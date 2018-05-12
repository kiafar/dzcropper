# dzCropper
A jQuery module that integrates Dropzone.js and Cropper.js. This module also adds a few missing functionality to the mix.
The added funtionalities are:
1. Integrates Cropper.js with dropzone, right after file addded to dropzone. Correct callbacks fired.
2. Automatically replaces the cropped version with the original photo.
3. Blocks adding of new files when the maximum file number reached, unlike dropzone native functionality.
4. More sophisticated styling.

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
* __maxDimention__: The maximum width and hight allowed for incoming files.
* __maxFiles__: (from Dropzone) Maximum files that user may upload.
* __maxFilesize__: (from Dropzone) Maximum file size for each file in MiB.
* __acceptedFiles__: (from Dropzone) File type (mime) to be accepted.
* __clickable__: (from Dropzone) Clickable dropzone elements to open browse for file.
* __cropperOptions__: Cropper options. If you override the cropper ready function, onCropperReady will not work.
* __mainTemplate__: Main dropzone template to be injected into the current selected element.
* __modalTemplate__: Cropzone template, currently implemented as bootstrap template.
* __onDropzoneReady__: Callback when dropzone is instantiated. Dropzone instance is passed to this function.
* __onCropperReady__: Callback when cropper is instantiated. Cropper instance is passed to this function.
* __onMaxFileReached__: Callback when maximum number of files reached and new file is added, max num is passed to this function.
* __onMaxDimentionReached__: Callback when maximum dimentions is breached. current image height and width and maxFiles are passed to this function.
* __onFileAdded__: Callback when a cropped file is added, before upload starts. Cropped file is passed to this function.
* __onFileRemoved__: Callback when a file being removed by user. The file is passed to this function.
* __onSuccess__: Callback when a file is successfully uploaded. The file is passed to this function.


## Credits
Based on: https://github.com/4unkur/cropper_dropzone.git
Cropper js: https://github.com/fengyuanchen/cropperjs
Dropzone: https://github.com/enyo/dropzone/