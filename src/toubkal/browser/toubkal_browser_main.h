#ifndef TOUBKAL_BROWSER_TOUBKAL_BROWSER_MAIN_H_
#define TOUBKAL_BROWSER_TOUBKAL_BROWSER_MAIN_H_

#include <memory>

namespace content {
class BrowserMainParts;
}

namespace toubkal {
namespace browser {

// Creates the main parts for Toubkal browser initialization
std::unique_ptr<content::BrowserMainParts> CreateToubkalBrowserMainParts();

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_TOUBKAL_BROWSER_MAIN_H_
