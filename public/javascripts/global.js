var utils = {

    isEmpty: function (obj) {

        // Speed up calls to hasOwnProperty
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        // null and undefined are "empty"
        if (obj === null || undefined == obj) {
            return true;
        }

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0) {
            return false;
        }
        if (obj.length === 0) {
            return true;
        }

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }

        return true;
    },


    addLoadEvent: function(func) {
      var oldonload = window.onload;
      if (typeof window.onload != 'function') {
        window.onload = func;
      } else {
        window.onload = function() {
          if (oldonload) {
            oldonload();
          }
          func();
        }
      }
    }

};


/*
var lang = {

    isDefined: function(element) {
        return typeof element != 'undefined';
    }
}

var utils = {

    setupAllWysiwygInto: function(element) {
        element.find(".richtext_panel").each(function () {
            utils.setupWysiwyg(this);
        });
    },

    setupAllWysiwyg: function() {
        $(".richtext_panel").each(function () {
            utils.setupWysiwyg(this);
        });
    },

    setupWysiwyg: function(control) {
        var controlEl = $(control);
        controlEl.css("width", "500px");
        controlEl.css("height","300px");
        controlEl.addClass('richtext_panel');
        controlEl.wysiwyg({
            controls: {
                html: {visible: true},
                colorpicker: {
                    groupIndex: 11,
                    visible: true,
                    css: {
                        "color": function (cssValue, Wysiwyg) {
                            var document = Wysiwyg.innerDocument(),
                                defaultTextareaColor = $(document.body).css("color");

                            if (cssValue !== defaultTextareaColor) {
                                return true;
                            }
                            return false;
                        }
                    },
                    exec: function() {
                        if ($.wysiwyg.controls.colorpicker) {
                            $.wysiwyg.controls.colorpicker.init(this);
                        }
                    },
                    tooltip: "Colorpicker"
                },
                fullscreen: {
                    groupIndex: 12,
                    visible: true,
                    exec: function () {
                        if ($.wysiwyg.fullscreen) {
                            $.wysiwyg.fullscreen.init(this);
                        }
                    },
                    tooltip: "Fullscreen"
                }
            },

            initialContent: function() {
                var $get = [];
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split("&amp;");

                for (var i = 0; i < hashes.length; i++) {
                    var hash = hashes[i].split('=');
                    $get.push(hash[0]);
                    $get[hash[0]] = hash[1];
                }

                if ($get.text) {
                    return unescape($get.text.replace(/\+/g, "%20"));
                }
                return "<p>Initial Content</p>";
            }
        });
    },

    showTooltipById: function(id) {
        $("#"+id).tooltip({
            effect: "fade",
            position: "bottom center",
            delay: 50,
            opacity: 0.7});
    },

    confirmDialog: function(message, yesFunction) {
        $('<div></div>').appendTo('body')
            .html('<div><h6>Are you sure ?</h6></div>')
            .dialog({
                modal: true, title: message, zIndex: 10000, autoOpen: true, width: 'auto', resizable: false,
                buttons: {
                    Yes: function (event, ui) {
                        yesFunction(this)
                    },
                    No: function (event, ui) {
                        $(this).dialog('close');
                    }
                }
            });
    }
}
*/