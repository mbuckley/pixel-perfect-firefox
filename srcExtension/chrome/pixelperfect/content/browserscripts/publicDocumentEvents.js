var pixelPerfect = pixelPerfect || {};

if (typeof pixelPerfect.publicDocument == "undefined") {
    pixelPerfect.publicDocument = {};
}

pixelPerfect.publicDocument = function () {
    // private
    var overlayDivId = 'pp_overlay';

    // public
    return {
        notifyPanelOverlayPositionHasChanged: function() {
            if ("createEvent" in document) {
                var element = document.getElementById("ppoc");
                if (element == null) {
                    var element = document.createElement("PixelPerfectOverlayCoordinates");
                }
                element.setAttribute("id", "ppoc")
                element.setAttribute("xPos", this.findPixelPerfectXPos());
                element.setAttribute("yPos", this.findPixelPerfectYPos());
                document.documentElement.appendChild(element);

                var evt = document.createEvent("Events");
                evt.initEvent("overlayMovementEvent", true, false);
                element.dispatchEvent(evt);
            }
        },
        notifyToSaveLastPosition: function() {
            if ("createEvent" in document) {
                var element = document.getElementById("ppoc");
                if (element == null) {
                    var element = document.createElement("PixelPerfectOverlayCoordinates");
                }
                element.setAttribute("id", "ppoc")
                element.setAttribute("xPos", this.findPixelPerfectXPos());
                element.setAttribute("yPos", this.findPixelPerfectYPos());
                document.documentElement.appendChild(element);

                var evt = document.createEvent("Events");
                evt.initEvent("saveLastPositionEvent", true, false);
                element.dispatchEvent(evt);
            }
        },

        findPixelPerfectXPos: function() {
            return this.findPixelPerfectPos()[0];
        },

        findPixelPerfectYPos: function() {
            return this.findPixelPerfectPos()[1];
        },

        findPixelPerfectPos: function() {
            return this.findPos(window.content.document.getElementById(overlayDivId));
        },

        findPos: function(obj) {
            var curleft = curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
                while (obj = obj.offsetParent);
            }
            return [curleft, curtop];
        },
        
        reloadLastOverlay: function() {
        	if ("createEvent" in document) {
        		var element = document.getElementById("ppReloadLastOverlay");
                if (element == null) {
                    var element = document.createElement("PixelPerfectLastOverlay");
                }
                element.setAttribute("id", "ppReloadLastOverlay")
                document.documentElement.appendChild(element);
                
        		var evt = document.createEvent("Events");
                evt.initEvent("reloadLastOverlayEvent", true, false);
                element.dispatchEvent(evt);
            }
        }
    };
}();

window.addEventListener("load", pixelPerfect.publicDocument.reloadLastOverlay, false);