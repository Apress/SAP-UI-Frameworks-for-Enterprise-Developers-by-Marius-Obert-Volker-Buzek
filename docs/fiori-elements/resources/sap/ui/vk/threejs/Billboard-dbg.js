/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Billboard class.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"../thirdparty/three",
	"../thirdparty/html2canvas",
	"../BillboardCoordinateSpace",
	"../BillboardTextEncoding",
	"../BillboardStyle",
	"../BillboardBorderLineStyle",
	"../BillboardHorizontalAlignment",
	"./ThreeUtils",
	"../NodeContentType"
], function(
	BaseObject,
	THREE,
	html2canvas,
	BillboardCoordinateSpace,
	BillboardTextEncoding,
	BillboardStyle,
	BillboardBorderLineStyle,
	BillboardHorizontalAlignment,
	ThreeUtils,
	NodeContentType
) {
	"use strict";

	/**
	 * Constructor for a new Billboard.
	 *
	 * @class
	 *
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.Billboard
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Billboard = BaseObject.extend("sap.ui.vk.threejs.Billboard", /** @lends sap.ui.vk.threejs.Billboard.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				node: {
					type: "any", // THREE.Group
					defaultValue: new THREE.Group()
				},
				text: {
					type: "string",
					defaultValue: ""
				},
				font: {
					type: "string",
					defaultValue: ""
				},
				fontSize: {
					type: "float",
					defaultValue: 20
				},
				fontWeight: {
					type: "string",
					defaultValue: "normal"
				},
				fontItalic: {
					type: "boolean",
					defaultValue: false
				},
				textColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				borderColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				borderOpacity: {
					type: "float",
					defaultValue: 1
				},
				backgroundColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				backgroundOpacity: {
					type: "float",
					defaultValue: 0.5
				},
				encoding: {
					type: "sap.ui.vk.BillboardTextEncoding",
					defaultValue: BillboardTextEncoding.PlainText
				},
				width: {
					type: "float",
					defaultValue: 100
				},
				height: {
					type: "float",
					defaultValue: 100
				},
				style: {
					type: "sap.ui.vk.BillboardStyle",
					defaultValue: BillboardStyle.None
				},
				borderLineStyle: {
					type: "sap.ui.vk.BillboardBorderLineStyle",
					defaultValue: BillboardBorderLineStyle.Solid
				},
				borderWidth: {
					type: "float",
					defaultValue: 2
				},
				horizontalAlignment: {
					type: "sap.ui.vk.BillboardHorizontalAlignment",
					defaultValue: BillboardHorizontalAlignment.Left
				},
				texture: {
					type: "any", // THREE.Texture
					defaultValue: null
				},
				material: {
					type: "any" // THREE.Material
				},
				link: {
					type: "string",
					defaultValue: ""
				},
				coordinateSpace: {
					type: "sap.ui.vk.BillboardCoordinateSpace",
					defaultValue: BillboardCoordinateSpace.Viewport
				},
				position: {
					type: "any", // THREE.Vector3
					defaultValue: new THREE.Vector3(0, 0, 0)
				},
				renderOrder: {
					type: "int",
					defaultValue: 0
				}
			}
		}
	});

	Billboard.prototype._planeGeometry = new THREE.PlaneGeometry(1, 1);

	Billboard.prototype.init = function() {
		if (BaseObject.prototype.init) {
			BaseObject.prototype.init.call(this);
		}

		var material = new THREE.MeshBasicMaterial({
			depthTest: false,
			depthWrite: false,
			transparent: true,
			alphaTest: 0.05,
			premultipliedAlpha: true,
			side: THREE.DoubleSide
		});
		this.setProperty("material", material, true);
		this._billboard = new THREE.Mesh(this._planeGeometry, material);

		this._needUpdateTexture = true;
	};

	Billboard.prototype.exit = function() {
		if (BaseObject.prototype.exit) {
			BaseObject.prototype.exit.call(this);
		}

		if (this._billboard) {
			ThreeUtils.disposeObject(this._billboard);
			this._billboard = null;
		}
	};

	Billboard.prototype.setNode = function(node) {
		if (node instanceof THREE.Object3D) {
			this.setProperty("node", node, true);

			node.add(this._billboard);
			node.matrixAutoUpdate = false;
			node.isBillboard = true;
			node.userData.billboard = this;
			this._traverse(function(child) {
				child.userData.skipIt = true;
			});
		}
		return this;
	};

	Billboard.prototype._traverse = function(callback) {
		callback(this._billboard);
	};

	Billboard.prototype.setEncoding = function(value) {
		this.setProperty("encoding", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setText = function(value) {
		this.setProperty("text", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setFont = function(value) {
		this.setProperty("font", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setFontSize = function(value) {
		this.setProperty("fontSize", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setFontWeight = function(value) {
		this.setProperty("fontWeight", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setFontItalic = function(value) {
		this.setProperty("fontItalic", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setStyle = function(value) {
		this.setProperty("style", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setWidth = function(value) {
		this.setProperty("width", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setHeight = function(value) {
		this.setProperty("height", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setTextColor = function(value) {
		this.setProperty("textColor", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBackgroundColor = function(value) {
		this.setProperty("backgroundColor", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBackgroundOpacity = function(value) {
		this.setProperty("backgroundOpacity", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBorderWidth = function(value) {
		this.setProperty("borderWidth", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBorderLineStyle = function(value) {
		this.setProperty("borderLineStyle", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBorderColor = function(value) {
		this.setProperty("borderColor", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setBorderOpacity = function(value) {
		this.setProperty("borderOpacity", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setHorizontalAlignment = function(value) {
		this.setProperty("horizontalAlignment", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setLink = function(value) {
		this.setProperty("link", value, true);
		this._needUpdateTexture = true;
		return this;
	};

	Billboard.prototype.setTexture = function(value) {
		this.setProperty("texture", value, true);
		this._billboard.material.map = value;
		return this;
	};

	Billboard.prototype.setMaterial = function(value) {
		this.setProperty("material", value, true);
		this._billboard.material = value;
		return this;
	};

	Billboard.prototype.setRenderOrder = function(value) {
		this.setProperty("renderOrder", value, true);
		this._traverse(function(child) {
			child.renderOrder = value;
		});
		return this;
	};

	Billboard.prototype._renderBackground = function(ctx, width, height, borderWidth) {
		// ctx.globalAlpha = 0.1;
		// ctx.fillStyle = "#0f0";
		// ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = this.getBackgroundColor();
		ctx.strokeStyle = this.getBorderColor();

		ctx.lineWidth = borderWidth;
		switch (this.getBorderLineStyle()) {
			default:
				ctx.setLineDash([]);
				break;
			case BillboardBorderLineStyle.Dash:
				ctx.setLineDash([borderWidth * 5, borderWidth]);
				break;
			case BillboardBorderLineStyle.Dot:
				ctx.setLineDash([borderWidth * 2, borderWidth]);
				break;
			case BillboardBorderLineStyle.DashDot:
				ctx.setLineDash([borderWidth * 5, borderWidth, borderWidth * 2, borderWidth]);
				break;
			case BillboardBorderLineStyle.DashDotDot:
				ctx.setLineDash([borderWidth * 5, borderWidth, borderWidth * 2, borderWidth, borderWidth * 2, borderWidth]);
				break;
		}

		var bw2 = borderWidth / 2;
		if (this.getStyle() === BillboardStyle.RectangularShape) {
			ctx.globalAlpha = this.getBackgroundOpacity();
			if (ctx.globalAlpha > 0) {
				ctx.fillRect(0, 0, width, height);
			}

			ctx.globalAlpha = borderWidth > 0 ? this.getBorderOpacity() : 0;
			if (ctx.globalAlpha > 0) {
				ctx.strokeRect(bw2, bw2, width - borderWidth, height - borderWidth);
			}
		} else if (this.getStyle() === BillboardStyle.CircularShape) {
			var xc = width / 2;
			var yc = height / 2;
			var radius = width / 2;
			ctx.beginPath();
			ctx.arc(xc, yc, radius - bw2, 0, 2 * Math.PI);
			ctx.closePath();

			ctx.globalAlpha = this.getBackgroundOpacity();
			if (ctx.globalAlpha > 0) {
				ctx.fill();
			}

			ctx.globalAlpha = borderWidth > 0 ? this.getBorderOpacity() : 0;
			if (ctx.globalAlpha > 0) {
				ctx.stroke();
			}
		}

		ctx.globalAlpha = 1;
		ctx.setLineDash([]);
	};

	Billboard.prototype._getFont = function(pixelRatio) {
		return (this.getFontItalic() ? "italic " : "") + this.getFontWeight() + " " + (this.getFontSize() * pixelRatio) + "px " + (this.getFont() || "Arial");
	};

	Billboard.prototype._renderPlainText = function(pixelRatio) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var fontSize = this.getFontSize() * pixelRatio;
		var font = this._getFont(pixelRatio);
		ctx.font = font;
		var lineSpacing = Math.ceil(fontSize);
		var borderWidth = this.getBorderLineStyle() !== BillboardBorderLineStyle.None ? this.getBorderWidth() * pixelRatio : 0;
		var margin = Math.ceil(fontSize * 0.2 + borderWidth);
		var textLines = this.getText().split("\n");
		var textWidth = 0;
		textLines.forEach(function(text) {
			textWidth = Math.max(textWidth, ctx.measureText(text).width);
		});
		var link = this.getLink();
		if (link.length > 0) {
			textWidth = Math.max(textWidth, ctx.measureText(link).width);
		}
		textWidth = Math.ceil(textWidth * 0.5) * 2;
		var textLineCount = textLines.length + (link.length > 0 ? 1 : 0);
		var textHeight = Math.ceil(lineSpacing * textLineCount * 0.5) * 2;
		var width = textWidth + margin * 2;
		var height = textHeight + margin * 2;
		if (this.getStyle() === BillboardStyle.CircularShape) {
			width = height = Math.max(width, height);
		}
		this._width = width / pixelRatio;
		this._height = height / pixelRatio;

		canvas.width = THREE.MathUtils.ceilPowerOfTwo(width);
		canvas.height = THREE.MathUtils.ceilPowerOfTwo(height);

		this._renderBackground(ctx, width, height, borderWidth);

		ctx.font = font;
		ctx.textAlign = this.getHorizontalAlignment();
		ctx.textBaseline = "middle";
		var a = ["left", "center", "right"].indexOf(ctx.textAlign);
		var x = (width + textWidth * (a - 1)) >> 1;
		var y = (height - (textLineCount - 1) * lineSpacing) >> 1;

		// draw shadow
		// ctx.fillStyle = "#000";
		// ctx.globalAlpha = 0.5;
		// ctx.filter = "blur(1px)";
		// for (var i in textLines) {
		// 	ctx.fillText(textLines[ i ], x + 1, y + lineSpacing * i + 1);
		// }

		// draw text
		ctx.fillStyle = this.getTextColor();
		ctx.filter = "blur(0px)";
		for (var i in textLines) {
			ctx.fillText(textLines[i], x, y + lineSpacing * i);
		}

		if (link.length > 0) {
			ctx.fillStyle = "#00f";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";
			ctx.fillText(link, width - margin, height - margin);
		}

		this._setBillboardTexture(canvas, width, height);
	};

	Billboard.prototype._renderHtmlText = function(pixelRatio) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var borderWidth = this.getBorderLineStyle() !== BillboardBorderLineStyle.None ? this.getBorderWidth() * pixelRatio : 0;
		var margin = Math.ceil(borderWidth);
		var width = Math.ceil(this.getWidth() * pixelRatio) + margin * 2;
		var height = Math.ceil(this.getHeight() * pixelRatio) + margin * 2;
		if (this.getStyle() === BillboardStyle.CircularShape) {
			width = height = Math.max(width, height);
		}
		this._width = width / pixelRatio;
		this._height = height / pixelRatio;

		canvas.width = THREE.MathUtils.ceilPowerOfTwo(width);
		canvas.height = THREE.MathUtils.ceilPowerOfTwo(height);

		this._renderBackground(ctx, width, height, borderWidth);

		var link = this.getLink();
		if (link.length > 0) {
			ctx.font = this._getFont(pixelRatio);
			ctx.fillStyle = "#00f";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";
			ctx.fillText(link, width - margin, height - margin);
		}

		var iframe = document.createElement("iframe");
		iframe.style.visibility = "hidden";
		iframe.width = (width - margin * 2) / pixelRatio;
		iframe.height = (height - margin * 2) / pixelRatio;
		iframe.sandbox = "allow-same-origin";
		document.body.appendChild(iframe);

		var doc = iframe.contentDocument || iframe.contentWindow.document;
		doc.open();
		doc.close();
		doc.body.innerHTML = this.getText();

		var htmlCanvas = document.createElement("canvas");
		htmlCanvas.width = iframe.width * pixelRatio;
		htmlCanvas.height = iframe.height * pixelRatio;
		htmlCanvas.style.width = iframe.width + "px";
		htmlCanvas.style.height = iframe.height + "px";
		var context = htmlCanvas.getContext("2d");
		context.scale(pixelRatio, pixelRatio);

		this._billboard.material.visible = false;
		html2canvas(doc.body, {
			canvas: htmlCanvas,
			backgroundColor: null
		}).then(function(htmlCanvas) {
			if (htmlCanvas.width > 0 && htmlCanvas.height > 0) {
				canvas.getContext("2d").drawImage(htmlCanvas, margin, margin);
			}

			setTimeout(this._setBillboardTexture.bind(this, canvas, width, height), 0);

			document.body.removeChild(iframe);
		}.bind(this));
	};

	Billboard.prototype._renderText = function(pixelRatio) {

		var fontFace = this.getFont() || "Arial";
		var fontSize = this.getFontSize() * 1.333; // = 96.0 / 72.0, conversion factor from Pt (points) to pixels

		// Following values are based on on-prem products. Cloud rendering needs to be compatible with the output from them.
		// WARNING: DO NOT MESS WITH THESE PROPERTIES! Just don't. It will break stuff.
		var padding = 4; // in logical pixels, this is the default in on-prem and is not persisted anywhere!
		var plainTextLineHeight = 1.2; // scale factor (for plain text notes)
		var htmlLineHeight = 1.25; // scale factor (for RichText notes)
		var htmlFrame; // placeholder for RT iframe
		var htmlDocument; // placeholder for RT content document

		var canvas = document.createElement("canvas");
		canvas.id = "jDVLAnnotationCanvas-" + Math.random().toString(36).substr(2, 9);
		canvas.style.visibility = "hidden";
		canvas.style.display = "none";
		// Maximum dimensions for offscreen canvas in logical pixels
		// These dimensions allow for a generously sized label, at 96 DPI physical resolution about 500 mm wide
		// If the actual size of the label happened to be even greater, then undersampling would occur because the canvas would be stretched
		// to a bigger frame, resulting in slightly blurry content. For now, however, this size is considered to be sufficient.
		// Note that, the width is greater because labels normally have a landscape aspect ratio.
		var maxCanvasWidth = 2048;
		var maxCanvasHeight = 1024;
		// Scale factor for canvas to make sure that the same amount of logical pixels are available in the canvas, regardless
		// of the current device pixel ratio, rounded up to the next power of two.
		// E.g. if the label has a size of 1000 logical pixels at a pixel ratio of 3 (e.g. on a Retina display), then the required
		// number of device pixels would be 3000, which would not fit into the default size. Instead, the canvas size needs to be
		// inflated to the next power of two, in this case to 8192 pixels, which will then be sufficient.
		var canvasScale = Math.pow(2, Math.ceil(Math.log(pixelRatio) / Math.LN2));
		// Scale canvas up for high-dpi devices
		canvas.width = maxCanvasWidth * canvasScale;
		canvas.height = maxCanvasHeight * canvasScale;
		document.body.appendChild(canvas);

		var ctx = canvas.getContext("2d");
		var fontWeight = Math.min(Math.max(Math.round(this.getFontWeight() / 100), 1), 9) * 100;
		ctx.font = fontWeight + (this.getFontItalic() ? " italic " : " ") + fontSize + "px " + fontFace;
		var lineSpacing = Math.ceil(fontSize * plainTextLineHeight);
		var w = this.getWidth();
		var h = this.getHeight();
		var borderWidth = this.getBorderLineStyle() !== BillboardBorderLineStyle.None ? this.getBorderWidth() : 0;
		var maxLineWidth = (this.getEncoding() === BillboardTextEncoding.PlainText ? 1024 : w) - (padding + borderWidth) * 2;
		var maxLines = ((this.getEncoding() === BillboardTextEncoding.PlainText ? 1024 : this.getHeight()) - (padding + borderWidth) * 2) / lineSpacing | 0;
		var textWidth = 0;
		var linkWidth = 0;
		var text = this.getText();
		var link = this.getLink();
		var textLines = this.getEncoding() === BillboardTextEncoding.PlainText ? text.split("\n") : [];
		textLines.length = Math.min(textLines.length, link.length > 0 ? maxLines - 1 : maxLines);

		function truncate(str) {
			return str.substr(0, str.length - 2) + "\u2026";
		}

		var linkLines = [];
		if (link.length > 0) {
			var maxLinkLines = maxLines - textLines.length;
			while (link.length > 0 && textLines.length < maxLinkLines) {
				var rowText = link;
				while ((ctx.measureText(rowText).width > maxLineWidth) && (rowText.length > 1)) {
					rowText = rowText.substring(0, rowText.length - 1);
				}

				linkLines.push(rowText);
				link = link.substring(rowText.length, link.length);
			}

			if (link.length > 0) {
				linkLines[linkLines.length - 1] = truncate(linkLines[linkLines.length - 1]);
			}

			for (var j = 0; j < linkLines.length; j++) {
				// console.log(i, linkLines[i], ctx.measureText(linkLines[i]).width);
				linkWidth = Math.max(ctx.measureText(linkLines[j]).width, linkWidth);
			}
		}

		if (this.getEncoding() === BillboardTextEncoding.PlainText) {// PlainText

			for (var k = 0; k < textLines.length; k++) {
				// console.log(i, textLines[i], ctx.measureText(textLines[i]).width);
				textWidth = Math.max(ctx.measureText(textLines[k]).width, textWidth);
			}

			// Overall width of label needs to be increased by the extent of a single whitespace char (based on on-prem code)
			var wspw = ctx.measureText(" ").width;
			w = Math.max(textWidth, linkWidth) + wspw + padding * 2;
			h = (textLines.length + linkLines.length) * lineSpacing + padding * 2;
		} else if (this.getEncoding() === BillboardTextEncoding.HtmlText && typeof html2canvas != "undefined") {// HtmlText (aka RichText)
			htmlFrame = document.createElement("iframe");
			htmlFrame.style.visibility = "hidden";
			htmlFrame.sandbox = "allow-same-origin";
			document.body.appendChild(htmlFrame);
			htmlDocument = htmlFrame.contentDocument || htmlFrame.contentWindow.document;
			htmlDocument.open();
			htmlDocument.close();
			htmlDocument.documentElement.innerHTML = text;

			// Sanitize Rich Text markup data persisted by VE Author
			// RichText markup is created by Qt components that are not compatible with web standards and therefore the
			// persisted date need to be purged and/or adjusted
			(function sanitizeHtmlContent() {
				var style;
				if (htmlDocument.styleSheets.length === 0) {
					style = htmlDocument.createElement("style");
					style.type = "text/css";
					style.appendChild(document.createTextNode("")); // WebKit might require end tag
					htmlDocument.head.appendChild(style);
				}
				style = htmlDocument.querySelector("style");

				// 1) CSS reset: clear anyting that might interfere with size calculations
				// NOTE: Resetting the line height is particularly important for html2canvas, browsers accept `unset`
				// value but html2canvas seems to have a problem with that.
				// For the same reason, we cannot set the line height on <p> as it will not be propagated to child elements
				// in html2canvas (again, it works fine in browsers) :(
				style.sheet.insertRule("* { margin: 0; padding: 0; line-height: 1; }", 0);
				// 2) VERY IMPORTANT: Make line height explicit, instead of relying on the browser to magically calculate the default one.
				// 3) Allow overly long words that do not fit on a standalone line to wrap anywhere, without injecting hyphens
				style.sheet.insertRule("span { line-height: " + htmlLineHeight + "; overflow-wrap: break-word;  }", 1);
				var rules = style.sheet.cssRules;
				var ruleText = [];
				for (var ri = 0; ri < rules.length; ri++) {
					ruleText.push(rules[ri].cssText);
				}
				style.textContent = ruleText.join("\n");
				// 4) Clear all style info from <body>
				// Brutal, but any kind of information here is 1) either not being used 2) or would be useless anyway
				// E.g. on-prem products are hosted on Windows and so Qt persists the default Windows system font
				// ('MS Shell Dlg') here ...not very helpful.
				// Don't worry, fonts etc. will be properly set for child elements.
				htmlDocument.body.removeAttribute("style");

				// Fix up some rules at element level, so that they surely override global ones
				var paras = htmlDocument.body.querySelectorAll("p");
				if (paras.length > 0) {
					// 5) Remove margin-top from first <p>
					// Qt persists this,then it ignores the value when file is read back...
					paras[0].style.marginTop = 0;
					// 6) Push downward first para a bit in labels (but not in notes)
					// This is to be compatible with Qt's rendering.

					paras[0].style.paddingTop = "1px";

					// 7) Allow lines to wrap on whitespaces but remove whitespaces from the end of the line for intrinsic size
					// calculations. Also, ignore embedded newline characters ('\n'), i.e. do not break line on these.
					// Note that, this is Qt's quirky behavior in the on-prem products. Qt exports RT content with
					// the 'white-space=pre-wrap' global style set and then it proceeds to ignore this very style when
					// the file is imported in e.g. VE Author, so it's inconsistent even with itself.
					// Anyhow, we must be bug-compatible, otherwise we would get unwanted line breaks compared to on-prem.
					paras.forEach(function(p, i) {
						p.style.whiteSpace = "normal";
					});
				}
				htmlDocument.body.querySelectorAll("span").forEach(function(span) {
					// 8) Fix up font family
					// Again, a Qt bug. It persists a malformed list. Without this fixup browser would fall back to default font.
					var fonts = span.style.fontFamily.split(",");
					fonts.forEach(function(f, i) {
						fonts[i] = "\"" + f.trim().replaceAll(/[\u0022\u0027]/g, "") + "\"";
					});
					span.style.fontFamily = fonts.join(", ");
					// 9) Do not wrap long lines at hyphens. This is Qt's behavior and it's actually desirable.
					// WORKAROUND: Prevent wrapping of lines at explicit hyphenations by replacing plain old "short" hyphen
					// aka minus sign (U+002D) and "long" hyphen (U+2010) with a non-breaking hyphen (U+2011).
					// Our application deals with technical documents, rather than general purpose text, which contain lot of
					// hyphenations, e.g. in IDs like "041A5100-1/-2". The hyphens are an integral part of the ID and therefore
					// breaking up text at hyphens is generally undesirable. Unfortunately, there is no way to explicitly control
					// this via CSS properties as of CSS L3 (note that, 'hyphens: none' only prevents the injection of hyphens
					// at breaks but do not prevent explicit hyphens from being treated as break oppportunities). CSS L4 proposal
					// might rectify this, but in the meantime, in lieu of explicit control, we need to resort to this solution.
					// This is also the recommended workaround by the Unicode Line Breaking Algorithm (UAX 14) annex.
					// The disadvantage of this is that the non-breaking hyphen glyph may be missing from some fonts or even when
					// it is present it may render ugly. For all the gory details, see: https://github.com/w3c/csswg-drafts/issues/3434
					// Disable this change, as in many sample files, minus sign / hyphen does not show
					// span.innerText = span.innerText.replaceAll(/[-\u2010]/g, "\u2011");
				});
			})();

			// Calculate dimensions for RT labels. The size information persisted in the file cannot be relied upon
			// Actual size of label can be both greater or less in both directions, therefore we treat the initial dimensions
			// as mere hints and recalculate the proper, fitting size ourselves.
			var calcHtmlContentExtents = function(contentExtentHints) {
				function addRect(target, source) {
					if (source.left < target.left) {
						target.left = source.left;
					}
					if (source.right > target.right) {
						target.right = source.right;
					}
					if (source.top < target.top) {
						target.top = source.top;
					}
					if (source.bottom > target.bottom) {
						target.bottom = source.bottom;
					}
				}

				// Eliminate any properties that might interfere with the size calculations
				htmlDocument.body.style.margin = 0;
				htmlDocument.body.style.padding = 0;
				htmlDocument.body.style.border = 0;
				// Wrap the entire content of the body in a new div
				var div = htmlDocument.createElement("div");
				while (htmlDocument.body.childNodes.length) {
					var htmlNode = htmlDocument.body.childNodes[0];
					div.appendChild(htmlNode);
				}
				htmlDocument.body.appendChild(div);
				div.style.margin = 0;
				div.style.padding = 0;
				div.style.border = 0;
				div.style.position = "absolute";

				var contentBoundingRect = {
					left: Infinity,
					top: Infinity,
					right: -Infinity,
					bottom: -Infinity
				};

				var contentWidth;
				var contentHeight;

				// No hinting info provided? Let's try to come up with something reasonable on our own
				if (contentExtentHints === undefined) {
					// Do not set size constraints on wrapper div, let it adapt its size to the intrinsic size of the content...
					div.style.width = "min-content";
					div.style.height = "min-content";
					// ...and let inline content overflow (in this case extend as far as possible, i.e. without breaking up words).
					// Therefore, the final horizontal extent should be the width of the longest word.
					div.style.overflowWrap = "normal";
					// Calculate union of bounding rectangles for all inline elements (atm, only spans)
					htmlDocument.querySelectorAll("span").forEach(function(span) {
						addRect(contentBoundingRect, span.getBoundingClientRect());
					});

					contentWidth = Math.ceil(contentBoundingRect.right - contentBoundingRect.left);
					contentHeight = Math.ceil(contentBoundingRect.bottom - contentBoundingRect.top);
					var intrinsicAspectRatio = contentBoundingRect.width / contentBoundingRect.height;
					// We try to keep the aspect ratio of the content hinting rectangle as close to this ratio as possible
					// (note that, this is rectangle in landscape orientation, the code is not adapted to handle portrait
					// target rectangles atm)
					var desiredAspectRatio = 16 / 9;
					if (intrinsicAspectRatio > desiredAspectRatio) {
						// The intrinsic content rectangle is also in landscape orientation and has a wider aspect than
						// the desired one, so we cannot shrink it any further, just use it as is
						contentExtentHints = {
							width: contentWidth,
							height: contentHeight
						};
					} else {
						// Otherwise, if the content rectangle's aspect ratio is tall, i.e. the rectangle is in portrait
						// orientation (or it is still in landscape but chunkier than what we want), then we try to "square-ify"
						// (sort of) and recalculate it in a way so that the aspect ratio gets close to the desired one.
						var contentArea = contentWidth * contentHeight;
						var y = Math.sqrt(contentArea / desiredAspectRatio);
						var x = y * desiredAspectRatio;
						contentExtentHints = {
							width: Math.ceil(x),
							height: Math.ceil(y)
						};
					}
				}

				// First pass of calculating content rectangle. Set size constraints on wrapper div using the hints...
				div.style.width = contentExtentHints.width + "px";
				div.style.height = contentExtentHints.height + "px";
				// ...but allow inline content to overflow the boundaries of the div if there are some overly long words
				// in the text. This will allow for both larger and smaller content than the width hint, and the actual
				// width will be calculated properly.
				div.style.overflowWrap = "normal";
				// Calculate union of bounding rectangles for all inline elements (atm, only spans)
				htmlDocument.querySelectorAll("span").forEach(function(span) {
					addRect(contentBoundingRect, span.getBoundingClientRect());
				});
				contentWidth = Math.ceil(contentBoundingRect.right - contentBoundingRect.left);
				// Since it is unknown whether the size hints did or did not contain the paddings, try to be creative:
				// if the actual size is close to the size hint then it is assumed that the hint did not contain the padding.
				if (Math.abs(contentWidth - contentExtentHints.width) > padding) {
					contentWidth = Math.min(contentWidth, contentExtentHints.width - 2 * padding);
				}

				// Second pass of calculating content rectangle. Fix the width and recalculate bounding rectangle
				// again to get actual height
				htmlFrame.width = contentWidth;
				div.style.width = contentWidth + "px";
				contentBoundingRect = {
					left: Infinity,
					top: Infinity,
					right: -Infinity,
					bottom: -Infinity
				};
				htmlDocument.querySelectorAll("p").forEach(function(p) {
					addRect(contentBoundingRect, p.getBoundingClientRect());
				});
				contentHeight = Math.ceil(contentBoundingRect.bottom - contentBoundingRect.top);
				// console.log("CALCULATED CONTENT extent=", contentWidth, contentHeight);
				var contentExtents = {
					width: contentWidth,
					height: contentHeight
				};
				// Unwrap temporary div
				while (div.childNodes.length) {
					var node = div.childNodes[0];
					htmlDocument.body.appendChild(node);
				}
				htmlDocument.body.removeChild(div);
				return contentExtents;
			};

			var contentExtents = { width: Math.ceil(w), height: Math.ceil(h) };
			contentExtents = calcHtmlContentExtents(w > 0 && h > 0 ? contentExtents : undefined);
			contentExtents.width += padding * 2;
			contentExtents.height += padding * 2;

			if (w < contentExtents.width) {
				w = contentExtents.width;
			}
			if (h < contentExtents.height) {
				h = contentExtents.height;
			}
		}

		w = Math.ceil(w + 2 * borderWidth);
		h = Math.ceil(h + 2 * borderWidth);
		// console.log(w, h);

		if (this.getStyle() === BillboardStyle.CircularShape) {
			w = h = Math.max(w, h);
		}

		w *= pixelRatio;
		h *= pixelRatio;

		var tw = Math.pow(2, Math.ceil(Math.log(w) / Math.LN2));
		var th = Math.pow(2, Math.ceil(Math.log(h) / Math.LN2));
		tw = Math.min(tw, canvas.width);
		th = Math.min(th, canvas.height);

		var textureScale = 1; // texture scale

		if (w > tw || h > th) {
			textureScale = Math.min(tw / w, th / h);
			w *= textureScale;
			h *= textureScale;
			pixelRatio *= textureScale;
		}

		var contentWidth = w;
		var contentHeight = h;
		this._width = w / pixelRatio;
		this._height = h / pixelRatio;

		// Convert metrics from logical pixels to device pixels
		padding *= pixelRatio;
		borderWidth *= pixelRatio;
		fontSize *= pixelRatio;
		lineSpacing *= pixelRatio;
		textWidth *= pixelRatio;

		ctx.fillStyle = this.getBackgroundColor();
		ctx.strokeStyle = this.getBorderColor();
		ctx.lineWidth = borderWidth;
		var borderWidth2 = borderWidth / 2;

		switch (this.getBorderLineStyle()) {
			default:
				ctx.setLineDash([]);
				break;
			case BillboardBorderLineStyle.Dash:
				ctx.setLineDash([borderWidth * 5, borderWidth]);
				break;
			case BillboardBorderLineStyle.Dot:
				ctx.setLineDash([borderWidth * 2, borderWidth]);
				break;
			case BillboardBorderLineStyle.DashDot:
				ctx.setLineDash([borderWidth * 5, borderWidth, borderWidth * 2, borderWidth]);
				break;
			case BillboardBorderLineStyle.DashDotDot:
				ctx.setLineDash([borderWidth * 5, borderWidth, borderWidth * 2, borderWidth, borderWidth * 2, borderWidth]);
				break;
		}

		var bgOpacity = this.getBackgroundOpacity();
		var borderOpacity = this.getBorderOpacity();
		if (this.getStyle() === BillboardStyle.RectangularShape) {
			if (bgOpacity > 0) {
				ctx.globalAlpha = bgOpacity;
				ctx.fillRect(0, 0, w, h);
			}

			ctx.globalAlpha = borderWidth > 0 ? borderOpacity : 0;
			if (ctx.globalAlpha > 0) {
				ctx.strokeRect(borderWidth2, borderWidth2, w - borderWidth, h - borderWidth);
			}
		} else if (this.getStyle() === BillboardStyle.CircularShape) {
			var xc = w / 2;
			var yc = h / 2;
			var radius = Math.min(xc, yc);
			ctx.beginPath();
			ctx.arc(xc, yc, radius - borderWidth2, 0, 2 * Math.PI);
			ctx.closePath();

			if (bgOpacity > 0) {
				ctx.globalAlpha = bgOpacity;
				ctx.fill();
			}

			ctx.globalAlpha = borderWidth > 0 ? borderOpacity : 0;
			if (borderOpacity > 0) {
				ctx.stroke();
			}
		}

		ctx.globalAlpha = 1;
		ctx.setLineDash([]);
		// From now on context is using the upscaled font size!
		ctx.font = fontWeight + (this.getFontItalic() ? " italic " : " ") + fontSize + "px " + fontFace;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		function renderLink() {
			if (linkLines.length > 0) {
				ctx.fillStyle = "#0000FF";
				h -= linkLines.length * lineSpacing;
				var x = (w - linkWidth) * 0.5;
				var y = h - borderWidth - padding + lineSpacing * 0.5;
				for (var i = 0; i < linkLines.length; i++) {
					ctx.fillText(linkLines[i], x, y);
					y += lineSpacing;
				}
			}
		}

		if (this.getEncoding() === BillboardTextEncoding.PlainText) {// PlainText
			renderLink();

			// All metrics are in device pixels now, no need to scale context
			ctx.fillStyle = this.getTextColor();
			ctx.strokeStyle = this.getBackgroundColor();
			ctx.lineWidth = 3;

			var x = (w - textWidth) * 0.5;
			var y = (h - (textLines.length - linkLines.length - 1) * lineSpacing) * 0.5;
			if (textLines.length == 1) {
				// Text in single-line labels is always centered both horizontally and vertically
				// Calculate actual height of text bounding box, so text can be accurately centered vertically, the way as in on-prem products
				var tm = ctx.measureText(text);
				var txth = tm.actualBoundingBoxDescent + tm.actualBoundingBoxAscent;
				// Align to bottom vertically. Top would take some extra padding into account which is reserved for diacritics (like acute accent etc.).
				// Since we are dealing with mostly English-language documents, these are normally not present.
				// Calculating the actual height of the text ourselves and aligning to the bottom instead of the top would properly center the text vertically
				// Note that, this will work with diacritics as well, as the bounding box will be taller in such cases.
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				x = w * 0.5;
				y = (h - 2 * borderWidth - txth) * 0.5 + txth + padding;
			}

			for (var i = 0; i < textLines.length; i++) {
				if (this.getStyle() === BillboardStyle.TextGlow) {// Style_TextGlow
					ctx.strokeText(textLines[i], x, y);
				}

				ctx.fillText(textLines[i], x, y);
				y += lineSpacing;
			}

			this._setBillboardTexture(canvas, contentWidth, contentHeight);
			document.body.removeChild(canvas);
		} else if (this.getEncoding() === BillboardTextEncoding.HtmlText && typeof html2canvas != "undefined") {// HtmlText (aka RichText)

			renderLink();
			// Canvas dimensions, including padding/margin, but excluding borders
			var cw = w - borderWidth * 2;
			var ch = h - borderWidth * 2;
			cw /= pixelRatio;
			ch /= pixelRatio;
			htmlFrame.width = cw;
			htmlFrame.height = ch;
			htmlFrame.scale = textureScale;
			htmlFrame.sandbox = "allow-same-origin";
			padding /= pixelRatio; // convert it back to logical pixels

			// Use same margin as on-prem applications
			htmlDocument.body.style.width = (cw - 2 * padding) + "px";
			htmlDocument.body.style.height = (ch - 2 * padding) + "px";
			htmlDocument.body.style.margin = 0;
			htmlDocument.body.style.padding = padding + "px";

			var htmlCanvas = document.createElement("canvas");
			htmlCanvas.style.width = cw + "px";
			htmlCanvas.style.height = ch + "px";
			htmlCanvas.width = cw * pixelRatio;
			htmlCanvas.height = ch * pixelRatio;
			var context = htmlCanvas.getContext("2d");
			context.scale(pixelRatio, pixelRatio);

			html2canvas(htmlDocument.documentElement, {
				canvas: htmlCanvas,
				backgroundColor: null,
				width: cw,
				height: ch
			}).then(function(htmlCanvas) {
				if (htmlCanvas.width > 0 && htmlCanvas.height > 0) {
					var ctx = canvas.getContext("2d");
					ctx.scale(textureScale, textureScale);
					ctx.drawImage(htmlCanvas, borderWidth, borderWidth);
				}

				setTimeout(this._setBillboardTexture.bind(this, canvas, contentWidth, contentHeight), 0);

				document.body.removeChild(htmlFrame);
				document.body.removeChild(canvas);
			}.bind(this));
		} else {
			document.body.removeChild(canvas);
		}
	};

	Billboard.prototype._setBillboardTexture = function(canvas, width, height) {
		var u = width / canvas.width,
			v = height / canvas.height;
		this._billboard.geometry = new THREE.PlaneGeometry(1, 1).setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, u, 1, 0, 1 - v, u, 1 - v], 2));

		var texture = new THREE.CanvasTexture(canvas);
		texture.magFilter = THREE.NearestFilter;
		this._billboard.material.map = texture;
		this._billboard.material.needsUpdate = true;
		this._billboard.material.visible = true;
	};

	var pos4 = new THREE.Vector4(),
		axisX = new THREE.Vector3(),
		axisY = new THREE.Vector3(),
		tmpPos = new THREE.Vector3(),
		quat = new THREE.Quaternion(),
		tmpScale = new THREE.Vector3();

	Billboard.prototype._updateTexture = function() {
		this._width = this.getWidth();
		this._height = this.getHeight();

		if (this.getText() && !this.getTexture()) {

			this._renderText(window.devicePixelRatio);
			/*
			switch (this.getEncoding()) {
				default:
				case BillboardTextEncoding.PlainText:
					this._renderPlainText(window.devicePixelRatio);
					break;
				case BillboardTextEncoding.HtmlText:
					this._renderHtmlText(window.devicePixelRatio);
					break;
			}
			*/
		}
	};

	Billboard.prototype._update = function(renderer, camera, viewportSize) {
		var node = this.getNode();
		if (!node || !node.visible) {
			return;
		}

		if (this._needUpdateTexture) {
			this._needUpdateTexture = false;
			this._updateTexture();
		}

		node.matrix.copy(node.parent.matrixWorld).invert();
		node.matrix.decompose(node.position, node.quaternion, node.scale);
		node.matrixWorld.identity();

		var billboard = this._billboard;
		var srcPosition = this.getPosition();
		var position = billboard.position;
		var scale = 1;
		if (srcPosition) {
			position.copy(srcPosition);
		} else {
			position.setScalar(0);
		}

		billboard.quaternion.copy(camera.quaternion);

		var coordinateSpace = this.getCoordinateSpace();
		if (coordinateSpace === BillboardCoordinateSpace.Screen) {// image note
			var dist = THREE.MathUtils.lerp(camera.near, camera.far, 1e-4); // as close as possible to the near clipping plane
			scale = (camera.isPerspectiveCamera ? 2 * dist : 2) / camera.projectionMatrix.elements[5];
			position.set(position.x * scale, position.y * scale, -dist).applyMatrix4(camera.matrixWorld);
			scale *= 2;
		} else if (coordinateSpace === BillboardCoordinateSpace.Viewport) {// text note
			if (viewportSize.x > viewportSize.y) {
				position.x *= viewportSize.y / viewportSize.x;
			} else {
				position.y *= viewportSize.x / viewportSize.y;
			}
			position.z = -0.9999; // as close as possible to the near clipping plane

			position.unproject(camera);

			// calculate billboard screen position
			pos4.copy(position).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			var sx = (pos4.x / pos4.w) * 0.5 * viewportSize.x,
				sy = (pos4.y / pos4.w) * 0.5 * viewportSize.y;

			// set billboard scale
			scale = pos4.w * 2 / (viewportSize.x * camera.projectionMatrix.elements[0]);

			// add per pixel alignment to the billboard
			axisX.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(scale * (Math.round(sx) - sx));
			axisY.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(scale * (Math.round(sy) - sy));
			position.add(axisX).add(axisY);
		}

		billboard.scale.set((this._width >= 0 ? this._width : 0.5 * viewportSize.x / viewportSize.y) * scale, (this._height >= 0 ? this._height : 0.5) * scale, 1);
		billboard.updateMatrix();
		billboard.updateMatrixWorld();
	};

	Billboard.prototype._ortho2DUpdate = function(renderer, camera) {
		if (!this.visible) {
			return;
		}

		var originalTransform = this.userData.originalTransform;

		var dist = camera.near * 1.0001;
		if (Math.abs(originalTransform.q.w - 1) > 1e-3) { // if the node is rotated
			dist = Math.min(dist + camera.near * originalTransform.s.length() * 0.5, (camera.near + camera.far) * 0.5);
		}
		this.position.copy(originalTransform.p).multiplyScalar(2 / camera.projectionMatrix.elements[5]);
		this.position.z = -1;
		this.position.multiplyScalar(dist).applyMatrix4(camera.matrixWorld);
		quat.copy(camera.quaternion).multiply(originalTransform.q);
		this.quaternion.copy(quat); // no onChangeCallback overhead with variable quat
		this.scale.copy(originalTransform.s).multiplyScalar(dist * 0.5);
		this.scale.z = Math.min(dist - camera.near, this.scale.z * 0.001);

		this.matrixWorld.compose(this.position, this.quaternion, this.scale);
		this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.matrixWorld);
		this.matrix.decompose(this.position, this.quaternion, this.scale);
		this.updateMatrixWorld(true); // update children matrices
	};

	Billboard.prototype._billboardViewUpdate = function(renderer, camera, viewportSize, backgroundProjection) {
		if (!this.visible) {
			return;
		}

		this.parent.matrixWorld.decompose(tmpPos, quat, tmpScale);
		quat.invert().multiply(camera.quaternion);
		this.quaternion.copy(quat); // no onChangeCallback overhead with variable quat

		if (this._vkGetNodeContentType() === NodeContentType.Symbol) {
			if (backgroundProjection === undefined) {// not spherical or planar
				var cameraDirection = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
				this._vkSetOpacity(Math.max(cameraDirection.dot(this.userData.direction), 0) * 0.8 + 0.2);
			}

			// calculate symbol scale in navigation scene
			pos4.copy(this.getWorldPosition(tmpPos));
			pos4.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			var s = pos4.w * 2 / (renderer.getSize(new THREE.Vector2()).x * camera.projectionMatrix.elements[0]);
			this.scale.setScalar(s);

			if (!this.userData._symbolCenterFixed) {// HACK: center symbol geometry
				if (!this.userData.boundingBox || this.userData.boundingBox.isEmpty()) {
					this._vkCalculateObjectOrientedBoundingBox();
					if (this.userData.boundingBox.isEmpty()) {
						return; // geometry not loaded yet
					}
				}
				var offset = this.userData.boundingBox.getCenter(new THREE.Vector3()).multiplyScalar(-1);
				this.traverse(function(node) {
					if (node.geometry) {
						node.position.add(offset);
						node.updateMatrix();
					}
				});
				this._vkCalculateObjectOrientedBoundingBox(); // update bounding box
				this.userData._symbolCenterFixed = true;
			}
		}

		this.updateMatrix();
		this.updateMatrixWorld();
	};

	Billboard.prototype._lockToViewportUpdate = function(renderer, camera) {
		var maxScale = 0;
		this.children.forEach(function(child) {
			if (child.visible && Math.abs(child.quaternion.w - 1) > 1e-3) { // take into account only rotated visible nodes
				maxScale = Math.max(maxScale, child.scale.length());
			}
		});
		var dist = Math.min(camera.near * (1.0001 + maxScale * 0.5), (camera.near + camera.far) * 0.5);
		this.position.setFromMatrixColumn(camera.matrixWorld, 2).multiplyScalar(-dist); // offset along camera z-axis
		this.position.add(camera.position);
		this.scale.setScalar(dist * 2 / camera.projectionMatrix.elements[5]);

		this.matrixWorld.compose(this.position, camera.quaternion, this.scale);
		this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.matrixWorld);
		this.matrix.decompose(this.position, this.quaternion, this.scale);
		this.updateMatrixWorld(true); // update children matrices
	};

	return Billboard;
});
