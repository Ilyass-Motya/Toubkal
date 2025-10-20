// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_BRANDING_BRANDING_CONFIG_H_
#define TOUBKAL_BROWSER_BRANDING_BRANDING_CONFIG_H_

#include <string>

namespace toubkal {
namespace branding {

// Product information
extern const char kProductName[];
extern const char kProductShortName[];
extern const char kProductVersion[];
extern const char kProductDescription[];

// Window titles and UI strings
extern const char kBrowserWindowTitle[];
extern const char kAboutDialogTitle[];
extern const char kAboutDialogDescription[];

// URL scheme branding
extern const char kInternalScheme[];
extern const char kInternalSchemeDisplayName[];

// Brand colors (hex values)
extern const char kPrimaryColor[];
extern const char kSecondaryColor[];
extern const char kAccentColor[];

// Logo and icon paths
extern const char kLogoPath[];
extern const char kIconPath[];
extern const char kFaviconPath[];

// Legal and copyright information
extern const char kCopyrightNotice[];
extern const char kLegalCompanyName[];
extern const char kLegalWebsite[];

}  // namespace branding
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_BRANDING_BRANDING_CONFIG_H_
