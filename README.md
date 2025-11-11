# OptimalLineLength

A lightweight, vanilla JavaScript library for analyzing and visualizing optimal line lengths in text content. Helps ensure text readability by highlighting lines that fall outside the recommended 50-80 character range.

## Overview

OptimalLineLength is a development tool that helps designers and developers ensure their text content maintains optimal readability. According to typography best practices, the ideal line length for body text is between 50-80 characters per line. This library automatically analyzes your text content and provides visual feedback about line lengths.

### Features

- **Zero Dependencies**: Pure vanilla JavaScript, no jQuery or other libraries required
- **Single File**: CSS styles are embedded in the JavaScript file for easy distribution
- **Flexible Selectors**: Works on any text elements (p, blockquote, h1-h6, or custom selectors)
- **Configurable**: Customize character ranges, styling, and behavior
- **Responsive**: Automatically recalculates on window resize with debouncing
- **Visual Feedback**: Color-coded counters show character count per line
- **Lightweight**: Small footprint, minimal performance impact

## Installation

### Option 1: Direct Download

Download `optimal-line-length.js` and include it in your HTML:

```html
<script src="path/to/optimal-line-length.js"></script>
```

### Option 2: Copy and Paste

Copy the contents of `optimal-line-length.js` and paste it into your project.

### Option 3: CDN (if hosted)

```html
<script src="https://your-cdn.com/optimal-line-length.js"></script>
```

## Usage

### Basic Usage (Auto-initialization)

The simplest way to use OptimalLineLength is with auto-initialization. Just include the script with the `data-auto-init` attribute:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <p>Your paragraph text here...</p>
  <blockquote>Your blockquote here...</blockquote>
  <h1>Your heading here...</h1>

  <!-- Auto-initialize on all default elements -->
  <script src="optimal-line-length.js" data-auto-init></script>
</body>
</html>
```

This will automatically analyze all `<p>`, `<blockquote>`, and `<h1>`-`<h6>` elements on the page.

### Manual Initialization

For more control, initialize manually with custom options:

```html
<script src="optimal-line-length.js"></script>
<script>
  // Initialize with default settings
  const oll = new OptimalLineLength();

  // Or with custom configuration
  const oll = new OptimalLineLength({
    selector: 'p, .article-text',  // Custom selector
    minChars: 45,                  // Minimum optimal characters
    maxChars: 75,                  // Maximum optimal characters
    maxLines: 20,                  // Analyze first 20 lines only
    showCounters: true,            // Show character counters
    highlightEndOfLine: true,      // Highlight end of lines
    debounceDelay: 200            // Resize debounce delay (ms)
  });
</script>
```

### Advanced Usage

#### Target Specific Elements

```javascript
// Only analyze elements with a specific class
const oll = new OptimalLineLength({
  selector: '.analyze-this',
  autoInit: false
});

oll.init();
```

#### Add Elements Dynamically

```javascript
const oll = new OptimalLineLength();

// Add new elements after initialization
oll.addElements('.new-content');

// Add a specific element
const element = document.querySelector('#my-element');
oll.addElements(element);
```

#### Refresh Analysis

```javascript
const oll = new OptimalLineLength();

// Refresh all elements
oll.refresh();

// Refresh a specific element
const element = document.querySelector('#my-element');
oll.refresh(element);
```

#### Clean Up

```javascript
const oll = new OptimalLineLength();

// Remove all markers and restore original content
oll.destroy();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | String | `'p, blockquote, h1, h2, h3, h4, h5, h6, .optimal-line-length'` | CSS selector for elements to analyze |
| `minChars` | Number | `50` | Minimum optimal characters per line |
| `maxChars` | Number | `80` | Maximum optimal characters per line |
| `maxLines` | Number | `10` | Maximum number of lines to analyze per element |
| `showCounters` | Boolean | `true` | Show character count indicators |
| `highlightEndOfLine` | Boolean | `true` | Highlight end-of-line markers |
| `debounceDelay` | Number | `150` | Delay (ms) before recalculating on resize |
| `autoInit` | Boolean | `true` | Automatically initialize when script loads |

## Visual Indicators

### Character Counters
- **Green**: Line length is optimal (50-80 characters)
- **Red**: Line length is too short or too long

### Line Markers
- **Gray vertical line**: Marks word boundaries
- **Red vertical line**: Marks end of line

## API Reference

### Constructor

```javascript
new OptimalLineLength(config)
```

Creates a new instance with optional configuration.

### Methods

#### `init()`
Initialize the library (called automatically if `autoInit: true`).

#### `refresh(element = null)`
Refresh analysis. Pass an element to refresh only that element, or no argument to refresh all.

#### `addElements(selector)`
Add new elements to analyze. Accepts a CSS selector string, HTMLElement, or NodeList.

#### `destroy()`
Remove all markers and restore original content.

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Modern browsers with ES6 support

## Development Tips

### Exclude Elements

To exclude specific elements from analysis, simply don't include them in your selector, or remove any default tags you don't want analyzed:

```javascript
const oll = new OptimalLineLength({
  selector: 'p:not(.no-analyze), .article-content'
});
```

### Styling Customization

The library injects CSS automatically, but you can override styles in your own stylesheet:

```css
/* Customize counter appearance */
.oll-counter {
  font-size: 12px !important;
  right: 10% !important;
}

/* Customize error color */
.oll-counter.oll-error {
  color: #ff6b6b !important;
}

/* Customize success color */
.oll-counter.oll-success {
  color: #51cf66 !important;
}

/* Hide end-of-line markers */
.oll-zero-width.oll-end-of-line {
  background-color: transparent !important;
}
```

### Performance Considerations

- The library processes only the first 10 lines by default (configurable via `maxLines`)
- Resize events are debounced to prevent excessive recalculation
- Elements with complex nested HTML are skipped to prevent layout issues

## Examples

### Example 1: Analyze Only Article Content

```html
<article class="blog-post">
  <p>Your article paragraph...</p>
  <p>Another paragraph...</p>
</article>

<script src="optimal-line-length.js"></script>
<script>
  const oll = new OptimalLineLength({
    selector: '.blog-post p'
  });
</script>
```

### Example 2: Custom Character Range

```html
<script src="optimal-line-length.js"></script>
<script>
  // For wider layouts, allow longer lines
  const oll = new OptimalLineLength({
    minChars: 60,
    maxChars: 100
  });
</script>
```

### Example 3: Development Mode Only

```html
<script src="optimal-line-length.js"></script>
<script>
  // Only enable in development
  if (window.location.hostname === 'localhost') {
    const oll = new OptimalLineLength();
  }
</script>
```

## Troubleshooting

### Elements Not Being Analyzed

- Check that your elements match the selector
- Ensure elements contain text content
- Check browser console for warnings about complex children

### Counters Not Appearing

- Verify `showCounters: true` in configuration
- Check that text is wrapping to multiple lines
- Inspect element to ensure counters aren't hidden by CSS

### Performance Issues

- Reduce `maxLines` to analyze fewer lines
- Increase `debounceDelay` for slower resize recalculation
- Use more specific selectors to analyze fewer elements

## License

MIT License - Feel free to use in personal and commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Changelog

### Version 2.0.0
- Rewritten in vanilla JavaScript (removed jQuery dependency)
- CSS styles now embedded in JS file
- Works on all text elements (p, blockquote, h1-h6, custom selectors)
- Configurable options
- Better performance and code quality
- Improved API with methods like `refresh()`, `addElements()`, and `destroy()`

### Version 1.0.0
- Initial release
- jQuery-based implementation
- Fixed #myTextWrapper selector
