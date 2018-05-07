/*!
 * dzCropper.js v1.0
 * https://github.com/kiafar/dzcropper
 *
 * Copyright (c) 2018 Tirdad Kiafar
 * Released under the MIT license
 *
 * 05/07/2018 @ 5:38pm (UTC)
 */
(function (window, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function (root, jQuery) {
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        factory(jQuery);
    }
}(this, (function ($) {
    'use strict';
    var actualFiles = [],
        options = {},
        DEFAULTS = {
            // Maximum dimention of the final cropped image, both x and y
            maxDimention: 900,
            maxFiles: 2,
            // in MiB
            maxFilesize: 2,
            acceptedFiles: 'image/*',
            // clickable elements that trigger browse for file
            clickable: ['.dropzone'],
            mainTemplate: '<form title="Drop images to upload, or click to browse" action="upload.php" class="dropzone" id="my-dropzone-container" method="post" enctype="multipart/form-data">' +
                '<img src="img/upload.png" alt="upload" class="dz-upload-img"/>' +
                '<div class="fallback">' +
                '<input name="file" type="file">' +
                '</div>' +
                '</form>',
            modalTemplate: '<div class="modal fade" tabindex="-1" role="dialog">' +
                '<div class="modal-dialog modal-lg" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4 class="modal-title">Crop</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                '<div class="image-container"><!-- image goest here --></div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-warning rotate-left" title="Rotate counterclockwise"><span class="fa fa-rotate-left"></span></button>' +
                '<button type="button" class="btn btn-warning rotate-right" title="Rotate clockwise"><span class="fa fa-rotate-right"></span></button>' +
                '<button type="button" class="btn btn-warning scale-x" data-value="-1" title="Flip horizontally"><span class="fa fa-arrows-h"></span></button>' +
                '<button type="button" class="btn btn-warning scale-y" data-value="-1" title="Flip vertically"><span class="fa fa-arrows-v"></span></button>' +
                '<button type="button" class="btn btn-warning reset" title="Reset to default"><span class="fa fa-refresh"></span></button>' +
                '<button type="button" class="btn btn-default" data-dismiss="modal" title="Close window">Cancel</button>' +
                '<button type="button" class="btn btn-primary crop-upload" title="Save">Done</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            onDropzoneReady: function() {},
            onCropperReady: function() {},
        }

    $.fn.dzCropper = function (opts) {

        options = Object.assign({}, DEFAULTS, typeof (opts) !== 'undefined' && opts);
        options.clickable.push('.dz-upload-img');

        var $this = $(this),
            c = 0,
            $dropzoneContainer = $(options.mainTemplate);

        Dropzone.autoDiscover = false;

        $this.append($dropzoneContainer);

        var myDropzone = new Dropzone($dropzoneContainer[0], {
            clickable: Array.isArray(options.clickable) && options.clickable,
            autoQueue: false,
            autoProcessQueue: false,
            addRemoveLinks: true,
            maxFilesize: options.maxFilesize,
            maxFiles: options.maxFiles,
            acceptedFiles: options.acceptedFiles,
            dictDefaultMessage: 'Drop images here, or click to browse',
            dictRemoveFile: 'Remove',
            init: function () { if (typeof(options.onDropzoneReady) === 'function') options.onDropzoneReady($this.data('dropzone')); },
        });

        $this.data('dropzone', myDropzone);

        myDropzone.on('addedfile', function (file) {
            // myDropzone.acceptedFiles not being updated on addedfile, so the condition for maximum files should be set carefully
            onAddedFile(file);
        });

        function onAddedFile(file) {
            // ignore already cropped and re-rendered files
            if (file.cropped) {
                return;
            } else if (maxFilesReached(file.originalFile || file, myDropzone)) {
                myDropzone.removeFile(file);
                alert('You cannot add more than '+ options.maxFiles + ' files.');
                return;
            }
            
            // remove not cropped file from dropzone (we will replace it later)
            myDropzone.removeFile(file);

            // initialize FileReader which reads uploaded file
            var reader = new FileReader();
            reader.onloadend = function () {
                var image = new Image();
                image.src = reader.result;
                image.onload = function () {
                    
                    var width = this.width;
                    var height = this.height;

                    file.originalFile = file.originalFile ? file.originalFile : { name: file.name, size: file.size, lastModified: file.lastModified };
                    
                    if (width <= options.maxDimention || height <= options.maxDimention) {
                        crop(image, file);
                        return;
                    } else if (width > height) {
                        width *= options.maxDimention / height;
                        height = options.maxDimention;
                    } else {
                        height *= options.maxDimention / width;
                        width = options.maxDimention;
                    }

                    // Resize
                    var canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = "white";
                    ctx.drawImage(image, 0, 0, width, height);

                    var resizedFile = base64ToFile(canvas.toDataURL(), file);

                    resizedFile.originalFile = file.originalFile;

                    // add the resized file so this function is triggered again
                    myDropzone.addFile(resizedFile);
                }
            };
            // read uploaded file (triggers code above)
            reader.readAsDataURL(file);
        }

        function crop(img, file) {
            img.id = 'img-' + ++c;
            var $cropperModal = $(options.modalTemplate);
            $cropperModal.find('.image-container').append(img);

            $cropperModal.modal({
                backdrop: 'static', // This disable for click outside event
                keyboard: true // This for keyboard event
            }).on('shown.bs.modal', function () {
                highlightLastModal();
                var cropper = new Cropper(img, {
                    aspectRatio: 1,
                    autoCropArea: 1,
                    movable: false,
                    cropBoxResizable: true,
                    rotatable: true,
                    ready: function() { if (typeof(options.onCropperReady) === 'function') options.onCropperReady($this.data('cropper')); }
                });
                
                $this.data('cropper', cropper);
                
                var $modal = $(this);
                $modal.on('click', '.crop-upload', function () {
                    // get cropped image data, fillColor makes sure png files wont get black canvas background
                    var blob = cropper.getCroppedCanvas({
                        fillColor: '#fff'
                    }).toDataURL("image/jpeg", 0.9);
                    // transform it to Blob object
                    var croppedFile = dataURItoBlob(blob);
                    croppedFile.name = file.name;
                    croppedFile.cropped = true;

                    var files = myDropzone.getAcceptedFiles();
                    for (var i = 0; i < files.length; i++) {
                        var f = files[i];
                        if (f.name === file.name) {
                            myDropzone.removeFile(f);
                        }
                    }
                    // Add file before checking so the user can see a visual feedback of the error if exceeds the limit
                    myDropzone.addFile(croppedFile);
                    if (croppedFile.size <= options.maxFilesize * 1024 * 1024) {
                        myDropzone.enqueueFile(croppedFile);
                        myDropzone.processQueue();
                    }

                    actualFiles.push(file.originalFile);

                    $modal.modal('hide');
                })
                .on('hidden.bs.modal', function (e) {
                    highlightLastModal();
                })
                .on('click', '.rotate-right', function () {
                    cropper.rotate(90);
                })
                .on('click', '.rotate-left', function () {
                    cropper.rotate(-90);
                })
                .on('click', '.reset', function () {
                    cropper.reset();
                })
                .on('click', '.scale-x', function () {
                    var $this = $(this);
                    cropper.scaleX($this.data('value'));
                    $this.data('value', -$this.data('value'));
                })
                .on('click', '.scale-y', function () {
                    var $this = $(this);
                    cropper.scaleY($this.data('value'));
                    $this.data('value', -$this.data('value'));
                });
            });
        }

        function maxFilesReached(file) {
            var croppedFile = [];
            for (let i = 0; i < myDropzone.files.length; i++) {
                var currFile = myDropzone.files[i];
                if (currFile.cropped) {
                    croppedFile.push(currFile);
                }
            }

            if (Number.isInteger(options.maxFiles) && croppedFile.length < options.maxFiles) {
                return false;
            } else {
                for (let i = 0; i < actualFiles.length; i++) {
                    currFile = actualFiles[i];
                    if (currFile.name === file.name && currFile.size === file.size) {
                        return false;
                    }
                }
                return true;
            }
        }
    }

    function base64ToFile(dataURI, origFile) {
        var byteString, mimestring;

        if (dataURI.split(',')[0].indexOf('base64') !== -1) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURI(dataURI.split(',')[1]);
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

        var content = new Array();
        for (var i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i);
        }

        var newFile = new File(
            [new Uint8Array(content)], origFile.name, {
                type: mimestring
            }
        );


        // Copy props set by the dropzone in the original file

        var origProps = [
            "upload", "status", "previewElement", "previewTemplate", "accepted"
        ];

        $.each(origProps, function (i, p) {
            newFile[p] = origFile[p];
        });

        return newFile;
    }

    function highlightLastModal() {
        $('.modal-backdrop').last().addClass('last');
        $('.modal').last().addClass('last');
    }

    // transform cropper dataURI output to a Blob which Dropzone accepts
    var dataURItoBlob = function (dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {
            type: 'image/jpeg'
        });
    };
})));