# dzCropper
A jQuery module that integrates Dropzone.js and Cropper.js. This module also adds a few missing functionality to the mix.
The added funtionalities are:
1. Avoid adding new files when the maximum file number reached.
2. More sophisticated styling

For demo please check http://tkiafar.com/dzcropper

## Dependencies
* jQuery
* Bootstrap
* Dropzone.js
* Cropper.js

## Getting Started
Please add `dzcropper.min.css` stylesheet link to the header and `dzcropper.min.js` script after jQuery, bootstrap, Dropzone and Cropper scripts.
Cropper is now added to jQuery fn and is initiated on a container by the following code:
`$('.dropzone-container')..dzCropper([options]);`
The options is an object with key value pairs as follows:
* __maxDimention__: The maximum width and hight of the cropped photo. If the photo is bigger than this, it will be resized to this square size.
* __maxFiles__: (from Dropzone) Maximum files that user may upload.
* __maxFilesize__: (from Dropzone) Maximum file size for each file in MiB.
* __acceptedFiles__: (from Dropzone) File type (mime) to be accepted.
* __clickable__: (from Dropzone) Clickable dropzone elements to open browse for file.
* __mainTemplate__: Main dropzone template to be injected into the current selected element.
* __modalTemplate__: Cropzone template, currently implemented as bootstrap template.
* __onDropzoneReady__: Callback to call when dropzone is instantiated. Dropzone instance is passed to this function.
* __onCropperReady__: Callback to call when cropper is instantiated. Cropper instance is passed to this function.


Based on: https://github.com/4unkur/cropper_dropzone.git