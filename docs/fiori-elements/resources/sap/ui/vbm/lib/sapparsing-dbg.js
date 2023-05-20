/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.Parser = function() {
	var parser = {};

	parser.formulas = [];
	parser.fPos = 0;
	parser.fCode = "";
	parser.fAttributes = [];

	parser.clear = function() {
		var temp;
		while ((temp = parser.formulas.shift()) != undefined) {
			parser.clearExpression(temp.dTree);
		}
	};

	parser.evaluate = function(vo, voind, ctx) {
		parser.vo = vo;
		parser.voi = voind;
		parser.ctx = ctx;
		parser.pos = undefined;
		var n = parser.formulas.length;
		for (var i = 0; i < n; ++i) {
			var f = parser.formulas[i];
			if (parser.evalF(f.dTree)) {
				return f.index;
			}
		}
		return -1; // no matching found
	};

	parser.evalF = function(node) {
		if ((node.operator == false) || (node.operator == true)) {
			return node.operator;
		}
		var result1;
		if (node.operator == 600) { // &
			result1 = parser.evalF(node.operand1);
			return result1 ? parser.evalF(node.operand2) : false;
		}
		if (node.operator == 700) { // |
			result1 = parser.evalF(node.operand1);
			return result1 ? true : parser.evalF(node.operand2);
		}
		var op1;
		var vo = parser.vo;
		switch (node.operand1) {
			case "text":
				op1 = vo.m_Text.GetValueString(parser.ctx);
				break;
			case "itext":
				op1 = parseInt(vo.m_Text.GetValueString(parser.ctx), 10);
				break;
			case "id":
				op1 = vo.m_ID;
				break;
			case "image":
				op1 = vo.m_Image.GetValueString(parser.ctx);
				break;
			case "x":
				if (!parser.pos) {
					parser.pos = parser.vo.m_Pos.GetValueVector(parser.ctx);
				}
				op1 = parser.pos[0];
				break;
			case "y":
				if (!parser.pos) {
					parser.pos = parser.vo.m_Pos.GetValueVector(parser.ctx);
				}
				op1 = parser.pos[1];
				break;
			case "tooltip":
				op1 = vo.m_Tooltip.GetValueString(parser.ctx);
				break;
			default:
				var attrTable = parser.fAttributes[parser.voi];
				op1 = ""; // default value
				for (var j = 0; j < attrTable.length; ++j) {
					if (attrTable[j].name == node.operand1) {
						var dat = vo.m_DataSource.m_CurElement.m_dataattributes[attrTable[j].index];
						if (dat != undefined) {
							op1 = dat.m_Value;
						}
					}
				}
		}
		switch (node.operator) {
			case 50:
				return op1 == node.operand2;
			case 51:
				return op1 >= node.operand2;
			case 52:
				return op1 > node.operand2;
			case 55:
				return op1 != node.operand2;
			case 56:
				return op1 <= node.operand2;
			case 57:
				return op1 < node.operand2;
			default:
				break;
		}

	};

	parser.verifyAttribute = function(node, vos, dtp) {
		if (jQuery.type(node.operand2) == 'object') {
			parser.verifyAttribute(node.operand2, vos, dtp);
		}
		if (jQuery.type(node.operand1) == 'object') {
			parser.verifyAttribute(node.operand1, vos, dtp);
		} else {
			var elte = node.operand1;
			if ((elte != "id") && (elte != "image") && (elte != "x") && (elte != "y") && (elte != "tooltip")) {
				if (!parser.fAttributes) {
					parser.buildAttributeTable(vos);
				}
				for (var i = 0; i < dtp.m_datatypenodes.length; ++i) {
					var cdtp = dtp.m_datatypenodes[i];
					var dtName = cdtp.m_Name;
					var attr = cdtp.m_datatypeattributes;
					for (var j = 0; j < attr.length; ++j) {
						var cattr = attr[j];
						if (cattr.m_Name == elte) {
							for (var k = 0; k < parser.fAttributes.length; ++k) {
								var cfAttr = parser.fAttributes[k];
								if (cfAttr.m_Name == dtName) {
									var fFound = false;
									for (var l = 0; l < cfAttr.length; ++l) {
										if (cfAttr[l].name == elte) {
											fFound = true;
										}
									}
									if (!fFound) {
										cfAttr.push({
											name: elte,
											index: j
										});
									}
								}
							}
						}

					}
				}
			}
		}
	};

	parser.buildAttributeTable = function(vos) {
		parser.fAttributes = [];
		for (var i = 0; i < vos.length; ++i) {
			var PList = [];
			var dataSource = vos[i].m_DataSource;
			if (dataSource != undefined) {
				PList.m_Name = dataSource.m_NPath[0];
				parser.fAttributes.push(PList);
			}
		}
	};

	parser.verifyAttributes = function(vos, ctx) {
		parser.fAttributes = undefined;
		var dtp = ctx.m_DataTypeProvider;
		for (var ii = 0; ii < parser.formulas.length; ++ii) {
			parser.verifyAttribute(parser.formulas[ii].dTree, vos, dtp);
		}
	};

	parser.clearExpression = function(myExpression) {
		if (jQuery.type(myExpression) != 'object') {
			return;
		}
		parser.clearExpression(myExpression.operand1);
		parser.clearExpression(myExpression.operand2);
		myExpression.operand1 = myExpression.operand2 = undefined;

	};

	parser.addFormula = function(index, myFormula) {
		parser.formulas.push({
			index: index,
			formula: myFormula,
			dTree: parser.buildDecisionTree(myFormula)
		});
		return parser.formulas.length - 1;
	};

	parser.buildDecisionTree = function(myFormula) {
		parser.fPos = 0;
		parser.fCode = myFormula;
		var currentNode = {};
		if (!parser.parseExpression(currentNode)) {
			VBI.Trace("Error: " + myFormula + " could not be interpreted");
			currentNode.operator = false;
		}

		return currentNode;
	};

	parser.parseExpression = function(node) {
		var op1 = parser.scan();
		if (op1 == -1) {
			node.operator = true;
			return (node.operator);
		}
		if (op1 == 10) {
			node.operand1 = {};
			if (!parser.parseExpression(node.operand1)) {
				return false;
			}
			if (parser.scan() != 20) {
				return false;
			}
			node.operator = parser.scan();
			if (parser.ttype != 2) {
				return false;
			}
			if (parser.scan() != 10) {
				return false;
			}
			node.operand2 = {};
			if (!parser.parseExpression(node.operand2)) {
				return false;
			}
			if (parser.scan() != 20) {
				return false;
			}
			return true;
		}
		if (op1 == 500) {
			node.operand1 = parser.token;
			node.operator = parser.scan();
			if (parser.ttype != 1) {
				return false;
			}
			parser.scan();
			if (parser.ttype != 10) {
				return false;
			}
			node.operand2 = parser.token;
			return true;
		}
		return false;
	};

	parser.scan = function() {
		var lookahead;
		var nOffset = 0;
		if (parser.fPos >= parser.fCode.length) {
			return -1;
		}
		var myChar = parser.fCode.substr(parser.fPos, 1);

		switch (true) {
			case myChar == "(":
				return parser.getToken(myChar, 10, 0);
			case myChar == ")":
				return parser.getToken(myChar, 20, 0);
			case myChar == "=":
				return parser.getToken(myChar, 50, 1);
			case myChar == "!":
				return parser.fCode.substr(parser.fPos + 1, 1) == "=" ? parser.getToken("!=", 55, 1) : false;
			case myChar == "<":
			case myChar == ">":
				nOffset = 5 * (myChar == "<");
				lookahead = parser.fCode.substr(parser.fPos + 1, 1);
				if (lookahead == "=") {
					return parser.getToken(myChar + lookahead, 51 + nOffset, 1);
				}
				if (myChar == "<" && lookahead == ">") {
					return parser.getToken("!=", 55, 1);
				}
				return parser.getToken(myChar, 52 + nOffset, 1);
			case myChar == "|":
			case myChar == "&":
				nOffset = 100 * (myChar == "|");
				lookahead = parser.fCode.substr(parser.fPos + 1, 1);
				if (myChar != lookahead) {
					lookahead = "";
				}
				return parser.getToken(myChar + lookahead, 600 + nOffset, 2);
			case ((myChar >= "0") && (myChar <= "9")):
				return parser.readNumber(myChar);
			case (((myChar >= "a") && (myChar <= "z")) || ((myChar >= "A") && (myChar <= "Z"))):
				return parser.readString(myChar);
			default:
				return -2; // invalid character
		}

	};

	parser.readNumber = function(firstChar) {
		var str = firstChar;
		var i = 1;
		var nextChar = parser.fCode.substr(parser.fPos + i, 1);
		while ((nextChar >= "0") && (nextChar <= "9")) {
			str += nextChar;
			i++;
			nextChar = parser.fCode.substr(parser.fPos + i, 1);
		}
		return parser.getToken(str, 600, 10);
	};

	parser.readString = function(firstChar) {
		var str = firstChar;
		var i = 1;
		var nextChar = parser.fCode.substr(parser.fPos + i, 1);
		while ((((nextChar >= "a") && (nextChar <= "z")) || ((nextChar >= "A") && (nextChar <= "Z"))) || ((nextChar >= "0") && (nextChar <= "9")) || (nextChar == "_") || (nextChar == ".") || (nextChar == "/") || (nextChar == "\\")) {
			str += nextChar;
			i++;
			nextChar = parser.fCode.substr(parser.fPos + i, 1);
		}
		return parser.getToken(str, 500, 10);
	};

	parser.getToken = function(str, id, type) {
		parser.fPos += str.length;
		parser.token = str;
		parser.ttype = type;
		return id;
	};

	return parser;
};

});
