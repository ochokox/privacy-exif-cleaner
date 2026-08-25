# Privacy Exif Cleaner

A 100% client-side web utility that strips EXIF and photo metadata during browser-based image re-encoding.

## Features
- **Client-Side Only:** No images ever leave the browser.
- **Zero Server Costs:** Built using standard Web APIs (Canvas API).
- **Supports:** JPEG, PNG, WebP formats.

## How it works
Images are rendered on an HTML5 Canvas and exported as fresh Data URLs, effectively dropping EXIF and location tags embedded in the original binary header.
