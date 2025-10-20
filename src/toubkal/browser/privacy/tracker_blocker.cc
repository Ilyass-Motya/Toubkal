/**
 * Toubkal Browser Tracker Blocker Implementation
 * 
 * Implements tracker blocking using blocklists and custom rules
 * to prevent tracking and improve privacy.
 */

#include "toubkal/browser/privacy/tracker_blocker.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <regex>

#include "base/bind.h"
#include "base/callback_helpers.h"
#include "base/files/file_util.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/strings/string_util.h"
#include "base/strings/string_number_conversions.h"
#include "base/values.h"
#include "base/time/time.h"
#include "base/task/post_task.h"
#include "base/task/thread_pool.h"
#include "crypto/sha2.h"
#include "mojo/public/cpp/bindings/self_owned_receiver.h"
#include "url/gurl.h"

namespace toubkal {

TrackerBlocker::TrackerBlocker()
    : blocking_enabled_(true),
      max_cache_size_(1000),
      stats_() {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  // Initialize blocklist URLs
  easylist_url_ = "https://easylist.to/easylist/easylist.txt";
  easyprivacy_url_ = "https://easylist.to/easylist/easyprivacy.txt";
  custom_rules_file_ = "custom_rules.txt";
  
  // Initialize stats
  stats_.total_rules = 0;
  stats_.active_rules = 0;
  stats_.blocked_requests = 0;
  stats_.allowed_requests = 0;
}

TrackerBlocker::~TrackerBlocker() {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
}

// mojom::TrackerBlocker implementation

void TrackerBlocker::SetBlockingEnabled(bool enabled, SetBlockingEnabledCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  blocking_enabled_ = enabled;
  LOG(INFO) << "Tracker blocking " << (enabled ? "enabled" : "disabled");
  
  std::move(callback).Run(true);
}

void TrackerBlocker::IsBlockingEnabled(IsBlockingEnabledCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  std::move(callback).Run(blocking_enabled_);
}

void TrackerBlocker::IsUrlBlocked(const std::string& url, IsUrlBlockedCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  if (!blocking_enabled_) {
    std::move(callback).Run(false, "");
    return;
  }
  
  bool blocked = ShouldBlockRequest(url);
  std::string reason = blocked ? "Blocked by rule" : "";
  
  std::move(callback).Run(blocked, reason);
}

void TrackerBlocker::CheckUrl(const std::string& url, CheckUrlCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  if (!blocking_enabled_) {
    std::move(callback).Run(false, "");
    return;
  }
  
  bool should_block = ShouldBlockRequest(url);
  std::string rule_matched = should_block ? "Matched rule" : "";
  
  std::move(callback).Run(should_block, rule_matched);
}

void TrackerBlocker::UpdateBlocklists(UpdateBlocklistsCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  // Update blocklists in a background task
  base::ThreadPool::PostTaskAndReplyWithResult(
      FROM_HERE,
      base::BindOnce(&TrackerBlocker::UpdateBlocklistsInternal, base::Unretained(this)),
      base::BindOnce(&TrackerBlocker::OnBlocklistsUpdated, 
                     weak_factory_.GetWeakPtr(), std::move(callback)));
}

void TrackerBlocker::GetBlocklistStats(GetBlocklistStatsCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  std::map<std::string, int32_t> stats_map;
  stats_map["total_rules"] = stats_.total_rules;
  stats_map["active_rules"] = stats_.active_rules;
  stats_map["blocked_requests"] = stats_.blocked_requests;
  stats_map["allowed_requests"] = stats_.allowed_requests;
  
  for (const auto& [source, count] : stats_.rules_by_source) {
    stats_map[source] = count;
  }
  
  std::move(callback).Run(stats_map);
}

void TrackerBlocker::AddCustomRule(const std::string& rule, AddCustomRuleCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  if (rule.empty()) {
    std::move(callback).Run(false, "Empty rule");
    return;
  }
  
  // Validate rule format
  if (!IsValidRule(rule)) {
    std::move(callback).Run(false, "Invalid rule format");
    return;
  }
  
  BlocklistRule blocklist_rule;
  blocklist_rule.pattern = rule;
  blocklist_rule.type = "custom";
  blocklist_rule.source = "custom";
  blocklist_rule.enabled = true;
  blocklist_rule.priority = 1000; // High priority for custom rules
  
  blocklist_rules_.push_back(blocklist_rule);
  stats_.total_rules++;
  stats_.active_rules++;
  stats_.rules_by_source["custom"]++;
  
  LOG(INFO) << "Added custom rule: " << rule;
  std::move(callback).Run(true, "");
}

void TrackerBlocker::RemoveCustomRule(const std::string& rule, RemoveCustomRuleCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  auto it = std::find_if(blocklist_rules_.begin(), blocklist_rules_.end(),
                        [&rule](const BlocklistRule& r) { return r.pattern == rule && r.source == "custom"; });
  
  if (it != blocklist_rules_.end()) {
    blocklist_rules_.erase(it);
    stats_.total_rules--;
    stats_.active_rules--;
    stats_.rules_by_source["custom"]--;
    LOG(INFO) << "Removed custom rule: " << rule;
    std::move(callback).Run(true);
  } else {
    std::move(callback).Run(false);
  }
}

void TrackerBlocker::GetCustomRules(GetCustomRulesCallback callback) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  std::vector<std::string> custom_rules;
  for (const auto& rule : blocklist_rules_) {
    if (rule.source == "custom") {
      custom_rules.push_back(rule.pattern);
    }
  }
  
