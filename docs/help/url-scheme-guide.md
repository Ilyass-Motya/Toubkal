# Toubkal Browser URL Scheme Guide

**Last Updated:** 2025-10-18  
**Version:** 1.0.0-alpha

This guide explains how to use Toubkal Browser's custom URL scheme and how it differs from other browsers.

---

## Overview

Toubkal Browser uses the `toubkal://` URL scheme for all internal pages, replacing the traditional `chrome://` URLs found in Chromium-based browsers. This change provides:

- **Brand Identity**: Clear distinction from Chrome/Chromium
- **Privacy Focus**: URLs reflect our privacy-first approach
- **Consistency**: All internal pages follow the same scheme

---

## Available Internal Pages

### Core Pages

| URL | Description | Purpose |
|-----|-------------|---------|
| `toubkal://settings` | Main settings page | Configure browser preferences |
| `toubkal://newtab` | New tab page | Default start page with search |
| `toubkal://about` | About page | Version and build information |
| `toubkal://version` | Version details | Detailed version information |

### Privacy Pages

| URL | Description | Purpose |
|-----|-------------|---------|
| `toubkal://privacy` | Privacy policy | Data handling and privacy practices |
| `toubkal://audit` | Transparency dashboard | View consent decisions and audit logs |
| `toubkal://consent` | Consent history | Manage AI consent decisions |

### AI Pages

| URL | Description | Purpose |
|-----|-------------|---------|
| `toubkal://ai` | AI assistant | Chat with local AI models |
| `toubkal://ai/settings` | AI configuration | Configure AI models and providers |
| `toubkal://ai/models` | Model management | Manage local AI models |

### MCP Pages

| URL | Description | Purpose |
|-----|-------------|---------|
| `toubkal://mcp` | MCP overview | Model Context Protocol information |
| `toubkal://mcp/servers` | Server management | Configure MCP servers |

### Help Pages

| URL | Description | Purpose |
|-----|-------------|---------|
| `toubkal://help` | Help center | Main help and support page |
| `toubkal://help/privacy` | Privacy help | Privacy features and settings |
| `toubkal://help/ai` | AI help | AI features and troubleshooting |

---

## Backward Compatibility

### Chrome URL Redirects

Toubkal Browser automatically redirects legacy `chrome://` URLs to their `toubkal://` equivalents:

| Chrome URL | Redirects to | Notes |
|------------|--------------|-------|
| `chrome://settings` | `toubkal://settings` | Main settings page |
| `chrome://newtab` | `toubkal://newtab` | New tab page |
| `chrome://about` | `toubkal://about` | About page |
| `chrome://version` | `toubkal://version` | Version information |
| `chrome://help` | `toubkal://help` | Help center |

### Removed Brave URLs

The following Brave-specific URLs are no longer supported:

- `brave://rewards` - Brave Rewards system
- `brave://wallet` - Brave Wallet
- `brave://referrals` - Brave Referrals

These features have been removed to focus on Toubkal's privacy-first approach.

---

## Common URL Patterns

### Valid Patterns

✅ **Correct:**
- `toubkal://settings`
- `toubkal://newtab`
- `toubkal://ai/settings`
- `toubkal://help/privacy`

### Common Mistakes

❌ **Incorrect:**
- `toubkal://setting` (missing 's')
- `toubkal://settigns` (typo)
- `toubkal://new-tab` (wrong separator)
- `toubkal://settings/` (trailing slash)

---

## Error Handling

### Page Not Found (404)

When you navigate to a non-existent `toubkal://` URL, you'll see:

1. **Error message** explaining the issue
2. **Valid URL examples** to help you find what you need
3. **Common mistakes** to avoid
4. **Quick navigation** buttons to popular pages

### Invalid URLs

Invalid URLs (malformed, unsupported schemes) will show:

1. **Clear error message** about what went wrong
2. **Suggestions** for fixing the issue
3. **Navigation options** to get back on track

---

## Developer Information

### URL Scheme Registration

The `toubkal://` scheme is registered in the browser's URL scheme handler, allowing:

- Direct navigation from external applications
- Bookmarking of internal pages
- Integration with browser extensions

### Programmatic Access

You can programmatically navigate to internal pages:

```javascript
// Navigate to settings
window.location.href = 'toubkal://settings'

// Navigate to AI assistant
window.location.href = 'toubkal://ai'
```

### Testing URLs

For testing purposes, you can use the browser's address bar:

1. Type `toubkal://` followed by the page name
2. Press Enter to navigate
3. Use Tab completion for available pages

---

## Troubleshooting

### URL Not Working

If a `toubkal://` URL isn't working:

1. **Check spelling** - URLs are case-sensitive
2. **Verify the page exists** - See the list above
3. **Try the redirect** - Use `chrome://` equivalent first
4. **Clear browser cache** - Sometimes helps with redirects

### Performance Issues

If pages load slowly:

1. **Check system resources** - Ensure adequate RAM/CPU
2. **Disable extensions** - Some may interfere
3. **Update browser** - Latest version may have fixes
4. **Report the issue** - Help us improve performance

### Getting Help

For additional support:

- **Help Center**: `toubkal://help`
- **GitHub Issues**: [Report bugs and request features](https://github.com/toubkal/toubkal/issues)
- **Community**: [Join our discussions](https://github.com/toubkal/toubkal/discussions)

---

## Migration from Other Browsers

### From Chrome

1. **Bookmarks**: Update any bookmarked `chrome://` URLs to `toubkal://`
2. **Extensions**: Check compatibility with Toubkal's URL scheme
3. **Scripts**: Update any automation scripts using internal URLs

### From Brave

1. **Remove Brave-specific bookmarks** (rewards, wallet, referrals)
2. **Update to Toubkal equivalents** for similar functionality
3. **Configure privacy settings** using `toubkal://settings`

---

## Security Considerations

### URL Validation

All `toubkal://` URLs are validated before processing:

- **Scheme verification** - Only `toubkal://` is accepted
- **Path validation** - Only known internal pages are allowed
- **Parameter sanitization** - Input parameters are cleaned

### External URL Handling

External URLs (`http://`, `https://`) are handled separately:

- **Full validation** - Proper URL format required
- **Security checks** - Malicious URLs are blocked
- **Sandboxing** - External content runs in isolated environment

---

## Future Updates

### Planned Additions

- `toubkal://extensions` - Extension management
- `toubkal://downloads` - Download history
- `toubkal://history` - Browsing history
- `toubkal://bookmarks` - Bookmark management

### Deprecation Policy

When URLs are deprecated:

1. **6-month notice** - Warning in browser
2. **Redirect period** - Old URLs redirect to new ones
3. **Removal** - Old URLs stop working after notice period

---

**Questions?** Contact us at [dev@toubkal.app](mailto:dev@toubkal.app) or visit [toubkal://help](toubkal://help).
