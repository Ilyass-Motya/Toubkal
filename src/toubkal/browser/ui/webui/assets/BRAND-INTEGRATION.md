# Toubkal Browser Brand Integration Guide

This guide explains how to use the Toubkal brand system across all internal pages and components.

## Brand Colors

### Primary Colors
- **Toubkal Blue**: `#1E40AF` - Primary brand color for trust and security
- **Toubkal Blue Light**: `#3B82F6` - Secondary brand color for energy and innovation
- **Toubkal Blue Dark**: `#1E3A8A` - Dark variant for authority and stability

### Secondary Colors
- **Toubkal Green**: `#10B981` - Privacy and safety indicators
- **Toubkal Green Light**: `#34D399` - Success states and positive actions
- **Toubkal Green Dark**: `#059669` - Reliability and trust indicators

### Accent Colors
- **Toubkal Amber**: `#F59E0B` - Attention and warning states
- **Toubkal Amber Light**: `#FBBF24` - Highlights and callouts
- **Toubkal Amber Dark**: `#D97706` - Urgent actions and alerts

## Typography

### Font Families
- **Sans Serif**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace**: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace`
- **Display**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extra Bold**: 800

## CSS Classes

### Brand Components

#### Buttons
```css
.toubkal-button-primary    /* Primary action button */
.toubkal-button-secondary  /* Secondary action button */
.toubkal-button-success    /* Success action button */
```

#### Cards
```css
.toubkal-card             /* Standard card container */
```

#### Inputs
```css
.toubkal-input            /* Form input field */
```

#### Badges
```css
.toubkal-badge-primary    /* Primary status badge */
.toubkal-badge-secondary  /* Secondary status badge */
.toubkal-badge-success    /* Success status badge */
.toubkal-badge-warning    /* Warning status badge */
.toubkal-badge-error      /* Error status badge */
```

### Brand Gradients
```css
.toubkal-gradient-primary    /* Primary brand gradient */
.toubkal-gradient-secondary  /* Secondary brand gradient */
.toubkal-gradient-accent     /* Accent brand gradient */
.toubkal-gradient-hero       /* Hero section gradient */
```

## Tailwind CSS Integration

The brand system is fully integrated with Tailwind CSS through custom configuration:

### Custom Colors
```css
bg-toubkal-primary-500     /* Primary blue */
bg-toubkal-secondary-500   /* Secondary green */
bg-toubkal-accent-500      /* Accent amber */
text-toubkal-gray-600      /* Primary text */
border-toubkal-gray-200    /* Primary border */
```

### Custom Fonts
```css
font-sans                  /* System sans-serif */
font-mono                  /* Monospace */
font-display               /* Display font */
```

### Custom Shadows
```css
shadow-toubkal             /* Brand shadow */
shadow-toubkal-lg          /* Large brand shadow */
```

## Logo Usage

### Logo Files
- **toubkal-logo.svg**: Full logo with text (200x60px)
- **toubkal-icon.svg**: Icon only (64x64px)

### Logo Guidelines
- Use the full logo for headers and branding areas
- Use the icon for favicons, app icons, and small spaces
- Maintain aspect ratio when scaling
- Use on light backgrounds for best visibility

## Implementation Examples

### React Component with Brand Styling
```tsx
import './toubkal-brand.css'

const ToubkalButton = ({ children, variant = 'primary' }) => (
  <button className={`toubkal-button toubkal-button-${variant}`}>
    {children}
  </button>
)
```

### HTML with Brand Classes
```html
<div class="toubkal-card">
  <h1 class="toubkal-text-display text-3xl">Welcome to Toubkal</h1>
  <p class="toubkal-text-body text-gray-600">Privacy-first browsing</p>
  <button class="toubkal-button toubkal-button-primary">Get Started</button>
</div>
```

### CSS Custom Properties
```css
.my-component {
  background: var(--toubkal-gradient-primary);
  color: var(--toubkal-text-inverse);
  border-radius: var(--toubkal-radius-lg);
  padding: var(--toubkal-space-4);
}
```

## Dark Mode Support

The brand system includes automatic dark mode support:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode colors are automatically applied */
  /* Use CSS custom properties for automatic switching */
}
```

## Responsive Design

The brand system is fully responsive:

```css
@media (max-width: 768px) {
  /* Mobile-optimized spacing and typography */
  /* Automatically applied through CSS custom properties */
}
```

## Accessibility

All brand components include accessibility features:

- High contrast ratios for text
- Focus indicators for interactive elements
- Semantic color usage for status indicators
- Keyboard navigation support

## Browser Support

The brand system supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Integration Checklist

- [ ] Include `toubkal-brand.css` in your page
- [ ] Use Toubkal color variables for consistency
- [ ] Apply Toubkal typography classes
- [ ] Use Toubkal component classes
- [ ] Include logo assets where appropriate
- [ ] Test dark mode compatibility
- [ ] Verify responsive design
- [ ] Check accessibility compliance