  std::move(callback).Run(custom_rules);
}

// Internal methods

bool TrackerBlocker::ShouldBlockRequest(const std::string& url, const std::string& referrer) const {
  if (!blocking_enabled_ || url.empty()) {
    return false;
  }
  
  // Check cache first
  auto cache_it = url_cache_.find(url);
  if (cache_it != url_cache_.end()) {
    return cache_it->second;
  }
  
  bool blocked = false;
  
  // Check domain blocking
  if (IsDomainBlocked(url)) {
    blocked = true;
  }
  
  // Check URL pattern blocking
  if (!blocked && IsUrlPatternBlocked(url)) {
    blocked = true;
  }
  
  // Check regex blocking
  if (!blocked && IsRegexBlocked(url)) {
    blocked = true;
  }
  
  // Cache result
  if (url_cache_.size() < static_cast<size_t>(max_cache_size_)) {
    url_cache_[url] = blocked;
  }
  
  return blocked;
}

bool TrackerBlocker::IsDomainBlocked(const std::string& url) const {
  GURL gurl(url);
  if (!gurl.is_valid()) {
    return false;
  }
  
  std::string host = gurl.host();
  return blocked_domains_.find(host) != blocked_domains_.end();
}

bool TrackerBlocker::IsUrlPatternBlocked(const std::string& url) const {
  for (const auto& rule : blocklist_rules_) {
    if (rule.type == "url" && rule.enabled) {
      if (MatchesRule(url, rule.pattern)) {
        return true;
      }
    }
  }
  return false;
}

bool TrackerBlocker::IsRegexBlocked(const std::string& url) const {
  for (const auto& regex : regex_rules_) {
    if (std::regex_search(url, regex)) {
      return true;
    }
  }
  return false;
}

bool TrackerBlocker::IsValidRule(const std::string& rule) const {
  if (rule.empty() || rule.length() > 1000) {
    return false;
  }
  
  // Basic validation - check for valid characters
  for (char c : rule) {
    if (c < 32 || c > 126) {
      return false;
    }
  }
  
  return true;
}

bool TrackerBlocker::MatchesRule(const std::string& url, const std::string& rule) const {
  if (rule.empty() || url.empty()) {
    return false;
  }
  
  GURL gurl(url);
  if (!gurl.is_valid()) {
    return false;
  }
  
  std::string host = gurl.host();
  std::string path = gurl.path();
  
  // Simple rule matching patterns
  if (rule[0] == '|' && rule[rule.length() - 1] == '|') {
    // Exact match
    std::string pattern = rule.substr(1, rule.length() - 2);
    return host == pattern || url == pattern;
  } else if (rule[0] == '|' && rule[rule.length() - 1] == '^') {
    // Prefix match
    std::string pattern = rule.substr(1, rule.length() - 2);
    return base::StartsWith(host, pattern, base::CompareCase::INSENSITIVE_ASCII) ||
           base::StartsWith(url, pattern, base::CompareCase::INSENSITIVE_ASCII);
  } else if (rule[0] == '^' && rule[rule.length() - 1] == '|') {
    // Suffix match
    std::string pattern = rule.substr(1, rule.length() - 2);
    return base::EndsWith(host, pattern, base::CompareCase::INSENSITIVE_ASCII) ||
           base::EndsWith(url, pattern, base::CompareCase::INSENSITIVE_ASCII);
  } else if (rule[0] == '^' && rule[rule.length() - 1] == '^') {
    // Contains match
    std::string pattern = rule.substr(1, rule.length() - 2);
    return base::Contains(host, pattern, base::CompareCase::INSENSITIVE_ASCII) ||
           base::Contains(url, pattern, base::CompareCase::INSENSITIVE_ASCII);
  } else {
    // Simple contains match
    return base::Contains(host, rule, base::CompareCase::INSENSITIVE_ASCII) ||
           base::Contains(url, rule, base::CompareCase::INSENSITIVE_ASCII);
  }
}

bool TrackerBlocker::UpdateBlocklistsInternal() {
  // Load blocklists
  LoadBlocklists();
  return true;
}

