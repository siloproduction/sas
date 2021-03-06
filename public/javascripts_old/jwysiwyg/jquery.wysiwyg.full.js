//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../jquery.wysiwyg.js
//
//=================


/**
 * WYSIWYG – jQuery plugin 0.98.dev
 *
 * Copyright © 2008–2009 Juan M Martinez, 2010–2013 Akzhan Abdulin and all contributors
 * https://github.com/jwysiwyg/jwysiwyg
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Release: 2013-12-13
 *
 */
/*jslint browser: true, forin: true, white: true */
(function(window, document, undefined) {

(function ($) {
	"use strict";
	/* Wysiwyg namespace: private properties and methods */

	var console = window.console || {
		log: $.noop,
		error: function (msg) {
			$.error(msg);
		}
	},
	supportsProp = ($.fn.prop !== undefined) && ($.fn.removeProp !== undefined);

	// $.browser fallback for jQuery 1.9+.
	if ($.browser === undefined) {
		$.browser = (function () {
			var ua_match = function (ua) {
				ua = ua.toLowerCase();
				var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
				/(webkit)[ \/]([\w.]+)/.exec(ua) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
				[];
				
				return { browser:match[ 1 ] || "", version:match[ 2 ] || "0" };
			},
			matched = ua_match(navigator.userAgent),
			browser = {};
			
			if (matched.browser) {
				browser[ matched.browser ] = true;
				browser.version = matched.version;
			}
			
			if (browser.chrome) {
				browser.webkit = true;
			} else if (browser.webkit) {
				browser.safari = true;
			}
			return browser;
		})();
	}


	function Wysiwyg() {
		// - the item is added by this.ui.appendControls and then appendItem
		// - click triggers this.triggerControl
		// cmd or[key] - designMode exec function name
		// tags - activates control for these tags (@see checkTargets)
		// css - activates control if one of css is applied
		this.controls = {
			bold: {
				groupIndex: 0,
				visible: true,
				tags: ["b", "strong"],
				css: {
					fontWeight: "bold"
				},
				tooltip: "Bold",
				hotkey: {"ctrl": 1, "key": 66}
			},

			copy: {
				groupIndex: 8,
				visible: false,
				tooltip: "Copy"
			},

			createLink: {
				groupIndex: 6,
				visible: true,
				exec: function () {
					var self = this;
					if ($.wysiwyg.controls && $.wysiwyg.controls.link) {
						$.wysiwyg.controls.link.init(this);
					} else if ($.wysiwyg.autoload) {
						$.wysiwyg.autoload.control("wysiwyg.link.js", function () {
							self.controls.createLink.exec.apply(self);
						});
					} else {
						console.error("$.wysiwyg.controls.link not defined. You need to include wysiwyg.link.js file");
					}
				},
				tags: ["a"],
				tooltip: "Create link"
			},
			
			unLink : {
				groupIndex: 6,
				visible: true,
				exec : function() {
					this.editorDoc.execCommand("unlink", false, null);
				},
				tooltip: "Remove link"
			},

			cut: {
				groupIndex: 8,
				visible: false,
				tooltip: "Cut"
			},

			decreaseFontSize: {
				groupIndex: 9,
				visible: false,
				tags: ["small"],
				tooltip: "Decrease font size",
				exec: function () {
					this.decreaseFontSize();
				}
			},

			h1: {
				groupIndex: 7,
				visible: true,
				className: "h1",
				command: ($.browser.msie || $.browser.opera) ? "FormatBlock" : "heading",
				"arguments": ($.browser.msie || $.browser.opera) ? "<h1>" : "h1",
				tags: ["h1"],
				tooltip: "Header 1"
			},

			h2: {
				groupIndex: 7,
				visible: true,
				className: "h2",
				command: ($.browser.msie || $.browser.opera)	? "FormatBlock" : "heading",
				"arguments": ($.browser.msie || $.browser.opera) ? "<h2>" : "h2",
				tags: ["h2"],
				tooltip: "Header 2"
			},

			h3: {
				groupIndex: 7,
				visible: true,
				className: "h3",
				command: ($.browser.msie || $.browser.opera) ? "FormatBlock" : "heading",
				"arguments": ($.browser.msie || $.browser.opera) ? "<h3>" : "h3",
				tags: ["h3"],
				tooltip: "Header 3"
			},

			highlight: {
				tooltip:     "Highlight",
				className:   "highlight",
				groupIndex:  1,
				visible:     false,
				css: {
					backgroundColor: "rgb(255, 255, 102)"
				},
				exec: function () {
					var command, node, selection, args;

					if ($.browser.msie || $.browser.opera) {
						command = "backcolor";
					} else {
						command = "hilitecolor";
					}

					if ($.browser.msie) {
						node = this.getInternalRange().parentElement();
					} else {
						selection = this.getInternalSelection();
						node = selection.extentNode || selection.focusNode;

						while (node.style === undefined) {
							node = node.parentNode;
							if (node.tagName && node.tagName.toLowerCase() === "body") {
								return;
							}
						}
					}

					if (node.style.backgroundColor === "rgb(255, 255, 102)" ||
							node.style.backgroundColor === "#ffff66") {
						args = "#ffffff";
					} else {
						args = "#ffff66";
					}

					this.editorDoc.execCommand(command, false, args);
				}
			},

			html: {
				groupIndex: 10,
				visible: false,
				exec: function (preProcessor, postProcessor) {
					var elementHeight;

					if (this.options.resizeOptions && $.fn.resizable) {
						elementHeight = this.element.height();
					}

					if (this.viewHTML) { //textarea is shown
						this.setContent((typeof postProcessor === 'function') ? postProcessor(this.original.value) : this.original.value);

						$(this.original).hide();
						this.editor.show();

						if (this.options.resizeOptions && $.fn.resizable) {
							// if element.height still the same after frame was shown
							if (elementHeight === this.element.height()) {
								this.element.height(elementHeight + this.editor.height());
							}

							this.element.resizable($.extend(true, {
								alsoResize: this.editor
							}, this.options.resizeOptions));
						}
						
						this.ui.toolbar.find("li").each(function () {
							var li = $(this);

							if (li.hasClass("html")) {
								li.removeClass("active");
							} else {
								li.removeClass('disabled');
							}
						});
					} else { //wysiwyg is shown
						this.saveContent(preProcessor);

						$(this.original).css({
							width:	this.editor.width(),
							height: this.editor.height(),
							resize: "none"
						}).show();
						this.editor.hide();
						
						if (this.options.resizeOptions && $.fn.resizable) {
							// if element.height still the same after frame was hidden
							if (elementHeight === this.element.height()) {
								this.element.height(this.ui.toolbar.height());
							}

							this.element.resizable("destroy");
						}

						this.ui.toolbar.find("li").each(function() {
							var li = $(this);

							if (li.hasClass("html")) {
								li.addClass("active");
							} else {
								if (false === li.hasClass("fullscreen")) {
									li.removeClass("active").addClass('disabled');
								}
							}
						});
					}

					this.viewHTML = !(this.viewHTML);
				},
				tooltip: "View source code"
			},

			increaseFontSize: {
				groupIndex: 9,
				visible: false,
				tags: ["big"],
				tooltip: "Increase font size",
				exec: function () {
					this.increaseFontSize();
				}
			},

			indent: {
				groupIndex: 2,
				visible: true,
				tooltip: "Indent"
			},

			insertHorizontalRule: {
				groupIndex: 6,
				visible: true,
				tags: ["hr"],
				tooltip: "Insert Horizontal Rule"
			},

			insertImage: {
				groupIndex: 6,
				visible: true,
				exec: function () {
					var self = this;

					if ($.wysiwyg.controls && $.wysiwyg.controls.image) {
						$.wysiwyg.controls.image.init(this);
					} else if ($.wysiwyg.autoload) {
						$.wysiwyg.autoload.control("wysiwyg.image.js", function () {
							self.controls.insertImage.exec.apply(self);
						});
					} else {
						console.error("$.wysiwyg.controls.image not defined. You need to include wysiwyg.image.js file");
					}
				},
				tags: ["img"],
				tooltip: "Insert image"
			},

			insertOrderedList: {
				groupIndex: 5,
				visible: true,
				tags: ["ol"],
				tooltip: "Insert Ordered List"
			},

			insertTable: {
				groupIndex: 6,
				visible: true,
				exec: function () {
					var self = this;

					if ($.wysiwyg.controls && $.wysiwyg.controls.table) {
						$.wysiwyg.controls.table(this);
					} else if ($.wysiwyg.autoload) {
						$.wysiwyg.autoload.control("wysiwyg.table.js", function () {
							self.controls.insertTable.exec.apply(self);
						});
					} else {
						console.error("$.wysiwyg.controls.table not defined. You need to include wysiwyg.table.js file");
					}
				},
				tags: ["table"],
				tooltip: "Insert table"
			},

			insertUnorderedList: {
				groupIndex: 5,
				visible: true,
				tags: ["ul"],
				tooltip: "Insert Unordered List"
			},

			italic: {
				groupIndex: 0,
				visible: true,
				tags: ["i", "em"],
				css: {
					fontStyle: "italic"
				},
				tooltip: "Italic",
				hotkey: {"ctrl": 1, "key": 73}
			},

			justifyCenter: {
				groupIndex: 1,
				visible: true,
				tags: ["center"],
				css: {
					textAlign: "center"
				},
				tooltip: "Justify Center"
			},

			justifyFull: {
				groupIndex: 1,
				visible: true,
				css: {
					textAlign: "justify"
				},
				tooltip: "Justify Full"
			},

			justifyLeft: {
				visible: true,
				groupIndex: 1,
				css: {
					textAlign: "left"
				},
				tooltip: "Justify Left"
			},

			justifyRight: {
				groupIndex: 1,
				visible: true,
				css: {
					textAlign: "right"
				},
				tooltip: "Justify Right"
			},

			ltr: {
				groupIndex: 10,
				visible: false,
				exec: function () {
					var p = this.dom.getElement("p");

					if (!p) {
						return false;
					}

					$(p).attr("dir", "ltr");
					return true;
				},
				tooltip : "Left to Right"
			},

			outdent: {
				groupIndex: 2,
				visible: true,
				tooltip: "Outdent"
			},

			paragraph: {
				groupIndex: 7,
				visible: false,
				className: "paragraph",
				command: "FormatBlock",
				"arguments": ($.browser.msie || $.browser.opera) ? "<p>" : "p",
				tags: ["p"],
				tooltip: "Paragraph"
			},

			paste: {
				groupIndex: 8,
				visible: false,
				tooltip: "Paste"
			},

			redo: {
				groupIndex: 4,
				visible: true,
				tooltip: "Redo"
			},

			removeFormat: {
				groupIndex: 10,
				visible: true,
				exec: function () {
					this.removeFormat();
				},
				tooltip: "Remove formatting"
			},

			rtl: {
				groupIndex: 10,
				visible: false,
				exec: function () {
					var p = this.dom.getElement("p");

					if (!p) {
						return false;
					}

					$(p).attr("dir", "rtl");
					return true;
				},
				tooltip : "Right to Left"
			},

			strikeThrough: {
				groupIndex: 0,
				visible: true,
				tags: ["s", "strike"],
				css: {
					textDecoration: "line-through"
				},
				tooltip: "Strike-through"
			},

			subscript: {
				groupIndex: 3,
				visible: true,
				tags: ["sub"],
				tooltip: "Subscript"
			},

			superscript: {
				groupIndex: 3,
				visible: true,
				tags: ["sup"],
				tooltip: "Superscript"
			},

			underline: {
				groupIndex: 0,
				visible: true,
				tags: ["u"],
				css: {
					textDecoration: "underline"
				},
				tooltip: "Underline",
				hotkey: {"ctrl": 1, "key": 85}
			},

			undo: {
				groupIndex: 4,
				visible: true,
				tooltip: "Undo"
			},

			code: {
				visible : true,
				groupIndex: 6,
				tooltip: "Code snippet",
				exec: function () {
					var range	= this.getInternalRange(),
						common	= $(range.commonAncestorContainer),
						$nodeName = range.commonAncestorContainer.nodeName.toLowerCase();
					if (common.parent("code").length) {
						common.unwrap();
					} else {
						if ($nodeName !== "body") {
							common.wrap("<code/>");
						}
					}
				}
			},
			
			cssWrap: {
				visible : false,
				groupIndex: 6,
				tooltip: "CSS Wrapper",
				exec: function () { 
					$.wysiwyg.controls.cssWrap.init(this);
				}
			}
			
		};


		this.defaults = {
html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" style="margin:0"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body style="margin:0;">INITIAL_CONTENT</body></html>',
			debug: false,
			controls: {},
			css: {},
			events: {},
			autoGrow: false,
			autoSave: true,
			brIE: false,					// http://code.google.com/p/jwysiwyg/issues/detail?id=15
			formHeight: 270,
			formWidth: 440,
			iFrameClass: null,
			initialContent: "<p>Initial content</p>",
			maxHeight: 10000,			// see autoGrow
			maxLength: 0,
			messages: {
				nonSelection: "Select the text you wish to link"
			},
			toolbarHtml: '<ul role="menu" class="toolbar"></ul>',
			removeHeadings: false,
			replaceDivWithP: false,
			resizeOptions: false,
			rmUnusedControls: false,	// https://github.com/akzhan/jwysiwyg/issues/52
			rmUnwantedBr: true,			// http://code.google.com/p/jwysiwyg/issues/detail?id=11
			tableFiller: "Lorem ipsum",
			initialMinHeight: null,

			controlImage: {
				forceRelativeUrls: false
			},

			controlLink: {
				forceRelativeUrls: false
			},

			plugins: { // placeholder for plugins settings
				autoload: false,
				i18n: false,
				rmFormat: {
					rmMsWordMarkup: false
				}
			},

			dialog : "default"
		};

		//these properties are set from control hashes
		this.availableControlProperties = [
			"arguments",
			"callback",
			"callbackArguments",
			"className",
			"command",
			"css",
			"custom",
			"exec",
			"groupIndex",
			"hotkey",
			"icon",
			"separator",
			"tags",
			"tooltip",
			"visible"
		];

		this.editor			= null;  //jquery iframe holder
		this.editorDoc		= null;
		this.element		= null;
		this.options		= {};
		this.original		= null;
		this.savedRange		= null;
		this.timers			= [];
		this.validKeyCodes	= [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46];

		this.isDestroyed	= false;

		this.dom		= { // DOM related properties and methods
			ie:		{
				parent: null // link to dom
			},
			w3c:	{
				parent: null // link to dom
			}
		};
		this.dom.parent		= this;
		this.dom.ie.parent	= this.dom;
		this.dom.w3c.parent	= this.dom;

		this.ui			= {};	// UI related properties and methods
		this.ui.self	= this;
		this.ui.toolbar	= null;
		this.ui.initialHeight = null; // ui.grow

		this.dom.getAncestor = function (element, filterTagName) {
			filterTagName = filterTagName.toLowerCase();

			while (element && element.tagName !== undefined && "body" !== element.tagName.toLowerCase()) {
				if (filterTagName === element.tagName.toLowerCase()) {
					return element;
				}

				element = element.parentNode;
			}
			if(!element.tagName && (element.previousSibling || element.nextSibling)) {
				if(element.previousSibling) {
					if(element.previousSibling.tagName.toLowerCase() === filterTagName) {
						return element.previousSibling;
					}
				}
				if(element.nextSibling) {
					if(element.nextSibling.tagName.toLowerCase() === filterTagName) {
						return element.nextSibling;
					}
				}
			}

			return null;
		};

		this.dom.getElement = function (filterTagName) {
			var dom = this;
			filterTagName = filterTagName.toLowerCase();
			return window.getSelection ? dom.w3c.getElement(filterTagName) : dom.ie.getElement(filterTagName);
		};

		this.dom.ie.getElement = function (filterTagName) {
			var dom			= this.parent,
				selection	= dom.parent.getInternalSelection(),
				range		= selection.createRange(),
				element;

			if ("Control" === selection.type) {
				// control selection
				if (1 === range.length) {
					element = range.item(0);
				} else {
					// multiple control selection
					return null;
				}
			} else {
				element = range.parentElement();
			}

			return dom.getAncestor(element, filterTagName);
		};

		this.dom.w3c.getElement = function (filterTagName) {
			var dom		= this.parent,
				range	= dom.parent.getInternalRange(),
				element;

			if (!range) {
				return null;
			}

			element	= range.commonAncestorContainer;

			if (3 === element.nodeType) {
				element = element.parentNode;
			}

			// if startContainer not Text, Comment, or CDATASection element then
			// startOffset is the number of child nodes between the start of the
			// startContainer and the boundary point of the Range
			if (element === range.startContainer) {
				element = element.childNodes[range.startOffset];
			}

			if(!element.tagName && (element.previousSibling || element.nextSibling)) {
				if(element.previousSibling) {
					if(element.previousSibling.tagName.toLowerCase() === filterTagName) {
						return element.previousSibling;
					}
				}
				if(element.nextSibling) {
					if(element.nextSibling.tagName.toLowerCase() === filterTagName) {
						return element.nextSibling;
					}
				}
			}

			return dom.getAncestor(element, filterTagName);
		};

		this.ui.addHoverClass = function () {
			$(this).addClass("wysiwyg-button-hover");
		};

		this.ui.appendControls = function () {
			var ui = this,
				self = this.self,
				controls = self.parseControls(),
				hasVisibleControls	= true, // to prevent separator before first item
				groups = [],
				controlsByGroup = {},
				i,
				currentGroupIndex, // jslint wants all vars at top of function
				iterateGroup = function (controlName, control) { //called for every group when adding
					if (control.groupIndex && currentGroupIndex !== control.groupIndex) {
						currentGroupIndex = control.groupIndex;
						hasVisibleControls = false;
					}

					if (!control.visible) {
						return;
					}

					if (!hasVisibleControls) {
						ui.appendItemSeparator();
						hasVisibleControls = true;
					}

					if (control.custom) {
						ui.appendItemCustom(controlName, control);
					} else {
						ui.appendItem(controlName, control);
					}
				};

			$.each(controls, function (name, c) { //sort by groupIndex
				var index = "empty";

				if (undefined !== c.groupIndex) {
					if ("" === c.groupIndex) {
						index = "empty";
					} else {
						index = c.groupIndex;
					}
				}

				if (undefined === controlsByGroup[index]) {
					groups.push(index);
					controlsByGroup[index] = {};
				}
				controlsByGroup[index][name] = c;
			});

			groups.sort(function (a, b) { //just sort group indexes by
				if ( (typeof a === "number" ) && (typeof b === "number") ) {
					return (a - b);
				}

				a = a.toString();
				b = b.toString();

				if (a > b) {
					return 1;
				}

				if (a === b) {
					return 0;
				}

				return -1;
			});

			if (0 < groups.length) {
				// set to first index in groups to proper placement of separator
				currentGroupIndex = groups[0];
			}

			for (i = 0; i < groups.length; i += 1) {
				$.each(controlsByGroup[groups[i]], iterateGroup);
			}
		};

		this.ui.appendItem = function (name, control) {
			var self = this.self,
				className = control.className || control.command || name || "empty",
				tooltip = control.tooltip || control.command || name || "";

			return $('<li role="menuitem" unselectable="on">' + className + "</li>")
				.addClass(className)
				.attr("title", tooltip)
				.hover(this.addHoverClass, this.removeHoverClass)
				.click(function (event) {
					if ($(this).hasClass("disabled")) {
						return false;
					}

					self.triggerControl(name, control);

					/**
					* @link https://github.com/jwysiwyg/jwysiwyg/issues/219
					*/
					var $target = $(event.target);
					for (var controlName in self.controls) {
						if ($target.hasClass(controlName)) {
							self.ui.toolbar.find("." + controlName).toggleClass("active");
							self.editorDoc.rememberCommand = true;
							break;
						}
					}

					this.blur();
					self.ui.returnRange();
					self.ui.focus();
					return true;
				})
				.appendTo(self.ui.toolbar);
		};

		this.ui.appendItemCustom = function (name, control) {
			var self = this.self,
				tooltip = control.tooltip || control.command || name || "";

			if (control.callback) {
				$(window).bind("trigger-" + name + ".wysiwyg", control.callback);
			}

			return $('<li role="menuitem" unselectable="on" style="background: url(\'' + control.icon + '\') no-repeat;"></li>')
				.addClass("custom-command-" + name)
				.addClass("wysiwyg-custom-command")
				.addClass(name)
				.attr("title", tooltip)
				.hover(this.addHoverClass, this.removeHoverClass)
				.click(function () {
					if ($(this).hasClass("disabled")) {
						return false;
					}

					self.triggerControl.apply(self, [name, control]);

					this.blur();
					self.ui.returnRange();
					self.ui.focus();

					self.triggerControlCallback(name);
					return true;
				})
				.appendTo(self.ui.toolbar);
		};

		this.ui.appendItemSeparator = function () {
			var self = this.self;
			return $('<li role="separator" class="separator"></li>').appendTo(self.ui.toolbar);
		};

		this.autoSaveFunction = function () {
			this.saveContent();
		};

		//called after click in wysiwyg "textarea"
		this.ui.checkTargets = function (element) {
			var self = this.self;

			//activate controls
			$.each(self.options.controls, function (name, control) {
				var className = control.className || control.command || name || "empty",
					tags,
					elm,
					css,
					el,
					// need to check multiple properties for the toolbar
					// if we check one-by-one, a single property match
					// on toolbar elements that have multiple css properties
					// will trigger the button as "active"
					checkActiveStatus = function (cssObject) {
						// set a count flag for how many matches we've encountered
						var matches = 0;

						// set an iterator to count the number of properties
						var total = 0;

						$.each(cssObject, function(cssProperty, cssValue) {
							if ( "function" === typeof cssValue ) {
								if ( cssValue.apply(self, [el.css(cssProperty).toString().toLowerCase(), self]) ) {
									matches += 1;
								}
							} else {
								if ( el.css(cssProperty).toString().toLowerCase() === cssValue ) {
									matches += 1;
								}
							}
							total += 1;
						});
						if ( total === matches ) {
							self.ui.toolbar.find("." + className).addClass("active");
						}
					};

				if ("fullscreen" !== className) {
					self.ui.toolbar.find("." + className).removeClass("active");
				}

				//activate by allowed tags
				if (control.tags || (control.options && control.options.tags)) {
					tags = control.tags || (control.options && control.options.tags);

					elm = element;
					while (elm) {
						if (elm.nodeType !== 1) {
							break;
						}

						if ($.inArray(elm.tagName.toLowerCase(), tags) !== -1) {
							self.ui.toolbar.find("." + className).addClass("active");
						}

						elm = elm.parentNode;
					}
				}

				//activate by supposed css
				if (control.css || (control.options && control.options.css)) {
					css = control.css || (control.options && control.options.css);
					el = $(element);

					while (el) {
						if (el[0].nodeType !== 1) {
							break;
						}
						checkActiveStatus(css);

						el = el.parent();
					}
				}
			});
		};

		this.ui.designMode = function () {
			var attempts = 3,
				self = this.self,
				runner;
				runner = function (attempts) {
					if ("on" === self.editorDoc.designMode) {
						if (self.timers.designMode) {
							window.clearTimeout(self.timers.designMode);
						}

						// IE needs to reget the document element (this.editorDoc) after designMode was set
						if (self.innerDocument() !== self.editorDoc) {
							self.ui.initFrame();
						}

						return;
					}

					try {
						self.editorDoc.designMode = "on";
					} catch (e) {
					}

					attempts -= 1;
					if (attempts > 0) {
						self.timers.designMode = window.setTimeout(function () { runner(attempts); }, 100);
					}
				};

			runner(attempts);
		};

		this.destroy = function () {
			this.isDestroyed = true;

			var i, $form = this.element.closest("form");

			for (i = 0; i < this.timers.length; i += 1) {
				window.clearTimeout(this.timers[i]);
			}

			// Move textarea back to its original position
			$(this.original).appendTo($(this.element.parent()));

			// Remove bindings
			$form.unbind(".wysiwyg");
			this.element.remove();
			$.removeData(this.original, "wysiwyg");
			$(this.original).show();
			return this;
		};

		this.getRangeText = function () {
			var r = this.getInternalRange();

			if (!r) {
				return r;
			}
			
			if (r.toString) {
				r = r.toString();
			} else if (r.text) {	// IE
				r = r.text;
			}

			return r;
		};
		//not used?
		this.execute = function (command, arg) {
			if (typeof (arg) === "undefined") {
				arg = null;
			}
			this.editorDoc.execCommand(command, false, arg);
		};

		this.extendOptions = function (options) {
			var controls = {};

			/**
			 * If the user set custom controls, we catch it, and merge with the
			 * defaults controls later.
			 */
			if ("object" === typeof options.controls) {
				controls = options.controls;
				delete options.controls;
			}

			options = $.extend(true, {}, this.defaults, options);
			options.controls = $.extend(true, {}, controls, this.controls, controls);

			if (options.rmUnusedControls) {
				$.each(options.controls, function (controlName) {
					if (!controls[controlName]) {
						delete options.controls[controlName];
					}
				});
			}

			return options;
		};

		this.ui.focus = function () {
			var self = this.self;

			self.editor.get(0).contentWindow.focus();
			return self;
		};

		this.ui.returnRange = function () {
			var self = this.self, sel;

			if (self.savedRange !== null) {
				if (window.getSelection) { //non IE and there is already a selection
					sel = window.getSelection();
					if (sel.rangeCount > 0) {
						sel.removeAllRanges();
					}
					try {
						sel.addRange(self.savedRange);
					} catch (e) {
						console.error(e);
					}
				} else if (window.document.createRange) { // non IE and no selection
					window.getSelection().addRange(self.savedRange);
				} else if (window.document.selection) { //IE
					self.savedRange.select();
				}

				self.savedRange = null;
			}
		};

		this.increaseFontSize = function () {
			if ($.browser.mozilla || $.browser.opera) {
				this.editorDoc.execCommand("increaseFontSize", false, null);
			} else if ($.browser.webkit) {
				var Range = this.getInternalRange(),
					Selection = this.getInternalSelection(),
					newNode = this.editorDoc.createElement("big");

				// If cursor placed on text node
				if (true === Range.collapsed && 3 === Range.commonAncestorContainer.nodeType) {
					var text = Range.commonAncestorContainer.nodeValue.toString(),
						start = text.lastIndexOf(" ", Range.startOffset) + 1,
						end = (-1 === text.indexOf(" ", Range.startOffset)) ? text : text.indexOf(" ", Range.startOffset);

					Range.setStart(Range.commonAncestorContainer, start);
					Range.setEnd(Range.commonAncestorContainer, end);

					Range.surroundContents(newNode);
					Selection.addRange(Range);
				} else {
					Range.surroundContents(newNode);
					Selection.removeAllRanges();
					Selection.addRange(Range);
				}
			} else {
				console.error("Internet Explorer?");
			}
		};

		this.decreaseFontSize = function () {
			if ($.browser.mozilla || $.browser.opera) {
				this.editorDoc.execCommand("decreaseFontSize", false, null);
			} else if ($.browser.webkit) {
				var Range = this.getInternalRange(),
					Selection = this.getInternalSelection(),
					newNode = this.editorDoc.createElement("small");

				// If cursor placed on text node
				if (true === Range.collapsed && 3 === Range.commonAncestorContainer.nodeType) {
					var text = Range.commonAncestorContainer.nodeValue.toString(),
						start = text.lastIndexOf(" ", Range.startOffset) + 1,
						end = (-1 === text.indexOf(" ", Range.startOffset)) ? text : text.indexOf(" ", Range.startOffset);

					Range.setStart(Range.commonAncestorContainer, start);
					Range.setEnd(Range.commonAncestorContainer, end);

					Range.surroundContents(newNode);
					Selection.addRange(Range);
				} else {
					Range.surroundContents(newNode);
					Selection.removeAllRanges();
					Selection.addRange(Range);
				}
			} else {
				console.error("Internet Explorer?");
			}
		};

		this.getContent = function () {
			if (this.viewHTML) {
				this.setContent(this.original.value);
			}
			return this.events.filter('getContent', this.editorDoc.body.innerHTML);
		};

		/**
		 * A jWysiwyg specific event system.
		 *
		 * Example:
		 *
		 * $("#editor").getWysiwyg().events.bind("getContent", function (orig) {
		 *     return "<div id='content'>"+orgi+"</div>";
		 * });
		 *
		 * This makes it so that when ever getContent is called, it is wrapped in a div#content.
		 */
		this.events = {
			_events : {},

			/**
			 * Similar to jQuery's bind, but for jWysiwyg only.
			 */
			bind : function (eventName, callback) {
				if (typeof (this._events.eventName) !== "object") {
					this._events[eventName] = [];
				}
				this._events[eventName].push(callback);
			},

			/**
			 * Similar to jQuery's trigger, but for jWysiwyg only.
			 */
			trigger : function (eventName, args) {
				if (typeof (this._events.eventName) === "object") {
					var editor = this.editor;
					$.each(this._events[eventName], function (k, v) {
						if (typeof (v) === "function") {
							v.apply(editor, args);
						}
					});
				}
			},

			/**
			 * This "filters" `originalText` by passing it as the first argument to every callback
			 * with the name `eventName` and taking the return value and passing it to the next function.
			 *
			 * This function returns the result after all the callbacks have been applied to `originalText`.
			 */
			filter : function (eventName, originalText) {
				if (typeof (this._events[eventName]) === "object") {
					var editor = this.editor,
						args = Array.prototype.slice.call(arguments, 1);

					$.each(this._events[eventName], function (k, v) {
						if (typeof (v) === "function") {
							originalText = v.apply(editor, args);
						}
					});
				}
				return originalText;
			}
		};


		this.getElementByAttributeValue = function (tagName, attributeName, attributeValue) {
			var i, value, elements = this.editorDoc.getElementsByTagName(tagName);

			for (i = 0; i < elements.length; i += 1) {
				value = elements[i].getAttribute(attributeName);

				if ($.browser.msie) {
					/** IE add full path, so I check by the last chars. */
					value = value.substr(value.length - attributeValue.length);
				}

				if (value === attributeValue) {
					return elements[i];
				}
			}

			return false;
		};

		this.getInternalRange = function () {
			var selection = this.getInternalSelection();

			if (!selection) {
				return null;
			}

			if (selection.rangeCount && selection.rangeCount > 0) { // w3c
				return selection.getRangeAt(0);
			} else if (selection.createRange) { // ie
				return selection.createRange();
			}

			return null;
		};

		this.getInternalSelection = function () {
			// firefox: document.getSelection is deprecated
			var editorWindow = this.editor.get(0).contentWindow;
			if (editorWindow && editorWindow.getSelection) {
				return editorWindow.getSelection();
			}
			else if (this.editorDoc.getSelection) {
				return this.editorDoc.getSelection();
			}
			else if (this.editorDoc.selection) {
				return this.editorDoc.selection;
			}

			return null;
		};

		this.getRange = function () {
			var selection = this.getSelection();

			if (!selection) {
				return null;
			}

			if (selection.rangeCount && selection.rangeCount > 0) { // w3c
				selection.getRangeAt(0);
			} else if (selection.createRange) { // ie
				return selection.createRange();
			}

			return null;
		};

		this.getSelection = function () {
			var selection = (window.getSelection && window.getSelection() !== null && window.getSelection().createRange) ? window.getSelection() : window.document.selection;

			return selection;
		};

		// :TODO: you can type long string and letters will be hidden because of overflow
		this.ui.grow = function () {
			var self = this.self,
				innerBody = $(self.editorDoc.body),
				innerHeight = $.browser.msie ? innerBody[0].scrollHeight : innerBody.height() + 2 + 20, // 2 - borders, 20 - to prevent content jumping on grow
				minHeight = self.ui.initialHeight,
				height = Math.max(innerHeight, minHeight);

			height = Math.min(height, self.options.maxHeight);

			self.editor.attr("scrolling", height < self.options.maxHeight ? "no" : "auto"); // hide scrollbar firefox
			innerBody.css("overflow", height < self.options.maxHeight ? "hidden" : ""); // hide scrollbar chrome

			self.editor.get(0).height = height;

			return self;
		};

		this.init = function (element, options) {
			var self = this,
				$form = $(element).closest("form"),
				newX = (element.width || element.clientWidth || 0),
				newY = (element.height || element.clientHeight || 0)
				;

			this.options	= this.extendOptions(options);
			this.original	= element;
			this.ui.toolbar	= $(this.options.toolbarHtml);

			if ($.browser.msie && parseInt($.browser.version, 10) < 8) {
				this.options.autoGrow = false;
			}

			if (newX === 0 && element.cols) {
				newX = (element.cols * 8) + 21;
			}
			if (newY === 0 && element.rows) {
				newY = (element.rows * 16) + 16;
			}

			this.editor = $(window.location.protocol === "https:" ? '<iframe src="javascript:false;"></iframe>' : "<iframe></iframe>").attr("frameborder", "0");

			if (this.options.iFrameClass) {
				this.editor.addClass(this.options.iFrameClass);
			} else {
				this.editor.css({
					minHeight: (newY - 6).toString() + "px",
					// fix for issue 12 ( http://github.com/akzhan/jwysiwyg/issues/issue/12 )
					width: (newX > 50) ? newX.toString() + "px" : ""
				});
				if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
					this.editor.css("height", newY.toString() + "px");
				}
			}
			/**
			 * Automagically add id to iframe if textarea has its own when possible
			 * ( http://github.com/akzhan/jwysiwyg/issues/245 )
			 */
			if (element.id) {
				var proposedId = element.id + '-wysiwyg-iframe';
				if (! document.getElementById(proposedId)) {
					this.editor.attr('id', proposedId);
				}
			}

			/**
			 * http://code.google.com/p/jwysiwyg/issues/detail?id=96
			 */
			this.editor.attr("tabindex", $(element).attr("tabindex"));

			this.element = $("<div/>").addClass("wysiwyg");

			if (!this.options.iFrameClass) {
				this.element.css({
					width: (newX > 0) ? newX.toString() + "px" : "100%"
				});
			}

			$(element).hide().before(this.element);

			this.viewHTML = false;

			/**
			 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=52
			 */
			this.initialContent = $(element).val();
			this.ui.initFrame();

			if (this.options.resizeOptions && $.fn.resizable) {
				this.element.resizable($.extend(true, {
					alsoResize: this.editor
				}, this.options.resizeOptions));
			}

			if (this.options.autoSave) {
				$form.bind("submit.wysiwyg", function () { self.autoSaveFunction(); });
			}

			$form.bind("reset.wysiwyg", function () { self.resetFunction(); });
		};

		this.ui.initFrame = function () {
			var self = this.self,
				stylesheet,
				growHandler,
				saveHandler,
				toolbarWrapEl;

			toolbarWrapEl = $('<div class="toolbar-wrap"><div style="clear: both"><!-- --></div>').prepend(self.ui.toolbar);
			self.ui.appendControls();
			self.element.append(toolbarWrapEl)
				.append(self.editor)
				.append(self.original);

			self.editorDoc = self.innerDocument();

			if (self.isDestroyed) {
				return null;
			}

			self.ui.designMode();
			self.editorDoc.open();
			self.editorDoc.write(
				self.options.html
					/**
					 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=144
					 */
					.replace(/INITIAL_CONTENT/, function () { return self.wrapInitialContent(); })
			);
			self.editorDoc.close();

			$.wysiwyg.plugin.bind(self);

			$(self.editorDoc).trigger("initFrame.wysiwyg");

			$(self.editorDoc).bind("click.wysiwyg", function (event) {
				self.ui.checkTargets(event.target ? event.target : event.srcElement);
			});

			/**
			 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=20
			 * @link https://github.com/akzhan/jwysiwyg/issues/330
			 */
			$(self.original).focus(function () {
				if ($(this).filter(":visible").length === 0 || $.browser.opera) {
					return;
				}
				self.ui.focus();
			});

			$($.wysiwyg.quirk.quirks).each(function(i, quirk) { quirk.init(self); });

			$(self.editorDoc).keydown(function (event) {
				var emptyContentRegex;
				if (event.keyCode === 8) { // backspace
					emptyContentRegex = /^<([\w]+)[^>]*>(<br\/?>)?<\/\1>$/;
					if (emptyContentRegex.test(self.getContent())) { // if content is empty
						event.stopPropagation(); // prevent remove single empty tag
						return false;
					}
				}

                self.editorDoc.rememberCommand = false;
				return true;
			});

			if (!$.browser.msie) {
				$(self.editorDoc).keydown(function (event) {
					var controlName;
					var control;

					/* Meta for Macs. tom@punkave.com */
					if (event.ctrlKey || event.metaKey) {
						for (controlName in self.options.controls) {
							control = self.options.controls[controlName];
							if (control.hotkey && control.hotkey.ctrl) {
								if (event.keyCode === control.hotkey.key) {
									self.triggerControl.apply(self, [controlName, control]);

									return false;
								}
							}
						}
					}
					return true;
				});
			}

			if (self.options.brIE) {
				$(self.editorDoc).keydown(function (event) {
					if (event.keyCode === 13) {

						if ($.browser.msie || $.browser.opera) {
							var rng = self.getRange();
							if (rng) {
								rng.pasteHTML("<br/>");
								rng.collapse(false);
								rng.select();
							} else {
								self.insertHtml('<br/>');
							}
						} else {
							var selection = self.editorDoc.getSelection();
							if (selection && selection.getRangeAt && selection.rangeCount) {
								var range = selection.getRangeAt(0);
								if (!range) return true;

								// Replace selected content by a newline
								var newlineEl = document.createElement('br');
								range.deleteContents();
								range.insertNode(newlineEl);

								// Remove selection and place cursor after newline
								range.setStartAfter(newlineEl);
								range.collapse(true);
								selection.removeAllRanges();
								selection.addRange(range);
							} else {
								return true;
							}

						}
						return false;
					}

					return true;
				});
			}

			if (self.options.plugins.rmFormat.rmMsWordMarkup) {
				$(self.editorDoc).bind("paste.wysiwyg", function (event) {
          if ($.wysiwyg.rmFormat) {
            if ("object" === typeof (self.options.plugins.rmFormat.rmMsWordMarkup)) {
              $.wysiwyg.rmFormat.run(self, {rules: { msWordMarkup: self.options.plugins.rmFormat.rmMsWordMarkup }});
            } else {
              $.wysiwyg.rmFormat.run(self, {rules: { msWordMarkup: { enabled: true }}});
            }
          }
				});
			}

			if (self.options.autoSave) {
				$(self.editorDoc).keydown(function () { self.autoSaveFunction(); })
					.keyup(function () { self.autoSaveFunction(); })
					.mousedown(function () { self.autoSaveFunction(); })
					.bind($.support.noCloneEvent ? "input.wysiwyg" : "paste.wysiwyg", function () { self.autoSaveFunction(); });
			}

			if (self.options.autoGrow) {
				if (self.options.initialMinHeight !== null) {
					self.ui.initialHeight = self.options.initialMinHeight;
				} else {
					self.ui.initialHeight = $(self.editorDoc).height();
				}
				$(self.editorDoc.body).css("border", "1px solid white"); // cancel margin collapsing

				growHandler = function () {
					self.ui.grow();
				};

				$(self.editorDoc).keyup(growHandler);
				$(self.editorDoc).bind("editorRefresh.wysiwyg", growHandler);

				// fix when content height > textarea height
				self.ui.grow();
			}

			if (self.options.css) {
				if (String === self.options.css.constructor) {
					if ($.browser.msie) {
						stylesheet = self.editorDoc.createStyleSheet(self.options.css);
						$(stylesheet).attr({
							"media":	"all"
						});
					} else {
						stylesheet = $("<link/>").attr({
							"href":		self.options.css,
							"media":	"all",
							"rel":		"stylesheet",
							"type":		"text/css"
						});

						$(self.editorDoc).find("head").append(stylesheet);
					}
				} else {
					self.timers.initFrame_Css = window.setTimeout(function () {
						$(self.editorDoc.body).css(self.options.css);
					}, 0);
				}
			}

			if (self.initialContent.length === 0) {
				if ("function" === typeof (self.options.initialContent)) {
					self.setContent(self.options.initialContent());
				} else {
					self.setContent(self.options.initialContent);
				}
			}

			if (self.options.maxLength > 0) {
				$(self.editorDoc).keydown(function (event) {
					if ($(self.editorDoc).text().length >= self.options.maxLength && $.inArray(event.which, self.validKeyCodes) === -1) {
						event.preventDefault();
					}
				});
			}

			// Support event callbacks
			$.each(self.options.events, function (key, handler) {
				$(self.editorDoc).bind(key + ".wysiwyg", function (event) {
					// Trigger event handler, providing the event and api to
					// support additional functionality.
					handler.apply(self.editorDoc, [event, self]);
				});
			});

			// restores selection properly on focus
			if ($.browser.msie) {
				// Event chain: beforedeactivate => focusout => blur.
				// Focusout & blur fired too late to handle internalRange() in dialogs.
				// When clicked on input boxes both got range = null
				$(self.editorDoc).bind("beforedeactivate.wysiwyg", function () {
					self.savedRange = self.getInternalRange();
				});
			} else {
				$(self.editorDoc).bind("blur.wysiwyg", function () {
					self.savedRange = self.getInternalRange();
				});
			}

			$(self.editorDoc.body).addClass("wysiwyg");
			if (self.options.events && self.options.events.save) {
				saveHandler = self.options.events.save;

				$(self.editorDoc).bind("keyup.wysiwyg", saveHandler);
				$(self.editorDoc).bind("change.wysiwyg", saveHandler);

				if ($.support.noCloneEvent) {
					$(self.editorDoc).bind("input.wysiwyg", saveHandler);
				} else {
					$(self.editorDoc).bind("paste.wysiwyg", saveHandler);
					$(self.editorDoc).bind("cut.wysiwyg", saveHandler);
				}
			}

			/**
			 * XHTML5 {@link https://github.com/akzhan/jwysiwyg/issues/152}
			 */
			if (self.options.xhtml5 && self.options.unicode) {
				var replacements = {ne:8800,le:8804,para:182,xi:958,darr:8595,nu:957,oacute:243,Uacute:218,omega:969,prime:8242,pound:163,igrave:236,thorn:254,forall:8704,emsp:8195,lowast:8727,brvbar:166,alefsym:8501,nbsp:160,delta:948,clubs:9827,lArr:8656,Omega:937,Auml:196,cedil:184,and:8743,plusmn:177,ge:8805,raquo:187,uml:168,equiv:8801,laquo:171,rdquo:8221,Epsilon:917,divide:247,fnof:402,chi:967,Dagger:8225,iacute:237,rceil:8969,sigma:963,Oslash:216,acute:180,frac34:190,lrm:8206,upsih:978,Scaron:352,part:8706,exist:8707,nabla:8711,image:8465,prop:8733,zwj:8205,omicron:959,aacute:225,Yuml:376,Yacute:221,weierp:8472,rsquo:8217,otimes:8855,kappa:954,thetasym:977,harr:8596,Ouml:214,Iota:921,ograve:242,sdot:8901,copy:169,oplus:8853,acirc:226,sup:8835,zeta:950,Iacute:205,Oacute:211,crarr:8629,Nu:925,bdquo:8222,lsquo:8216,apos:39,Beta:914,eacute:233,egrave:232,lceil:8968,Kappa:922,piv:982,Ccedil:199,ldquo:8220,Xi:926,cent:162,uarr:8593,hellip:8230,Aacute:193,ensp:8194,sect:167,Ugrave:217,aelig:230,ordf:170,curren:164,sbquo:8218,macr:175,Phi:934,Eta:919,rho:961,Omicron:927,sup2:178,euro:8364,aring:229,Theta:920,mdash:8212,uuml:252,otilde:245,eta:951,uacute:250,rArr:8658,nsub:8836,agrave:224,notin:8713,ndash:8211,Psi:936,Ocirc:212,sube:8838,szlig:223,micro:181,not:172,sup1:185,middot:183,iota:953,ecirc:234,lsaquo:8249,thinsp:8201,sum:8721,ntilde:241,scaron:353,cap:8745,atilde:227,lang:10216,__replacement:65533,isin:8712,gamma:947,Euml:203,ang:8736,upsilon:965,Ntilde:209,hearts:9829,Alpha:913,Tau:932,spades:9824,dagger:8224,THORN:222,"int":8747,lambda:955,Eacute:201,Uuml:220,infin:8734,rlm:8207,Aring:197,ugrave:249,Egrave:200,Acirc:194,rsaquo:8250,ETH:208,oslash:248,alpha:945,Ograve:210,Prime:8243,mu:956,ni:8715,real:8476,bull:8226,beta:946,icirc:238,eth:240,prod:8719,larr:8592,ordm:186,perp:8869,Gamma:915,reg:174,ucirc:251,Pi:928,psi:968,tilde:732,asymp:8776,zwnj:8204,Agrave:192,deg:176,AElig:198,times:215,Delta:916,sim:8764,Otilde:213,Mu:924,uArr:8657,circ:710,theta:952,Rho:929,sup3:179,diams:9830,tau:964,Chi:935,frac14:188,oelig:339,shy:173,or:8744,dArr:8659,phi:966,iuml:239,Lambda:923,rfloor:8971,iexcl:161,cong:8773,ccedil:231,Icirc:206,frac12:189,loz:9674,rarr:8594,cup:8746,radic:8730,frasl:8260,euml:235,OElig:338,hArr:8660,Atilde:195,Upsilon:933,there4:8756,ouml:246,oline:8254,Ecirc:202,yacute:253,auml:228,permil:8240,sigmaf:962,iquest:191,empty:8709,pi:960,Ucirc:219,supe:8839,Igrave:204,yen:165,rang:10217,trade:8482,lfloor:8970,minus:8722,Zeta:918,sub:8834,epsilon:949,yuml:255,Sigma:931,Iuml:207,ocirc:244};
				self.events.bind("getContent", function (text) {
					return text.replace(/&(?:amp;)?(?!amp|lt|gt|quot)([a-z][a-z0-9]*);/gi, function (str, p1) {
						if (!replacements[p1]) {
							p1 = p1.toLowerCase();
							if (!replacements[p1]) {
								p1 = "__replacement";
							}
						}

						var num = replacements[p1];
						/* Numeric return if ever wanted: return replacements[p1] ? "&#"+num+";" : ""; */
						return String.fromCharCode(num);
					});
				});
			}
			$(self.original).trigger('ready.jwysiwyg', [self.editorDoc, self]);
		};

		this.innerDocument = function () {
			var element = this.editor.get(0);

			if (element.nodeName.toLowerCase() === "iframe") {
				if (element.contentDocument) {				// Gecko
					return element.contentDocument;
				} else if (element.contentWindow) {			// IE
					return element.contentWindow.document;
				}

				if (this.isDestroyed) {
					return null;
				}

				console.error("Unexpected error in innerDocument");
			}

			return element;
		};

		this.insertHtml = function (szHTML) {
			var img, range;

			if (!szHTML || szHTML.length === 0) {
				return this;
			}

			if ($.browser.msie) {
				this.ui.focus();
				this.editorDoc.execCommand("insertImage", false, "#jwysiwyg#");
				img = this.getElementByAttributeValue("img", "src", "#jwysiwyg#");
				if (img) {
					$(img).replaceWith(szHTML);
				}
			} else {
				if ($.browser.mozilla) { // @link https://github.com/akzhan/jwysiwyg/issues/50
					if (1 === $(szHTML).length) {
						range = this.getInternalRange();
						range.deleteContents();
						range.insertNode($(szHTML).get(0));
					} else {
						this.editorDoc.execCommand("insertHTML", false, szHTML);
					}
				} else {
					if (!this.editorDoc.execCommand("insertHTML", false, szHTML)) {
						this.editor.focus();
						/* :TODO: place caret at the end
						if (window.getSelection) {
						} else {
						}
						this.editor.focus();
						*/
						this.editorDoc.execCommand("insertHTML", false, szHTML);
					}
				}
			}

			this.saveContent();

			return this;
		};

		//check allowed properties
		this.parseControls = function () {
			var self = this;

			$.each(this.options.controls, function (controlName, control) {
				$.each(control, function (propertyName) {
					if (-1 === $.inArray(propertyName, self.availableControlProperties)) {
						throw controlName + '["' + propertyName + '"]: property "' + propertyName + '" not exists in Wysiwyg.availableControlProperties';
					}
				});
			});

			if (this.options.parseControls) { //user callback
				return this.options.parseControls.call(this);
			}

			return this.options.controls;
		};

		this.removeFormat = function () {
			if ($.browser.msie) {
				this.ui.focus();
			}

			if (this.options.removeHeadings) {
				this.editorDoc.execCommand("formatBlock", false, "<p>"); // remove headings
			}

			this.editorDoc.execCommand("removeFormat", false, null);
			this.editorDoc.execCommand("unlink", false, null);

			if ($.wysiwyg.rmFormat && $.wysiwyg.rmFormat.enabled) {
				if ("object" === typeof (this.options.plugins.rmFormat.rmMsWordMarkup)) {
					$.wysiwyg.rmFormat.run(this, {rules: { msWordMarkup: this.options.plugins.rmFormat.rmMsWordMarkup }});
				} else {
					$.wysiwyg.rmFormat.run(this, {rules: { msWordMarkup: { enabled: true }}});
				}
			}

			return this;
		};

		this.ui.removeHoverClass = function () {
			$(this).removeClass("wysiwyg-button-hover");
		};

		this.resetFunction = function () {
			this.setContent(this.initialContent);
		};

		this.saveContent = function (filter) {
			if (this.viewHTML) {
				return; // no need
			}
			if (this.original) {
				var content, newContent;

				content = (typeof filter === 'function') ? filter(this.getContent()) : this.getContent();

				if (this.options.rmUnwantedBr) {
					content = content.replace(/<br\/?>$/, "");
				}

				if (this.options.replaceDivWithP) {
					newContent = $("<div/>").addClass("temp").append(content);

					newContent.children("div").each(function () {
						var element = $(this), p = element.find("p"), i;

						if (0 === p.length) {
							p = $("<p></p>");

							if (this.attributes.length > 0) {
								for (i = 0; i < this.attributes.length; i += 1) {
									p.attr(this.attributes[i].name, element.attr(this.attributes[i].name));
								}
							}

							p.append(element.html());

							element.replaceWith(p);
						}
					});

					content = newContent.html();
				}

				var event = $.Event('change');
				event.source = this;
				$(this.original).val(content).trigger(event);

				if (this.options.events && this.options.events.save) {
					this.options.events.save.call(this);
				}
			}

			return this;
		};

		this.setContent = function (newContent) {
			this.editorDoc.body.innerHTML = newContent;
			this.saveContent();

			return this;
		};

		this.triggerControl = function (name, control) {
			var cmd = control.command || name,							//command directly for designMode=on iframe (this.editorDoc)
				args = control["arguments"] || [];

			if (control.exec) {
				control.exec.apply(this, control.callbackArguments);  //custom exec function in control, allows DOM changing
			} else {
				this.ui.focus();
				this.ui.withoutCss(); //disable style="" attr inserting in mozzila's designMode
				// when click <Cut>, <Copy> or <Paste> got "Access to XPConnect service denied" code: "1011"
				// in Firefox untrusted JavaScript is not allowed to access the clipboard
				try {
					this.editorDoc.execCommand(cmd, false, args);
				} catch (e) {
					console.error(e);
				}
			}

			if (this.options.autoSave) {
				this.autoSaveFunction();
			}
		};

		this.triggerControlCallback = function (name) {
			$(window).trigger("trigger-" + name + ".wysiwyg", [this]);
		};

		this.ui.withoutCss = function () {
			var self = this.self;

			if ($.browser.mozilla) {
				try {
					self.editorDoc.execCommand("styleWithCSS", false, false);
				} catch (e) {
					try {
						self.editorDoc.execCommand("useCSS", false, true);
					} catch (e2) {
					}
				}
			}

			return self;
		};

		this.wrapInitialContent = function () {
			var content = this.initialContent;
			return content;
		};
	}


	/*
	 * Wysiwyg namespace: public properties and methods
	 */

	$.wysiwyg = {
		messages: {
			noObject: "Something goes wrong, check object"
		},

		/**
		 * Custom control support by Alec Gorge ( http://github.com/alecgorge )
		 */
		addControl: function (object, name, settings) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg"),
					customControl = {},
					toolbar;

				if (!oWysiwyg) {
					return this;
				}

				customControl[name] = $.extend(true, {visible: true, custom: true}, settings);
				$.extend(true, oWysiwyg.options.controls, customControl);

				// render new toolbar
				toolbar = $(oWysiwyg.options.toolbarHtml);
				oWysiwyg.ui.toolbar.replaceWith(toolbar);
				oWysiwyg.ui.toolbar = toolbar;
				oWysiwyg.ui.appendControls();
			});
		},

		clear: function (object) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.setContent("");
			});
		},

		console: console, // let our console be available for extensions

		destroy: function (object) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.destroy();
			});
		},

		"document": function (object) {
			// no chains because of return
			var oWysiwyg = object.data("wysiwyg");

			if (!oWysiwyg) {
				return undefined;
			}

			return $(oWysiwyg.editorDoc);
		},

        focus: function(object) {
            var oWysiwyg = object.data("wysiwyg");

            if (!oWysiwyg) {
                return undefined;
            }

            oWysiwyg.ui.focus();

            return object;
        },

		getContent: function (object) {
			// no chains because of return
			var oWysiwyg = object.data("wysiwyg");

			if (!oWysiwyg) {
				return undefined;
			}

			return oWysiwyg.getContent();
		},
    
		getSelection: function (object) {
			// no chains because of return
			var oWysiwyg = object.data("wysiwyg");

			if (!oWysiwyg) {
				return undefined;
			}

			return oWysiwyg.getRangeText();
		},

		init: function (object, options) {
			return object.each(function () {
				var opts = $.extend(true, {}, options),
					obj;

				// :4fun:
				// remove this textarea validation and change line in this.saveContent function
				// $(this.original).val(content); to $(this.original).html(content);
				// now you can make WYSIWYG editor on h1, p, and many more tags
				if (("textarea" !== this.nodeName.toLowerCase()) || $(this).data("wysiwyg")) {
					return;
				}

				obj = new Wysiwyg();
				obj.init(this, opts);
				$.data(this, "wysiwyg", obj);

				$(obj.editorDoc).trigger("afterInit.wysiwyg");
			});
		},

		insertHtml: function (object, szHTML) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.insertHtml(szHTML);
			});
		},

		plugin: {
			listeners: {},

			bind: function (Wysiwyg) {
				var self = this;
				
				var makeHandler = function() {
					return function(event) {
						var pluginName = event.data.plugin.name;
						var methodName = event.data.plugin.method;
						$.wysiwyg[pluginName][methodName].apply($.wysiwyg[pluginName], [Wysiwyg]);
					};
				};

				$.each(this.listeners, function (action, handlers) {
					var i, plugin;

					for (i = 0; i < handlers.length; i += 1) {
						plugin = self.parseName(handlers[i]);

						$(Wysiwyg.editorDoc).bind(action + ".wysiwyg", {plugin: plugin}, 
							makeHandler()
						);
					}
				});
			},

			exists: function (name) {
				var plugin;

				if ("string" !== typeof (name)) {
					return false;
				}

				plugin = this.parseName(name);

				if (!$.wysiwyg[plugin.name] || !$.wysiwyg[plugin.name][plugin.method]) {
					return false;
				}

				return true;
			},

			listen: function (action, handler) {
				var plugin;

				plugin = this.parseName(handler);

				if (!$.wysiwyg[plugin.name] || !$.wysiwyg[plugin.name][plugin.method]) {
					return false;
				}

				if (!this.listeners[action]) {
					this.listeners[action] = [];
				}

				this.listeners[action].push(handler);

				return true;
			},

			parseName: function (name) {
				var elements;

				if ("string" !== typeof (name)) {
					return false;
				}

				elements = name.split(".");

				if (2 > elements.length) {
					return false;
				}

				return {name: elements[0], method: elements[1]};
			},

			register: function (data) {
				if (!data.name) {
					console.error("Plugin name missing");
				}

				$.each($.wysiwyg, function (pluginName) {
					if (pluginName === data.name) {
						console.error("Plugin with name '" + data.name + "' was already registered");
					}
				});

				$.wysiwyg[data.name] = data;

				return true;
			}
		},
		
		quirk: {
			quirks: [],
			
			assert: function(expression, message) {
				if (!expression) throw new Error(message);
			},
			
			register: function(quirk) {
				this.assert(typeof quirk.init === 'function', 'quirk.init must be a function');
				this.quirks.push(quirk);
			}
		},

		removeFormat: function (object) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.removeFormat();
			});
		},

		save: function (object) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.saveContent();
			});
		},

		selectAll: function (object) {
			var oWysiwyg = object.data("wysiwyg"), oBody, oRange, selection;

			if (!oWysiwyg) {
				return this;
			}

			oBody = oWysiwyg.editorDoc.body;
			if (window.getSelection) {
				selection = oWysiwyg.getInternalSelection();
				selection.selectAllChildren(oBody);
			} else {
				oRange = oBody.createTextRange();
				oRange.moveToElementText(oBody);
				oRange.select();
			}
		},

		setContent: function (object, newContent) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				oWysiwyg.setContent(newContent);
			});
		},

		triggerControl: function (object, controlName) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				if (!oWysiwyg.controls[controlName]) {
					console.error("Control '" + controlName + "' not exists");
				}

				oWysiwyg.triggerControl.apply(oWysiwyg, [controlName, oWysiwyg.controls[controlName]]);
			});
		},

		support: {
			prop: supportsProp
		},

		utils: {
			extraSafeEntities: [["<", ">", "'", '"', " "], [32]],

			encodeEntities: function (str) {
				var self = this, aStr, aRet = [];

				if (this.extraSafeEntities[1].length === 0) {
					$.each(this.extraSafeEntities[0], function (i, ch) {
						self.extraSafeEntities[1].push(ch.charCodeAt(0));
					});
				}
				aStr = str.split("");
				$.each(aStr, function (i) {
					var iC = aStr[i].charCodeAt(0);
					if ($.inArray(iC, self.extraSafeEntities[1]) && (iC < 65 || iC > 127 || (iC > 90 && iC < 97))) {
						aRet.push('&#' + iC + ';');
					} else {
						aRet.push(aStr[i]);
					}
				});

				return aRet.join('');
			}
		}
	};


	/**
	 * Unifies dialog methods to allow custom implementations
	 * 
	 * Events:
	 *     * afterOpen
	 *     * beforeShow
	 *     * afterShow
	 *     * beforeHide
	 *     * afterHide
	 *     * beforeClose
	 *     * afterClose
	 * 
	 * Example:
	 * var dialog = new ($.wysiwyg.dialog)($('#idToTextArea').data('wysiwyg'), {"title": "Test", "content": "form data, etc."});
	 * 
	 * dialog.bind("afterOpen", function () { alert('you should see a dialog behind this one!'); });
	 * 
	 * dialog.open();
	 * 
	 * 
	 */
	$.wysiwyg.dialog = function (jWysiwyg, opts) {
		
		var theme	= (jWysiwyg && jWysiwyg.options && jWysiwyg.options.dialog) ? jWysiwyg.options.dialog : (opts.theme ? opts.theme : "default"),
			obj		= new $.wysiwyg.dialog.createDialog(theme),
			that	= this,
			$that	= $(that);
				
		this.options = {
			"modal": true,
			"draggable": true,
			"title": "Title",
			"content": "Content",
			"width":  "auto",
			"height": "auto",
			"zIndex": 2000,
			"open": false,
			"close": false
		};

		this.isOpen = false;

		$.extend(this.options, opts);

		this.object = obj;

		// Opens a dialog with the specified content
		this.open = function () {
			this.isOpen = true;

			obj.init.apply(that, []);
			var $dialog = obj.show.apply(that, []);

			$that.trigger("afterOpen", [$dialog]);
			
		};

		this.show = function () {
			this.isOpen = true;
			$that.trigger("beforeShow");
			$that.trigger("afterShow");
		};

		this.hide = function () {
			this.isOpen = false;
			
			$that.trigger("beforeHide");
			
			var $dialog = obj.hide.apply(that, []);
			
			$that.trigger("afterHide", [$dialog]);
		};

		// Closes the dialog window.
		this.close = function () {
			this.isOpen = false;
						
			var $dialog = obj.hide.apply(that, []);
			
			$that.trigger("beforeClose", [$dialog]);
			
			obj.destroy.apply(that, []);
			
			$that.trigger("afterClose", [$dialog]);

			jWysiwyg.ui.focus();
		};

		if (this.options.open) {
			$that.bind("afterOpen", this.options.open);
		}
		if (this.options.close) {
			$that.bind("afterClose", this.options.close);
		}

		return this;
	};

	// "Static" Dialog methods.
	$.extend(true, $.wysiwyg.dialog, {
		_themes : {}, // sample {"Theme Name": object}
		_theme : "", // the current theme

		register : function(name, obj) {
			$.wysiwyg.dialog._themes[name] = obj;
		},

		deregister : function (name) {
			delete $.wysiwyg.dialog._themes[name];
		},

		createDialog : function (name) {
			return new $.wysiwyg.dialog._themes[name]();
		},
		
		getDimensions : function () {
			var width  = document.body.scrollWidth,
				height = document.body.scrollHeight;

			if ($.browser.opera) {
				height = Math.max(
					$(document).height(),
					$(window).height(),
					document.documentElement.clientHeight);
			}

			return [width, height];
		}
	});

	$(function () { // need access to jQuery UI stuff.
		if ($.ui) {
			$.wysiwyg.dialog.register("jqueryui", function () {
				var that = this;

				this._$dialog = null;

				this.init = function() {
					var content = this.options.content;

					if (typeof content === 'object') {
						if (typeof content.html === 'function') {
							content = content.html();
						} else if(typeof content.toString === 'function') {
							content = content.toString();
						}
					}

					that._$dialog = $('<div></div>').attr('title', this.options.title).html(content);

					var dialogHeight = this.options.height === 'auto' ? 300 : this.options.height,
						dialogWidth = this.options.width === 'auto' ? 450 : this.options.width;

					// console.log(that._$dialog);
					
					that._$dialog.dialog({
						modal: this.options.modal,
						draggable: this.options.draggable,
						height: dialogHeight,
						width: dialogWidth
					});

					return that._$dialog;
				};

				this.show = function () {
					that._$dialog.dialog("open");
					return that._$dialog;
				};

				this.hide = function () {
					that._$dialog.dialog("close");
					return that._$dialog;
				};

				this.destroy = function() {
					that._$dialog.dialog("destroy");
					return that._$dialog;
				};
			});
		}

		$.wysiwyg.dialog.register("default", function () {
			var that = this;

			this._$dialog = null;

			this.init = function() {
				var abstractDialog	= this,
					content			= this.options.content;

				if (typeof content === 'object') {
					if(typeof content.html === 'function') {
						content = content.html();
					}
					else if(typeof content.toString === 'function') {
						content = content.toString();
					}
				}

				that._$dialog = $('<div class="wysiwyg-dialog"></div>').css({"z-index": this.options.zIndex});

				var $topbar = $('<div class="wysiwyg-dialog-topbar"><div class="wysiwyg-dialog-close-wrapper"></div><div class="wysiwyg-dialog-title">'+this.options.title+'</div></div>');
				var $link = $('<a href="#" class="wysiwyg-dialog-close-button">X</a>');

				$link.click(function () {
					abstractDialog.close(); // this is important it makes sure that is close from the abstract $.wysiwyg.dialog instace, not just locally 
				});
				
				$topbar.find('.wysiwyg-dialog-close-wrapper').prepend($link);

				var $dcontent = $('<div class="wysiwyg-dialog-content">'+content+'</div>');

				that._$dialog.append($topbar).append($dcontent);
				
				// Set dialog's height & width, and position it correctly:
				var dialogHeight = this.options.height === 'auto' ? 300 : this.options.height,
					dialogWidth = this.options.width === 'auto' ? 450 : this.options.width;
				that._$dialog.hide().css({
					"width": dialogWidth,
					"height": dialogHeight,
					"left": (($(window).width() - dialogWidth) / 2),
					"top": (($(window).height() - dialogHeight) / 3)
				});

				$("body").append(that._$dialog);

				return that._$dialog;
			};

			this.show = function () {

				// Modal feature:
				if (this.options.modal) {
					var dimensions = $.wysiwyg.dialog.getDimensions(),
						wrapper    = $('<div class="wysiwyg-dialog-modal-div"></div>')
						.css({"width": dimensions[0], "height": dimensions[1]});
					that._$dialog.wrap(wrapper);
				}
				
				// Draggable feature:
				if (this.options.draggable) { 
					
					var mouseDown = false;
					
					that._$dialog.find("div.wysiwyg-dialog-topbar").bind("mousedown", function (e) {
						e.preventDefault();
						$(this).css({ "cursor": "move" });
						var $topbar = $(this),
							_dialog = $(this).parents(".wysiwyg-dialog"),
							offsetX = (e.pageX - parseInt(_dialog.css("left"), 10)),
							offsetY = (e.pageY - parseInt(_dialog.css("top"), 10));
						mouseDown = true;
						$(this).css({ "cursor": "move" });
						
						$(document).bind("mousemove", function (e) {
							e.preventDefault();
							if (mouseDown) {
								_dialog.css({
									"top": (e.pageY - offsetY),
									"left": (e.pageX - offsetX)
								});
							}
						}).bind("mouseup", function (e) {
							e.preventDefault();
							mouseDown = false;
							$topbar.css({ "cursor": "auto" });
							$(document).unbind("mousemove").unbind("mouseup");
						});
					
					});
				}
				
				that._$dialog.show();
				return that._$dialog;

			};

			this.hide = function () {
				that._$dialog.hide();
				return that._$dialog;
			};

			this.destroy = function() {
			
				// Modal feature:
				if (this.options.modal) { 
					that._$dialog.unwrap();
				}
				
				// Draggable feature:
				if (this.options.draggable) { 
					that._$dialog.find("div.wysiwyg-dialog-topbar").unbind("mousedown");
				}
				
				that._$dialog.remove();
				return that._$dialog;
			};
		});
	});
	// end Dialog



	$.fn.wysiwyg = function (method) {
		var args = arguments, plugin;

		if ("undefined" !== typeof $.wysiwyg[method]) {
			// set argument object to undefined
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.wysiwyg[method].apply($.wysiwyg, Array.prototype.slice.call(args, 1));
		} else if ("object" === typeof method || !method) {
			Array.prototype.unshift.call(args, this);
			return $.wysiwyg.init.apply($.wysiwyg, args);
		} else if ($.wysiwyg.plugin.exists(method)) {
			plugin = $.wysiwyg.plugin.parseName(method);
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.wysiwyg[plugin.name][plugin.method].apply($.wysiwyg[plugin.name], Array.prototype.slice.call(args, 1));
		} else {
			console.error("Method '" +  method + "' does not exist on jQuery.wysiwyg.\nTry to include some extra controls or plugins");
		}
	};
	
	$.fn.getWysiwyg = function () {
		return this.data("wysiwyg");
	};

})(window.jQuery);

})(window, document);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../controls/wysiwyg.colorpicker.js
//
//=================


