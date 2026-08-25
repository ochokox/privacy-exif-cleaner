# Privacy Exif Cleaner

A lightweight browser-based image metadata remover.

## Features

- Client-side image processing
- No image-processing server required
- JPG support
- PNG support
- WebP support
- Multiple image processing
- Mobile-friendly interface
- File size and pixel-count limits
- No analytics or advertising scripts included

## How It Works

Images are loaded into the user's browser and drawn onto an HTML5 Canvas.

The Canvas output is then exported as a new image file.

This re-encoding process is intended to remove metadata contained in the original image.

## Privacy

Image files are processed locally in the browser.

The application does not contain functionality that uploads user images to an image-processing server.

## Important Limitation

Metadata removal is not guaranteed to remove every possible proprietary or format-specific metadata field.

Users should verify processed files when handling highly sensitive information.

## Supported Formats

- JPEG
- PNG
- WebP

## Technology

- HTML
- CSS
- JavaScript
- HTML5 Canvas API
- Browser File API

## License

The project license will be specified separately.