void TrackerBlocker::OnBlocklistsUpdated(UpdateBlocklistsCallback callback, bool success) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  if (success) {
    std::move(callback).Run(true, "");
  } else {
    std::move(callback).Run(false, "Failed to update blocklists");
  }
}

void TrackerBlocker::LoadBlocklists() {
  // Load EasyList
  LoadEasyList();
  
  // Load EasyPrivacy
  LoadEasyPrivacy();
  
  // Load custom rules
  LoadCustomRules();
  
  // Compile regex rules
  CompileRegexRules();
  
  // Optimize rule matching
  OptimizeRuleMatching();
}

void TrackerBlocker::LoadEasyList() {
  // In practice, this would download and parse EasyList
  // For now, we'll use some example rules
  std::vector<std::string> easylist_rules = {
    "||google-analytics.com^",
    "||googletagmanager.com^",
    "||facebook.com/tr^",
    "||doubleclick.net^",
    "||googlesyndication.com^"
  };
  
  for (const auto& rule : easylist_rules) {
    ParseBlocklistRule(rule, "easylist");
  }
}

void TrackerBlocker::LoadEasyPrivacy() {
  // In practice, this would download and parse EasyPrivacy
  // For now, we'll use some example rules
  std::vector<std::string> easyprivacy_rules = {
    "||google-analytics.com/analytics.js^",
    "||googletagmanager.com/gtm.js^",
    "||facebook.com/tr^",
    "||doubleclick.net/instream/ad_status.js^"
  };
  
  for (const auto& rule : easyprivacy_rules) {
    ParseBlocklistRule(rule, "easyprivacy");
  }
}

void TrackerBlocker::LoadCustomRules() {
  // In practice, this would load from a file
  // For now, we'll use some example rules
  std::vector<std::string> custom_rules = {
    "||example-tracker.com^",
    "||ads.example.com^"
  };
  
  for (const auto& rule : custom_rules) {
    ParseBlocklistRule(rule, "custom");
  }
}

void TrackerBlocker::ParseBlocklistRule(const std::string& rule, const std::string& source) {
  if (rule.empty() || rule[0] == '!') { // Skip comments
    return;
  }
  
  BlocklistRule blocklist_rule;
  blocklist_rule.pattern = rule;
  blocklist_rule.source = source;
  blocklist_rule.enabled = true;
  blocklist_rule.priority = 100; // Default priority
  
  // Determine rule type
  if (rule[0] == '|' && rule[rule.length() - 1] == '|') {
    blocklist_rule.type = "exact";
  } else if (rule[0] == '|' || rule[rule.length() - 1] == '|') {
    blocklist_rule.type = "url";
  } else if (rule[0] == '^' && rule[rule.length() - 1] == '^') {
    blocklist_rule.type = "contains";
  } else {
    blocklist_rule.type = "domain";
  }
  
  blocklist_rules_.push_back(blocklist_rule);
  stats_.total_rules++;
  stats_.active_rules++;
  stats_.rules_by_source[source]++;
}

void TrackerBlocker::CompileRegexRules() {
  regex_rules_.clear();
  
  for (const auto& rule : blocklist_rules_) {
    if (rule.type == "regex" && rule.enabled) {
      try {
        std::regex regex_rule(rule.pattern, std::regex_constants::icase);
        regex_rules_.push_back(regex_rule);
      } catch (const std::regex_error& e) {
        LOG(WARNING) << "Invalid regex rule: " << rule.pattern << " - " << e.what();
      }
    }
  }
}

void TrackerBlocker::OptimizeRuleMatching() {
  // Sort rules by priority (higher priority first)
  std::sort(blocklist_rules_.begin(), blocklist_rules_.end(),
            [](const BlocklistRule& a, const BlocklistRule& b) {
              return a.priority > b.priority;
            });
  
  // Extract domains for fast lookup
  blocked_domains_.clear();
  for (const auto& rule : blocklist_rules_) {
    if (rule.type == "domain" && rule.enabled) {
      blocked_domains_.insert(rule.pattern);
    }
  }
}

void TrackerBlocker::RecordBlockedRequest(const std::string& url, const std::string& rule) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  stats_.blocked_requests++;
  stats_.blocks_by_domain[rule]++;
  
  LOG(INFO) << "Blocked request: " << url << " by rule: " << rule;
}

void TrackerBlocker::RecordAllowedRequest(const std::string& url) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  stats_.allowed_requests++;
}

BlocklistStats TrackerBlocker::GetStatistics() const {
  return stats_;
}

// Mojo binding

void TrackerBlocker::BindReceiver(mojo::PendingReceiver<mojom::TrackerBlocker> receiver) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  receiver_.Bind(std::move(receiver));
}

}  // namespace toubkal