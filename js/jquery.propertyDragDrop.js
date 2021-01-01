/* =======================================================================
 jquery.propertyDragDrop.js
 * Version: 2.0
 * Date: 2021/01/01
 * By: Rich DeBourke
 * License: MIT
 * GitHub: https://github.com/RichDeBourke/style-property-drag-and-drop
 * ======================================================================= */

(function ($, win, doc) {
    "use strict";

    var passiveSupported = false;

    try {
        var options = Object.defineProperty({}, "passive", {
            get: function() {
            passiveSupported = true;
            }
        });

        win.addEventListener("test", options, options);
        win.removeEventListener("test", options, options);
    } catch(err) {
        passiveSupported = false;
    }

    // Polyfill for forEach - used for adding listeners to inputs
    if (win.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    var propertyDragDrop = function (element, options) {
        // plugin's default options
        var defaultOptions = {
                transferProperty: "backgroundColor",
                childrenIgnore: null, // Optional - child elements to be ignored
                dropTargetClass: null, // Required - elements with this class are destination elements
                sourceHighlightClass: null, // Optional class to apply to source element when dragging a clone of the source element (null for nothing)
                cloneClass: null, // Required - class that defines the clones
                cloneWidth: 48, // Width in pixels (gets divided in half to calculate the drag offset)
                cloneHight: 48, // Height in pixels (gets divided in half to calculate the drag offset)
                cloneCanDropClass: null, // Optional class to apply to the clone when dropping is possible
                destinationCanReceiveClass: null, // Optional class to apply to the destination element when it is in range for a drop
                bodyDraggingClass: null, // Required - adds a class to the body to maintain the cursor style

                // Default action is to transfer the background color
                didDrop: null
            };

        var $sourceElement = null; // Element that provides the source info
        var $activeElement = null; // Clone element that is dragged around
        var $destElement = null; // Possible drop destination element

        var plugin = this;

        var $element = $(element); // reference to the jQuery version of DOM element

        var pluginOptions = $.extend({}, defaultOptions, options);


        // methods
        function cancelDestElement () {
            if ($destElement !== null) {
                if (pluginOptions.destinationCanReceiveClass) {
                    $destElement.removeClass(pluginOptions.destinationCanReceiveClass);
                }
                $destElement = null;
            }
            if ($activeElement !== null) {
                if (pluginOptions.cloneCanDropClass) {
                    $activeElement.removeClass(pluginOptions.cloneCanDropClass);
                }
            }
        }

        // Callback
        // The OnStart event is called when a slider thumb has been selected
        function callDidDrop ($src, $dst) {
            if (pluginOptions.didDrop && typeof pluginOptions.didDrop === "function") {
                pluginOptions.didDrop($src, $dst);
            } else {
                $dst.css(pluginOptions.transferProperty, $src.css(pluginOptions.transferProperty));

            }
        }

        function onMove (event) {
            var posX;
            var posY;
            var destElement;
            var noDropZone = false;
            var $possibleDestElement;
            var activeElement = $activeElement[0];

            // Not sure why, but occasionally there is no sourceElement
            if (!$activeElement || !$sourceElement) {
                return;
            }

            posX = event.clientX;
            posY = event.clientY;

            activeElement.style.display = "none";
            destElement = doc.elementFromPoint(posX, posY);

            // Wait to offset positions for the clone corner until after checking for what's under the pointer
            posX = event.pageX - (pluginOptions.cloneWidth / 2);
            posY = event.pageY - (pluginOptions.cloneHight / 2);

            activeElement.style.display = "block";
            activeElement.style.left = posX + "px";
            activeElement.style.top = posY + "px";

            // Find the element under the clone that's a target (if there is a target)
            // The check for destElement not being the document is because classList errors at the document level
            // IE9 does not support classList - include the eligrey classList.js shim for IE9
            while (destElement && (destElement !== doc) && !destElement.classList.contains(pluginOptions.dropTargetClass) && !noDropZone) {
                destElement = destElement.parentNode;
                if (destElement === doc) {
                    noDropZone = true;
                    destElement = null;
                }
            }

            // If the clone is over a droppable target and it's not the source element then...
            if (destElement && destElement !== $sourceElement[0]) {
                // Check if the destElement is new (the mouse just moved over it)
                if ($destElement === null || $destElement[0] !== destElement) {
                    $possibleDestElement = $(destElement);
                    if (pluginOptions.destinationCanReceiveClass) {
                        if ($destElement !== null) {
                            $destElement.removeClass(pluginOptions.destinationCanReceiveClass);
                        }
                        $possibleDestElement.addClass(pluginOptions.destinationCanReceiveClass);
                    }
                    if (pluginOptions.cloneCanDropClass) {
                        $activeElement.addClass(pluginOptions.cloneCanDropClass);
                    }
                    $destElement = $possibleDestElement;
                }
            } else if ($destElement !== null) {
                cancelDestElement();
            }

            event.preventDefault();
        }

        function onEnd (event) {

            if (!$activeElement) {
                return;
            }

            if ($destElement) {
                callDidDrop($sourceElement, $destElement);
            }
            cancelDestElement();

            $activeElement.remove();
            $activeElement = null;
            if (pluginOptions.sourceHighlightClass) {
                $sourceElement.removeClass(pluginOptions.sourceHighlightClass);
            }
            $sourceElement = null;

            doc.body.classList.remove(pluginOptions.bodyDraggingClass);
            win.removeEventListener("mousemove", onMove, passiveSupported ? { passive: false } : false);
            win.removeEventListener("pointermove", onMove, passiveSupported ? { passive: false } : false);
            win.removeEventListener("mouseup", onEnd, passiveSupported ? { passive: false } : false);
            win.removeEventListener("pointerend", onEnd, passiveSupported ? { passive: false } : false);

            event.preventDefault();
        }

        function onPointerStart (event) {
            // Position difference from drag-point to active element center
            var dragOffsetX;
            var dragOffsetY;

            if (event.button === 0) {
                $sourceElement = $element;
                dragOffsetX = event.pageX - (pluginOptions.cloneWidth / 2);
                dragOffsetY = event.pageY - (pluginOptions.cloneHight / 2);

                $activeElement = $("<div>", {class: pluginOptions.cloneClass});

                // Elements that are cloned are added to the body
                $activeElement.appendTo(doc.body);
                if (pluginOptions.sourceHighlightClass) {
                    $element.addClass(pluginOptions.sourceHighlightClass);
                }

                $activeElement.css({
                    position: "absolute",
                    width: pluginOptions.cloneWidth,
                    height: pluginOptions.cloneHight,
                    left: dragOffsetX,
                    top: dragOffsetY
                });

                $activeElement.css(pluginOptions.transferProperty, $element.css(pluginOptions.transferProperty));

                doc.body.classList.add(pluginOptions.bodyDraggingClass);

                win.addEventListener("pointermove", onMove, passiveSupported ? { passive: false } : false);
                win.addEventListener("pointerup", onEnd, passiveSupported ? { passive: false } : false);

                event.preventDefault();
            }
        }

        function onMouseStart (event) {
            // Position difference from drag-point to active element center
            var dragOffsetX;
            var dragOffsetY;

            if (event.button === 0) {
                $sourceElement = $element;
                dragOffsetX = event.pageX - (pluginOptions.cloneWidth / 2);
                dragOffsetY = event.pageY - (pluginOptions.cloneHight / 2);

                $activeElement = $("<div>", {class: pluginOptions.cloneClass});

                // Elements that are cloned are added to the body
                $activeElement.appendTo(doc.body);
                if (pluginOptions.sourceHighlightClass) {
                    $element.addClass(pluginOptions.sourceHighlightClass);
                }

                $activeElement.css({
                    position: "absolute",
                    width: pluginOptions.cloneWidth,
                    height: pluginOptions.cloneHight,
                    left: dragOffsetX,
                    top: dragOffsetY
                });

                $activeElement.css(pluginOptions.transferProperty, $element.css(pluginOptions.transferProperty));

                doc.body.classList.add(pluginOptions.bodyDraggingClass);

                win.addEventListener("mousemove", onMove, passiveSupported ? { passive: false } : false);
                win.addEventListener("mouseup", onEnd, passiveSupported ? { passive: false } : false);

                event.preventDefault();
            }
        }


        // the "constructor" method that gets called when the object is created
        plugin.init = function () {
            if (win.PointerEvent) {
                // Use pointer events
                element.querySelectorAll(pluginOptions.childrenIgnore).forEach(function(elem) {
                    elem.addEventListener("pointerdown", function(event) {
                        event.stopPropagation();
                    }, passiveSupported ? { passive: false } : false);
                });
                element.addEventListener("pointerdown", onPointerStart, passiveSupported ? { passive: false } : false);
            } else {
                // It's IE9 or 10 - use the mouse
                element.querySelectorAll(pluginOptions.childrenIgnore).forEach(function(elem) {
                    elem.addEventListener("mousedown", function(event) {
                        event.stopPropagation();
                    }, passiveSupported ? { passive: false } : false);
                });
                element.addEventListener("mousedown", onMouseStart, passiveSupported ? { passive: false } : false);
            }
        };

        // call the "constructor" method
        plugin.init();
    };

    // add the plugin to the jQuery.fn object
    $.fn.propertyDragDrop = function (options) {
        // "this" is the jQuery object passed to the plugin
        return this.each(function () {
            // "this" is each of the DOM elements
            if ($.data(this, "propertyDragDrop") === undefined) {
                $.data(this, "propertyDragDrop", new propertyDragDrop(this, options));
            }
        });
    };

}(jQuery, window, document));