/**
 * Controls: Colorpicker plugin
 * 
 * Depends on jWYSIWYG, (farbtastic || other colorpicker plugins)
 */
(function ($) {
	"use strict";

	if (undefined === $.wysiwyg) {
		throw "wysiwyg.colorpicker.js depends on $.wysiwyg";
	}

	if (!$.wysiwyg.controls) {
		$.wysiwyg.controls = {};
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	$.wysiwyg.controls.colorpicker = {
		modalOpen: false,
		color: {
			back: {
				prev: "#ffffff",
				palette: []
			},
			fore: {
				prev: "#123456",
				palette: []
			}
		},

		addColorToPalette: function (type, color) {
			if (-1 === $.inArray(color, this.color[type].palette)) {
				this.color[type].palette.push(color);
			} else {
				this.color[type].palette.sort(function (a, b) {
					if (a === color) {
						return 1;
					}

					return 0;
				});
			}
		},

		init: function (Wysiwyg) {
			if ($.wysiwyg.controls.colorpicker.modalOpen === true) {
				return false;
			} else {
				$.wysiwyg.controls.colorpicker.modalOpen = true;
			}
			var self = this, elements, dialog, colorpickerHtml, dialogReplacements, key, translation;

            		var initialContentPalettes = Wysiwyg.getContent().match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi) || [];
            		for (var i = 0; i < initialContentPalettes.length; i++) { self.addColorToPalette("fore", initialContentPalettes[i]); }
            
			dialogReplacements = {
				legend: "Colorpicker",
				color: "Color",
				applyForeColor: "Set Text",
				applyBgColor: "Set Background",
				reset: "Cancel"
			};

			colorpickerHtml = '<form class="wysiwyg"><fieldset><legend>{legend}</legend>' +
				'<ul class="palette"></ul>' +
				'<label>{color}: <input type="text" name="color" value="#123456"/></label>' +
				'<div class="wheel"></div>' +
				'<input type="button" class="button applyForeColor" value="{applyForeColor}"/> ' +
				'<input type="button" class="button applyBgColor" value="{applyBgColor}"/> ' +
				'<input type="reset" value="{reset}"/></fieldset></form>';

			for (key in dialogReplacements) {
				if ($.wysiwyg.i18n) {
					translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.colorpicker");

					if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
					}

					dialogReplacements[key] = translation;
				}

				colorpickerHtml = colorpickerHtml.replace("{" + key + "}", dialogReplacements[key]);
			}

			if ($.modal) {
				elements = $(colorpickerHtml);

				if ($.farbtastic) {
					this.renderPalette(elements, "fore");
					elements.find(".wheel").farbtastic(elements.find("input:text"));
				}

				$.modal(elements.html(), {
					maxWidth: Wysiwyg.defaults.formWidth,
					maxHeight: Wysiwyg.defaults.formHeight,
					overlayClose: true,

					onShow: function (dialog) {
						$("input:submit", dialog.data).click(function (e) {
							var color = $('input[name="color"]', dialog.data).val();
							self.color.fore.prev = color;
							self.addColorToPalette("fore", color);

							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
							}

							Wysiwyg.editorDoc.execCommand('ForeColor', false, color);
							$.modal.close();
							return false;
						});
						$("input:reset", dialog.data).click(function (e) {
							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
							}

							$.modal.close();
							return false;
						});
						$("fieldset", dialog.data).click(function (e) {
							e.stopPropagation();
						});
					},

					onClose: function (dialog) {
						$.wysiwyg.controls.colorpicker.modalOpen = false;
						$.modal.close();
					}
				});
			} else if ($.fn.dialog) {
				elements = $(colorpickerHtml);

				if ($.farbtastic) {
					this.renderPalette(elements, "fore");
					elements.find(".wheel").farbtastic(elements.find("input:text"));
				}

				dialog = elements.appendTo("body");
				var buttonSetup = {};
				buttonSetup[ dialogReplacements['applyForeColor'] ] = function() {
					dialog.find('input.applyForeColor').click();
				};
				buttonSetup[ dialogReplacements['applyBgColor'] ] = function() {
					dialog.find('input.applyBgColor').click();
				};
				buttonSetup[ dialogReplacements['reset'] ] = function() {
					dialog.find('input:reset').click();
				};
				
				dialog.dialog({
					modal: true,
					open: function (event, ui) {
						$("input:button,input:reset", elements).hide();
						$("input.applyForeColor,input.applyBgColor", elements).click(function (e) {
							var color = $('input[name="color"]', dialog).val();
							self.color.fore.prev = color;
							self.addColorToPalette("fore", color);

							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
							}

							if ($(this).hasClass('applyForeColor')) {
								Wysiwyg.editorDoc.execCommand('ForeColor', false, color);
							} else {
								if ($.browser.msie)
									Wysiwyg.editorDoc.execCommand('BackColor', false, color);
								else
									Wysiwyg.editorDoc.execCommand('hilitecolor',false,color);							
							}							
							
							$(dialog).dialog("close");
							return false;
						});
						$("input:reset", elements).click(function (e) {
							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
							}

							$(dialog).dialog("close");
							return false;
						});
						$('fieldset', elements).click(function (e) {
							e.stopPropagation();
						});
					},
					buttons : buttonSetup,
					close: function (event, ui) {
						$.wysiwyg.controls.colorpicker.modalOpen = false;
						dialog.dialog("destroy");
						dialog.remove();
					}
				});
			} else {
				if ($.farbtastic) {
					elements = $("<div/>")
						.css({"position": "fixed",
							"z-index": 2000,
							"left": "50%", "top": "50%", "background": "rgb(0, 0, 0)",
							"margin-top": -1 * Math.round(Wysiwyg.defaults.formHeight / 2),
							"margin-left": -1 * Math.round(Wysiwyg.defaults.formWidth / 2)})
						.html(colorpickerHtml);
					this.renderPalette(elements, "fore");
					elements.find("input[name=color]").val(self.color.fore.prev);
					elements.find(".wheel").farbtastic(elements.find("input:text"));
					$("input.applyForeColor,input.applyBgColor", elements).click(function (event) {
						var color = $('input[name="color"]', elements).val();
						self.color.fore.prev = color;
						self.addColorToPalette("fore", color);

						if ($.browser.msie) {
							Wysiwyg.ui.returnRange();
						}

						if ($(this).hasClass('applyForeColor')) {
							Wysiwyg.editorDoc.execCommand('ForeColor', false, color);
						} else {
							if ($.browser.msie)
								Wysiwyg.editorDoc.execCommand('BackColor', false, color);
							else
								Wysiwyg.editorDoc.execCommand('hilitecolor',false,color);							
						}

						$(elements).remove();
						$.wysiwyg.controls.colorpicker.modalOpen = false;
						return false;
					});
					$("input:reset", elements).click(function (event) {

						if ($.browser.msie) {
							Wysiwyg.ui.returnRange();
						}

						$(elements).remove();
						$.wysiwyg.controls.colorpicker.modalOpen = false;
						return false;
					});
					$("body").append(elements);
					elements.click(function (e) {
						e.stopPropagation();
					});
				}
			}
		},

		renderPalette: function (jqObj, type) {
			var palette = jqObj.find(".palette"),
				bind = function () {
					var color = $(this).text();
					jqObj.find("input[name=color]").val(color);
					// farbtastic binds on keyup
					if ($.farbtastic) {
						jqObj.find("input[name=color]").trigger("keyup");
					}
				},
				colorExample,
				colorSelect,
				i;

			for (i = this.color[type].palette.length - 1; i > -1; i -= 1) {
				colorExample = $("<div/>").css({
					"float": "left",
					"width": "16px",
					"height": "16px",
					"margin": "0px 5px 0px 0px",
					"background-color": this.color[type].palette[i]
				});

				colorSelect = $("<li>" + this.color[type].palette[i] + "</li>")
					.css({"cursor": "pointer", "list-style": "none"})
					.append(colorExample)
					.bind("click.wysiwyg", bind);

				palette.append(colorSelect).css({"margin": "0px", "padding": "0px"});
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../controls/wysiwyg.cssWrap.js
//
//=================


/**
 * Controls: Element CSS Wrapper plugin
 *
 * Depends on jWYSIWYG
 * 
 * By Yotam Bar-On (https://github.com/tudmotu)
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "wysiwyg.cssWrap.js depends on $.wysiwyg";
	}
	/* For core enhancements #143
	$.wysiwyg.ui.addControl("cssWrap", {
		visible : false,
		groupIndex: 6,
		tooltip: "CSS Wrapper",
		exec: function () { 
				$.wysiwyg.controls.cssWrap.init(this);
			}
	}
	*/	
	if (!$.wysiwyg.controls) {
		$.wysiwyg.controls = {};
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	$.wysiwyg.controls.cssWrap = {
		init: function (Wysiwyg) {
			var self = this, formWrapHtml, key, translation,
				dialogReplacements = {
					legend	: "Wrap Element",
					wrapperType : "Wrapper Type",
					ID : "ID",
					"class" : "Class",
					wrap  : "Wrap",
					unwrap: "Unwrap",
					cancel   : "Cancel"
				};

			formWrapHtml = '<form class="wysiwyg"><fieldset><legend>{legend}</legend>' +
				'<div class="wysiwyg-dialogRow"><label>{wrapperType}: &nbsp;<select name="type"><option value="span">Span</option><option value="div">Div</option></select></label></div>' +
				'<div class="wysiwyg-dialogRow"><label>{ID}: &nbsp;<input name="id" type="text" /></label></div>' + 
				'<div class="wysiwyg-dialogRow"><label>{class}: &nbsp;<input name="class" type="text" /></label></div>' +
				'<div class="wysiwyg-dialogRow"><input type="button" class="button cssWrap-unwrap" style="display:none;" value="{unwrap}"/></label>' +
				'<input type="submit"  class="button cssWrap-submit" value="{wrap}"/></label>' +
				'<input type="reset" class="button cssWrap-cancel" value="{cancel}"/></div></fieldset></form>';

			for (key in dialogReplacements) {
				if ($.wysiwyg.i18n) {
					translation = $.wysiwyg.i18n.t(dialogReplacements[key]);
					if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
					}
					dialogReplacements[key] = translation;
				}
				formWrapHtml = formWrapHtml.replace("{" + key + "}", dialogReplacements[key]);
			}
			if (!$(".wysiwyg-dialog-wrapper").length) {
				$(formWrapHtml).appendTo("body");
				$("form.wysiwyg").dialog({
					modal: true,
					open: function (ev, ui) {
						var $this = $(this), range	= Wysiwyg.getInternalRange(), common, $nodeName;
						// We make sure that there is some selection:
						if (range) {
							if ($.browser.msie) {
								Wysiwyg.ui.focus();
							}
							common	= $(range.commonAncestorContainer);
						} else {
							alert("You must select some elements before you can wrap them.");
							$this.dialog("close");
							return 0;
						}
						$nodeName = range.commonAncestorContainer.nodeName.toLowerCase();
						// If the selection is already a .wysiwygCssWrapper, then we want to change it and not double-wrap it.
						if (common.parent(".wysiwygCssWrapper").length) {
							alert(common.parent(".wysiwygCssWrapper").get(0).nodeName.toLowerCase());
							$this.find("select[name=type]").val(common.parent(".wysiwygCssWrapper").get(0).nodeName.toLowerCase());
							$this.find("select[name=type]").attr("disabled", "disabled");
							$this.find("input[name=id]").val(common.parent(".wysiwygCssWrapper").attr("id"));
							$this.find("input[name=class]").val(common.parent(".wysiwygCssWrapper").attr("class").replace('wysiwygCssWrapper ', ''));
							// Add the "unwrap" button:
							$("form.wysiwyg").find(".cssWrap-unwrap").show();
							$("form.wysiwyg").find(".cssWrap-unwrap").click(function (e) {
								e.preventDefault();
								if ($nodeName !== "body") {
									common.unwrap();
								}
								$this.dialog("close");
								return 1;
							});
						}
						// Submit button.
						$("form.wysiwyg").find(".cssWrap-submit").click(function (e) {
							e.preventDefault();
							var $wrapper = $("form.wysiwyg").find("select[name=type]").val(),
								$id = $("form.wysiwyg").find("input[name=id]").val(),
								$class = $("form.wysiwyg").find("input[name=class]").val();

							if ($nodeName !== "body") {
								// If the selection is already a .wysiwygCssWrapper, then we want to change it and not double-wrap it.
								if (common.parent(".wysiwygCssWrapper").length) {
									common.parent(".wysiwygCssWrapper").attr("id", $class);
									common.parent(".wysiwygCssWrapper").attr("class", $class);
								} else {
									common.wrap("<" + $wrapper + " id=\"" + $id + "\" class=\"" + "wysiwygCssWrapper " + $class + "\"/>");
								}
							} else {
								// Currently no implemntation for if $nodeName == 'body'.
							}
							$this.dialog("close");
						});
						// Cancel button.
						$("form.wysiwyg").find(".cssWrap-cancel").click(function (e) {
							e.preventDefault();
							$this.dialog("close");
							return 1;
						});
					},
					close: function () {
						$(this).dialog("destroy");
						$(this).remove();
					}
				});
				Wysiwyg.saveContent();
			}
			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
			return 1;
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../controls/wysiwyg.image.js
//
//=================


/**
 * Controls: Image plugin
 *
 * Depends on jWYSIWYG
 */
(function ($) {
	"use strict";

	if (undefined === $.wysiwyg) {
		throw "wysiwyg.image.js depends on $.wysiwyg";
	}

	if (!$.wysiwyg.controls) {
		$.wysiwyg.controls = {};
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	$.wysiwyg.controls.image = {
		groupIndex: 6,
		visible: true,
		exec: function () {
			$.wysiwyg.controls.image.init(this);
		},
		tags: ["img"],
		tooltip: "Insert image",
		init: function (Wysiwyg) {
			var self = this, elements, adialog, dialog, formImageHtml, regexp, dialogReplacements, key, translation,
				img = {
					alt: "",
					self: Wysiwyg.dom ? Wysiwyg.dom.getElement("img") : null, // link to element node
					src: "http://",
					title: ""
				};

			dialogReplacements = {
				legend	: "Insert Image",
				preview : "Preview",
				url     : "URL",
				title   : "Title",
				description : "Description",
				width   : "Width",
				height  : "Height",
				original : "Original W x H",
				"float"	: "Float",
				floatNone : "None",
				floatLeft : "Left",
				floatRight : "Right",
				submit  : "Insert Image",
				reset   : "Cancel",
				fileManagerIcon : "Select file from server"
			};

			formImageHtml = '<form class="wysiwyg" id="wysiwyg-addImage"><fieldset>' +
				'<div class="form-row"><span class="form-row-key">{preview}:</span><div class="form-row-value"><img src="" alt="{preview}" style="margin: 2px; padding:5px; max-width: 100%; overflow:hidden; max-height: 100px; border: 1px solid rgb(192, 192, 192);"/></div></div>' +
				'<div class="form-row"><label for="name">{url}:</label><div class="form-row-value"><input type="text" name="src" value=""/>';

			if ($.wysiwyg.fileManager && $.wysiwyg.fileManager.ready) {
				// Add the File Manager icon:
				formImageHtml += '<div class="wysiwyg-fileManager" title="{fileManagerIcon}"/>';
			}

			formImageHtml += '</div></div>' +
				'<div class="form-row"><label for="name">{title}:</label><div class="form-row-value"><input type="text" name="imgtitle" value=""/></div></div>' +
				'<div class="form-row"><label for="name">{description}:</label><div class="form-row-value"><input type="text" name="description" value=""/></div></div>' +
				'<div class="form-row"><label for="name">{width} x {height}:</label><div class="form-row-value"><input type="text" name="width" value="" class="width-small"/> x <input type="text" name="height" value="" class="width-small"/></div></div>' +
				'<div class="form-row"><label for="name">{original}:</label><div class="form-row-value"><input type="text" name="naturalWidth" value="" class="width-small" disabled="disabled"/> x ' +
				'<input type="text" name="naturalHeight" value="" class="width-small" disabled="disabled"/></div></div>' +
				'<div class="form-row"><label for="name">{float}:</label><div class="form-row-value"><select name="float">' +
				'<option value="">{floatNone}</option>' +
				'<option value="left">{floatLeft}</option>' +
				'<option value="right">{floatRight}</option></select></div></div>' +
				'<div class="form-row form-row-last"><label for="name"></label><div class="form-row-value"><input type="submit" class="button" value="{submit}"/> ' +
				'<input type="reset" value="{reset}"/></div></div></fieldset></form>';

			for (key in dialogReplacements) {
				if ($.wysiwyg.i18n) {
					translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.image");

					if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
					}

					dialogReplacements[key] = translation;
				}

				regexp = new RegExp("{" + key + "}", "g");
				formImageHtml = formImageHtml.replace(regexp, dialogReplacements[key]);
			}

			if (img.self) {
				img.src    = img.self.src    ? img.self.src    : "";
				img.alt    = img.self.alt    ? img.self.alt    : "";
				img.title  = img.self.title  ? img.self.title  : "";
				img.width  = img.self.width  ? img.self.width  : "";
				img.height = img.self.height ? img.self.height : "";
				img.styleFloat = $(img.self).css("float");
			}

			adialog = new $.wysiwyg.dialog(Wysiwyg, {
				"title"   : dialogReplacements.legend,
				"content" : formImageHtml
			});

			$(adialog).bind("afterOpen", function (e, dialog) {
				dialog.find("form#wysiwyg-addImage").submit(function (e) {
					e.preventDefault();
					self.processInsert(dialog.container, Wysiwyg, img);

					adialog.close();
					return false;
				});

				// File Manager (select file):
				if ($.wysiwyg.fileManager) {
					$("div.wysiwyg-fileManager").bind("click", function () {
						$.wysiwyg.fileManager.init(Wysiwyg, function (selected) {
							dialog.find("input[name=src]").val(selected);
							dialog.find("input[name=src]").trigger("change");
						});
					});
				}

				$("input:reset", dialog).click(function (e) {
					adialog.close();

					return false;
				});

				$("fieldset", dialog).click(function (e) {
					e.stopPropagation();
				});

				self.makeForm(dialog, img);
			});

			adialog.open();

			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
		},

		processInsert: function (context, Wysiwyg, img) {
			var image,
				url = $('input[name="src"]', context).val(),
				title = $('input[name="imgtitle"]', context).val(),
				description = $('input[name="description"]', context).val(),
				width = $('input[name="width"]', context).val(),
				height = $('input[name="height"]', context).val(),
				styleFloat = $('select[name="float"]', context).val(),
				styles = [],
				style = "",
				found,
				baseUrl;

			if (Wysiwyg.options.controlImage && Wysiwyg.options.controlImage.forceRelativeUrls) {
				baseUrl = window.location.protocol + "//" + window.location.hostname
					+ (window.location.port ? ":" + window.location.port : "");
				if (0 === url.indexOf(baseUrl)) {
					url = url.substr(baseUrl.length);
				}
			}

			if (img.self) {
				// to preserve all img attributes
				$(img.self).attr("src", url)
					.attr("title", title)
					.attr("alt", description)
					.css("float", styleFloat);

				if (width.toString().match(/^[0-9]+(px|%)?$/)) {
					$(img.self).css("width", width);
				} else {
					$(img.self).css("width", "");
				}

				if (height.toString().match(/^[0-9]+(px|%)?$/)) {
					$(img.self).css("height", height);
				} else {
					$(img.self).css("height", "");
				}

				Wysiwyg.saveContent();
			} else {
				found = width.toString().match(/^[0-9]+(px|%)?$/);
				if (found) {
					if (found[1]) {
						styles.push("width: " + width + ";");
					} else {
						styles.push("width: " + width + "px;");
					}
				}

				found = height.toString().match(/^[0-9]+(px|%)?$/);
				if (found) {
					if (found[1]) {
						styles.push("height: " + height + ";");
					} else {
						styles.push("height: " + height + "px;");
					}
				}

				if (styleFloat.length > 0) {
					styles.push("float: " + styleFloat + ";");
				}

				if (styles.length > 0) {
					style = ' style="' + styles.join(" ") + '"';
				}

				image = "<img src='" + url + "' title='" + title + "' alt='" + description + "'" + style + "/>";
				Wysiwyg.insertHtml(image);
			}
		},

		makeForm: function (form, img) {
			form.find("input[name=src]").val(img.src);
			form.find("input[name=imgtitle]").val(img.title);
			form.find("input[name=description]").val(img.alt);
			form.find('input[name="width"]').val(img.width);
			form.find('input[name="height"]').val(img.height);
			form.find('select[name="float"]').val(img.styleFloat);
			form.find('img').attr("src", img.src);

			form.find('img').bind("load", function () {
				if (form.find('img').get(0).naturalWidth) {
					form.find('input[name="naturalWidth"]').val(form.find('img').get(0).naturalWidth);
					form.find('input[name="naturalHeight"]').val(form.find('img').get(0).naturalHeight);
				} else if (form.find('img').attr("naturalWidth")) {
					form.find('input[name="naturalWidth"]').val(form.find('img').attr("naturalWidth"));
					form.find('input[name="naturalHeight"]').val(form.find('img').attr("naturalHeight"));
				}
			});

			form.find("input[name=src]").bind("change", function () {
				form.find('img').attr("src", this.value);
			});

			return form;
		}
	};

	$.wysiwyg.insertImage = function (object, url, attributes) {
		return object.each(function () {
			var Wysiwyg = $(this).data("wysiwyg"),
				image,
				attribute;

			if (!Wysiwyg) {
				return this;
			}

			if (!url || url.length === 0) {
				return this;
			}

			if ($.browser.msie) {
				Wysiwyg.ui.focus();
			}

			if (attributes) {
				Wysiwyg.editorDoc.execCommand("insertImage", false, "#jwysiwyg#");
				image = Wysiwyg.getElementByAttributeValue("img", "src", "#jwysiwyg#");

				if (image) {
					image.src = url;

					for (attribute in attributes) {
						if (attributes.hasOwnProperty(attribute)) {
							image.setAttribute(attribute, attributes[attribute]);
						}
					}
				}
			} else {
				Wysiwyg.editorDoc.execCommand("insertImage", false, url);
			}

			Wysiwyg.saveContent();

			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");

			return this;
		});
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../controls/wysiwyg.link.js
//
//=================


/**
 * Controls: Link plugin
 *
 * Depends on jWYSIWYG
 *
 * By: Esteban Beltran (academo) <sergies@gmail.com>
 */
(function ($) {
	"use strict";

	if (undefined === $.wysiwyg) {
		throw "wysiwyg.link.js depends on $.wysiwyg";
	}

	if (!$.wysiwyg.controls) {
		$.wysiwyg.controls = {};
	}

	/*
	* Wysiwyg namespace: public properties and methods
	*/
	$.wysiwyg.controls.link = {
		init: function (Wysiwyg) {
			var self = this, elements, dialog, url, a, selection,
				formLinkHtml, dialogReplacements, key, translation, regexp,
				baseUrl, img;

			dialogReplacements = {
				legend: "Insert Link",
				url   : "Link URL",
				title : "Link Title",
				target: "Link Target",
				submit: "Insert Link",
				reset: "Cancel"
			};

			formLinkHtml = '<form class="wysiwyg"><fieldset><legend>{legend}</legend>' +
				'<label>{url}: <input type="text" name="linkhref" value=""/></label>' +
				'<label>{title}: <input type="text" name="linktitle" value=""/></label>' +
				'<label>{target}: <input type="text" name="linktarget" value=""/></label>' +
				'<input type="submit" class="button" value="{submit}"/> ' +
				'<input type="reset" value="{reset}"/></fieldset></form>';

			for (key in dialogReplacements) {
				if ($.wysiwyg.i18n) {
					translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.link");

					if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
					}

					dialogReplacements[key] = translation;
				}

				regexp = new RegExp("{" + key + "}", "g");
				formLinkHtml = formLinkHtml.replace(regexp, dialogReplacements[key]);
			}

			a = {
				self: Wysiwyg.dom.getElement("a"), // link to element node
				href: "http://",
				title: "",
				target: ""
			};

			if (a.self) {
				a.href = a.self.href ? a.self.href : a.href;
				a.title = a.self.title ? a.self.title : "";
				a.target = a.self.target ? a.self.target : "";
			}

			if ($.fn.dialog) {
				elements = $(formLinkHtml);
				elements.find("input[name=linkhref]").val(a.href);
				elements.find("input[name=linktitle]").val(a.title);
				elements.find("input[name=linktarget]").val(a.target);

				if ($.browser.msie) {
					try {
						dialog = elements.appendTo(Wysiwyg.editorDoc.body);
					} catch (err) {
						dialog = elements.appendTo("body");
					}
				} else {
					dialog = elements.appendTo("body");
				}

				dialog.dialog({
					modal: true,
					open: function (ev, ui) {
						$("input:submit", dialog).click(function (e) {
							e.preventDefault();

							var url = $('input[name="linkhref"]', dialog).val(),
								title = $('input[name="linktitle"]', dialog).val(),
								target = $('input[name="linktarget"]', dialog).val(),
								baseUrl,
								img;

							if (Wysiwyg.options.controlLink.forceRelativeUrls) {
								baseUrl = window.location.protocol + "//" + window.location.hostname;
								if (0 === url.indexOf(baseUrl)) {
									url = url.substr(baseUrl.length);
								}
							}

							if (a.self) {
								if ("string" === typeof (url)) {
									if (url.length > 0) {
										// to preserve all link attributes
										$(a.self).attr("href", url).attr("title", title).attr("target", target);
									} else {
										$(a.self).replaceWith(a.self.innerHTML);
									}
								}
							} else {
								if ($.browser.msie) {
									Wysiwyg.ui.returnRange();
								}

								//Do new link element
								selection = Wysiwyg.getRangeText();
								img = Wysiwyg.dom.getElement("img");

								if ((selection && selection.length > 0) || img) {
									if ($.browser.msie) {
										Wysiwyg.ui.focus();
									}

									if ("string" === typeof (url)) {
										if (url.length > 0) {
											Wysiwyg.editorDoc.execCommand("createLink", false, url);
										} else {
											Wysiwyg.editorDoc.execCommand("unlink", false, null);
										}
									}

									a.self = Wysiwyg.dom.getElement("a");

									$(a.self).attr("href", url).attr("title", title);

									/**
									 * @url https://github.com/akzhan/jwysiwyg/issues/16
									 */
									$(a.self).attr("target", target);
								} else if (Wysiwyg.options.messages.nonSelection) {
									window.alert(Wysiwyg.options.messages.nonSelection);
								}
							}

							Wysiwyg.saveContent();

							$(dialog).dialog("close");

							 Wysiwyg.ui.focus();
							 return false;
						});
						$("input:reset", dialog).click(function (e) {
							e.preventDefault();
							$(dialog).dialog("close");
							Wysiwyg.ui.focus();
						});
					},
					close: function (ev, ui) {
						dialog.dialog("destroy");
						dialog.remove();
						Wysiwyg.ui.focus();
					}
				});
			} else {
				if (a.self) {
					url = window.prompt("URL", a.href);

					if (Wysiwyg.options.controlLink.forceRelativeUrls) {
						baseUrl = window.location.protocol + "//" + window.location.hostname;
						if (0 === url.indexOf(baseUrl)) {
							url = url.substr(baseUrl.length);
						}
					}

					if ("string" === typeof (url)) {
						if (url.length > 0) {
							$(a.self).attr("href", url);
						} else {
							$(a.self).replaceWith(a.self.innerHTML);
						}
					}
				} else {
					//Do new link element
					selection = Wysiwyg.getRangeText();
					img = Wysiwyg.dom.getElement("img");

					if ((selection && selection.length > 0) || img) {
						if ($.browser.msie) {
							Wysiwyg.ui.focus();
							Wysiwyg.editorDoc.execCommand("createLink", true, null);
						} else {
							url = window.prompt(dialogReplacements.url, a.href);

							if (Wysiwyg.options.controlLink.forceRelativeUrls) {
								baseUrl = window.location.protocol + "//" + window.location.hostname;
								if (0 === url.indexOf(baseUrl)) {
									url = url.substr(baseUrl.length);
								}
							}

							if ("string" === typeof (url)) {
								if (url.length > 0) {
									Wysiwyg.editorDoc.execCommand("createLink", false, url);
								} else {
									Wysiwyg.editorDoc.execCommand("unlink", false, null);
								}
							}
						}
					} else if (Wysiwyg.options.messages.nonSelection) {
						window.alert(Wysiwyg.options.messages.nonSelection);
					}
				}

				Wysiwyg.saveContent();
			}

			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
		}
	};

	$.wysiwyg.createLink = function (object, url, title) {
		return object.each(function () {
			var oWysiwyg = $(this).data("wysiwyg"),
				selection;

			if (!oWysiwyg) {
				return this;
			}

			if (!url || url.length === 0) {
				return this;
			}

			selection = oWysiwyg.getRangeText();
			// ability to link selected img - just hack
			var internalRange = oWysiwyg.getInternalRange();
			var isNodeSelected = false;
			if (internalRange && internalRange.extractContents) {
				var rangeContents = internalRange.cloneContents();
				if (rangeContents!=null && rangeContents.childNodes && rangeContents.childNodes.length>0)
					isNodeSelected = true;
			}
			
			if ( (selection && selection.length > 0) || isNodeSelected ) {
				if ($.browser.msie) {
					oWysiwyg.ui.focus();
				}
				oWysiwyg.editorDoc.execCommand("unlink", false, null);
				oWysiwyg.editorDoc.execCommand("createLink", false, url);
			} else {
				if (title) {
					oWysiwyg.insertHtml('<a href="'+url+'">'+title+'</a>');
				} else {
					if (oWysiwyg.options.messages.nonSelection) 
						window.alert(oWysiwyg.options.messages.nonSelection);
				}
			}
			return this;
		});
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../controls/wysiwyg.table.js
//
//=================


/**
 * Controls: Table plugin
 * 
 * Depends on jWYSIWYG
 */
(function ($) {
	"use strict";

	if (undefined === $.wysiwyg) {
		throw "wysiwyg.table.js depends on $.wysiwyg";
	}

	if (!$.wysiwyg.controls) {
		$.wysiwyg.controls = {};
	}

	var insertTable = function (colCount, rowCount, filler) {
		if (isNaN(rowCount) || isNaN(colCount) || rowCount === null || colCount === null) {
			return;
		}

		var i, j, html = ['<table border="1" style="width: 100%;"><tbody>'];

		colCount = parseInt(colCount, 10);
		rowCount = parseInt(rowCount, 10);

		if (filler === null) {
			filler = "&nbsp;";
		}
		filler = "<td>" + filler + "</td>";

		for (i = rowCount; i > 0; i -= 1) {
			html.push("<tr>");
			for (j = colCount; j > 0; j -= 1) {
				html.push(filler);
			}
			html.push("</tr>");
		}
		html.push("</tbody></table>");

		return this.insertHtml(html.join(""));
	};

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	$.wysiwyg.controls.table = function (Wysiwyg) {
		var adialog, dialog, colCount, rowCount, formTableHtml, dialogReplacements, key, translation, regexp;

		dialogReplacements = {
			legend: "Insert table",
			cols  : "Count of columns",
			rows  : "Count of rows",
			submit: "Insert table",
			reset: "Cancel"
		};

		formTableHtml = '<form class="wysiwyg" id="wysiwyg-tableInsert"><fieldset><legend>{legend}</legend>' +
			'<label>{cols}: <input type="text" name="colCount" value="3" /></label><br/>' +
			'<label>{rows}: <input type="text" name="rowCount" value="3" /></label><br/>' +
			'<input type="submit" class="button" value="{submit}"/> ' +
			'<input type="reset" value="{reset}"/></fieldset></form>';
		
		for (key in dialogReplacements) {
			if ($.wysiwyg.i18n) {
				translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.table");

				if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
					translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
				}

				dialogReplacements[key] = translation;
			}

			regexp = new RegExp("{" + key + "}", "g");
			formTableHtml = formTableHtml.replace(regexp, dialogReplacements[key]);
		}

		if (!Wysiwyg.insertTable) {
			Wysiwyg.insertTable = insertTable;
		}

		adialog = new $.wysiwyg.dialog(Wysiwyg, {
			"title"   : dialogReplacements.legend,
			"content" : formTableHtml,
			"open"    : function (e, dialog) {
				dialog.find("form#wysiwyg-tableInsert").submit(function (e) {
					e.preventDefault();
					rowCount = dialog.find("input[name=rowCount]").val();
					colCount = dialog.find("input[name=colCount]").val();

					Wysiwyg.insertTable(colCount, rowCount, Wysiwyg.defaults.tableFiller);

					adialog.close();
					return false;
				});

				dialog.find("input:reset").click(function (e) {
					e.preventDefault();
					adialog.close();
					return false;
				});
			}
		});
		
		adialog.open();

		$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
	};

	$.wysiwyg.insertTable = function (object, colCount, rowCount, filler) {
		return object.each(function () {
			var Wysiwyg = $(this).data("wysiwyg");

			if (!Wysiwyg.insertTable) {
				Wysiwyg.insertTable = insertTable;
			}

			if (!Wysiwyg) {
				return this;
			}

			Wysiwyg.insertTable(colCount, rowCount, filler);
			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");

			return this;
		});
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../plugins/wysiwyg.autoload.js
//
//=================


/**
 * Autoload plugin
 * 
 * Depends on jWYSIWYG, autoload
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "wysiwyg.autoload.js depends on $.wysiwyg";
	}

	if (undefined === $.autoload) {
		throw "wysiwyg.autoload.js depends on $.autoload";
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	var autoload = {
		name: "autoload",
		version: "",
		defaults: {
			baseFile:		"jquery.wysiwyg.js",
			css:			["jquery.wysiwyg.css", "jquery.wysiwyg.modal.css"],
			cssPath:		"",
			controlPath:	"controls/",
			i18nPath:		"i18n/"
		},
		options: {},

		css: function (names) {
			$.autoload.css(names, this.options);
		},

		control: function (names, successCallback) {
			$.autoload.js(names, {"baseFile": this.options.baseFile, "jsPath": this.options.controlPath, "successCallback": successCallback});
		},

		init: function (Wysiwyg) {
			if (!Wysiwyg.options.plugins[this.name]) {
				return true;
			}

			var i;

			this.options = $.extend(true, this.defaults, Wysiwyg.options.plugins[this.name]);

			if (this.options.css) {
				for (i = 0; i < this.options.css.length; i += 1) {
					this.css(this.options.css[i]);
				}
			}
		},

		lang: function (names, successCallback) {
			$.autoload.js(names, {"baseFile": this.options.baseFile, "jsPath": this.options.i18nPath, "successCallback": successCallback});
		}
	};

	$.wysiwyg.plugin.register(autoload);
	$.wysiwyg.plugin.listen("initFrame", "autoload.init");
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../plugins/wysiwyg.fileManager.js
//
//=================


/**
 * File Manager plugin for jWYSIWYG
 * 
 * Yotam Bar-On, 2011
 * 
 * The file manager ui uses the Silk icon set from FAMFAMFAM
 * 
 */

(function ($) {
	"use strict";

	if (undefined === $.wysiwyg) {
		throw "wysiwyg.fileManager.js depends on $.wysiwyg";
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	// Only for show
	var fileManager = {
		name: "fileManager",
		version: "0.98", // Same as jwysiwyg
		ajaxHandler: "",
		selected: null,
		setAjaxHandler: function (_handler) {
			this.ajaxHandler = _handler;
			this.ready = true;

			return this;
		},
		ready: false,
		init: function (Wysiwyg, callback) {
			if (this.ready) {
				var manager = new fileManagerObj(this.ajaxHandler);
				manager.load(Wysiwyg, callback);
			} else {
				console.log("$.wysiwyg.fileManager: Must set ajax handler first, using $.wysiwyg.fileManager.setAjaxHandler()");
				return false;
			}
		}
	};

	// Register:
	$.wysiwyg.plugin.register(fileManager);

	// Private object:
	function fileManagerObj(_handler) {
		this.handler = _handler;
		this.loaded = false;
		this.move = false;
		this.rename = false;
		this.remove = false;
		this.upload = false;
		this.mkdir = false;
		this.selectedFile = "";
		this.curDir = "/";
		this.curListHtml = "";
		this.dialog = null;
		this.baseUrl = "";

		/**
		 * Methods
		 */
		var console = $.wysiwyg.console;
		//console.log("handler: " + this.handler);

		this.load = function (Wysiwyg, callback) {
			var self = this;
			self.loaded = true;
			self.authenticate(function (response) {
				if (response !== "success") {
					var dialog = new $.wysiwyg.dialog(null, {
						"title"   : "Error",
						"content" : response
					});
					dialog.open();

					return false;
				}

				// Wrap the file list:
				var uiHtml = '<div class="wysiwyg-files-wrapper">' +
								'<input type="text" name="url" />' +
								'<div id="wysiwyg-files-list-wrapper"></div>';

				// If handler does not support upload, icon will not appear:
				if (self.upload.enabled) {
					uiHtml += '<div class="wysiwyg-files-action-upload" title="{{upload_action}}"></div>';
				}

				// If handler does not support mkdir, icon will not appear:
				if (self.mkdir.enabled) {
					uiHtml += '<div class="wysiwyg-files-action-mkdir" title="{{mkdir_action}}"></div>';
				}

				uiHtml += '<input style="display:none;" type="button" name="submit" value="{{select}}" />' +
							'</div>';

				uiHtml = self.i18n(uiHtml);
				if ($.wysiwyg.dialog) {
					// Support for native $.wysiwyg.dialog()
					var _title = self.i18n("{{file_manager}}");
					var fileManagerUI = new $.wysiwyg.dialog(Wysiwyg, {
						"title": _title,
						"content": uiHtml,
						"close": function (e, dialog) {
							self.dialog = null;
						},
						"open": function (e, dialog) {

							self.dialog = dialog;

							self.loadDir();
							self.bindHover();
							self.bindBrowse();

							// Select file bindings
							dialog.find("input[name=submit]").bind("click", function () {
								var file = dialog.find("input[name=url]").val();
								fileManagerUI.close();
								self.loaded = false;
								callback(self.baseUrl+file);
							});

							// Create Directory
							$(".wysiwyg-files-action-mkdir").bind("click", function (e) {
								e.preventDefault();
								var uiHtml = '<div>' +
												'<input type="text" class="wysiwyg-files-textfield" name="newName" value="{{new_directory}}" />' +
												'<input type="button" name="cancel" value="{{cancel}}" />' +
												'<input type="button" name="create" value="{{create}}" />' +
												'</div>';
								uiHtml = self.i18n(uiHtml);
								var _mkdirTitle = self.i18n("{{mkdir_title}}");
								var mkdirDialog = new $.wysiwyg.dialog(null, {
									"title": _mkdirTitle,
									"content": uiHtml,
									"close": function () {

									},
									"open": function (e, _dialog) {
										_dialog.find("input[name=create]").bind("click", function () {
											self.mkDir(_dialog.find("input[name=newName]").val(), function (response) {
												self.loadDir();
												mkdirDialog.close();
											});
										});

										_dialog.find("input[name=cancel]").bind("click", function () {
											mkdirDialog.close();
										});
									}
								});
								mkdirDialog.open();
							});

							// Upload File
							$(".wysiwyg-files-action-upload").bind("click", function (e) {
								self.loadUploadUI();
							});

						},
						"modal": false
						// "theme": "jqueryui"
					});

					fileManagerUI.open();

				} else {
					// If $.wysiwyg.dialog() does not work..
					console.error("$.wysiwyg.fileManager: This plugin uses the native dialog system of jWYSIWYG. Make sure you are using version > 0.98");
				}
			});
		};

		this.authenticate = function (callback) {
			if (!this.loaded) {
				return false;
			}
			var self = this;
			$.getJSON(self.handler, { "action": "auth", "auth": "jwysiwyg" }, function (json, textStatus) {
				if (json.success) {
					self.move = json.data.move;
					self.rename = json.data.rename;
					self.remove = json.data.remove;
					self.mkdir = json.data.mkdir;
					self.upload = json.data.upload;
					self.baseUrl = json.data.baseUrl;
					callback("success");
				} else {
					callback(json.error + "\n<br>$.wysiwyg.fileManager: Unable to authenticate handler.");
				}
			});
		};

		this.loadDir = function () {
			if (!this.loaded) {
				return false;
			}
			var self = this;
			self.curDir = self.curDir.replace(/\/$/, '') + '/';

			// Retreives list of files inside a certain directory:
			$.getJSON(self.handler, { "dir": self.curDir, "action": "list" }, function (json) {
				if (json.success) {
					self.dialog.find("#wysiwyg-files-list-wrapper").removeClass("wysiwyg-files-ajax").html(self.listDir(json));
					self.bindHover();
					self.bindBrowse();
				} else {
					alert(json.error);
				}
			});
		};

		/**
		 * Ajax Methods.
		 */

		// List Directory
		this.listDir = function (json) {
			if (!this.loaded) {
				return false;
			}
			var self = this;
			var treeHtml = '<ul class="wysiwyg-files-list">';
			if (self.curDir !== "/") {
				var prevDir = self.curDir.replace(/[^\/]+\/?$/, '');
				treeHtml += '<li class="wysiwyg-files-dir wysiwyg-files-dir-prev">' +
							'<a href="#" rel="' + prevDir + '" title="{{previous_directory}}">' +
							self.curDir +
							'</a></li>';
			}
			$.each(json.data.directories, function (name, dirPath) {
				treeHtml += '<li class="wysiwyg-files-dir">' +
							'<a href="#" rel="' + dirPath + '">' +
							name +
							'</a></li>';
			});
			$.each(json.data.files, function (name, url) {
				var ext = name.replace(/^.*?\./, '').toLowerCase();
				treeHtml += '<li class="wysiwyg-files-file wysiwyg-files-' + ext + '">' +
							'<a href="#" rel="' + url + '">' +
							name +
							'</a></li>';
			});
			treeHtml += '</ul>';

			return self.i18n(treeHtml);
		};

/**
 * Should be remembered for future implementation:
 * If handler does not support certain actions - do not show their icons/button.
 * Only action a handler MUST support is "list" (list directory).
 * 
 * Implemented: 28-May-2011, Yotam Bar-On
 */

		// Remove File Method:
		this.removeFile = function (type, callback) {
			if (!this.loaded) { return false; }
			if (!this.remove.enabled) { console.log("$.wysiwyg.fileManager: handler: remove is disabled."); return false; }

			var self = this;
			$.getJSON(self.remove.handler, { "action": "remove", "type": type, "dir": self.curDir, "file": self.selectedFile  }, function (json) {
				if (json.success) {
					alert(json.data);
				} else {
					alert(json.error);
				}
				callback(json);
			});
		};

		// Rename File Method
		this.renameFile = function (type, newName, callback) {
			if (!this.loaded) { return false; }
			if (!this.rename.enabled) { console.log("$.wysiwyg.fileManager: handler: rename is disabled."); return false; }

			var self = this;
			$.getJSON(self.rename.handler, { "action": "rename", "type": type, "dir": self.curDir, "file": self.selectedFile, "newName": newName  }, function (json) {
				if (json.success) {
					alert(json.data);
				} else {
					alert(json.error);
				}
				callback(json);
			});
		};

		// Make Directory Method
		this.mkDir = function (newName, callback) {
			if (!this.loaded) { return false; }
			if (!this.mkdir.enabled) { console.log("$.wysiwyg.fileManager: handler: mkdir is disabled."); return false; }

			var self = this;
			$.getJSON(self.mkdir.handler, { "action": "mkdir", "dir": self.curDir, "newName": newName  }, function (json) {
				if (json.success) {
					alert(json.data);
				} else {
					alert(json.error);
				}
				callback(json);
			});
		};

		/**
		 * Currently we will not support moving of files. This will be supported only when a more interactive interface will be introduced.
		 */
		this.moveFile = function () {
			if (!this.loaded) {
				return false;
			}
			if (!this.move.enabled) {
				console.log("$.wysiwyg.fileManager: handler: move is disabled."); return false;
			}
			var self = this;
			return false;
		};

		// Upload:
		this.loadUploadUI = function () {
			if (!this.loaded) { return false; }
			if (!this.upload.enabled) { console.log("$.wysiwyg.fileManager: handler: move is disabled."); return false; }
			var self = this;
			var uiHtml = '<form enctype="multipart/form-data" method="post" action="' + self.upload.handler + '">' +
							'<p><input type="file" name="handle" /><br>' +
							'<input type="text" name="newName" style="width:250px; border:solid 1px !important;" /><br>' +
							'<input type="text" name="action" style="display:none;" value="upload" /><br></p>' +
							'<input type="text" name="dir" style="display:none;" value="' + self.curDir + '" /></p>' +
							'<input type="submit" name="submit" value="{{submit}}" />' +
							'</form>';
			uiHtml = self.i18n(uiHtml);

			var _uploadTitle = self.i18n("{{upload_title}}");

			var dialog = new $.wysiwyg.dialog(null, {
				"title": _uploadTitle,
				"content": "",
				"open": function (e, _dialog) {

					$("<iframe/>", { "class": "wysiwyg-files-upload" }).load(function () {
						var $doc = $(this).contents();
						$doc.find("body").append(uiHtml);
						$doc.find("input[type=file]").change(function () {
							var $val = $(this).val();
							$val = $val.replace(/.*[\\\/]/, '');
							// Should implement validation of extensions before submitting form
							$doc.find("input[name=newName]").val($val);
						});

					}).appendTo(_dialog.find(".wysiwyg-dialog-content"));

				},
				"close": function () {
					self.loadDir();
				}
			});

			dialog.open();
		};

		/**
		 * i18n Support.
		 * The below methods will enable basic support for i18n
		 */

		// Default translations (EN):
		this.defaultTranslations = {
			"file_manager": 		"File Manager",
			"upload_title":			"Upload File",
			"rename_title":			"Rename File",
			"remove_title":			"Remove File",
			"mkdir_title":			"Create Directory",
			"upload_action": 		"Upload new file to current directory",
			"mkdir_action": 		"Create new directory",
			"remove_action": 		"Remove this file",
			"rename_action": 		"Rename this file",
			"delete_message": 		"Are you sure you want to delete this file?",
			"new_directory": 		"New Directory",
			"previous_directory": 	"Go to previous directory",
			"rename":				"Rename",
			"select": 				"Select",
			"create": 				"Create",
			"submit": 				"Submit",
			"cancel": 				"Cancel",
			"yes":					"Yes",
			"no":					"No"
		};
		/** 
		 * Take an html string with placeholders: {{placeholder}} and translate it. 
		 * It takes all labels and trys to translate them. 
		 * If there is no translation (or i18n plugin is not loaded) it will use the defaults.
		 */
		this.i18n = function (tHtml) {
			var map = this.defaultTranslations;
			// If i18n plugin exists:
			if ($.wysiwyg.i18n) {
				$.each(map, function (key, val) {
					map[key] = $.wysiwyg.i18n.t(key, "dialogs.fileManager");
				});
			}

			$.each(map, function (key, val) {
				tHtml = tHtml.replace("{{" + key + "}}", val);
			});

			return tHtml;
		};

		/**
		 * BINDINGS FOR ELEMENTS
		 * The below methods are bind methods for elements inside the File Manager's dialogs.
		 * Their purpose is to enable simple coding of the dialog interfaces,
		 * and to make the use of "live" deprecated.
		 */

		this.bindHover = function () {
			var self = this,
				dialog = self.dialog,
				object = dialog.find("li");

			/** 
			 * HOVER + ACTIONS BINDINGS:
			 */
			object.bind("mouseenter", function () {
				$(this).addClass("wysiwyg-files-hover");

				if ($(this).hasClass("wysiwyg-files-dir")) {
					$(this).addClass("wysiwyg-files-dir-expanded");
				}

				// Add action buttons:
				if (!$(this).hasClass("wysiwyg-files-dir-prev")) {

					$(".wysiwyg-files-action").remove();

					// If handler does not support remove, icon will not appear:
					if (self.remove.enabled) {
						var rmText = self.i18n("{{remove_action}}");
						$("<div/>", { "class": "wysiwyg-files-action wysiwyg-files-action-remove", "title": rmText }).appendTo(this);

						// "Remove" binding:
						$(".wysiwyg-files-action-remove").bind("click", function (e) {
							e.preventDefault();
							var entry = $(this).parent("li");
							// What are we deleting?
							var type = entry.hasClass("wysiwyg-files-file") ? "file" : "dir";
							var uiHtml = 	"<p>{{delete_message}}</p>" +
											'<div class="">' +
											'<input type="button" name="cancel" value="{{no}}" />' +
											'<input type="button" name="remove" value="{{yes}}" />' +
											"</div>";
							uiHtml = self.i18n(uiHtml);

							var _removeTitle = self.i18n("{{remove_title}}");

							var removeDialog = 	new $.wysiwyg.dialog(null, {
								"title": _removeTitle,
								"content": uiHtml,
								"close": function () {

								},
								"open": function (e, _dialog) {
									_dialog.find("input[name=remove]").bind("click", function () {
										self.selectedFile = entry.find("a").text();
										self.removeFile(type, function (response) {
											self.loadDir();
											removeDialog.close();
										});
									});

									_dialog.find("input[name=cancel]").bind("click", function () {
										removeDialog.close();
									});
								}
							});

							removeDialog.open();
						});
					}

					// If handler does not support rename, icon will not appear:
					if (self.rename.enabled) {
						var rnText = self.i18n("{{rename_action}}");
						$("<div/>", { "class": "wysiwyg-files-action wysiwyg-files-action-rename", "title": rnText }).appendTo(this);

						// "Rename" binding:
						$(".wysiwyg-files-action-rename").bind("click", function (e) {
							e.preventDefault();
							var entry = $(this).parent("li");
							// What are we deleting?
							var type = entry.hasClass("wysiwyg-files-file") ? "file" : "dir";
							var uiHtml = 	'<div>' +
											'<input type="text" class="wysiwyg-files-textfield" name="newName" value="' + entry.find("a").text() + '" />' +
											'<input type="button" name="cancel" value="{{cancel}}" />' +
											'<input type="button" name="rename" value="{{rename}}" />' +
											'</div>';
							uiHtml = self.i18n(uiHtml);
							var _renameTitle = self.i18n("{{rename_title}}");

							var renameDialog = new $.wysiwyg.dialog(null, {
								"title": _renameTitle,
								"content": uiHtml,
								"close": function () {

								},
								"open": function (e, _dialog) {
									_dialog.find("input[name=rename]").bind("click", function () {
										self.selectedFile = entry.find("a").text();
										self.renameFile(type, _dialog.find("input[name=newName]").val(), function (response) {
											self.loadDir();
											renameDialog.close();
										});
									});

									_dialog.find("input[name=cancel]").bind("click", function () {
										renameDialog.close();
									});
								}
							});

							renameDialog.open();
						});
					}
				}
			}).bind("mouseleave", function () {
				$(this).removeClass("wysiwyg-files-dir-expanded");
				$(this).removeClass("wysiwyg-files-hover");

				// Remove action buttons:
				$(".wysiwyg-files-action").remove();
			});
		};

		/**
		 * BROWSING BINDINGS
		 */
		this.bindBrowse = function () {
			var self = this,
				dialog = self.dialog,
				object = self.dialog.find("li").find("a");

			// Browse:
			object.bind("click", function (e) {
				$(".wysiwyg-files-wrapper").find("li").css("backgroundColor", "#FFF");

				// Browse Directory:
				if ($(this).parent("li").hasClass("wysiwyg-files-dir")) {
					self.selectedFile = $(this).attr("rel");
					self.curDir = $(this).attr("rel");
					dialog.find("input[name=submit]").hide();
					$(".wysiwyg-files-wrapper").find("input[name=url]").val("");
					$('#wysiwyg-files-list-wrapper').addClass("wysiwyg-files-ajax");
					$('#wysiwyg-files-list-wrapper').html("");
					self.loadDir();
					dialog.find("input[name=submit]").hide();

				// Select Entry:
				} else {
					self.selectedFile = $(this).text();
					$(this).parent("li").css("backgroundColor", "#BDF");
					$(".wysiwyg-files-wrapper").find("input[name=url]").val($(this).attr("rel"));
					dialog.find("input[name=submit]").show();
				}
			});
		};

		this.bindPreview = function (object) {
			var self = this;
		};
	}
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../plugins/wysiwyg.fullscreen.js
//
//=================


/**
 * Fullscreen plugin
 * 
 * Depends on jWYSIWYG
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "wysiwyg.fullscreen.js depends on $.wysiwyg";
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	var fullscreen = {
		name: "fullscreen",
		version: "",
		defaults: {
			css: {
				editor: {
					width:	"100%",
					height:	"100%"
				},
				element: {
					width:	"100%",
					height:	"100%",
					position: "fixed",
					left:	"0px",
					top:	"0px",
					background: "rgb(255, 255, 255)",
					padding: "0px",
					"border-bottom-color": "",
					"border-bottom-style": "",
					"border-bottom-width": "0px",
					"border-left-color": "",
					"border-left-style": "",
					"border-left-width": "0px",
					"border-right-color": "",
					"border-right-style": "",
					"border-right-width": "0px",
					"border-top-color": "",
					"border-top-style": "",
					"border-top-width": "0px",
					"z-index": 1000
				},
				original: {
					width:	"100%",
					height:	"100%",
					position: "fixed",
					left:	"0px",
					top:	"0px",
					background: "rgb(255, 255, 255)",
					padding: "0px",
					"border-bottom-color": "",
					"border-bottom-style": "",
					"border-bottom-width": "0px",
					"border-left-color": "",
					"border-left-style": "",
					"border-left-width": "0px",
					"border-right-color": "",
					"border-right-style": "",
					"border-right-width": "0px",
					"border-top-color": "",
					"border-top-style": "",
					"border-top-width": "0px",
					"z-index": 1000
				}
			}
		},
		options: {},
		originalBoundary: {
			editor: {},
			element: {},
			original: {}
		},

		init: function (Wysiwyg, options) {
			options = options || {};
			this.options = $.extend(true, this.defaults, options);

			if (Wysiwyg.ui.toolbar.find(".fullscreen").hasClass("active")) {
				this.restore(Wysiwyg);
				Wysiwyg.ui.toolbar.find(".fullscreen").removeClass("active");
			} else {
				this.stretch(Wysiwyg);
				Wysiwyg.ui.toolbar.find(".fullscreen").addClass("active");
			}
		},

		restore: function (Wysiwyg) {
			var propertyName;

			for (propertyName in this.defaults.css.editor) {
				Wysiwyg.editor.css(propertyName, this.originalBoundary.editor[propertyName]);
				this.originalBoundary.editor[propertyName] = null;
			}

			for (propertyName in this.defaults.css.element) {
				Wysiwyg.element.css(propertyName, this.originalBoundary.element[propertyName]);
				this.originalBoundary.element[propertyName] = null;
			}

			for (propertyName in this.defaults.css.original) {
				$(Wysiwyg.original).css(propertyName, this.originalBoundary.original[propertyName]);
				this.originalBoundary.original[propertyName] = null;
			}
		},

		stretch: function (Wysiwyg) {
			var propertyName;

			// save previous values
			for (propertyName in this.defaults.css.editor) {
				this.originalBoundary.editor[propertyName] = Wysiwyg.editor.css(propertyName);
			}

			for (propertyName in this.defaults.css.element) {
				this.originalBoundary.element[propertyName] = Wysiwyg.element.css(propertyName);
			}

			for (propertyName in this.defaults.css.original) {
				this.originalBoundary.original[propertyName] = $(Wysiwyg.original).css(propertyName);
			}

			// set new values
			for (propertyName in this.defaults.css.editor) {
				Wysiwyg.editor.css(propertyName, this.options.css.editor[propertyName]);
			}

			for (propertyName in this.defaults.css.element) {
				Wysiwyg.element.css(propertyName, this.options.css.element[propertyName]);
			}

			this.options.css.original.top = Wysiwyg.ui.toolbar.css("height");
			for (propertyName in this.defaults.css.original) {
				$(Wysiwyg.original).css(propertyName, this.options.css.original[propertyName]);
			}
		}
	};

	$.wysiwyg.plugin.register(fullscreen);
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../plugins/wysiwyg.i18n.js
//
//=================


/**
 * Internationalization plugin
 * 
 * Depends on jWYSIWYG
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "wysiwyg.i18n.js depends on $.wysiwyg";
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	var i18n = {
		name: "i18n",
		version: "",
		defaults: {
			lang: "en",			// change to your language by passing lang option
			wysiwygLang: "en"	// default WYSIWYG language
		},
		lang: {},
		options: {},

		init: function (Wysiwyg, lang) {
			if (!Wysiwyg.options.plugins[this.name]) {
				return true;
			}

			this.options = $.extend(true, this.defaults, Wysiwyg.options.plugins[this.name]);

			if (lang) {
				this.options.lang = lang;
			} else {
				lang = this.options.lang;
			}

			if ((lang !== this.options.wysiwygLang) && (undefined === $.wysiwyg.i18n.lang[lang])) {
				if ($.wysiwyg.autoload) {
					$.wysiwyg.autoload.lang("lang." + lang + ".js", function () {
						$.wysiwyg.i18n.init(Wysiwyg, lang);
					});
				} else {
					throw 'Language "' + lang + '" not found in $.wysiwyg.i18n. You need to include this language file';
				}
			}

			this.translateControls(Wysiwyg, lang);
		},

		translateControls: function (Wysiwyg, lang) {
			Wysiwyg.ui.toolbar.find("li").each(function () {
				if (Wysiwyg.options.controls[$(this).attr("class")] && Wysiwyg.options.controls[$(this).attr("class")].visible) {
					$(this).attr("title", $.wysiwyg.i18n.t(Wysiwyg.options.controls[$(this).attr("class")].tooltip, "controls", lang));
				}
			});
		},

		run: function (object, lang) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg");

				if (!oWysiwyg) {
					return this;
				}

				$.wysiwyg.i18n.init(oWysiwyg, lang);
			});
		},

		t: function (phrase, section, lang) {
			var i, section_array, transObject;

			if (!lang) {
				lang = this.options.lang;
			}

			if ((lang === this.options.wysiwygLang) || (!this.lang[lang])) {
				return phrase;
			}

			transObject = this.lang[lang];
			section_array = section.split(".");
			for (i = 0; i < section_array.length; i += 1) {
				if (transObject[section_array[i]]) {
					transObject = transObject[section_array[i]];
				}
			}

			if (transObject[phrase]) {
				return transObject[phrase];
			}

			return phrase;
		}
	};

	$.wysiwyg.plugin.register(i18n);
	$.wysiwyg.plugin.listen("initFrame", "i18n.init");
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../plugins/wysiwyg.rmFormat.js
//
//=================


/**
 * rmFormat plugin
 *
 * Depends on jWYSIWYG
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "wysiwyg.rmFormat.js depends on $.wysiwyg";
	}

	/*
	 * Wysiwyg namespace: public properties and methods
	 */
	var rmFormat = {
		name: "rmFormat",
		version: "",
		defaults: {
			rules: {
				heading: false,
				table: false,
				inlineCSS: false,
				/*
				 * rmAttr       - { "all" | object with names } remove all
				 *                attributes or attributes with following names
				 *
				 * rmWhenEmpty  - if element contains no text or { \s, \n, <br>, <br/> }
				 *                then it will be removed
				 *
				 * rmWhenNoAttr - if element contains no attributes (i.e. <span>Some Text</span>)
				 *                then it will be removed
				 */
				msWordMarkup: {
					enabled: false,
					tags: {
						"a": {
							rmWhenEmpty: true
						},

						"b": {
							rmWhenEmpty: true
						},

						"div": {
							rmWhenEmpty: true,
							rmWhenNoAttr: true
						},

						"em": {
							rmWhenEmpty: true
						},

						"font": {
							rmAttr: {
								"face": "",
								"size": ""
							},
							rmWhenEmpty: true,
							rmWhenNoAttr: true
						},

						"h1": {
							rmAttr: "all",
							rmWhenEmpty: true
						},
						"h2": {
							rmAttr: "all",
							rmWhenEmpty: true
						},
						"h3": {
							rmAttr: "all",
							rmWhenEmpty: true
						},
						"h4": {
							rmAttr: "all",
							rmWhenEmpty: true
						},
						"h5": {
							rmAttr: "all",
							rmWhenEmpty: true
						},
						"h6": {
							rmAttr: "all",
							rmWhenEmpty: true
						},

						"i": {
							rmWhenEmpty: true
						},

						"p": {
							rmAttr: "all",
							rmWhenEmpty: true
						},

						"span": {
							rmAttr: {
								lang: ""
							},
							rmWhenEmpty: true,
							rmWhenNoAttr: true
						},

						"strong": {
							rmWhenEmpty: true
						},

						"u": {
							rmWhenEmpty: true
						}
					}
				}
			}
		},
		options: {},
		enabled: false,
		debug:	false,

		domRemove: function (node) {
			// replace h1-h6 with p
			if (this.options.rules.heading) {
				if (node.nodeName.toLowerCase().match(/^h[1-6]$/)) {
					// in chromium change this to
					// $(node).replaceWith($('<p/>').html(node.innerHTML));
					// to except DOM error: also try in other browsers
					$(node).replaceWith($('<p/>').html($(node).contents()));

					return true;
				}
			}

			// remove tables not smart enough )
			if (this.options.rules.table) {
				if (node.nodeName.toLowerCase().match(/^(table|t[dhr]|t(body|foot|head))$/)) {
					$(node).replaceWith($(node).contents());

					return true;
				}
			}

			return false;
		},

		removeStyle: function(node) {
		  if (this.options.rules.inlineCSS) {
		    $(node).removeAttr('style');
		  }
		},

		domTraversing: function (el, start, end, canRemove, cnt) {
			if (null === canRemove) {
				canRemove = false;
			}

			var isDomRemoved, p;

			while (el) {
				if (this.debug) { console.log(cnt, "canRemove=", canRemove); }

				this.removeStyle(el);

				if (el.firstElementChild) {

					if (this.debug) { console.log(cnt, "domTraversing", el.firstElementChild); }

					return this.domTraversing(el.firstElementChild, start, end, canRemove, cnt + 1);
				} else {

					if (this.debug) { console.log(cnt, "routine", el); }

					isDomRemoved = false;

					if (start === el) {
						canRemove = true;
					}

					if (canRemove) {
						if (el.previousElementSibling) {
							p = el.previousElementSibling;
						} else {
							p = el.parentNode;
						}

						if (this.debug) { console.log(cnt, el.nodeName, el.previousElementSibling, el.parentNode, p); }

						isDomRemoved = this.domRemove(el);
						if (this.domRemove(el)) {

							if (this.debug) { console.log("p", p); }

							// step back to parent or previousElement to traverse again then element is removed
							el = p;
						}

						if (start !== end && end === el) {
							return true;
						}
					}

					if (false === isDomRemoved) {
						el = el.nextElementSibling;
					}
				}
			}

			return false;
		},

		msWordMarkup: function (text) {
			var tagName, attrName, rules, reg, regAttr, found, attrs;

			// @link https://github.com/akzhan/jwysiwyg/issues/165
			text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

			text = text.replace(/<meta\s[^>]+>/g, "");
			text = text.replace(/<link\s[^>]+>/g, "");
			text = text.replace(/<title>[\s\S]*?<\/title>/g, "");
			text = text.replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gm, "");
			text = text.replace(/<w:([^\s>]+)(?:\s[^\/]+)?\/>/g, "");
			text = text.replace(/<w:([^\s>]+)(?:\s[^>]+)?>[\s\S]*?<\/w:\1>/gm, "");
			text = text.replace(/<m:([^\s>]+)(?:\s[^\/]+)?\/>/g, "");
			text = text.replace(/<m:([^\s>]+)(?:\s[^>]+)?>[\s\S]*?<\/m:\1>/gm, "");

			// after running the above.. it still needed these
			text = text.replace(/<xml>[\s\S]*?<\/xml>/g, "");
			text = text.replace(/<object(?:\s[^>]*)?>[\s\S]*?<\/object>/g, "");
			text = text.replace(/<o:([^\s>]+)(?:\s[^\/]+)?\/>/g, "");
			text = text.replace(/<o:([^\s>]+)(?:\s[^>]+)?>[\s\S]*?<\/o:\1>/gm, "");
			text = text.replace(/<st1:([^\s>]+)(?:\s[^\/]+)?\/>/g, "");
			text = text.replace(/<st1:([^\s>]+)(?:\s[^>]+)?>[\s\S]*?<\/st1:\1>/gm, "");
			// ----
			text = text.replace(/<!--[^>]+>\s*<[^>]+>/gm, ""); // firefox needed this 1

      // MS Office 9 has conditional we need to remove
      // <http://stackoverflow.com/questions/5653207/remove-html-comments-with-regex-in-javascript>
      text = text.replace(/<!--[\s\S]*?-->/g, "")
      // remove start and end fragments
      text = text.replace('<!--StartFragment-->', '').replace('<!--EndFragment-->', '')

			text = text.replace(/^[\s\n]+/gm, "");

			if (this.options.rules.msWordMarkup.tags) {
				for (tagName in this.options.rules.msWordMarkup.tags) {
					rules = this.options.rules.msWordMarkup.tags[tagName];

					if ("string" === typeof (rules)) {
						if ("" === rules) {
							reg = new RegExp("<" + tagName + "(?:\\s[^>]+)?/?>", "gmi");
							text = text.replace(reg, "<" + tagName + ">");
						}
					} else if ("object" === typeof (rules)) {
						reg = new RegExp("<" + tagName + "(\\s[^>]+)?/?>", "gmi");
						found = reg.exec(text);
						attrs = "";

						if (found && found[1]) {
							attrs = found[1];
						}

						if (rules.rmAttr) {
							if ("all" === rules.rmAttr) {
								attrs = "";
							} else if ("object" === typeof (rules.rmAttr) && attrs) {
								for (attrName in rules.rmAttr) {
									regAttr = new RegExp(attrName + '="[^"]*"', "mi");
									attrs = attrs.replace(regAttr, "");
								}
							}
						}

						if (attrs) {
							attrs = attrs.replace(/[\s\n]+/gm, " ");

							if (" " === attrs) {
								attrs = "";
							}
						}

						text = text.replace(reg, "<" + tagName + attrs + ">");
					}
				}

				for (tagName in this.options.rules.msWordMarkup.tags) {
					rules = this.options.rules.msWordMarkup.tags[tagName];

					if ("string" === typeof (rules)) {
						//
					} else if ("object" === typeof (rules)) {
						if (rules.rmWhenEmpty) {
							reg = new RegExp("<" + tagName + "(\\s[^>]+)?>(?:[\\s\\n]|<br/?>)*?</" + tagName + ">", "gmi");
							text = text.replace(reg, "");
						}

						if (rules.rmWhenNoAttr) {
							reg = new RegExp("<" + tagName + ">(?!<" + tagName + ">)([\\s\\S]*?)</" + tagName + ">", "mi");
							found = reg.exec(text);
							while (found) {
								text = text.replace(reg, found[1]);

								found = reg.exec(text);
							}
						}
					}
				}
			}

			return text;
		},

		run: function (Wysiwyg, options) {
			options = options || {};
			this.options = $.extend(true, this.defaults, options);

			if (this.options.rules.heading || this.options.rules.table) {
				var r = Wysiwyg.getInternalRange(),
					start,
					end,
					node,
					traversing;

				start = r.startContainer;
				if (start.nodeType === 3) {
					start = start.parentNode;
				}

				end = r.endContainer;
				if (end.nodeType === 3) {
					end = end.parentNode;
				}

				if (this.debug) {
					console.log("start", start, start.nodeType, start.nodeName, start.parentNode);
					console.log("end", end, end.nodeType, end.nodeName, end.parentNode);
				}

				node = r.commonAncestorContainer;
				if (node.nodeType === 3) {
					node = node.parentNode;
				}

				if (this.debug) {
					console.log("node", node, node.nodeType, node.nodeName.toLowerCase(), node.parentNode, node.firstElementChild);
					console.log(start === end);
				}

				traversing = null;
				if (start === end) {
					traversing = this.domTraversing(node, start, end, true, 1);
				} else {
					traversing = this.domTraversing(node.firstElementChild, start, end, null, 1);
				}

				if (this.debug) { console.log("DomTraversing=", traversing); }
			}

      // wait until paste event triggered new content
      // <https://code.google.com/p/jwysiwyg/issues/detail?id=210>
      if (this.options.rules.msWordMarkup.enabled) {
        var that = this
        setTimeout(function() {
          Wysiwyg.setContent(that.msWordMarkup(Wysiwyg.getContent()));
        }, 100)
      }

			if (this.options.rules.msWordMarkup.enabled) {
				Wysiwyg.setContent(this.msWordMarkup(Wysiwyg.getContent()));
			}
		}
	};

	$.wysiwyg.plugin.register(rmFormat);
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.ca.js
//
//=================


/**
 * Internationalization: Catalan language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Josep Anguera Peralta <josep.anguera@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.ca.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.ca.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.ca = {
		controls: {
			"Bold": "Negreta",
			"Colorpicker": "Triar color",
			"Copy": "Copiar",
			"Create link": "Crear link",
			"Cut": "Tallar",
			"Decrease font size": "Disminuir tamany font",
			"Fullscreen": "Pantalla completa",
			"Header 1": "Títol 1",
			"Header 2": "Títol 2",
			"Header 3": "Títol 3",
			"View source code": "Veure codi",
			"Increase font size": "Aumentar tamany font",
			"Indent": "Afegir Sangrat",
			"Insert Horizontal Rule": "Insertar línia horitzontal",
			"Insert image": "Insertar imatge",
			"Insert Ordered List": "Insertar llista numèrica",
			"Insert table": "Insertar taula",
			"Insert Unordered List": "Insertar llista sense ordre",
			"Italic": "Cursiva",
			"Justify Center": "Centrar",
			"Justify Full": "Justificar",
			"Justify Left": "Alinear a la esquerra",
			"Justify Right": "Alinear a la dreta",
			"Left to Right": "Esquerra a dreta",
			"Outdent": "Treure sangrat",
			"Paste": "Enganxar",
			"Redo": "Restaurar",
			"Remove formatting": "Treure format",
			"Right to Left": "Dreta a esquerra",
			"Strike-through": "Invertir",
			"Subscript": "Subíndex",
			"Superscript": "Superíndex",
			"Underline": "Subratllar",
			"Undo": "Desfer"
		},

		dialogs: {
			// for all
			"Apply": "Aplicar",
			"Cancel": "Cancelar",

			colorpicker: {
				"Colorpicker": "Triar color",
				"Color": "Color"
			},

			image: {
				"Insert Image": "Insertar imatge",
				"Preview": "Previsualització",
				"URL": "URL",
				"Title": "Títol",
				"Description": "Descripció",
				"Width": "Amplada",
				"Height": "Alçada",
				"Original W x H": "Amplada x Alçada original",
				"Float": "Flotant",
				"None": "No",
				"Left": "Esquerra",
				"Right": "Dreta"
			},

			link: {
				"Insert Link": "Insertar link",
				"Link URL": "URL del link",
				"Link Title": "Títol del link",
				"Link Target": "Target de link"
			},

			table: {
				"Insert table": "Insertar taula",
				"Count of columns": "Número de columnes",
				"Count of rows": "Número de files"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.cs.js
//
//=================


/**
 * Internationalization: czech language
 *
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: deepj on github.com
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.cs.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.cs.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.cs = {
		controls: {
			"Bold": "Tučné",
			"Colorpicker": "Výběr barvy",
			"Copy": "Kopírovat",
			"Create link": "Vytvořit odkaz",
			"Cut": "Vyjmout",
			"Decrease font size": "Zmenšit velikost písma",
			"Fullscreen": "Celá obrazovka",
			"Header 1": "Nadpis 1",
			"Header 2": "Nadpis 2",
			"Header 3": "Nadpis 3",
			"View source code": "Zobrazit zdrojový kód",
			"Increase font size": "Zvětšit velikost písma",
			"Indent": "Zvětšit odsazení",
			"Insert Horizontal Rule": "Vložit horizontální čáru",
			"Insert image": "Vložit obrázek",
			"Insert Ordered List": "Vložit číslovaný seznam",
			"Insert table": "Vložit tabulku",
			"Insert Unordered List": "Vložit odrážkový seznam",
			"Italic": "Kurzíva",
			"Justify Center": "Zarovnat na střed",
			"Justify Full": "Zarovnat do bloku",
			"Justify Left": "Zarovnat doleva",
			"Justify Right": "Zarovnat doprava",
			"Left to Right": "Zleva doprava",
			"Outdent": "Zmenšit odsazení",
			"Paste": "Vložit",
			"Redo": "Znovu",
			"Remove formatting": "Odstranit formátování",
			"Right to Left": "Zprava doleva",
			"Strike-through": "Přeškrnuté",
			"Subscript": "Dolní index",
			"Superscript": "Horní index",
			"Underline": "Potržené",
			"Undo": "Zpět"
		},

		dialogs: {
			// for all
			"Apply": "Použij",
			"Cancel": "Zrušit",

			colorpicker: {
				"Colorpicker": "Výběr barvy",
				"Color": "Barva"
			},

			fileManager: {
				"file_manager": "Správce souborů",
				"upload_title": "Nahrát soubor",
				"rename_title": "Přejmenovat soubor",
				"remove_title": "Odstranit soubor",
				"mkdir_title": "Vytvořit adresář",
				"upload_action": "Nahrát nový soubor do aktualního adresáře",
				"mkdir_action": "Vytvořit nový adresář",
				"remove_action": "Odstranit tento soubor",
				"rename_action": "Přejmenovat tento soubor" ,
				"delete_message": "Jste si jist, že chcete smazat tento soubor?",
				"new_directory": "Nový adresář",
				"previous_directory": "Vrať se do přechozího adresáře",
				"rename": "Přejmenovat",
				"select": "Vybrat",
				"create": "Vytvořit",
				"submit": "Vložit",
				"cancel": "Zrušit",
				"yes": "Ano",
				"no": "Ne"
			},

			image: {
				"Insert Image": "Vložit obrázek",
				"Preview": "Náhled",
				"URL": "Odkaz",
				"Title": "Název",
				"Description": "Popis",
				"Width": "Šířka",
				"Height": "Výška",
				"Original W x H": "Původní šířka a výška",
				"Float": "Obtékání",
				"None": "Žádné",
				"Left": "Doleva",
				"Right": "Doprava",
				"Select file from server": "Vybrat soubor ze serveru"
			},

			link: {
				"Insert Link": "Vložit odkaz",
				"Link URL": "Odkaz",
				"Link Title": "Název odkazu",
				"Link Target": "Cíl odkazu"
			},

			table: {
				"Insert table": "Vložit tabulku",
				"Count of columns": "Počet sloupců",
				"Count of rows": "Počet řádků"
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.de.js
//
//=================


/**
 * Internationalization: German language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Markus Schirp (mbj) <mbj@seonic.net>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.de.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.de.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.de = {
		controls: {
			"Bold": "Fett",
			"Colorpicker": "Farbe wählen",
			"Copy": "Kopieren",
			"Create link": "Link erstellen",
			"Cut": "Ausschneiden",
			"Decrease font size": "Schriftgröße verkleinern",
			"Fullscreen": "Vollbild",
			"Header 1": "Überschrift 1",
			"Header 2": "Überschrift 2",
			"Header 3": "Überschrift 3",
			"View source code": "Quellcode anzeigen",
			"Increase font size": "Schriftgröße vergrößern",
			"Indent": "Einrücken",
			"Insert Horizontal Rule": "Horizontalen Trennbalken einfügen",
			"Insert image": "Bild einfügen",
			"Insert Ordered List": "Nummerierte Liste einfügen",
			"Insert table": "Tabelle einfügen",
			"Insert Unordered List": "Unnummerierte Liste einfügen",
			"Italic": "Kursiv",
			"Justify Center": "Zentrieren",
			"Justify Full": "Blocksatz",
			"Justify Left": "Links ausrichten",
			"Justify Right": "Rechts ausrichten",
			"Left to Right": "Links nach Rechts",
			"Outdent": "Einrückung zurücknehmen",
			"Paste": "Einfügen",
			"Redo": "Wiederherstellen",
			"Remove formatting": "Formatierung entfernen",
			"Right to Left": "Rechts nach Links",
			"Strike-through": "Durchstreichen",
			"Subscript": "Tiefstellen",
			"Superscript": "Hochstellen",
			"Underline": "Unterstreichen",
			"Undo": "Rückgängig"
		},

		dialogs: {
			// for all
			"Apply": "Anwenden",
			"Cancel": "Abbrechen",

			colorpicker: {
				"Colorpicker": "Farbwähler",
				"Color": "Farbe"
			},

			image: {
				"Insert Image": "Bild einfügen",
				"Preview": "Vorschau",
				"URL": "URL",
				"Title": "Titel",
				"Description": "Beschreibung",
				"Width": "Breite",
				"Height": "Höhe",
				"Original W x H": "Original W x H",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": ""
			},

			link: {
				"Insert Link": "Link einfügen",
				"Link URL": "Link URL",
				"Link Title": "Link Titel",
				"Link Target": "Link Ziel"
			},

			table: {
				"Insert table": "Tabelle einfügen",
				"Count of columns": "Spaltenanzahl",
				"Count of rows": "Zeilenanzahl"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.en.js
//
//=================


/**
 * Internationalization: English language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 * 
 * By: frost-nzcr4 on github.com
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.en.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.en.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.en = {
		controls: {
			"Bold": "",
			"Colorpicker": "",
			"Copy": "",
			"Create link": "",
			"Cut": "",
			"Decrease font size": "",
			"File Manager": "",
			"Fullscreen": "",
			"Header 1": "",
			"Header 2": "",
			"Header 3": "",
			"View source code": "",
			"Increase font size": "",
			"Indent": "",
			"Insert Horizontal Rule": "",
			"Insert image": "",
			"Insert Ordered List": "",
			"Insert table": "",
			"Insert Unordered List": "",
			"Italic": "",
			"Justify Center": "",
			"Justify Full": "",
			"Justify Left": "",
			"Justify Right": "",
			"Left to Right": "",
			"Outdent": "",
			"Paste": "",
			"Redo": "",
			"Remove formatting": "",
			"Right to Left": "",
			"Strike-through": "",
			"Subscript": "",
			"Superscript": "",
			"Underline": "",
			"Undo": ""
		},

		dialogs: {
			// for all
			"Apply": "",
			"Cancel": "",

			colorpicker: {
				"Colorpicker": "",
				"Color": ""
			},

			fileManager: {
				"file_manager": 		"File Manager",
				"upload_title":			"Upload File",
				"rename_title":			"Rename File",
				"remove_title":			"Remove File",
				"mkdir_title":			"Create Directory",
				"upload_action": 		"Upload new file to current directory",
				"mkdir_action": 		"Create new directory",
				"remove_action": 		"Remove this file",
				"rename_action": 		"Rename this file" ,	
				"delete_message": 		"Are you sure you want to delete this file?",
				"new_directory": 		"New Directory",
				"previous_directory": 	"Go to previous directory",
				"rename":				"Rename",
				"select": 				"Select",
				"create": 				"Create",
				"submit": 				"Submit",
				"cancel": 				"Cancel",
				"yes":					"Yes",
				"no":					"No"
			},

			image: {
				"Insert Image": "",
				"Preview": "",
				"URL": "",
				"Title": "",
				"Description": "",
				"Width": "",
				"Height": "",
				"Original W x H": "",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": "",
				"Select file from server": ""
			},

			link: {
				"Insert Link": "",
				"Link URL": "",
				"Link Title": "",
				"Link Target": ""
			},

			table: {
				"Insert table": "",
				"Count of columns": "",
				"Count of rows": ""
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.es.js
//
//=================


/**
 * Internationalization: Spanish language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Esteban Beltran (academo) <sergies@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.es.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.es.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.es = {
		controls: {
			"Bold": "Negrilla",
			"Colorpicker": "",
			"Copy": "Copiar",
			"Create link": "Crear Link",
			"Cut": "Cortar",
			"Decrease font size": "Disminuir tamaño fuente",
			"Fullscreen": "",
			"Header 1": "Titulo 1",
			"Header 2": "Titulo 2",
			"Header 3": "Titulo 3",
			"View source code": "Ver fuente",
			"Increase font size": "Aumentar tamaño fuente",
			"Indent": "Agregar Sangría",
			"Insert Horizontal Rule": "Insertar linea horizontal",
			"Insert image": "Insertar Imagen",
			"Insert Ordered List": "Insertar lista numérica",
			"Insert table": "Insertar Tabla",
			"Insert Unordered List": "Insertar Lista viñetas",
			"Italic": "Cursiva",
			"Justify Center": "Centrar",
			"Justify Full": "Justificar",
			"Justify Left": "Alinear a la Izquierda",
			"Justify Right": "Alinear a la derecha",
			"Left to Right": "Izquierda a derecha",
			"Outdent": "Quitar Sangría",
			"Paste": "Pegar",
			"Redo": "Restaurar",
			"Remove formatting": "Quitar Formato",
			"Right to Left": "Derecha a izquierda",
			"Strike-through": "Invertir",
			"Subscript": "Subíndice",
			"Superscript": "Superíndice",
			"Underline": "Subrayar",
			"Undo": "Deshacer"
		},

		dialogs: {
			// for all
			"Apply": "Aplicar",
			"Cancel": "Cancelar",

			colorpicker: {
				"Colorpicker": "Selector de color",
				"Color": "Color"
			},

			image: {
				"Insert Image": "Insertar imagen",
				"Preview": "Vista previa",
				"URL": "URL",
				"Title": "Título",
				"Description": "Descripción",
				"Width": "Ancho",
				"Height": "Alto",
				"Original W x H": "Original Al X An",
				"Float": "Flotación",
				"None": "Ninguna",
				"Left": "Izquierda",
				"Right": "Derecha"
			},

			link: {
				"Insert Link": "Insertar Link",
				"Link URL": "URL del link",
				"Link Title": "Título del link",
				"Link Target": "Target del Link"
			},

			table: {
				"Insert table": "Insertar tabla",
				"Count of columns": "Cuenta de columnas",
				"Count of rows": "Cuenta de filas"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.fa.js
//
//=================


/**
 * Internationalization: Persian language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 * 
 * By: seifzadeh on github.com
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.fa.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.fa.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.fa = {
		controls: {
			"Bold": "پر رنگ",
			"Colorpicker": "انتخاب رنگ",
			"Copy": "کپی",
			"Create link": "درج لینک",
			"Cut": "برداشتن",
			"Decrease font size": "کوچک کردن اندازه متن",
			"File Manager": "مدیریت فایل",
			"Fullscreen": "تمام صفحه",
			"Header 1": "متن بسیار بزرگ",
			"Header 2": "متن بزرگ",
			"Header 3": "متن متوسط",
			"View source code": "نمایش کد",
			"Increase font size": "زیاد کردن اندازه متن",
			"Indent": "برجسته کردن",
			"Insert Horizontal Rule": "درج خط افقی",
			"Insert image": "درج عکس",
			"Insert Ordered List": " درج لیست ردیف دار",
			"Insert table": "درج جدول",
			"Insert Unordered List": "درج لیست بدون ردیف",
			"Italic": "متن کج",
			"Justify Center": "وسط چین",
			"Justify Full": "چیدن متن از دو طرف",
			"Justify Left": "چپ چین",
			"Justify Right": "راست چین",
			"Left to Right": "چپ به راست",
			"Outdent": "بیرون رفتگی متن",
			"Paste": "چسباندن",
			"Redo": "بازگشت",
			"Remove formatting": "حذف فرمت",
			"Right to Left": "راست به چپ",
			"Strike-through": "خط خرده",
			"Subscript": "زیرنویس",
			"Superscript": "سر نویس",
			"Underline": "زیر خط دار",
			"Undo": "جلو"
		},

		dialogs: {
			// for all
			"Apply": "اعمال تغییرات",
			"Cancel": "انصراف",

			colorpicker: {
				"Colorpicker": "انتخاب رنگ",
				"Color": "رنگ"
			},

			fileManager: {
				"file_manager": 		"مدیریت فایل",
				"upload_title":			"آپلود فایل",
				"rename_title":			"تغییر نام",
				"remove_title":			"حذف فایل",
				"mkdir_title":			"عنوان پوشه جدید",
				"upload_action": 		"آپلود در پوشه جدید",
				"mkdir_action": 		"ساخ پوشه جدید",
				"remove_action": 		"حذف فایل",
				"rename_action": 		"تغییر نام فایل" ,	
				"delete_message": 		"واقعا قصد حذف فایل رو دارید؟",
				"new_directory": 		"دایرکتوری جدید",
				"previous_directory": 	"بازگشت به دایرکتوری قبلی",
				"rename":				"تغییر نام",
				"select": 				"انتخاب",
				"create": 				"ساختن",
				"submit": 				"تایید",
				"cancel": 				"انصراف",
				"yes":					"قبول",
				"no":					"رد"
			},

			image: {
				"Insert Image": "درج تصویر",
				"Preview": "پیش نمایش",
				"URL": "لینک عکس",
				"Title": "عنوان",
				"Description": "توضیحات",
				"Width": "طول",
				"Height": "عرض",
				"Original W x H": "اندازه اصلی",
				"Float": "طرف نمایش",
				"None": "بدون طرف",
				"Left": "چپ",
				"Right": "راست",
				"Select file from server": "انتخاب فایل از سرور"
			},

			link: {
				"Insert Link": "درج لینک",
				"Link URL": "آدرس لینک",
				"Link Title": "عنوان",
				"Link Target": "نوع ارجاع"
			},

			table: {
				"Insert table": "درج جدول",
				"Count of columns": "تعداد ستون‌ها",
				"Count of rows": "تعداد سطرها"
			}
		}
	};
})(jQuery);






//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.fr.js
//
//=================


/**
 * Internationalization: french language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Tom Barbette <mappam0@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.fr.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.fr.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.fr = {
		controls: {
			"Bold": "Gras",
			"Colorpicker": "Choisir une couleur",
			"Copy": "Copier",
			"Create link": "Créer un lien",
			"Cut": "Couper",
			"Decrease font size": "Diminuer la taille du texte",
			"Fullscreen": "Plein écran",
			"Header 1": "Titre 1",
			"Header 2": "Titre 2",
			"Header 3": "Titre 3",
			"View source code": "Voir le code source",
			"Increase font size": "Augmenter la taille du texte",
			"Indent": "Augmenter le retrait",
			"Insert Horizontal Rule": "Insérer une règle horyzontale",
			"Insert image": "Insérer une image",
			"Insert Ordered List": "Insérer une liste ordonnée",
			"Insert table": "Insérer un tableau",
			"Insert Unordered List": "Insérer une liste",
			"Italic": "Italique",
			"Justify Center": "Centré",
			"Justify Full": "Justifié",
			"Justify Left": "Aligné à gauche",
			"Justify Right": "Aligné à droite",
			"Left to Right": "Gauche à droite",
			"Outdent": "Réduire le retrait",
			"Paste": "Coller",
			"Redo": "Restaurer",
			"Remove formatting": "Supprimer le formatage",
			"Right to Left": "Droite à gauche",
			"Strike-through": "Barré",
			"Subscript": "Indice",
			"Superscript": "Exposant",
			"Underline": "Souligné",
			"Undo": "Annuler"
		},

		dialogs: {
			// for all
			"Apply": "Appliquer",
			"Cancel": "Annuler",

			colorpicker: {
				"Colorpicker": "Choisir une couleur",
				"Color": "Couleur"
			},

			image: {
				"Insert Image": "Insérer une image",
				"Preview": "Prévisualiser",
				"URL": "URL",
				"Title": "Titre",
				"Description": "Description",
				"Width": "Largeur",
				"Height": "Hauteur",
				"Original W x H": "L x H originale",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": ""
			},

			link: {
				"Insert Link": "Insérer un lien",
				"Link URL": "URL du lien",
				"Link Title": "Titre du lien",
				"Link Target": "Cible du lien"
			},

			table: {
				"Insert table": "Insérer un tableau",
				"Count of columns": "Nombre de colonnes",
				"Count of rows": "Nombre de lignes"
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.he.js
//
//=================


/**
 * Internationalization: English language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 * 
 * By: 	Tudmotu, frost-nzcr4 on github.com
 * 		Yotam Bar-On
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.he.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.he.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.he = {
		controls: {
			"Bold": "מודגש",
			"Colorpicker": "פלטת צבעים",
			"Copy": "העתק",
			"Create link": "צור קישור",
			"Cut": "חתוך",
			"Decrease font size": "הקטן גופן",
			"Fullscreen": "מסך מלא",
			"Header 1": "כותרת 1",
			"Header 2": "כותרת 2",
			"Header 3": "כותרת 3",
			"View source code": "הצג קוד מקור",
			"Increase font size": "הגדל גופן",
			"Indent": "הגדל הזחה",
			"Insert Horizontal Rule": "הכנס קו אופקי",
			"Insert image": "הוסף תמונה",
			"Insert Ordered List": "הוספך רשימה ממוספרת",
			"Insert table": "הוסף טבלה",
			"Insert Unordered List": "הוספת רשימה בלתי ממוספרת",
			"Italic": "נטוי",
			"Justify Center": "מרכז",
			"Justify Full": "יישור לשוליים",
			"Justify Left": "הצמד לשמאל",
			"Justify Right": "הצמד לימין",
			"Left to Right": "שמאל לימין",
			"Outdent": "הורד הזחה",
			"Paste": "הדבק",
			"Redo": "עשה שוב",
			"Remove formatting": "הסר עיצוב",
			"Right to Left": "ימין לשמאל",
			"Strike-through": "כיתוב מחוק",
			"Subscript": "כתיב עילי",
			"Superscript": "כתיב תחתי",
			"Underline": "קו תחתון",
			"Undo": "בטל פעולה"
		},

		dialogs: {
			// for all
			"Apply": "החל",
			"Cancel": "בטל",

			colorpicker: {
				"Colorpicker": "פלטת צבעים",
				"Color": "צבע"
			},

			image: {
				"Insert Image": "הכנס תמונה",
				"Preview": "תצוגה מקדימה",
				"URL": "כתובת רשת",
				"Title": "כותרת",
				"Description": "תיאור",
				"Width": "רוחב",
				"Height": "גובה",
				"Original W x H": "מימדים מקוריים",
				"Float": "צף",
				"None": "שום כיוון",
				"Left": "שמאל",
				"Right": "ימין"
			},

			link: {
				"Insert Link": "צור קישור",
				"Link URL": "כתובת רשת",
				"Link Title": "כותרת",
				"Link Target": "מטרה"
			},

			table: {
				"Insert table": "הוסף טבלה",
				"Count of columns": "מספר עמודות",
				"Count of rows": "מספר שורות"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.hr.js
//
//=================


/**
 * Internationalization: Croatian language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Boris Strahija (bstrahija) <boris@creolab.hr>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.hr.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.hr.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.hr = {
		controls: {
			"Bold": "Podebljano",
			"Colorpicker": "Izbor boje",
			"Copy": "Kopiraj",
			"Create link": "Umetni link",
			"Cut": "Izreži",
			"Decrease font size": "Smanji font",
			"Fullscreen": "Cijeli ekran",
			"Header 1": "Naslov 1",
			"Header 2": "Naslov 2",
			"Header 3": "Naslov 3",
			"Header 4": "Naslov 4",
			"Header 5": "Naslov 5",
			"Header 6": "Naslov 6",
			"View source code": "Kod",
			"Increase font size": "Povećaj font",
			"Indent": "Uvuci",
			"Insert Horizontal Rule": "Horizontalna linija",
			"Insert image": "Umetni sliku",
			"Insert Ordered List": "Numerirana lista",
			"Insert table": "Umetni tabelu",
			"Insert Unordered List": "Nenumerirana lista",
			"Italic": "Ukošeno",
			"Justify Center": "Centriraj",
			"Justify Full": "Poravnaj obostrano",
			"Justify Left": "Poravnaj lijevo",
			"Justify Right": "Poravnaj desno",
			"Left to Right": "Lijevo na desno",
			"Outdent": "Izvuci",
			"Paste": "Zalijepi",
			"Redo": "Ponovi",
			"Remove formatting": "Poništi oblikovanje",
			"Right to Left": "Desno na lijevo",
			"Strike-through": "Precrtano",
			"Subscript": "Indeks",
			"Superscript": "Eksponent",
			"Underline": "Podcrtano",
			"Undo": "Poništi",
			"Code snippet": "Isječak koda"
		},

		dialogs: {
			// for all
			"Apply": "Primjeni",
			"Cancel": "Odustani",

			colorpicker: {
				"Colorpicker": "Izbor boje",
				"Color": "Boja"
			},

			image: {
				"Insert Image": "Umetni sliku",
				"Preview": "Predprikaz",
				"URL": "URL",
				"Title": "Naslov",
				"Description": "Opis",
				"Width": "Širina",
				"Height": "Visina",
				"Original W x H": "Originalna Š x V",
				"Float": "",
				"None": "Nema",
				"Left": "Lijevo",
				"Right": "Desno"
			},

			link: {
				"Insert Link": "Umetni link",
				"Link URL": "URL linka",
				"Link Title": "Naslov linka",
				"Link Target": "Meta linka"
			},

			table: {
				"Insert table": "Umetni tabelu",
				"Count of columns": "Broj kolona",
				"Count of rows": "Broj redova"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.it.js
//
//=================


/**
 * Internationalization: italian language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Mauro Franceschini <mauro.franceschini@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.it.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.it.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.it = {
		controls: {
			"Bold": "Grassetto",
			"Colorpicker": "Scegli un colore",
			"Copy": "Copia",
			"Create link": "Crea collegamento",
			"Cut": "Taglia",
			"Decrease font size": "Diminuisci dimensione testo",
			"Fullscreen": "Schermo intero",
			"Header 1": "Titolo 1",
			"Header 2": "Titolo 2",
			"Header 3": "Titolo 3",
			"View source code": "Visualizza codice sorgente",
			"Increase font size": "Aumenta dimensione testo",
			"Indent": "Aumenta il rientro",
			"Insert Horizontal Rule": "Inserisci separatore orizzontale",
			"Insert image": "Inserisci immagine",
			"Insert Ordered List": "Inserisci lista ordinata",
			"Insert table": "Inserisci tabella",
			"Insert Unordered List": "Inserisci lista non ordinata",
			"Italic": "Corsivo",
			"Justify Center": "Centrato",
			"Justify Full": "Giustificato",
			"Justify Left": "Allineato a sinistra",
			"Justify Right": "Allineato a destra",
			"Left to Right": "Da sinistra a destra",
			"Outdent": "Riduci il rientro",
			"Paste": "Incolla",
			"Redo": "Ripristina",
			"Remove formatting": "Cancella formattazione",
			"Right to Left": "Da destra a sinistra",
			"Strike-through": "Barrato",
			"Subscript": "Pedice",
			"Superscript": "Apice",
			"Underline": "Sottolineato",
			"Undo": "Annulla"
		},

		dialogs: {
			// for all
			"Apply": "Applica",
			"Cancel": "Annulla",

			colorpicker: {
				"Colorpicker": "Scegli un colore",
				"Color": "Colore"
			},

			image: {
				"Insert Image": "Inserisci immagine",
				"Preview": "Anteprima",
				"URL": "Indirizzo internet (URL)",
				"Title": "Titolo",
				"Description": "Descrizione",
				"Width": "Larghezza",
				"Height": "Altezza",
				"Original W x H": "Dimensioni originali (L x A)",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": ""
			},

			link: {
				"Insert Link": "Inserisci collegamento",
				"Link URL": "Indirizzo internet (URL)",
				"Link Title": "Titolo",
				"Link Target": "Destinazione"
			},

			table: {
				"Insert table": "Inserisci tabella",
				"Count of columns": "Numero di colonne",
				"Count of rows": "Numero di righe"
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.ja.js
//
//=================


/**
 * Internationalization: japanese language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: https://github.com/rosiro
 *
 */

(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.ja.js depends on $.wysiwyg";
		return false;
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.ja.js depends on $.wysiwyg.i18n";
		return false;
	}

	$.wysiwyg.i18n.lang.ja = {
		controls: {
			"Bold": "ボールド",
			"Copy": "コピー",
			"Create link": "リンク作成",
			"Cut": "切り取り",
			"Decrease font size": "フォントサイズを小さく",
			"Header 1": "見出し１",
			"Header 2": "見出し２",
			"Header 3": "見出し３",
			"View source code": "ソースコードを見る",
			"Increase font size": "フォントサイズを大きく",
			"Indent": "インデント",
			"Insert Horizontal Rule": "水平線<HR>を挿入",
			"Insert image": "画像を挿入",
			"Insert Ordered List": "順序付きリストの追加",
			"Insert table": "テーブルを挿入",
			"Insert Unordered List": "順序なしリストを追加",
			"Italic": "イタリック",
			"Justify Center": "中央寄せ",
			"Justify Full": "左右一杯に揃える",
			"Justify Left": "左寄せ",
			"Justify Right": "右寄せ",
			"Left to Right": "左から右へ",
			"Outdent": "インデント解除",
			"Paste": "貼り付け",
			"Redo": "やり直し",
			"Remove formatting": "書式設定を削除",
			"Right to Left": "右から左へ",
			"Strike-through": "取り消し線",
			"Subscript": "下付き文字",
			"Superscript": "上付き文字",
			"Underline": "下線",
			"Undo": "元に戻す"
		},

		dialogs: {
			// for all
			"Apply": "適用",
			"Cancel": "キャンセル",

			colorpicker: {
				"Colorpicker": "カラーピッカー",
				"Color": "カラー"
			},

			image: {
				"Insert Image": "画像を挿入",
				"Preview": "プレビュー",
				"URL": "URL",
				"Title": "タイトル",
				"Description": "概要",
				"Width": "横幅",
				"Height": "高さ",
				"Original W x H": "オリジナル 横 x 高",
				"Float": "フロート",
				"None": "画像無し",
				"Left": "左寄せ",
				"Right": "右寄せ"
			},

			link: {
				"Insert Link": "リンクの挿入",
				"Link URL": "リンク URL",
				"Link Title": "リンク タイトル",
				"Link Target": "リンク ターゲット"
			},

			table: {
				"Insert table": "テーブルを挿入",
				"Count of columns": "列数",
				"Count of rows": "行数"
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.nb.js
//
//=================


/**
 * Internationalization: norwegian (bokmål) language
 *
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: strauman on github.com / strauman.net
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.nb.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.nb.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.nb = {
		controls: {
			"Bold": "Fet",
			"Colorpicker": "Fargevelger",
			"Copy": "Kopier",
			"Create link": "Lag lenke",
			"Cut": "Klipp ut",
			"Decrease font size": "Reduser skriftstørrelse",
			"Fullscreen": "Fullskjerm",
			"Header 1": "Overskrift 1",
			"Header 2": "Overskrift 2",
			"Header 3": "Overskrift 3",
			"View source code": "Vis kildekode",
			"Increase font size": "Øk skriftstørrelse",
			"Indent": "Innrykk",
			"Insert Horizontal Rule": "Sett inn horisontal linje",
			"Insert image": "Sett inn bilde",
			"Insert Ordered List": "Sett inn sortert liste",
			"Insert table": "Sett inn tabell",
			"Insert Unordered List": "Sett inn usortert liste",
			"Italic": "Kursiv",
			"Justify Center": "Midtstillt",
			"Justify Full": "Blokkjustert",
			"Justify Left": "Ventrejustert",
			"Justify Right": "Høyrejustert",
			"Left to Right": "Venstre til høyre",
			"Outdent": "Rykk ut",
			"Paste": "Lim inn",
			"Redo": "Gjør om",
			"Remove formatting": "Fjern formatering",
			"Right to Left": "Høyre til venstre",
			"Strike-through": "Gjennomstreking",
			"Subscript": "Hevet skrift",
			"Superscript": "Senket skrift",
			"Underline": "Understrek",
			"Undo": "Angre"
		},

		dialogs: {
			// for all
			"Apply": "Bruk",
			"Cancel": "Avbryt",

			colorpicker: {
				"Colorpicker": "Fargevelger",
				"Color": "Farge"
			},

			fileManager: {
				"file_manager": 		"Filbehandler",
				"upload_title":			"Last opp fil",
				"rename_title":			"Gi nytt navn",
				"remove_title":			"Slett fil",
				"mkdir_title":			"Ny mappe",
				"upload_action": 		"Last opp fil til denne mappen",
				"mkdir_action": 		"Lag ny mappe",
				"remove_action": 		"Slett filen",
				"rename_action": 		"Nytt navn" ,	
				"delete_message": 		"Er du sikker på at du vil slette denne filen?",
				"new_directory": 		"Mappe uten navn",
				"previous_directory": 	"Opp",
				"rename":				"Gi nytt navn",
				"select": 				"Velg",
				"create": 				"Lag",
				"submit": 				"Send",
				"cancel": 				"Avbryt",
				"yes":					"Ja",
				"no":					"Nei"
			},

			image: {
				"Insert Image": "Sett inn bilde",
				"Preview": "Forhåndsvisning",
				"URL": "URL",
				"Title": "Tittel",
				"Description": "Beskrivelse",
				"Width": "Bredde",
				"Height": "Høyde",
				"Original W x H": "Original B x H",
				"Float": "Flyt",
				"None": "Ingen",
				"Left": "Venstre",
				"Right": "Høyre",
				"Select file from server": "Velg fil fra tjener"
			},

			link: {
				"Insert Link": "Sett inn lenke",
				"Link URL": "Lenke-URL",
				"Link Title": "Lenketittel",
				"Link Target": "Lenkemål"
			},

			table: {
				"Insert table": "Sett inn tabell",
				"Count of columns": "Antall kolonner",
				"Count of rows": "Antall rader"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.nl.js
//
//=================


/**
 * Internationalization: Dutch
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Erik van Dongen <dongen@connexys.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.nl.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.nl.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.nl = {
		controls: {
			"Bold": "Vet",
			"Colorpicker": "Kleur kiezen",
			"Copy": "Kopiëren",
			"Create link": "Link maken",
			"Cut": "Knippen",
			"Decrease font size": "Lettergrootte verkleinen",
			"Fullscreen": "Volledig scherm",
			"Header 1": "Kop 1",
			"Header 2": "Kop 2",
			"Header 3": "Kop 3",
			"View source code": "Broncode bekijken",
			"Increase font size": "Lettergrootte vergroten",
			"Indent": "Inspringen",
			"Insert Horizontal Rule": "Horizontale lijn invoegen",
			"Insert image": "Afbeelding invoegen",
			"Insert Ordered List": "Genummerde lijst",
			"Insert table": "Tabel invoegen",
			"Insert Unordered List": "Lijst met opsommingstekens",
			"Italic": "Cursief",
			"Justify Center": "Centreren",
			"Justify Full": "Uitvullen",
			"Justify Left": "Links uitlijnen",
			"Justify Right": "Rechts uitlijnen",
			"Left to Right": "Links naar Rechts",
			"Outdent": "Uitspringen",
			"Paste": "Plakken",
			"Redo": "Opnieuw uitvoeren",
			"Remove formatting": "Opmaak verwijderen",
			"Right to Left": "Rechts naar Links",
			"Strike-through": "Doorstrepen",
			"Subscript": "Subscript",
			"Superscript": "Superscript",
			"Underline": "Onderstrepen",
			"Undo": "Ongedaan maken"
		},

		dialogs: {
			// for all
			"Apply": "Toepassen",
			"Cancel": "Annuleren",

			colorpicker: {
				"Colorpicker": "Kleur kiezen",
				"Color": "Kleur"
			},

			image: {
				"Insert Image": "Afbeeldingen invoegen",
				"Preview": "Voorbeeld",
				"URL": "URL",
				"Title": "Titel",
				"Description": "Beschrijving",
				"Width": "Breedte",
				"Height": "Hoogte",
				"Original W x H": "Originele B x H",
				"Float": "Float",
				"None": "None",
				"Left": "Left",
				"Right": "Right"
			},

			link: {
				"Insert Link": "Link invoegen",
				"Link URL": "Link URL",
				"Link Title": "Linktitel",
				"Link Target": "Link target"
			},

			table: {
				"Insert table": "Tabel invoegen",
				"Count of columns": "Aantal kolommen",
				"Count of rows": "Aantal rijen"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.pl.js
//
//=================


/**
 * Internationalization: Polish language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Andrzej Herok
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.pl.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.pl.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.pl = {
		controls: {
			"Bold": "Pogrubienie",
			"Colorpicker": "Wybór koloru",
			"Copy": "Kopiuj",
			"Create link": "Utwórz łącze",
			"Cut": "Wytnij",
			"Decrease font size": "Zmniejsz rozmiar czcionki",
			"Fullscreen": "Pełny ekran",
			"Header 1": "Nagłówek 1",
			"Header 2": "Nagłówek 2",
			"Header 3": "Nagłówek 3",
			"View source code": "Pokaż kod źródłowy",
			"Increase font size": "Zwiększ rozmiar czcionki",
			"Indent": "Zwiększ wcięcie",
			"Insert Horizontal Rule": "Wstaw poziomą linię",
			"Insert image": "Wstaw obrazek",
			"Insert Ordered List": "Lista numerowana",
			"Insert table": "Wstaw tabelę",
			"Insert Unordered List": "Lista nienumerowana",
			"Italic": "Kursywa",
			"Justify Center": "Wyśrodkuj",
			"Justify Full": "Justowanie",
			"Justify Left": "Do lewej",
			"Justify Right": "Do prawej",
			"Left to Right": "Od lewej do prawej",
			"Outdent": "Zmniejsz wcięcie",
			"Paste": "Wklej",
			"Redo": "Powtórz",
			"Remove formatting": "Usuń formatowanie",
			"Right to Left": "Od prawej do lewej",
			"Strike-through": "Przekreślenie",
			"Subscript": "Indeks dolny",
			"Superscript": "Indeks górny",
			"Underline": "Podkreślenie",
			"Undo": "Cofnij"
		},

		dialogs: {
			// for all
			"Apply": "Zastosuj",
			"Cancel": "Anuluj",

			colorpicker: {
				"Colorpicker": "Próbnik koloru",
				"Color": "Kolor"
			},

			image: {
				"Insert Image": "Wstaw obrazek",
				"Preview": "Podgląd",
				"URL": "URL",
				"Title": "Tytuł",
				"Description": "Opis",
				"Width": "Szerokość",
				"Height": "Wysokość",
				"Original W x H": "Oryginalne wymiary",
				"Float": "Przyleganie",
				"None": "Brak",
				"Left": "Do lewej",
				"Right": "Do prawej"
			},

			link: {
				"Insert Link": "Wstaw łącze",
				"Link URL": "URL łącza",
				"Link Title": "Tytuł łącza",
				"Link Target": "Target"
			},

			table: {
				"Insert table": "Wstaw tabelę",
				"Count of columns": "Liczba kolumn",
				"Count of rows": "Liczba wierszy"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.pt_br.js
//
//=================


/**
 * Internationalization: Brazilian Portugese language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Marcelo Wergles <mwergles@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.pt_br.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.pt_br.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.pt_br = {
		controls: {
			"Bold": "Negrito",
			"Colorpicker": "Escolher uma cor",
			"Copy": "Copiar",
			"Create link": "Criar link",
			"Cut": "Recortar",
			"Decrease font size": "Diminuir o tamanho da fonte",
			"Fullscreen": "Tela cheia",
			"Header 1": "Título 1",
			"Header 2": "Título 2",
			"Header 3": "Título 3",
			"View source code": "Ver código fonte",
			"Increase font size": "Aumentar o tamanho da fonte",
			"Indent": "Aumentar recuo",
			"Insert Horizontal Rule": "Inserir linha horizontal",
			"Insert image": "Inserir imagem",
			"Insert Ordered List": "Inserir numeração",
			"Insert table": "Inserir tabela",
			"Insert Unordered List": "Inserir marcadores",
			"Italic": "Itálico",
			"Justify Center": "Centralizar",
			"Justify Full": "Justificar",
			"Justify Left": "Alinhar à esquerda",
			"Justify Right": "Alinhar à direita",
			"Left to Right": "Esquerda à direita",
			"Outdent": "Diminuir recuo",
			"Paste": "Colar",
			"Redo": "Refazer",
			"Remove formatting": "Remover formatação",
			"Right to Left": "Direita à esquerda",
			"Strike-through": "Riscar",
			"Subscript": "Subscrito",
			"Superscript": "Sobrescrito",
			"Underline": "Sublinhar",
			"Undo": "Desfazer"
		},

		dialogs: {
			// for all
			"Apply": "Aplicar",
			"Cancel": "Cancelar",

			colorpicker: {
				"Colorpicker": "Escolher uma cor",
				"Color": "Cor"
			},

			image: {
				"Insert Image": "Inserir Imagem",
				"Preview": "Pré-visualizar",
				"URL": "URL",
				"Title": "Título",
				"Description": "Descrição",
				"Width": "Largura",
				"Height": "Altura",
				"Original W x H": "L x A original",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": ""
			},

			link: {
				"Insert Link": "Inserir Link",
				"Link URL": "URL do link",
				"Link Title": "Título do link",
				"Link Target": "Alvo do link"
			},

			table: {
				"Insert table": "Inserir tabela",
				"Count of columns": "Número de colunas",
				"Count of rows": "Número de linhas"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.ru.js
//
//=================


/**
 * Internationalization: Russian language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 * 
 * By: frost-nzcr4 on github.com
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.ru.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.ru.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.ru = {
		controls: {
			"Bold": "Жирный",
			"Colorpicker": "Выбор цвета",
			"Copy": "Копировать",
			"Create link": "Создать ссылку",
			"Cut": "Вырезать",
			"Decrease font size": "Уменьшить шрифт",
			"File Manager": "Управление файлами",
			"Fullscreen": "На весь экран",
			"Header 1": "Заголовок 1",
			"Header 2": "Заголовок 2",
			"Header 3": "Заголовок 3",
			"View source code": "Посмотреть исходный код",
			"Increase font size": "Увеличить шрифт",
			"Indent": "Отступ",
			"Insert Horizontal Rule": "Вставить горизонтальную прямую",
			"Insert image": "Вставить изображение",
			"Insert Ordered List": "Вставить нумерованный список",
			"Insert table": "Вставить таблицу",
			"Insert Unordered List": "Вставить ненумерованный список",
			"Italic": "Курсив",
			"Justify Center": "Выровнять по центру",
			"Justify Full": "Выровнять по ширине",
			"Justify Left": "Выровнять по левой стороне",
			"Justify Right": "Выровнять по правой стороне",
			"Left to Right": "Слева направо",
			"Outdent": "Убрать отступ",
			"Paste": "Вставить",
			"Redo": "Вернуть действие",
			"Remove formatting": "Убрать форматирование",
			"Right to Left": "Справа налево",
			"Strike-through": "Зачёркнутый",
			"Subscript": "Нижний регистр",
			"Superscript": "Верхний регистр",
			"Underline": "Подчёркнутый",
			"Undo": "Отменить действие"
		},

		dialogs: {
			// for all
			"Apply": "Применить",
			"Cancel": "Отмена",

			colorpicker: {
				"Colorpicker": "Выбор цвета",
				"Color": "Цвет"
			},

			fileManager: {
				"file_manager": 		"Управление файлами",
				"upload_title":			"Загрузить файл",
				"rename_title":			"Переименовать файл",
				"remove_title":			"Удалить файл",
				"mkdir_title":			"Создать папку",
				"upload_action": 		"Загружает новый файл в текущую папку",
				"mkdir_action": 		"Создаёт новую папку",
				"remove_action": 		"Удалить этот файл",
				"rename_action": 		"Переименовать этот файл" ,	
				"delete_message": 		"Хотите удалить этот файл?",
				"new_directory": 		"Новая папка",
				"previous_directory": 	"Вернуться к предыдущей папке",
				"rename":				"Переименовать",
				"select": 				"Выбрать",
				"create": 				"Создать",
				"submit": 				"Послать",
				"cancel": 				"Отмена",
				"yes":					"Да",
				"no":					"Нет"
			},

			image: {
				"Insert Image": "Вставить изображение",
				"Preview": "Просмотр",
				"URL": "URL адрес",
				"Title": "Название",
				"Description": "Альт. текст",
				"Width": "Ширина",
				"Height": "Высота",
				"Original W x H": "Оригинальные Ш x В",
				"Float": "Положение",
				"None": "Не выбрано",
				"Left": "Слева",
				"Right": "Справа",
				"Select file from server": "Выбрать файл с сервера"
			},

			link: {
				"Insert Link": "Вставить ссылку",
				"Link URL": "URL адрес",
				"Link Title": "Название",
				"Link Target": "Цель"
			},

			table: {
				"Insert table": "Вставить таблицу",
				"Count of columns": "Кол-во колонок",
				"Count of rows": "Кол-во строк"
			}
		}
	};
})(jQuery);



//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.se.js
//
//=================


/**
 * Internationalization: swedish language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: ippa@rubylicio.us
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.se.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.se.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.se = {
		controls: {
			"Bold": "Tjock",
			"Colorpicker": "",
			"Copy": "Kopiera",
			"Create link": "Skapa länk",
			"Cut": "Klipp",
			"Decrease font size": "Minska storlek",
			"Fullscreen": "",
			"Header 1": "Rubrik 1",
			"Header 2": "Rubrik 2",
			"Header 3": "Rubrik 3",
			"View source code": "Se källkod",
			"Increase font size": "Öka fontstorlek",
			"Indent": "Öka indrag",
			"Insert Horizontal Rule": "Lägg in vertical avskiljare ",
			"Insert image": "Infoga bild",
			"Insert Ordered List": "Infoga numrerad lista",
			"Insert table": "Infoga tabell",
			"Insert Unordered List": "Infoga lista",
			"Italic": "Kursiv",
			"Justify Center": "Centrera",
			"Justify Full": "Marginaljustera",
			"Justify Left": "Vänsterjustera",
			"Justify Right": "Högerjustera",
			"Left to Right": "Vänster till höger",
			"Outdent": "Minska indrag",
			"Paste": "Klistra",
			"Redo": "Gör om",
			"Remove formatting": "Ta bort formatering",
			"Right to Left": "Höger till vänster",
			"Strike-through": "Genomstrykning",
			"Subscript": "Subscript",
			"Superscript": "Superscript",
			"Underline": "Understruken",
			"Undo": "Ångra"
		},

		dialogs: {
			// for all
			"Apply": "Applicera",
			"Cancel": "Avbryt",

			colorpicker: {
				"Colorpicker": "Färgval",
				"Color": "Färg"
			},

			image: {
				"Insert Image": "Lägg in bild",
				"Preview": "Förhandsgranska",
				"URL": "URL",
				"Title": "Rubrik",
				"Description": "Beskrivning",
				"Width": "Bredd",
				"Height": "Höjd",
				"Original W x H": "Original Bredd x Höjd",
				"Float": "Flytande",
				"None": "Ingen",
				"Left": "Vänster",
				"Right": "Höger"
			},

			link: {
				"Insert Link": "Skapa länk",
				"Link URL": "LänkURL",
				"Link Title": "Länkrubrik",
				"Link Target": "Länkmål"
			},

			table: {
				"Insert table": "Skapa tabell",
				"Count of columns": "Antal kolumner",
				"Count of rows": "Antal rader"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.sl.js
//
//=================


/**
 * Internationalization: Slovenian language
 *
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Peter Zlatnar <peter.zlatnar@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.sl.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.sl.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang.sl = {
		controls: {
			"Bold": "Krepko",
			"Colorpicker": "Izbirnik barv",
			"Copy": "Kopiraj",
			"Create link": "Dodaj povezavo",
			"Cut": "Izreži",
			"Decrease font size": "Zmanjšaj pisavo",
			"Fullscreen": "Celozaslonski način",
			"Header 1": "Naslov 1",
			"Header 2": "Naslov 2",
			"Header 3": "Naslov 3",
			"View source code": "Prikaži izvorno kodo",
			"Increase font size": "Povečaj pisavo",
			"Indent": "Zamik v desno",
			"Insert Horizontal Rule": "Vstavi vodoravno črto ",
			"Insert image": "Vstavi sliko",
			"Insert Ordered List": "Vstavi oštevilčen seznam",
			"Insert table": "Vstavi tabelo",
			"Insert Unordered List": "Vstavi označen seznam",
			"Italic": "Ležeče",
			"Justify Center": "Sredinska poravnava",
			"Justify Full": "Obojestranska poravnava",
			"Justify Left": "Leva poravnava",
			"Justify Right": "Desna poravnava",
			"Left to Right": "Od leve proti desni",
			"Outdent": "Zamik v levo",
			"Paste": "Prilepi",
			"Redo": "Ponovi",
			"Remove formatting": "Odstrani oblikovanje",
			"Right to Left": "Od desne proti levi",
			"Strike-through": "Prečrtano",
			"Subscript": "Podpisano",
			"Superscript": "Nadpisano",
			"Underline": "Podčrtano",
			"Undo": "Razveljavi"
		},

		dialogs: {
			// for all
			"Apply": "Uporabi",
			"Cancel": "Prekliči",
			
			colorpicker: {
				"Colorpicker": "Izbirnik barv",
				"Color": "Barva"
			},

			image: {
				"Insert Image": "Vstavi sliko",
				"Preview": "Predogled",
				"URL": "URL",
				"Title": "Naslov",
				"Description": "Opis",
				"Width": "Širina",
				"Height": "Višina",
				"Original W x H": "Prvotna Š x V",
				"Float": "",
				"None": "",
				"Left": "",
				"Right": ""
			},

			link: {
				"Insert Link": "Vstavi povezavo",
				"Link URL": "URL povezave",
				"Link Title": "Naslov povezave",
				"Link Target": "Cilj povezave"
			},

			table: {
				"Insert table": "Vstavi tabelo",
				"Count of columns": "Število stolpcev",
				"Count of rows": "Število vrstic"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.tr.js
//
//=================


/**
 * Internationalization: Turkish language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 *
 * By: Kadir Atesoglu <kadir.atesoglu@gmail.com>
 *
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.tr.js, $.wysiwyg olmadan çalışamaz";
	}
	if (undefined === $.wysiwyg.i18n) {
	    throw "lang.tr.js, $.wysiwyg.i18n olmadan çalışamaz";
	}

	$.wysiwyg.i18n.lang.de = {
		controls: {
			"Bold": "Kalın",
			"Colorpicker": "Renk Seçimi",
			"Copy": "Kopyala",
			"Create link": "Link Oluştur",
			"Cut": "Kes",
			"Decrease font size": "Font Küçült",
			"Fullscreen": "Tam Ekran",
			"Header 1": "Başlık 1",
			"Header 2": "Başlık 2",
			"Header 3": "Başlık 3",
			"View source code": "Kaynak Kod",
			"Increase font size": "Font Büyült",
			"Indent": "Girinti",
			"Insert Horizontal Rule": "Yatay Çizgi Ekle",
			"Insert image": "Resim Ekle",
			"Insert Ordered List": "Sıralı Liste Ekle",
			"Insert table": "Tablo Ekle",
			"Insert Unordered List": "Sırasız Liste Ekle",
			"Italic": "İtalik",
			"Justify Center": "Ortala",
			"Justify Full": "İki Yana Dayalı",
			"Justify Left": "Sola Dayalı",
			"Justify Right": "Sağa Dayalı",
			"Left to Right": "Soldan Sağa",
			"Outdent": "Çıkıntı",
			"Paste": "Yapıştır",
			"Redo": "Yinele",
			"Remove formatting": "Format Temizle",
			"Right to Left": "Sağdan Sola",
			"Strike-through": "Üstçizgi",
			"Subscript": "Kök",
			"Superscript": "Kare",
			"Underline": "Altçizgi",
			"Undo": "Geri Al"
		},

		dialogs: {
			// for all
			"Apply": "Uygula",
			"Cancel": "Vazgeç",

			colorpicker: {
				"Colorpicker": "Renk Seç",
				"Color": "Renk"
			},

			image: {
				"Insert Image": "Resim Ekle",
				"Preview": "Önizleme",
				"URL": "Link",
				"Title": "Başlık",
				"Description": "Açıklama",
				"Width": "Genişlik",
				"Height": "Yükseklik",
				"Original W x H": "Orjinal Genişlik * Yükseklik",
				"Float": "Hizalama",
				"None": "Yok",
				"Left": "Sol",
				"Right": "Sağ"
			},

			link: {
				"Insert Link": "Link Ekle",
				"Link URL": "Link Adresi",
				"Link Title": "Link Başlığı",
				"Link Target": "Link Davranışı"
			},

			table: {
				"Insert table": "Tablo Ekle",
				"Count of columns": "Sütun Sayısı",
				"Count of rows": "Satır Sayısı"
			}
		}
	};
})(jQuery);




//=================
//
// File: /home/blt/dev/lib/jquery/jwysiwyg/help/bin/./../../i18n/lang.zh-cn.js
//
//=================


/**
 * Internationalization: Chinese (Simplified) language
 * 
 * Depends on jWYSIWYG, $.wysiwyg.i18n
 * 
 * By: https://github.com/mengxy
 */
(function ($) {
	if (undefined === $.wysiwyg) {
		throw "lang.zh-cn.js depends on $.wysiwyg";
	}
	if (undefined === $.wysiwyg.i18n) {
		throw "lang.zh-cn.js depends on $.wysiwyg.i18n";
	}

	$.wysiwyg.i18n.lang['zh-cn'] = {
		controls: {
			"Bold": "加粗",
			"Colorpicker": "取色器",
			"Copy": "复制",
			"Create link": "创建链接",
			"Cut": "剪切",
			"Decrease font size": "减小字号",
			"Fullscreen": "全屏",
			"Header 1": "标题1",
			"Header 2": "标题2",
			"Header 3": "标题3",
			"View source code": "查看源码",
			"Increase font size": "增大字号",
			"Indent": "缩进",
			"Insert Horizontal Rule": "插入水平线",
			"Insert image": "插入图片",
			"Insert Ordered List": "插入有序列表",
			"Insert table": "插入表格",
			"Insert Unordered List": "插入无序列表",
			"Italic": "斜体",
			"Justify Center": "居中对齐",
			"Justify Full": "填充整行",
			"Justify Left": "左对齐",
			"Justify Right": "右对齐",
			"Left to Right": "从左到右",
			"Outdent": "取消缩进",
			"Paste": "粘贴",
			"Redo": "前进",
			"Remove formatting": "清除格式",
			"Right to Left": "从右到左",
			"Strike-through": "删除线",
			"Subscript": "上角标",
			"Superscript": "下角标",
			"Underline": "下划线",
			"Undo": "撤销"
		},

		dialogs: {
			// for all
			"Apply": "应用",
			"Cancel": "取消",

			colorpicker: {
				"Colorpicker": "取色器",
				"Color": "颜色"
			},

			image: {
				"Insert Image": "插入图片",
				"Preview": "预览",
				"URL": "URL",
				"Title": "标题",
				"Description": "描述",
				"Width": "宽度",
				"Height": "高度",
				"Original W x H": "原始宽高",
				"Float": "浮动",
				"None": "无",
				"Left": "左",
				"Right": "右"
			},

			link: {
				"Insert Link": "插入链接",
				"Link URL": "链接URL",
				"Link Title": "链接Title",
				"Link Target": "链接Target"
			},

			table: {
				"Insert table": "插入表格",
				"Count of columns": "列数",
				"Count of rows": "行数"
			}
		}
	};
})(jQuery);




