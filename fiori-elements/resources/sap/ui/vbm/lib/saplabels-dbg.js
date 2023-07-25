/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the label handling
// Author: Martina Gozlinski, extraction by Jürgen
// First part enriches scene with label specific functions
// Second part consists of the VBI.Label object, formerly part of vobase

sap.ui.define([
	"sap/ui/core/IconPool",
	"./sapvbi"
], function(IconPool) {
	"use strict"

/* global VBI */// declare unusual global vars for JSLint/SAPUI5 validation
VBI.addSceneLabelFunctions = function(scene) {
	scene.InternalDrawLabelTexts = function(dc, label, textcolor, substrings) {
		for (var nJ = 0; nJ < label.m_Pos.length; ++nJ) {
			for (var nZ = 0; nZ < label.m_Pos[nJ].length; nZ++) {

				var height = Math.round(label.m_Height);
				var width = Math.round(label.m_Width);
				var startX = Math.round(label.m_Pos[nJ][nZ][0]);
				var startY = Math.round(label.m_Pos[nJ][nZ][1]);
				var alignment = label.m_Arrow ? label.m_Align : 0;// 1;3;5;7
				var radius = label.m_Rounded ? height / 2 : 10;
				var nK;
				dc.beginPath();
				dc.lineWidth = 2;
				dc.moveTo(startX + radius, startY); // 0

				if (alignment == 5) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width / 2 - 3, startY
						], [
							startX + width / 2, startY - 5
						], [
							startX + width / 2 + 3, startY
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}
				}
				dc.lineTo(startX + width - radius, startY); // 1
				dc.arcTo(startX + width, startY, startX + width, startY + radius, radius); // 2

				if (alignment == 7 && !label.m_Rounded) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width, startY + height / 2 - 3
						], [
							startX + width + 5, startY + height / 2
						], [
							startX + width, startY + height / 2 + 3
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}

				}
				dc.lineTo(startX + width, startY + height - radius); // 3
				dc.arcTo(startX + width, startY + height, startX + width - radius, startY + height, radius); // 4

				if (alignment == 1) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width / 2 + 3, startY + height
						], [
							startX + width / 2, startY + height + 5
						], [
							startX + width / 2 - 3, startY + height
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}
				}
				dc.lineTo(startX + radius, startY + height); // 5
				dc.arcTo(startX, startY + height, startX, startY + height - radius, radius); // 6

				if (alignment == 3 && !label.m_Rounded) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX, startY + height / 2 + 3
						], [
							startX - 5, startY + height / 2
						], [
							startX, startY + height / 2 - 3
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}
				}
				dc.lineTo(startX, startY + radius); // 7
				dc.arcTo(startX, startY, startX + radius, startY, radius); // 8

				dc.fillStyle = label.m_BgColor;
				dc.fill();
				if (label.m_BrdrCol) {
					dc.strokeStyle = label.m_BrdrCol;
				} else {
					dc.strokeStyle = label.m_BgColor;
				}
				dc.stroke();

				var nLineHeight = textcolor.length == 1 ? VBI.Utilities.RemToPixel(0.75) : VBI.Utilities.RemToPixel(0.75) + 1;
				var ntransparentOffset = 0;
				for (var nX = 0; nX < textcolor.length; ++nX) {
					dc.fillStyle = textcolor[nX];
					var nYOffset = 0;
					for (nK = 0; nK < substrings.length; nK++) {
						nYOffset = label.m_Padding[1] + nLineHeight * nK;
						dc.fillText(substrings[nK], startX + label.m_Padding[0] + ntransparentOffset, startY + nYOffset + ntransparentOffset + 7);
					}
					ntransparentOffset++;
				}
				// rectangle for icon
				if (label.m_Icon) {
					label.m_IcInfo = IconPool.getIconInfo(label.m_Icon);
					if (label.m_IcInfo) {
						var iconPosX = (label.m_Align == 7 && label.m_Arrow) ? startX : startX + width;
						dc.fillStyle = label.m_IcBgrdCol;

						dc.fillRect(iconPosX - 7, startY + height - 7, 14, 14);
						label.m_Pos[nJ][nZ].rc = [
							iconPosX - 7, startY + height - 7, iconPosX - 7 + 14, startY + height - 7 + 14
						];

					}
				}
			}
		}
	};

	scene.InternalDrawLabels = function(dc, label, textcolor, substrings) {
		for (var nJ = 0; nJ < label.m_Pos.length; ++nJ) {
			for (var nZ = 0; nZ < label.m_Pos[nJ].length; nZ++) {
				VBI.Utilities.SetTextAttributes(dc, VBI.Utilities.RemToPixel(0.75) + "px 'Lucida Sans Unicode',sans-serif", undefined, undefined, "start", "middle");
				var height = Math.round(label.m_Height);
				var width = Math.round(label.m_Width);
				var startX = Math.round(label.m_Pos[nJ][nZ][0]);
				// if ( startX + width > 1000)continue;
				var startY = Math.round(label.m_Pos[nJ][nZ][1]);
				var alignment = label.m_Arrow ? label.m_Align : 0;// 1;3;5;7
				var radius = label.m_Rounded ? height / 2 : 6;
				var nK;
				dc.beginPath();
				dc.lineWidth = 2;
				dc.moveTo(startX + radius, startY); // 0

				if (alignment == 5) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width / 2 - 3, startY
						], [
							startX + width / 2, startY - 5
						], [
							startX + width / 2 + 3, startY
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}
				}
				dc.lineTo(startX + width - radius, startY); // 1
				dc.arcTo(startX + width, startY, startX + width, startY + radius, radius); // 2

				if (alignment == 7 && !label.m_Rounded) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width, startY + height / 2 - 3
						], [
							startX + width + 5, startY + height / 2
						], [
							startX + width, startY + height / 2 + 3
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}

				}
				dc.lineTo(startX + width, startY + height - radius); // 3
				dc.arcTo(startX + width, startY + height, startX + width - radius, startY + height, radius); // 4

				if (alignment == 1) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX + width / 2 + 3, startY + height
						], [
							startX + width / 2, startY + height + 5
						], [
							startX + width / 2 - 3, startY + height
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}

				}
				dc.lineTo(startX + radius, startY + height); // 5
				dc.arcTo(startX, startY + height, startX, startY + height - radius, radius); // 6

				if (alignment == 3 && !label.m_Rounded) {
					label.m_Pos[nJ][nZ].tri = [
						[
							startX, startY + height / 2 + 3
						], [
							startX - 5, startY + height / 2
						], [
							startX, startY + height / 2 - 3
						]
					];
					for (nK = 0; nK < 3; ++nK) {
						dc.lineTo(label.m_Pos[nJ][nZ].tri[nK][0], label.m_Pos[nJ][nZ].tri[nK][1]);
					}
				}
				dc.lineTo(startX, startY + radius); // 7
				dc.arcTo(startX, startY, startX + radius, startY, radius); // 8

				dc.fillStyle = label.m_BgColor;
				dc.fill();
				dc.strokeStyle = (label.m_BrdrCol ? label.m_BrdrCol : label.m_BgColor);
				dc.stroke();
				var nLineHeight = textcolor.length == 1 ? VBI.Utilities.RemToPixel(0.75) : VBI.Utilities.RemToPixel(0.75) + 1;
				var ntransparentOffset = 0;
				for (var nX = 0; nX < textcolor.length; ++nX) {
					dc.fillStyle = textcolor[nX];
					var nYOffset = 0;
					for (nK = 0; nK < substrings.length; nK++) {
						nYOffset = label.m_Padding[1] + nLineHeight * nK;
						dc.fillText(substrings[nK], (VBI.m_bIsRtl) ? (startX + width - label.m_Padding[0] + ntransparentOffset) : (startX + label.m_Padding[0] + ntransparentOffset), startY + nYOffset + ntransparentOffset + 7);
					}
					ntransparentOffset++;
				}
				// rectangle for icon
				if (label.m_Icon) {
					label.m_IcInfo = IconPool.getIconInfo(label.m_Icon);
					if (label.m_IcInfo) {
						var iconPosX = (label.m_Align == 7 && label.m_Arrow) ? startX : startX + width;
						dc.fillStyle = label.m_IcBgrdCol;

						dc.fillRect(iconPosX - 7, startY + height - 7, 14, 14);

						label.m_Pos[nJ][nZ].rc = [
							iconPosX - 7, startY + height - 7, iconPosX - 7 + 14, startY + height - 7 + 14
						];

						// the icon itself
						VBI.Utilities.SetTextAttributes(dc, "12px SAP-icons", undefined, undefined, "center", "middle");
						dc.fillStyle = label.GetLabelIconColor();
						dc.fillText(label.m_IcInfo.content, iconPosX, startY + height);
					}
				}
			}
		}
	};

	scene.InternalDrawLabelIcons = function(dc, label) {
		var height = Math.round(label.m_Height);
		var width = Math.round(label.m_Width);
		for (var nJ = 0; nJ < label.m_Pos.length; ++nJ) {
			for (var nZ = 0; nZ < label.m_Pos[nJ].length; nZ++) {
				var startX = Math.round(label.m_Pos[nJ][nZ][0]);
				var startY = Math.round(label.m_Pos[nJ][nZ][1]);

				if (label.m_Icon && label.m_IcInfo) {
					dc.fillStyle = label.GetLabelIconColor();
					var iconPosX = (label.m_Align == 7 && label.m_Arrow) ? startX : startX + width;
					dc.fillText(label.m_IcInfo.content, iconPosX, startY + height);
				}
			}
		}
	};

	scene.InternalRenderLabels = function(canvas, dc) {
		// iterate over VOs : 1. loop: calculate label data: position, width and height, alignment, textcolor and substrings; then draw the texts
		// iterate over VOs : 2. loop: draw the icons
		// separate both to not switch fonts for each label ( performance reason )
		var aVO = scene.m_VOS;
		for (var nI = 0, len = aVO.length; nI < len; ++nI) {
			var aLabels = aVO[nI].getLabelData(true);
			for (var nY = 0; nY < aLabels.length; ++nY) {
				var label = aLabels[nY];
				VBI.Utilities.SetTextAttributes(dc, VBI.Utilities.RemToPixel(0.75) + "px 'Lucida Sans Unicode',sans-serif", undefined, undefined, "start", "middle");
				label.SetDimensions(dc);
				label.AlignLabel();
				var textcolor = label.GetLabelTextColor();
				var substrings = label.m_Text.split(/\r\n/);

				/*
					REPOSITIONING THE LABELS TO AVOID THEM BEING CUT
					Before drawing the labels, we check if they fit in the current map.
					If they don't we reposition them by 5 pixels towards
					left/right/top/bottom, depending on where it's necessary.
				*/
				var viewportCoord = scene.GetViewport();
				for (var i = 0; i < label.m_Pos.length; i++) {
					for (var j = 0; j < label.m_Pos[i].length; j++) {

						var voPosition = label.m_PosArray.pa,
							labelBottomLeftCoord = label.m_Pos[i][j];

						// Performing the repositioning for all kinds of labels
						if (voPosition.length !== 3 || voPosition[0] > viewportCoord[0] && voPosition[0] < viewportCoord[2]) {
							// Check if label fits at the left
							if (labelBottomLeftCoord[0] - viewportCoord[0] < 5) {
								labelBottomLeftCoord[0] = viewportCoord[0] + 5;
							} else if (labelBottomLeftCoord[0] + label.m_Width > viewportCoord[2] - 5) {
								// Check if label fits at the right
								labelBottomLeftCoord[0] = viewportCoord[2] - label.m_Width - 5;
							}

							// Check if the label fits at the top
							if (labelBottomLeftCoord[1] - viewportCoord[1] < 5) {
								labelBottomLeftCoord[1] = viewportCoord[1] + 5;
							} else if (labelBottomLeftCoord[1] + label.m_Height > viewportCoord[3] - 5) {
								// Check if the label fits at the bottom
								labelBottomLeftCoord[1] = viewportCoord[3] - label.m_Height - 5;
							}
						} else {
							// Performing the repositioning for spot labels in the scenario
							// where they get a position value after substracting the tile width
							if (labelBottomLeftCoord[0] + (label.m_aIO[1] || 0) - viewportCoord[0] < 5) {
								labelBottomLeftCoord[0] = viewportCoord[0] + 5;
							} else if (labelBottomLeftCoord[0] + (label.m_aIO[1] || 0) + label.m_Width > viewportCoord[2] - 5) {
								// Check if label fits at the right
								labelBottomLeftCoord[0] = viewportCoord[2] - label.m_Width - 5;
							} else {
								labelBottomLeftCoord[0] += label.m_aIO[1] || 0;
							}

							// Check if the label fits at the top
							if (labelBottomLeftCoord[1] - viewportCoord[1] < 5) {
								labelBottomLeftCoord[1] = viewportCoord[1] + 5;
							} else if (labelBottomLeftCoord[1] + label.m_Height > viewportCoord[3] - 5) {
								// Check if the label fits at the bottom
								labelBottomLeftCoord[1] = viewportCoord[3] - label.m_Height - 5;
							}
						}

					}
				}

				scene.InternalDrawLabels(dc, label, textcolor, substrings);
			}
		}

	};

};

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< //
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< //
// Label functions of the scene //
// ===================================================================================================== //
// ===================================================================================================== //
// VBI.Label object //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

