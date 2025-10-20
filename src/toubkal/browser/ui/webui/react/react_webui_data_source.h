// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_REACT_REACT_WEBUI_DATA_SOURCE_H_
#define TOUBKAL_BROWSER_UI_WEBUI_REACT_REACT_WEBUI_DATA_SOURCE_H_

#include <memory>
#include <string>
#include "content/public/browser/web_ui_data_source.h"

namespace toubkal {
namespace browser {

// Data source for serving React WebUI pages
class ReactWebUIDataSource {
 public:
  // Create data source for audit dashboard
  static std::unique_ptr<content::WebUIDataSource> CreateAuditDataSource();

  // Create data source for consent history
  static std::unique_ptr<content::WebUIDataSource> CreateConsentDataSource();

  // Create data source for settings page
  static std::unique_ptr<content::WebUIDataSource> CreateSettingsDataSource();

  // Get the base URL for React assets
  static std::string GetReactAssetsBaseUrl();

  // Load React app HTML template
  static std::string LoadReactAppTemplate(const std::string& app_name);

  // Load React app assets (JS, CSS)
  static std::string LoadReactAppAssets(const std::string& app_name, 
                                       const std::string& asset_type);

 private:
  // Get the path to built React assets
  static std::string GetReactAssetsPath();

  // Load file from React build output
  static std::string LoadReactAsset(const std::string& asset_path);
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_REACT_REACT_WEBUI_DATA_SOURCE_H_
