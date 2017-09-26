/**
 * Yet another modal dialog - v1.0
 *
 * Requires jQuery (https://github.com/jquery/jquery)
 * Copyright (c) 2014 guvra
 * Licensed under MIT and GPL
 *
 * Examples:
 * - $.modal().open('Lorem ipsum dolor sit amet, tale sadipscing qui ne, te dicat antiopam torquatos nam.');
 * - $.modal().ajax('/legal/terms');
 * - $('#form').modal();
 * - $('.edit').click(function (event) {
 *       $.modal().ajax('/user/edit', $(event.target).data());
 *       event.preventDefault();
 *   });
 */
(function ($) {
    'use strict';

    /**
     * jQuery plugin implementation of the modal dialog.
     */
    $.fn.modal = function (options) {
        var $this = $(this), modal = $.modal(options);

        if (modal.settings.autoOpen) {
            modal.open($this.clone().show());
        }

        return modal;
    };

    /**
     * Initialize a new modal dialog object.
     */
    $.modal = function (options) {
        /**
         * Constructor.
         */
        var ModalDialog = function (options) {
            this.settings = $.extend({
                ajaxError: '', // the message to display when an ajax request fails
                ajaxLoaderHTML: '', // the HTML content shown while waiting for an ajax response

                autoCenter: true, // whether to automatically center the modal dialog
                autoOpen: true, // whether to automatically open the modal dialog when it is used as a jQuery plugin

                closeOnClick: true, // whether to close the modal dialog when the user clicks outside of the modal dialog
                closeOnEscape: true, // whether to close the modal dialog when the user uses the escape key

                onClose: $.noop, // a callback that prevents the modal dialog from closing when it returns false
                onOpen: $.noop, // a callback that prevents the modal dialog from opening when it returns false

                overlayClass: '', // additional class(es) for the overlay
                overlayCss: {}, // additional CSS properties to set on the overlay

                containerClass: '', // additional classes for the modal dialog container
                containerCss: {}, // additional CSS properties to set on the modal dialog container

                showClose: true, // whether to show the close button
                closeHTML: '', // the HTML content of the close button

                height: 'auto', // the modal dialog height
                width: 'auto', // the modal dialog width
                minHeight: false, // the modal dialog minimum height
                minWidth: false, // the modal dialog minimum width
                maxHeight: false, // the modal dialog maximum height
                maxWidth: false // the modal dialog maximum width
            }, options);

            this.$overlay = $();
            this.$modal = $();
            this.$content = $();
            this.$closeButton = $();

            $.proxy(initialize, this)();
        };

        /**
         * Private variables.
         */
        var autoCenterIntervalId = null;

        /**
         * Check whether the modal dialog is opened.
         */
        ModalDialog.prototype.isOpened = function () {
            return $.contains(document, this.$modal[0]);
        };

        /**
         * Close the modal dialog.
         */
        ModalDialog.prototype.close = function () {
            if (this.settings.onClose() !== false) {
                if (this.isOpened()) {
                    $('body')
                        .unbind('click', onDocumentClick)
                        .unbind('keyup', onDocumentKeyUp);

                    this.$modal.remove();
                    this.$overlay.remove();
                }

                $.proxy(stopAutoCenter, this)();
            }

            return this;
        };

        /**
         * Display HTML content in a modal dialog.
         * The content argument is optional and can either be a jQuery object or a string.
         */
        ModalDialog.prototype.open = function (content) {
            if (this.settings.onOpen() !== false) {
                if (typeof content !== 'undefined') {
                    this.$content.html(getHTML(content));
                }

                if (!this.isOpened()) {
                    $('body')
                        .bind('click', $.proxy(onDocumentClick, this))
                        .bind('keyup', $.proxy(onDocumentKeyUp, this))
                        .append(this.$overlay)
                        .append(this.$modal);
                }

                if (this.settings.autoCenter) {
                    $.proxy(startAutoCenter, this)();
                }
            }

            return this;
        };

        /**
         * Perform an Ajax request and open a modal dialog showing the HTML response.
         */
        ModalDialog.prototype.ajax = function (url, data) {
            var self = this, loaderHTML = getHTML(this.settings.ajaxLoaderHTML);
            if (typeof data === 'undefined') {
                data = {};
            }

            return $.ajax({
                url: url,
                data: data,
                beforeSend: function () {
                    if (loaderHTML) {
                        self.$closeButton.hide();
                        self.open(loaderHTML);
                    }
                }
            }).done(function (response) {
                self.open(response);
            }).fail(function (response) {
                if (self.settings.ajaxError) {
                    if (loaderHTML) {
                        self.close();
                    }
                    alert(self.settings.ajaxError);
                }
            }).always(function () {
                if (loaderHTML && self.settings.showClose) {
                    self.$closeButton.show();
                }
            });
        };

        /**
         * Close the modal dialog when a click is performed on the overlay/close button.
         */
        var onDocumentClick = function (event) {
            var $target = $(event.target);

            if ($target.is(this.$overlay)) {
                if (this.settings.closeOnClick) {
                    this.close();
                }
            } else if ($target.is(this.$closeButton)) {
                this.close();
                event.preventDefault();
            }
        };

        /**
         * Close the modal dialog when the escape key is pressed.
         */
        var onDocumentKeyUp = function (event) {
            if (this.settings.closeOnEscape && event.keyCode === 27) {
                this.close();
            }
        };

        /**
         * Start the modal auto center interval.
         */
        var startAutoCenter = function () {
            var callback = $.proxy(centerContainer, this)
            callback();

            if (autoCenterIntervalId === null) {
                autoCenterIntervalId = window.setInterval(callback, 300);
            }
        };

        /**
         * Stop the modal centering interval.
         */
        var stopAutoCenter = function () {
            if (autoCenterIntervalId !== null) {
                window.clearInterval(autoCenterIntervalId);
                autoCenterIntervalId = null;
            }
        };

        /**
         * Center the modal dialog within the viewport.
         */
        var centerContainer = function () {
            var $window = $(window);

            this.$modal.css({
                left: ($window.outerWidth() - this.$modal.outerWidth()) / 2,
                top: ($window.outerHeight() - this.$modal.outerHeight()) / 2
            });
        };

        /**
         * Get the string representation of a jQuery object.
         * If the argument is a string, the string is returned.
         */
        var getHTML = function (object) {
            return object instanceof jQuery ? object[0].outerHTML : object;
        };

        /**
         * Create a new modal overlay / modal container.
         */
        var initialize = function () {
            // Build a new overlay
            this.$overlay = $('<div class="modal-overlay ' + this.settings.overlayClass + '"></div>');
            this.$overlay.css(this.settings.overlayCss);

            // Build a new modal container
            this.$modal = $('<div class="modal-container ' + this.settings.containerClass + '"></div>');

            // Append the close button to the modal container
            this.$closeButton = $('<a href="#" class="modal-close">' + getHTML(this.settings.closeHTML) + '</a>');
            this.$modal.append(this.$closeButton);

            if (!this.settings.showClose) {
                this.$closeButton.hide();
            }

            // Append the content container to the modal container
            this.$content = $('<div class="modal-content"></div>');
            this.$modal.append(this.$content);

            // Set width/height properties
            var properties = ['height', 'width', 'minHeight', 'minWidth', 'maxHeight', 'maxWidth'];
            for (var i in properties) {
                var property = properties[i];
                if (this.settings[property]) {
                    this.$modal.css(property, this.settings[property]);
                }
            }

            // Set other CSS properties
            this.$modal.css(this.settings.containerCss);
        };

        return new ModalDialog(options);
    };
})(jQuery);
