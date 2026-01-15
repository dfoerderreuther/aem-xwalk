# Header Block

The header block provides the main navigation and branding for the site.

## Navigation Fragment Structure

The header automatically loads the navigation from a fragment based on the current page path:
- Pages at `/a/b/*` will load `/a/b/nav`
- Pages at `/a` will load `/nav` (root)
- You can override this with a `nav` metadata tag

### Nav Fragment Format

The nav fragment should have **3 sections** in this order:

1. **Logo** (first section)
2. **Navigation links** (second section)
3. **Search/Tools** (third section)

## Example Nav Fragment

Create a document at `/language-masters/en/nav` with the following structure:

```
| Logo Section |
| ![Y-Walk Logo](/images/logo.png) |

| Navigation Section |
| - [Home](/)
  - [About](/about)
  - [Contact](/contact) |

| Search Section |
| [Search](/search) |
```

## Logo Configuration

The logo in the first section will automatically be:
- Sized to 166px width
- Linked to the homepage (/) if not already linked
- Given appropriate accessibility attributes
- Positioned at the start of the header

## Customization

- **Logo size**: Currently set to 166px width (can be adjusted in `header.css`)
- **Header height**: Controlled by `--nav-height` CSS variable (currently 90px)
- **Navigation source**: Controlled by `nav` metadata or automatic path resolution
