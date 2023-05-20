/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Text class.
sap.ui.define([
	"./Element",
	"./Path",
	"sap/base/util/uid"
], function(
	Element,
	Path,
	uid
) {
	"use strict";

	var Text = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Text";
		this.text = parameters.text;
		this.content = parameters.content || (parameters.children ? getParametricContent(parameters.children, parameters.textStyles) : []);
		this.style = parameters.style || {};
		this.style.size = this.style.size || "1em";
		this.x = parameters.x || 0;
		this.y = parameters.y || 0;
		if (parameters.dx) {
			this.dx = parameters.dx;
		}
		if (parameters.dy) {
			this.dy = parameters.dy;
		}

		// If not specified then set default colours for text objects
		this.fillStyle = parameters.fillStyle || { colour: [0, 0, 0, 1] };
		this.lineStyle = parameters.lineStyle || {
			colour: [0, 0, 0, 0],
			width: 1
		};

		// If colours are provided in style then overwrite defaults
		if (this.style.fill) {
			this.fillStyle.veid = "t" + this.style.veid;
			this.fillStyle.colour = this.style.fill;
		}
		if (this.style.stroke) {
			this.lineStyle.veid = "t" + this.style.veid;
			this.lineStyle.colour = this.style.stroke;
		}

		this.setMaterial(parameters.material);
	};

	Text.prototype = Object.assign(Object.create(Element.prototype), { constructor: Text });

	Text.prototype.tagName = function() {
		return "text";
	};

	Text.prototype.defaultFillAlpha = 1;

	// canvas for measuring text
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	Text.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		if (this.domRef) {
			var bbox = this.domRef.getBBox();
			if (bbox) {
				this._expandBoundingBoxCE(boundingBox, matrixWorld, bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5, bbox.width * 0.5, bbox.height * 0.5);
				return;
			}
		}

		function getText(content) {
			var text = "";
			for (var i = 0, l = content.length; i < l; i++) {
				var c = content[i];
				if (c.text) {
					text += c.text;
				}
				if (c.content) {
					text += getText(c.content);
				}
			}
			return text;
		}

		var strokeDelta = isNaN(this.strokeWidth) ? 0 : this.strokeWidth * 0.5;
		context.font = this.style.size + " " + (this.style.fontFace || "Arial");
		var metrics = context.measureText((this.text ? this.text : "") + (this.content ? getText(this.content) : ""));
		var hw = metrics.width * 0.5 + strokeDelta;
		var hh = (metrics.actualBoundingBoxAscent || this.style.size) * 0.5 + strokeDelta;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x + hw, this.y - hh, hw, hh);
	};

	function setStyle(style, setAttributeFunc, ignoreFillStroke) {
		if (style.size) {
			setAttributeFunc("font-size", style.size);
		}

		if (style.fontFace) {
			setAttributeFunc("font-family", style.fontFace);
		}

		if (style.fontStyle) {
			setAttributeFunc("font-style", style.fontStyle);
		}

		if (style.fontWeight) {
			setAttributeFunc("font-weight", style.fontWeight);
		}

		if (style.textDecoration) {
			setAttributeFunc("text-decoration", style.textDecoration);
		}

		if (!ignoreFillStroke) {// ignore style.fill/style.stroke in favor of fillStyle.colour/lineStyle.colour
			if (style.fill) {
				setAttributeFunc("fill", style.fill);
			}

			if (style.stroke) {
				setAttributeFunc("stroke", style.stroke);
			}
		}
	}

	Text.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("x", this.x);
		setAttributeFunc("y", this.y);
		if (this.dx) {
			setAttributeFunc("dx", this.dx);
		}
		if (this.dy) {
			setAttributeFunc("dy", this.dy);
		}
		setStyle(this.style, setAttributeFunc, true);
	};

	function setContentAttributes(content, setAttributeFunc) {
		if (content.x !== undefined) {
			setAttributeFunc("x", content.x);
		}
		if (content.y !== undefined) {
			setAttributeFunc("y", content.y);
		}
		if (content.dx) {
			setAttributeFunc("dx", content.dx);
		}
		if (content.dy) {
			setAttributeFunc("dy", content.dy);
		}
	}

	function renderContent(content, rm) {
		if (!content || content.length === 0) {
			return;
		}
		var setAttributeFunc = rm.attr.bind(rm);
		for (var i = 0, l = content.length; i < l; i++) {
			var c = content[i];
			switch (c.type) {
				case 10: // ptParametricTextData
				case undefined:
				case "text":
					rm.text(c.text);
					break;
				case 11: // ptParametricTextSpan
				case "span":
					rm.openStart("tspan");
					setContentAttributes(c, setAttributeFunc);
					if (c.style) {
						setStyle(c.style, setAttributeFunc);
					}
					rm.openEnd();
					if (c.text) {
						rm.text(c.text);
					}
					renderContent(c.content, rm);
					rm.close("tspan");
					break;
				case 12: // ptParametricTextPath
				case "path":
					rm.openStart("textPath");
					setContentAttributes(c, setAttributeFunc);
					if (c.style) {
						setStyle(c.style, setAttributeFunc);
					}
					if (!c.path && c.pathSegments) {
						c.path = new Path({ segments: c.pathSegments });
					}
					var path = c.path;
					if (path instanceof Path) {
						rm.attr("href", "#" + path.uid);
						rm.openEnd();
						rm.openStart(path.tagName());
						rm.attr("id", path.uid);
						path._setSpecificAttributes(setAttributeFunc);
						rm.openEnd();
						rm.close(path.tagName());
					} else {
						rm.openEnd();
					}
					if (c.text) {
						rm.text(c.text);
					}
					renderContent(c.content, rm);
					rm.close("textPath");
					break;
				default: break;
			}
		}
	}

	Text.prototype._renderContent = function(rm) {
		if (this.text) {
			rm.text(this.text);
		}
		renderContent(this.content, rm);
	};

	function createContent(content, parentDomRef) {
		if (!content || content.length === 0) {
			return;
		}
		var domRef, setAttributeFunc;
		for (var i = 0, l = content.length; i < l; i++) {
			var c = content[i];
			switch (c.type) {
				case 10: // ptParametricTextData
				case undefined:
				case "text":
					parentDomRef.append(c.text);
					break;
				case 11: // ptParametricTextSpan
				case "span":
					domRef = document.createElementNS(Element._svgNamespace, "tspan");
					setAttributeFunc = domRef.setAttribute.bind(domRef);
					setContentAttributes(c, setAttributeFunc);
					if (c.style) {
						setStyle(c.style, setAttributeFunc);
					}
					if (c.text) {
						domRef.append(c.text);
					}
					createContent(c.content, domRef);
					parentDomRef.append(domRef);
					break;
				case 12: // ptParametricTextPath
				case "path":
					domRef = document.createElementNS(Element._svgNamespace, "textPath");
					setAttributeFunc = domRef.setAttribute.bind(domRef);
					setContentAttributes(c, setAttributeFunc);
					if (c.style) {
						setStyle(c.style, setAttributeFunc);
					}
					if (!c.path && c.pathSegments) {
						c.path = new Path({ segments: c.pathSegments });
					}
					var path = c.path;
					if (path instanceof Path) {
						domRef.setAttribute("href", "#" + path.uid);
						var pathDomRef = document.createElementNS(Element._svgNamespace, path.tagName());
						pathDomRef.setAttribute("id", path.uid);
						path._setSpecificAttributes(pathDomRef.setAttribute.bind(pathDomRef));
						domRef.append(pathDomRef);
					}
					if (c.text) {
						domRef.append(c.text);
					}
					createContent(c.content, domRef);
					parentDomRef.append(domRef);
					break;
				default: break;
			}
		}
	}

	Text.prototype._createContent = function(domRef) {
		if (this.text) {
			domRef.append(this.text);
		}
		createContent(this.content, domRef);
	};

	function toPixels(size) {
		switch (typeof size) {
			case "number": return size;
			case "string":
				if (size.endsWith("pt")) {
					return parseFloat(size) * 4 / 3;
				} else if (size.endsWith("em")) {
					return parseFloat(size) * 16;
				}
				return parseFloat(size);
			default: return 0;
		}
	}

	function getContent(p) {
		var content = [];
		for (var i = 0; i < p.childNodes.length; i++) {
			var node = p.childNodes[i];
			if (node.data !== undefined) {
				content.push({
					type: 10,
					text: node.data
				});
			} else if (node.childNodes.length > 0) {
				var tspan = {
					type: 11,
					content: getContent(node)
				};
				var nodeStyle = node.style;
				var style = {};
				if (nodeStyle.fontSize) {
					style.size = nodeStyle.fontSize;
				}
				if (nodeStyle.fontFamily) {
					style.fontFace = nodeStyle.fontFamily.replaceAll("\"", "'"); // or .replace(new RegExp("\"", "g"), "'")
				}
				if (nodeStyle.textDecoration) {
					style.textDecoration = nodeStyle.textDecoration;
				}
				if (nodeStyle.color) {
					style.fill = nodeStyle.color;
				}
				switch (node.tagName) {
					case "EM": style.fontStyle = "italic"; break;
					case "STRONG": style.fontWeight = "bold"; break;
					default: break;
				}
				if (Object.keys(style).length) {
					tspan.style = style;
				}
				content.push(tspan);
			}
		}
		return content;
	}

	function getMaxFontSize(content) {
		var maxFontSize = 0;
		for (var i = 0; i < content.length; i++) {
			var subContent = content[i];
			var fontSize = subContent.style && subContent.style.size;
			if (fontSize !== undefined) {
				fontSize = toPixels(fontSize);
				if (typeof fontSize == "number" && isFinite(fontSize)) {
					maxFontSize = Math.max(maxFontSize, fontSize);
				}
			}
			if (subContent.content) {
				maxFontSize = Math.max(maxFontSize, getMaxFontSize(subContent.content));
			}
		}
		return maxFontSize;
	}

	Text.prototype.setHtmlTextContent = function(htmlText) {
		var htmlElem = document.createElement("html");
		htmlElem.innerHTML = htmlText;
		var content = [];
		var bodyNodes = htmlElem.getElementsByTagName("body");
		var rootNodes = bodyNodes.length > 0 ? bodyNodes[0].childNodes : [];
		// console.log(rootNodes);
		for (var i = 0, y = this.y; i < rootNodes.length; i++) {
			var node = rootNodes[i];
			if (node.childNodes.length > 0) {
				var nodeContent = getContent(node);
				var maxFontSize;
				if (node.nodeName === "P") {
					maxFontSize = Math.max(getMaxFontSize(nodeContent), toPixels(this.style.size));
					y += i > 0 ? maxFontSize : 0;
				}
				content.push({
					type: 11,
					x: (node.style.paddingLeft || 0) + this.x,
					y: y,
					content: getContent(node)
				});
				if (node.nodeName === "P") {
					y += maxFontSize * 0.25;
				}
			} else if (node.data) {// text node
				content.push({
					type: 10,
					text: node.data
				});
			}
		}
		// console.log(content);
		delete this.text;
		this.content = content;
		this.invalidate();
	};

	function contentToHtmlText(content, inlineContent) {
		var value = "";
		var tags = [];
		for (var i = 0; i < content.length; i++) {
			var c = content[i];
			switch (c.type) {
				case 10:
				case undefined:
				case "text":
					value += c.text;
					break;
				case 11:
				case "span":
				case 12:
				case "path":
					var style = c.style;
					if (!inlineContent || c.y !== undefined || c.dy !== undefined) {
						tags.push("p");
						value += "<p style=\"text-align: left;";
						if (c.x) {
							value += " padding-left: " + (typeof c.x === "number" ? c.x + "px" : c.x) + ";";
						}
						value += "\">";
					}
					if (style) {
						if (style.textDecoration || style.size || style.fontFace || style.fill) {
							tags.push("span");
							value += "<span style=\"";
							if (style.textDecoration) {
								value += "text-decoration: " + style.textDecoration + ";";
							}
							if (style.size) {
								value += "font-size: " + (toPixels(style.size) * 0.75) + "pt;";
							}
							if (style.fill) {
								value += "color: " + style.fill + ";";
							}
							if (style.fontFace) {
								value += "font-family: " + style.fontFace + ";";
							}
							value += "\">";
						}
						if (style.fontStyle === "italic") {
							tags.push("em");
							value += "<em>";
						}
						if (style.fontWeight === "bold") {
							tags.push("strong");
							value += "<strong>";
						}
					}
					if (tags.length === 0) {
						tags.push("span");
						value += "<span>";
					}

					if (c.text) {
						value += c.text;
					}
					value += contentToHtmlText(c.content, true);

					var tagName = tags.pop();
					while (tagName !== undefined) {
						value += "</" + tagName + ">";
						tagName = tags.pop();
					}
					break;
				default: break;
			}
		}
		return value;
	}

	Text.prototype.getHtmlTextContent = function() {
		var htmlText = contentToHtmlText(this.content, false);
		return this.text ? this.text + htmlText : htmlText;
	};

	function getParametricContent(children, textStyles) {
		var content = [];
		for (var i = 0; i < children.length; i++) {
			var c = children[i];
			switch (c.type) {
				case undefined:
				case "text":
					content.push({ type: 10, text: c.text });
					break;
				default:
				case "span":
				case "path":
					var tspan = { type: c.type === "path" ? 12 : 11 };
					if (c.x !== undefined) {
						tspan.x = c.x;
					}
					if (c.y !== undefined) {
						tspan.x = c.y;
					}
					if (c.dx !== undefined) {
						tspan.x = c.dx;
					}
					if (c.dy !== undefined) {
						tspan.x = c.dy;
					}
					if (c.style_id) {
						tspan.style = textStyles.get(c.style_id);
					}
					if (c.text) {
						tspan.text = c.text;
					}
					if (c.children) {
						tspan.content = getParametricContent(c.children, textStyles);
					}
					content.push(tspan);
					break;
			}
		}
		return content;
	}

	function getParametricChildren(content, textStyles) {
		var children = [];
		for (var i = 0; i < content.length; i++) {
			var c = content[i];
			switch (c.type) {
				case 10:
				case undefined:
					children.push({ text: c.text });
					break;
				case 11:
				case "span":
				case 12:
				case "path":
					var span = { type: "span" };
					if (c.x !== undefined) {
						span.x = c.x;
					}
					if (c.y !== undefined) {
						span.y = c.y;
					}
					if (c.dx !== undefined) {
						span.dx = c.dx;
					}
					if (c.dy !== undefined) {
						span.dy = c.dy;
					}
					if (c.text) {
						span.text = c.text;
					}
					var textStyle = c.style;
					if (textStyle) {
						textStyle.veid = textStyle.veid || uid();
						span["style_id"] = textStyle.veid;
						textStyles.push(textStyle);
					}
					if (c.content) {
						span.children = getParametricChildren(c.content, textStyles);
					}
					children.push(span);
					break;
				default: break;
			}
		}
		return children;
	}

	Text.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		parametric.type = "text";

		if (parametric.s) {
			parametric.s[1] *= -1; // parametric text is vertically inverted on storage service
		}

		if (this.x) {
			parametric.x = this.x;
		}
		if (this.y) {
			parametric.y = this.y;
		}
		if (this.dx) {
			parametric.dx = this.dx;
		}
		if (this.dy) {
			parametric.dy = this.dy;
		}

		var textStyle = this.style;
		if (textStyle) {
			textStyle.veid = textStyle.veid || uid();
			parametric["style_id"] = textStyle.veid;
			textStyles.push(textStyle);
		}

		if (this.text) {
			parametric.text = this.text;
		}

		parametric.children = getParametricChildren(this.content, textStyles);

		return parametric;
	};

	Text.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		this.text = source.text;
		this.content = source.content; // just copy reference to the source content
		this.style = source.style; // just copy reference to the source style
		this.x = source.x;
		this.y = source.y;
		if (source.dx) {
			this.dx = source.dx;
		}
		if (source.dy) {
			this.dy = source.dy;
		}

		return this;
	};

	return Text;
});
