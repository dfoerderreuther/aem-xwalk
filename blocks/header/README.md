# Header Block

The header block provides the main navigation and branding for the site.

## Block Content

### Logo

To add a logo to the header, include an image in the header block content in your AEM document:

| Header |
|--------|
| ![Logo](/images/logo.png) |

The logo will automatically be:
- Sized to 166px width
- Linked to the homepage (/)
- Positioned before the navigation menu
- Given appropriate accessibility attributes

### Navigation

The header automatically loads the navigation from a fragment based on the current page path:
- Pages at `/a/b/*` will load `/a/b/nav`
- Pages at `/a` will load `/nav` (root)
- You can override this with a `nav` metadata tag

## Example

In your document (e.g., in Word or Google Docs):

```
---
Header
![Y-Walk Logo](/images/logo.png)
---
```

This will render the logo in the header, which can be managed as an AEM asset.

## Customization

- **Logo size**: Currently set to 166px width (can be adjusted in `header.css`)
- **Header height**: Controlled by `--nav-height` CSS variable (currently 90px)
- **Navigation source**: Controlled by `nav` metadata or automatic path resolution
