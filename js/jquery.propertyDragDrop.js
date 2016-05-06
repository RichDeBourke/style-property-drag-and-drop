/* =======================================================================
 * jquery.propertyDragDrop.js
 * Version: 1.0
 * Date: 2016/04/17
 * By: Rich DeBourke
 * License: MIT
 * GitHub: https://github.com/RichDeBourke/style-property-drag-and-drop
 *
 * Plugin is a fork of Mikael Plate's jquery-drag-drop-plugin
 * https://github.com/mikeplate/jquery-drag-drop-plugin
 * ======================================================================= */

(function ($, window, document) {
    "use strict";
    var defaultOptions = {
        transferProperty: "backgroundColor",
        dropTargetClass: null, // Required - elements with this class are destination elements
        sourceHighlightClass: null, // Optional class to apply to source element when dragging a clone of the source element (null for nothing)
        cloneClass: null, // Required - class that defines the clones
        cloneWidth: 48, // Width in pixels (gets divided in half to calculate the drag offset)
        cloneHight: 48, // Height in pixels (gets divided in half to calculate the drag offset)
        cloneCanDropClass: null, // Optional class to apply to the clone when dropping is possible
        destinationCanReceiveClass: null, // Optional class to apply to the destination element when it is in range for a drop
        bodyDraggingClass: null, // Required - adds a class to the body to maintain the cursor style

        // Default is to transfer the background color
        didDrop: function ($src, $dst) {
            $dst.css("backgroundColor", $src.css("backgroundColor"));
        }
    },

    $sourceElement = null, // Element that user wanted to drag
    $activeElement = null, // Element that is shown moving around during drag operation
    $destElement = null, // Element currently highlighted as possible drop destination
    dragOffsetX, dragOffsetY, // Position difference from drag-point to active element center
    methods;

    // Private helper methods

    function cancelDestElement(options) {
        if ($destElement !== null) {
            if (options.destinationCanReceiveClass) {
                $destElement.removeClass(options.destinationCanReceiveClass);
            }
            $destElement = null;
        }
        if ($activeElement !== null) {
            if (options.cloneCanDropClass) {
                $activeElement.removeClass(options.cloneCanDropClass);
            }
        }
    }

    // Public methods

    methods = {
        init: function (options) {
            options = $.extend({}, defaultOptions, options);
            this.data("options", options);
            this.on("mousedown.dragdrop touchstart.dragdrop", methods.onStart);
            return this;
        },

        onStart: function (event) {
            var $element = $(this),
                options = $element.data("options");

            if ($element) {
                $sourceElement = $element;
                if (event.type === "touchstart") {
                    dragOffsetX = event.originalEvent.touches[0].clientX;
                    dragOffsetY = event.originalEvent.touches[0].clientY;
                } else {
                    dragOffsetX = event.pageX - options.cloneWidth / 2;
                    dragOffsetY = event.pageY - options.cloneHight / 2;
                }

                $activeElement = $("<div>", {
                                    class: options.cloneClass
                                });

                // Elements that are cloned are added to the body
                $activeElement.appendTo(document.body);
                if (options.sourceHighlightClass) {
                    $element.addClass(options.sourceHighlightClass);
                }

                $activeElement.css({
                    position: "absolute",
                    left: dragOffsetX,
                    top: dragOffsetY,
                    backgroundColor: $element.css(options.transferProperty)
                });

                $(document.body).addClass(options.bodyDraggingClass);

                $(window)
                    .on("mousemove.dragdrop touchmove.dragdrop", {
                        source: $element
                    }, methods.onMove)
                    .on("mouseup.dragdrop touchend.dragdrop", {
                        source: $element
                    }, methods.onEnd);

                event.stopPropagation();
                return false;
            }
        },

        onMove: function (event) {
            var $me,
                options,
                posX,
                posY,
                destElement,
                noDropZone = false,
                $possibleDestElement,
                activeElement = $activeElement[0];

            // Not sure why, but occasionally there is no sourceElement
            if (!$activeElement || !$sourceElement) {
                return;
            }

            $me = event.data.source;
            options = $me.data("options");

            if (event.type === "touchmove") {
                posX = event.originalEvent.touches[0].clientX;
                posY = event.originalEvent.touches[0].clientY;
            } else {
                posX = event.pageX;
                posY = event.pageY;
            }

            activeElement.style.display = "none";
            destElement = document.elementFromPoint(
                // The scroll values are subtracted because elementFromPoint starts from the viewport upper left, not the document
                posX - document.documentElement.scrollLeft - document.body.scrollLeft,
                posY - document.documentElement.scrollTop - document.body.scrollTop
            );
            posX -= 25; // -= dragOffsetX;
            posY -= 25; // -= dragOffsetY;

            activeElement.style.display = "";
            activeElement.style.left = posX + "px";
            activeElement.style.top = posY + "px";

            // Find the element under the clone that's a target (if there is a target)
            // The check for destElement not being the document is because classList errors at the document level
            // IE9 does not support classList - include the eligrey classList.js shim
            while (destElement && (destElement !== document) && !destElement.classList.contains(options.dropTargetClass) && !noDropZone) {
                destElement = destElement.parentNode;
                if (destElement === document.body) {
                    noDropZone = true;
                    destElement = null;
                }
            }

            // If the clone is over a droppable target and it's not the source element then...
            if (destElement && destElement !== $sourceElement[0]) {
                // Check if the destElement is a new (the mouse just moved over it)
                if ($destElement === null || $destElement[0] !== destElement) {
                    $possibleDestElement = $(destElement);
                    if (options.destinationCanReceiveClass) {
                        if ($destElement !== null) {
                            $destElement.removeClass(options.destinationCanReceiveClass);
                        }
                        $possibleDestElement.addClass(options.destinationCanReceiveClass);
                    }
                    if (options.cloneCanDropClass) {
                        $activeElement.addClass(options.cloneCanDropClass);
                    }
                    $destElement = $possibleDestElement;
                }
            } else if ($destElement !== null) {
                cancelDestElement(options);
            }

            event.stopPropagation();
            return false;
        },

        onEnd: function (event) {
            var $me,
                options;

            if (!$activeElement) {
                return;
            }

            $me = event.data.source;
            options = $me.data("options");
            if ($destElement) {
                options.didDrop($sourceElement, $destElement);
            }
            cancelDestElement(options);

            $activeElement.remove();
            if (options.sourceHighlightClass) {
                $sourceElement.removeClass(options.sourceHighlightClass);
            }

            $(window).off("mousemove.dragdrop touchmove.dragdrop");
            $(window).off("mouseup.dragdrop touchend.dragdrop");
            $(document.body).removeClass(options.bodyDraggingClass);
            $sourceElement = $activeElement = null;
        }
    };

    $.fn.propertyDragDrop = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        $.error('Method ' + method + ' does not exist on jQuery.dragdrop');
    };
}(jQuery, window, document));
