// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/react/react_webui_data_source.h"

#include "base/files/file_util.h"
#include "base/path_service.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "content/public/browser/web_ui_data_source.h"
#include "toubkal/browser/branding/branding_manager.h"

namespace toubkal {
namespace browser {

std::unique_ptr<content::WebUIDataSource> ReactWebUIDataSource::CreateAuditDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-audit");

  // Set up the audit dashboard HTML
  std::string html_template = LoadReactAppTemplate("audit");
  source->SetDefaultResource(html_template);

  // Add React assets
  std::string js_assets = LoadReactAppAssets("audit", "js");
  std::string css_assets = LoadReactAppAssets("audit", "css");
  
  source->AddResourcePath("assets/app.js", js_assets);
  source->AddResourcePath("assets/app.css", css_assets);

  return source;
}

std::unique_ptr<content::WebUIDataSource> ReactWebUIDataSource::CreateConsentDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-consent");

  // Set up the consent history HTML
  std::string html_template = LoadReactAppTemplate("consent");
  source->SetDefaultResource(html_template);

  // Add React assets
  std::string js_assets = LoadReactAppAssets("consent", "js");
  std::string css_assets = LoadReactAppAssets("consent", "css");
  
  source->AddResourcePath("assets/app.js", js_assets);
  source->AddResourcePath("assets/app.css", css_assets);

  return source;
}

std::unique_ptr<content::WebUIDataSource> ReactWebUIDataSource::CreateSettingsDataSource() {
  auto source = std::make_unique<content::WebUIDataSource>("toubkal-settings");

  // Set up the settings page HTML
  std::string html_template = LoadReactAppTemplate("settings");
  source->SetDefaultResource(html_template);

  // Add React assets
  std::string js_assets = LoadReactAppAssets("settings", "js");
  std::string css_assets = LoadReactAppAssets("settings", "css");
  
  source->AddResourcePath("assets/app.js", js_assets);
  source->AddResourcePath("assets/app.css", css_assets);

  return source;
}

std::string ReactWebUIDataSource::GetReactAssetsBaseUrl() {
  return "toubkal://react-assets/";
}

std::string ReactWebUIDataSource::LoadReactAppTemplate(const std::string& app_name) {
  // Load the HTML template for the React app
  std::string template_path = base::StringPrintf("react_webui/%s/index.html", app_name.c_str());
  std::string html_content = LoadReactAsset(template_path);
  
  if (html_content.empty()) {
    // Fallback template if file not found
    html_content = base::StringPrintf(R"(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toubkal %s</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <div id="root">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div style="text-align: center;">
        <h1>Loading Toubkal %s...</h1>
        <p>Please wait while the application loads.</p>
      </div>
    </div>
  </div>
  <script src="assets/app.js"></script>
</body>
</html>)", 
      base::ToUpperASCII(app_name).c_str(),
      base::ToUpperASCII(app_name).c_str());
  }
  
  return html_content;
}

std::string ReactWebUIDataSource::LoadReactAppAssets(const std::string& app_name, 
                                                    const std::string& asset_type) {
  std::string asset_path = base::StringPrintf("react_webui/%s/assets/app.%s", 
                                             app_name.c_str(), asset_type.c_str());
  return LoadReactAsset(asset_path);
}

std::string ReactWebUIDataSource::GetReactAssetsPath() {
  // Get the path to the React build output directory
  base::FilePath assets_path;
  if (base::PathService::Get(base::DIR_GEN_TEST_DATA_ROOT, &assets_path)) {
    assets_path = assets_path.AppendASCII("react_webui");
    return assets_path.AsUTF8Unsafe();
  }
  return "";
}

std::string ReactWebUIDataSource::LoadReactAsset(const std::string& asset_path) {
  base::FilePath full_path;
  if (base::PathService::Get(base::DIR_GEN_TEST_DATA_ROOT, &full_path)) {
    full_path = full_path.AppendASCII(asset_path);
    
    std::string content;
    if (base::ReadFileToString(full_path, &content)) {
      return content;
    }
  }
  
  // Return empty string if file not found
  return "";
}

}  // namespace browser
}  // namespace toubkal