VBI.Label = function(label, nIndex, recalc, posarray, rcbox, aIO) {
	this.m_bAligned = false;
	this.mIndex = nIndex;
	this.m_aIO = aIO;
	this.m_rcBox = rcbox;
	this.m_Text = label.text;
	this.m_BgColor = label.bgColor;
	this.m_BrdrCol = label.brdrCol;
	this.m_Icon = label.icon;
	this.m_IcBgrdCol = label.icColor;
	this.m_IcTextCol = label.icTextColor;
	this.m_Arrow = label.arrow;
	this.m_Rounded = label.rounded;
	this.m_Align = label.Align;
	this.m_Offset = label.offset;
	this.m_Padding = [
		7, 5
	];
	this.m_ArrowHeight = 5;
	this.m_ArrowWidth = 3;
	this.m_LineWidth = 2;
	this.m_LabelIconColor = null;
	this.m_PosArray = posarray; // the position ( positionarray ) of the VO Instance calculated in RenderInstance

	this.m_Pos = []; // the calculated position of the labeltext
	this.m_Width = 0;
	this.m_Height = 0;
	this.m_LabelTextColor = [];
	if (!recalc) { // predefined positions only if no recalc method available
		var nLen = Math.floor(this.m_PosArray.pa.length / 3) * 3;
		for (var nH = 0; nH < aIO.length; nH++) {
			var aTmp = [];
			for (var nI = 0; nI < nLen; nI += 3) {
				var pt = [
					this.m_PosArray.pa[nI] + aIO[nH], this.m_PosArray.pa[nI + 1]
				];
				aTmp.push(pt);
			}
			this.m_Pos.push(aTmp);
		}
	}

	this.CalculateLabelPos = recalc;

	this.getContrastCol = function(rgba) {
		// calculate brightness difference to get the best contrast
		var idxText = (299 * 250 + 587 * 250 + 114 * 250) / 1000.0;
		var idxBgCol = (299 * rgba[0] + 587 * rgba[1] + 114 * rgba[2]) / 1000.0;
		return (Math.abs(idxBgCol - idxText) <= 125.0 ? "#000000" : "#FAFAFA");
	};

	this.GetLabelTextColor = function() {
		if (!this.m_LabelTextColor.length) {
			var rgba = VBI.Types.string2rgba(this.m_BgColor);
			if (rgba[3] == 0 && rgba[4] == 1) { // transparent background
				this.m_LabelTextColor[0] = "#FFFFFF";
				this.m_LabelTextColor[1] = "#000000";
			} else {
				this.m_LabelTextColor[0] = this.getContrastCol(rgba);
			}
		}
		return this.m_LabelTextColor;
	};

	this.GetLabelIconColor = function() {
		if (!this.m_LabelIconColor) {
			if (this.m_IcTextCol) {
				this.m_LabelIconColor = this.m_IcTextCol;
			} else {
				var rgba = VBI.Types.string2rgba(this.m_IcBgrdCol);
				this.m_LabelIconColor = ((rgba[3] == 0 && rgba[4] == 1) ? "#000000" : this.getContrastCol(rgba));
			}
		}
		return this.m_LabelIconColor;
	};

	this.SetDimensions = function(preconfiguredDC) {
		if (!this.m_Width || !this.m_Height) {
			var substrings = this.m_Text.split(/\r\n/);
			var nMaxLength = 0;
			var nMaxIdx = 0;
			var nLineHeight = VBI.Utilities.RemToPixel(0.75);
			for (var nJ = 0; nJ < substrings.length; nJ++) {
				var ntmp = substrings[nJ].length;
				if (ntmp > nMaxLength) {
					nMaxLength = ntmp;
					nMaxIdx = nJ;
				}
			}

			this.m_Width = preconfiguredDC.measureText(substrings[nMaxIdx]).width + this.m_Padding[0] * 2;
			this.m_Height = nLineHeight * substrings.length + this.m_Padding[1] * 2;
		}

	};

	this.AlignLabel = function() {

		if (!this.m_bAligned) {
			var rcBox = [
				0, 0, 0, 0
			];
			var pt;
			var corr = this.m_ArrowHeight + this.m_LineWidth;
			if (this.m_rcBox) {
				rcBox = this.m_rcBox;
			}
			for (var nI = 0; nI < this.m_Pos.length; nI++) { // loop over all Positions
				for (var nJ = 0; nJ < this.m_Pos[nI].length; nJ++) {

					pt = (this.m_rcBox ? [
						this.m_rcBox[0] + (this.m_rcBox[2] - this.m_rcBox[0]) / 2, this.m_rcBox[1] + (this.m_rcBox[3] - this.m_rcBox[1]) / 2
					] : this.m_Pos[nI][nJ]);

					switch (this.m_Align) {
						case 0:
							pt[0] -= this.m_Width / 2;
							pt[1] -= this.m_Height / 2;
							break;
						case 1:
							pt[0] -= this.m_Width / 2;
							pt[1] -= (rcBox[3] - rcBox[1]) / 2 + this.m_Height;
							if (this.m_Arrow) {
								pt[1] -= corr;
							}
							break;
						case 2:
							pt[0] += (rcBox[2] - rcBox[0]) / 2;
							pt[1] -= (rcBox[3] - rcBox[1]) / 2 + this.m_Height;
							break;
						case 3:
							pt[0] += (rcBox[2] - rcBox[0]) / 2;
							pt[1] -= this.m_Height / 2;
							if (this.m_Arrow && !this.m_Rounded) {
								pt[0] += corr;
							}
							break;
						case 4:
							pt[0] += (rcBox[2] - rcBox[0]) / 2;
							pt[1] += (rcBox[3] - rcBox[1]) / 2;
							break;
						case 5:
							pt[0] -= (this.m_Width / 2);
							pt[1] += (rcBox[3] - rcBox[1]) / 2;
							if (this.m_Arrow) {
								pt[1] += corr;
							}
							break;
						case 6:
							pt[0] -= (rcBox[2] - rcBox[0]) / 2 + this.m_Width;
							pt[1] += (rcBox[3] - rcBox[1]) / 2;
							break;
						case 7:
							pt[0] -= (rcBox[2] - rcBox[0]) / 2 + this.m_Width;
							pt[1] -= this.m_Height / 2;
							if (this.m_Arrow && !this.m_Rounded) {
								pt[0] -= corr;
							}
							break;
						case 8:
							pt[0] -= (rcBox[2] - rcBox[0]) / 2 + this.m_Width;
							pt[1] -= (rcBox[3] - rcBox[1]) / 2 + this.m_Height;
							break;
						default:
							if (VBI.m_bIsRtl) {
								pt[0] -= this.m_Width;
							}
							pt[1] += (rcBox[3] - rcBox[1]) / 2;
							break;
					}
					if (!this.CalculateLabelPos) {
						pt[0] += this.m_aIO[nI];
					}
					pt[0] += this.m_Offset[0];
					pt[1] += this.m_Offset[1];
					this.m_Pos[nI][nJ] = pt;
				}
			}
		}
		this.m_bAligned = true;
	};

	this.clear = function() {
		this.CalculateLabelPos = null;
		this.m_Pos = null;
		this.m_PosArray = null;
		this.m_rcBox = null;
		this.m_aIO = null;
		this.m_LabelTextColor = null;
		this.m_LabelIconColor = null;
	};

	return this;
};

});
