Style Property Drag and Drop
============================

## jQuery plugin that provides:

* Transfer of a CSS property (e.g. background-color) from one element to another
* Operation with both mouse and touch events
* Using a clone to visually show the transfer
* Finding a destination node, even when that node is a parent node (the parent is covered by a child node)

## Dependencies
* jQuery 2.x - The plugin only supports newer browsers including IE from version 9 - it does not support IE8 or lower

## Usage

Include the CSS file in the head section:

~~~~ html
<link href="property-drag-drop.css" rel="stylesheet" type="text/css">
~~~~

Add jQuery, the plugin, and the JavaScript code to initiate the plugin in the body section:

~~~~ javascript
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
<script src="jquery.property-drag-drop.plugin.js"></script>
<script>
    $(document).ready(function () {
        $(".draggable").propertyDragDrop({
            dropTargetClass: "droppable",
            sourceHighlightClass: "source-highlight",
            cloneClass: "clone",
            cloneCanDropClass: "clone-can-drop",
            destinationCanReceiveClass: "dest-can-receive",
            bodyDraggingClass: "dragging"
        });
    });
</script>
~~~~

### Source (draggable) elements
Any element on the page that has the assigned source class can be a source. In the example, the assigned source class is `draggable`.

### Destination (droppable) elements

Any element on the page that has the assigned destination class can be a destination. In the example, the assigned destination class is `droppable`.

## Demos
[Simple demo](http://richdebourke.github.io/style-property-drag-and-drop/index.html) - example of the plugin

[In operation](http://goo.gl/4Huz36) - plugin in use on a website

## Configuring the plugin

The plugin uses the following parameters when it is initialized:

* **transferProperty** - Optional - CSS property to be transferred - default is backgroundColor
    * *The property can be specified in either CSS or DOM formatting (e.g. background-color or backgroundColor).*
* **dropTargetClass** - Required - elements with this class are destination elements
* **sourceHighlightClass** - Optional - class to apply to source element when dragging a clone of the source element
    * *This class has limited value as the user probably will not require any indication for what was the source element.* 
* **cloneClass** - Required - class that defines the clones
* **cloneWidth** - Optional - width of the clone in pixels - default value is 48 pixels
* **cloneHight** - Optional - height of the clone in pixels - default value is 48 pixels
    * *The clone width & height are needed for positioning of the clone. While it is possible to get the dimensions from the cloneClass, it's easier to just have the size passed in.*
* **cloneCanDropClass** - Optional - class to apply to the clone when dropping is possible
* **destinationCanReceiveClass** - Optional - class to apply to the destination element when the clone is in range for a drop
    * *Just the cloneCanDropClass or the destinationCanReceive class is enough to indicate to the user that the clone can be dropped. Using both on the same page would be redundant.*
* **bodyDraggingClass** - Required - adds a class to the body to maintain the cursor style
* **didDrop** - Optional - callback function that's called after the clone is dropped onto a target. The function is provided with jQuery objects for the source ($src) and destination ($dst). The default is to transfer the background color

## How the plugin works
This plugin is a fork of Mikael Plate's [jquery-drag-drop-plugin](https://github.com/mikeplate/jquery-drag-drop-plugin) with some modifications:
* Removed the canDrag & canDrop callbacks and the destroy, on, and off methods
* Creating a clone is standard (not an option)
* Removed the option for restricting dragging to within a container
* Switched from jQuery .bind/.unbind to .on/.off
* Added a loop to check whether a parent element has the dropTargetClass
    * *For my application, I needed to identify if a parent element was a potential destination element. As a clone is being moved, I use the move event to identify the element that is under the mouse or touch point (elementFromPoint). I then check that element and its parents to see if any element has the dropTargetClass. If I find a parent with the class, the parent is set as the possible destination.*

The plugin adds a listener to the source elements. At a touchstart or mousedown event, a clone with the required source property is created. The clone can be dragged to a destination element. If the clone is released over a destination element, the designated property is transferred to the destination element.

## Why a new drag & drop plugin
There are drag & drop plugins on GitHub that have [clone capability](https://github.com/mikeplate/jquery-drag-drop-plugin), but I needed the ability to identify a droppable target that was under another element (a child node). This is why I added code to cycle through the parent nodes to find if a parent node had the `dropTargetClass`.

## Compatibility
The attribute drag & drop plugin has been confirmed to work as of April 2016 with the latest versions of:
* IE 9, 10, & 11
* Edge (desktop & Surface)
* Chrome (mobile & desktop)
* Firefox
* Android Internet
* Safari (mobile & desktop)

*Note: IE 9 does not support element.classList (which the plugin uses to check for the drop class). For IE 9 I use Eli Grey's [classList.js shim](https://github.com/eligrey/classList.js) to add the classList functionality.*

## License
This plugin is provided under the [MIT license](http://opensource.org/licenses/mit-license.php).

This plugin is based on the jquery-drag-drop-plugin by Mikael Plate, which is also provided under the [MIT License](https://github.com/mikeplate/jquery-drag-drop-plugin/blob/master/LICENSE.txt).

