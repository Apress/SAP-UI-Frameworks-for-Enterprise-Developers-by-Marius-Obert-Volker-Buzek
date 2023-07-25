/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.NavigationControl = function(SuppressedNavControlVisibility) {
	var nc = {};
	nc.scene = null;
	nc.suppressedVisibility = SuppressedNavControlVisibility;
	nc.m_MinLOD = null;
	nc.m_MaxLOD = null;
	nc.m_lengthScrollLine = 94 - 18;
	nc.m_startScrollPoint = null;
	nc.m_ID = null;
	nc.zoomtimerfrq = 40;
	nc.zoomtimer = 0;
	nc.movetimer = 0;
	nc.bInitDrag = false;
	nc.offsetX = 0;
	nc.offsetY = 0;
	nc.curMoveX = 0;
	nc.curMoveY = 0;
	nc.curZoomY = 0;
	nc.tint = 20;
	nc.midpointForZoom = [
		0, 0
	];
	nc.timer_mapnav = null;

	nc.m_Div = nc.m_Divmapnav = nc.m_Divmapscrollarea = nc.m_Divmapscrollpoint = nc.m_Divmapcursorgrip = nc.m_Divmapcursor = nc.m_Divmapcursorreset = nc.m_Divmapcursorleft = nc.m_Divmapcursortop = nc.m_Divmapcursorright = nc.m_Divmapcursordown = nc.m_DivmapmobileHome = nc.m_DivmapmobileHomeIcon = nc.m_DivmapmobileZoomin = nc.m_DivmapmobileZoominIcon = nc.m_DivmapmobileZoomout = nc.m_DivmapmobileZoomoutIcon = null;

	nc.clear = function() {

		if (nc.timer_mapnav) {
			window.clearInterval(nc.timer_mapnav);
		}
		nc.DetachEvents();
		// remove references ...........................................//
		nc.scene = null;
		nc.m_Div = nc.m_Divmapnav = nc.m_Divmapscrollarea = nc.m_Divmapscrollpoint = nc.m_Divmapcursorgrip = nc.m_Divmapcursor = nc.m_Divmapcursorreset = nc.m_Divmapcursorleft = nc.m_Divmapcursortop = nc.m_Divmapcursorright = nc.m_Divmapcursordown = nc.m_DivmapmobileHome = nc.m_DivmapmobileHomeIcon = nc.m_DivmapmobileZoomin = nc.m_DivmapmobileZoominIcon = nc.m_DivmapmobileZoomout = nc.m_DivmapmobileZoomoutIcon = null;

	};

	nc.getId = function(a, b) {
		return b + '-' + a;
	};

	nc.DetachEvents = function() {
		if (VBI.m_bIsMobile) {
			jQuery(nc.m_DivmapmobileHome).off();
			jQuery(nc.m_DivmapmobileZoomin).off();
			jQuery(nc.m_DivmapmobileZoomout).off();
		} else {
			jQuery(nc.m_Divmapnav).off();
			jQuery(nc.m_Divmapscrollpoint).off();
			jQuery(nc.m_Divmapcursorgrip).off();
			jQuery(nc.m_Divmapcursorleft).off();
			jQuery(nc.m_Divmapcursorright).off();
			jQuery(nc.m_Divmapcursortop).off();
			jQuery(nc.m_Divmapcursordown).off();
			jQuery(nc.m_Divmapcursorreset).off();

			document.removeEventListener('mouseup', nc.zoom_processmouseup, true);
			document.removeEventListener('mousemove', nc.zoom_processmousemove, true);
		}
	};

	nc.AttachEvents = function() {
		if (VBI.m_bIsMobile) {
			nc.AttachTouchEvents();
		} else {
			nc.AttachMouseEvents();
		}
	};

	nc.AttachTouchEvents = function() {

		jQuery(nc.m_DivmapmobileHome).on("click", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("Home Button : click");
			}
			nc.scene.GoToInitialStart();
		});
		jQuery(nc.m_DivmapmobileHome).on("touchstart", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("Home Button : touchstart");
			}
			nc.scene.GoToInitialStart();
		});
		jQuery(nc.m_DivmapmobileHome).on("touchend", function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("Home Button : touchend");
			}
			event.preventDefault();
		});

		jQuery(nc.m_DivmapmobileZoomin).on("touchstart", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomIn Button : touchstart");
			}
			nc.StartAnimatedZoom(1);
		});
		jQuery(nc.m_DivmapmobileZoomin).on("touchend", function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomIn Button : touchend");
			}
			if (nc.zoomtimer) {
				window.clearInterval(nc.zoomtimer);
				nc.ZoomToNextIntegerLOD(true);
			}
			event.preventDefault();
		});
		jQuery(nc.m_DivmapmobileZoomin).on("touchleave", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomIn Button : touchleave");
			}
			if (nc.zoomtimer) {
				window.clearInterval(nc.zoomtimer);
				nc.ZoomToNextIntegerLOD(true);
			}
		});

		jQuery(nc.m_DivmapmobileZoomout).on("touchstart", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomOut Button : touchstart");
			}
			nc.StartAnimatedZoom(-1);
		});
		jQuery(nc.m_DivmapmobileZoomout).on("touchend", function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomOut Button : touchend");
			}
			if (nc.zoomtimer) {
				window.clearInterval(nc.zoomtimer);
				nc.ZoomToNextIntegerLOD(false);
			}
			event.preventDefault();
		});
		jQuery(nc.m_DivmapmobileZoomout).on("touchleave", function() {
			if (VBI.m_bTrace) {
				VBI.Trace("ZoomOut Button : touchleave");
			}
			if (nc.zoomtimer) {
				window.clearInterval(nc.zoomtimer);
				nc.ZoomToNextIntegerLOD(false);
			}
		});

	};
	nc.AttachMouseEvents = function() {
		var opacity = 1.0;
		var timerFrequency = 50;
		nc.timer_mapnav = null;
		var focusSource = null;

		// fade handling
		if (nc.suppressedVisibility.fade) {
			nc.m_Divmapnav.style.opacity = 1;
		}

		jQuery(nc.m_Divmapnav).on("mouseenter", function(event) {
			focusSource = event.fromElement;
		});

		jQuery(nc.m_Divmapnav).on("mouseup", function() {
			if (focusSource) {
				focusSource.focus({preventScroll: true});
			}
		});

		jQuery(nc.m_Divmapnav).on("mouseleave", function() {
			// window.clearInterval(nc.movetimer);
			if (!nc.suppressedVisibility.fade) {
				opacity = 1.0;
				nc.timer_mapnav = window.setInterval(function() {
					if (!nc.m_Divmapnav || opacity <= 0.5) {
						window.clearInterval(nc.timer_mapnav);
					} else {
						opacity -= 0.01;
						nc.m_Divmapnav.style.opacity = opacity;
					}
				}, timerFrequency);
			}
		});

		jQuery(nc.m_Divmapnav).on("mouseenter", function() {
			window.clearInterval(nc.timer_mapnav);
			nc.m_Divmapnav.style.opacity = 1;
		});

		// zoom handling
		if (!nc.suppressedVisibility.zoom) {
			if (nc.suppressedVisibility.move) {
				jQuery(nc.m_Divmapscrollarea).css('top', 10 + 'px');
			}

			jQuery(nc.m_Divmapscrollpoint).on("mousedown", function(event) {
				if (event.which == 1) {
					nc.midpointForZoom = nc.scene.GetCenterPos();
					nc.curZoomY = jQuery(nc.m_Divmapscrollpoint).position().top;

					nc.offsetY = event.pageY - nc.curZoomY;

					document.addEventListener('mouseup', nc.zoom_processmouseup, true);
					document.addEventListener('mousemove', nc.zoom_processmousemove, true);

				}
			});

			jQuery(nc.m_Divmapscrollpoint).on("dragstart", function(e) {
				e.preventDefault();
			});

		} // zoom handling

		// move handling
		if (!nc.suppressedVisibility.move) {
			jQuery(nc.m_Divmapcursorgrip).on("mouseenter", function() {
				jQuery(nc.m_Divmapcursor).css("background-position", "-5px 228px");
			}).on("mouseleave", function() {
				jQuery(nc.m_Divmapcursor).css("background-position", "-5px 305px");
			});

			var distance = 10;

			jQuery(nc.m_Divmapcursorleft).on("mousedown", function(event) {
				if (event.which == 1) {
					jQuery(this).css("background-position", "-134px 194px");
					window.clearInterval(nc.movetimer);
					nc.movetimer = window.setInterval(function() {
						nc.scene.MoveMap(distance, 0);
					}, nc.tint);
				}
			}).on("mouseup", function(event) {
				window.clearInterval(nc.movetimer);
				jQuery(this).css("background-position", "-134px 211px");
			}).on("mouseout", function(event) {
				if (nc.bInitDrag == false) {
					window.clearInterval(nc.movetimer);
					jQuery(this).css("background-position", "-134px 228px");
				}
			}).on("mousemove", function(event) {
				if (nc.bInitDrag == true) {
					jQuery(this).css("background-position", "-134px 177px");
				}
			});

			jQuery(nc.m_Divmapcursorright).on("mousedown", function(event) {
				if (event.which == 1) {
					jQuery(this).css("background-position", "-116px 194px");
					window.clearInterval(nc.movetimer);
					nc.movetimer = window.setInterval(function() {
						nc.scene.MoveMap(-distance, 0);
					}, nc.tint);
				}
			}).on("mouseup", function(event) {
				window.clearInterval(nc.movetimer);
				jQuery(this).css("background-position", "-116px 211px");
			}).on("mouseout", function(event) {
				if (nc.bInitDrag == false) {
					window.clearInterval(nc.movetimer);
					jQuery(this).css("background-position", "-116px 228px");
				}
			}).on("mousemove", function(event) {
				if (nc.bInitDrag == true) {
					jQuery(this).css("background-position", "-116px 177px");
				}
			});

			jQuery(nc.m_Divmapcursortop).on("mousedown", function(event) {
				if (event.which == 1) {
					jQuery(this).css("background-position", "-82px 192px");
					window.clearInterval(nc.movetimer);
					nc.movetimer = window.setInterval(function() {
						nc.scene.MoveMap(0, distance);
					}, nc.tint);
				}
			}).on("mouseup", function(event) {
				window.clearInterval(nc.movetimer);
				jQuery(this).css("background-position", "-82px 210px");
			}).on("mouseout", function(event) {
				if (nc.bInitDrag == false) {
					window.clearInterval(nc.movetimer);
					jQuery(this).css("background-position", "-82px 228px");
				}
			}).on("mousemove", function(event) {
				if (nc.bInitDrag == true) {
					jQuery(this).css("background-position", "-82px 174px");
				}
			});

			jQuery(nc.m_Divmapcursordown).on("mousedown", function(event) {
				if (event.which == 1) {
					jQuery(this).css("background-position", "-99px 192px");
					window.clearInterval(nc.movetimer);
					nc.movetimer = window.setInterval(function() {
						nc.scene.MoveMap(0, -distance);
					}, nc.tint);
				}
			}).on("mouseup", function(event) {
				window.clearInterval(nc.movetimer);
				jQuery(this).css("background-position", "-99px 210px");
			}).on("mouseout", function(event) {
				if (nc.bInitDrag == false) {
					window.clearInterval(nc.movetimer);
					jQuery(this).css("background-position", "-99px 228px");
				}
			}).on("mousemove", function(event) {
				if (nc.bInitDrag == true) {
					jQuery(this).css("background-position", "-99px 174px");
				}
			});

			jQuery(nc.m_Divmapcursorreset).on("dragstart", function(e) {
				e.preventDefault();
			});
			jQuery(nc.m_Divmapcursorreset).on("mousedown", function(e) {
				if (e.which == 1) {
					nc.curMoveX = jQuery(nc.m_Divmapcursorreset).position().left;
					nc.curMoveY = jQuery(nc.m_Divmapcursorreset).position().top;

					// change appearance of arrows to inactive
					jQuery(nc.m_Divmapcursorleft).css("background-position", "-134px 177px");
					jQuery(nc.m_Divmapcursorright).css("background-position", "-116px 177px");
					jQuery(nc.m_Divmapcursordown).css("background-position", "-99px 174px");
					jQuery(nc.m_Divmapcursortop).css("background-position", "-82px 174px");

					jQuery(this).css("background-position", "-222px 263px");
					nc.offsetX = e.pageX - nc.curMoveX;
					nc.offsetY = e.pageY - nc.curMoveY;

					window.clearInterval(nc.movetimer);
					nc.movetimer = 0;
					nc.bInitDrag = true;
					document.addEventListener('mouseup', nc.processmouseup, true);
					document.addEventListener('mousemove', nc.processmousemove, true);
				}
			});

			jQuery(nc.m_Divmapcursorreset).css("position", ""); // does not work in Chrome otherwise

			jQuery(nc.m_Divmapcursorreset).on("dblclick", function() {
				nc.scene.GoToInitialStart();
			});
		} // move handling
	};

	nc.AppendButton = function() {
		nc.m_Divmapnav = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-nav', nc.m_ID), 'vbi-nav');
		nc.m_Divmapnav.setAttribute("role", sap.ui.core.AccessibleRole.Navigation);
		nc.m_Divmapnav.setAttribute("tabindex", "-1");
		nc.m_Divmapnav.m_VBIType = "N";
		nc.m_DivmapmobileHome = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-navmobile-home', nc.m_ID), 'vbi-navmobile-home');
		nc.m_DivmapmobileHome.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_DivmapmobileHome.setAttribute("tabindex", "-1");
		nc.m_DivmapmobileHome.innerHTML = "\ue070";
		nc.m_Divmapnav.appendChild(nc.m_DivmapmobileHome);
		if (!nc.suppressedVisibility.zoom) {
			nc.m_DivmapmobileZoomin = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-navmobile-zoomin', nc.m_ID), 'vbi-navmobile-zoomin');
			nc.m_DivmapmobileZoomin.setAttribute("role", sap.ui.core.AccessibleRole.Button);
			nc.m_DivmapmobileZoomin.setAttribute("tabindex", "-1");
			nc.m_DivmapmobileZoomin.innerHTML = "+";
			nc.m_Divmapnav.appendChild(nc.m_DivmapmobileZoomin);

			nc.m_DivmapmobileZoomout = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-navmobile-zoomout', nc.m_ID), 'vbi-navmobile-zoomout');
			nc.m_DivmapmobileZoomout.setAttribute("role", sap.ui.core.AccessibleRole.Button);
			nc.m_DivmapmobileZoomout.setAttribute("tabindex", "-1");
			nc.m_DivmapmobileZoomout.innerHTML = "-";
			nc.m_Divmapnav.appendChild(nc.m_DivmapmobileZoomout);
		}

		nc.scene.m_Div.appendChild(nc.m_Divmapnav);

	};

	nc.AppendDiv = function() {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n");
		var sTooltipZoom = oResourceBundle.getText("NAVCTL_TITLE_ZOOM", [0]);
		sTooltipZoom = sTooltipZoom.substr(0, sTooltipZoom.search(/[0-9]/));

		// create the divs
		nc.m_Divmapnav = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-nav', nc.m_ID), 'vbi-nav');
		nc.m_Divmapnav.setAttribute("role", sap.ui.core.AccessibleRole.Navigation);
		nc.m_Divmapnav.setAttribute("tabindex", "-1");
		nc.m_Divmapnav.m_VBIType = "N";

		nc.m_Divmapcursor = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor', nc.m_ID), 'vbi-cursor');
		nc.m_Divmapcursor.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
		nc.m_Divmapcursor.setAttribute("tabindex", "-1");

		nc.m_Divmapscrollarea = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-scrollarea', nc.m_ID), 'vbi-scrollarea');
		nc.m_Divmapscrollarea.setAttribute("role", sap.ui.core.AccessibleRole.Slider);
		nc.m_Divmapscrollarea.setAttribute("tabindex", "0");

		nc.m_Divmapcursorgrip = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-grip', nc.m_ID), 'vbi-cursor-grip');
		nc.m_Divmapcursorgrip.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		nc.m_Divmapcursorgrip.setAttribute("tabindex", "-1");

		var mapcursormiddle = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-middle', nc.m_ID), 'vbi-cursor-middle');
		mapcursormiddle.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		mapcursormiddle.setAttribute("tabindex", "0");

		var mapscrolllineupperending = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-scrolllineupperending', nc.m_ID), 'vbi-scrolllineupperending');
		mapscrolllineupperending.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		mapscrolllineupperending.setAttribute("tabindex", "-1");

		var mapscrollline = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-scrollline', nc.m_ID), 'vbi-scrollline');
		mapscrollline.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		mapscrollline.setAttribute("tabindex", "-1");

		var mapscrolllinelowerending = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-scrolllinelowerending', nc.m_ID), 'vbi-scrolllinelowerending');
		mapscrolllinelowerending.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		mapscrolllinelowerending.setAttribute("tabindex", "-1");

		nc.m_Divmapscrollpoint = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-scrollpoint', nc.m_ID), 'vbi-scrollpoint', sTooltipZoom);
		nc.m_Divmapscrollpoint.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapscrollpoint.setAttribute("aria-label", sTooltipZoom);
		nc.m_Divmapscrollpoint.setAttribute("tabindex", "0");

		nc.m_Divmapcursorleft = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-left', nc.m_ID), 'vbi-cursor-left', oResourceBundle.getText("NAVCTL_TITLE_MOVE_LEFT"));
		nc.m_Divmapcursorleft.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapcursorleft.setAttribute("aria-label", oResourceBundle.getText("NAVCTL_TITLE_MOVE_LEFT"));
		nc.m_Divmapcursorleft.setAttribute("tabindex", "2");

		nc.m_Divmapcursorright = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-right', nc.m_ID), 'vbi-cursor-right', oResourceBundle.getText("NAVCTL_TITLE_MOVE_RIGHT"));
		nc.m_Divmapcursorright.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapcursorright.setAttribute("aria-label", oResourceBundle.getText("NAVCTL_TITLE_MOVE_RIGHT"));
		nc.m_Divmapcursorright.setAttribute("tabindex", "4");

		nc.m_Divmapcursortop = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-top', nc.m_ID), 'vbi-cursor-top', oResourceBundle.getText("NAVCTL_TITLE_MOVE_UP"));
		nc.m_Divmapcursortop.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapcursortop.setAttribute("aria-label", oResourceBundle.getText("NAVCTL_TITLE_MOVE_UP"));
		nc.m_Divmapcursortop.setAttribute("tabindex", "1");

		nc.m_Divmapcursordown = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-down', nc.m_ID), 'vbi-cursor-down', oResourceBundle.getText("NAVCTL_TITLE_MOVE_DOWN"));
		nc.m_Divmapcursordown.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapcursordown.setAttribute("aria-label", oResourceBundle.getText("NAVCTL_TITLE_MOVE_DOWN"));
		nc.m_Divmapcursordown.setAttribute("tabindex", "5");

		nc.m_Divmapcursorreset = VBI.Utilities.CreateGeoSceneDivCSS(nc.getId('vbi-cursor-reset', nc.m_ID), 'vbi-cursor-reset', oResourceBundle.getText("NAVCTL_TITLE_MOVE"));
		nc.m_Divmapcursorreset.setAttribute("role", sap.ui.core.AccessibleRole.Button);
		nc.m_Divmapcursorreset.setAttribute("aria-label", oResourceBundle.getText("NAVCTL_TITLE_MOVE"));
		nc.m_Divmapcursorreset.setAttribute("tabindex", "3");

		mapcursormiddle.appendChild(nc.m_Divmapcursorleft);
		mapcursormiddle.appendChild(nc.m_Divmapcursorright);
		mapcursormiddle.appendChild(nc.m_Divmapcursortop);
		mapcursormiddle.appendChild(nc.m_Divmapcursordown);
		mapcursormiddle.appendChild(nc.m_Divmapcursorreset);

		nc.m_Divmapcursorgrip.appendChild(mapcursormiddle);

		nc.m_Divmapscrollarea.appendChild(mapscrolllineupperending);
		nc.m_Divmapscrollarea.appendChild(mapscrollline);
		nc.m_Divmapscrollarea.appendChild(mapscrolllinelowerending);
		nc.m_Divmapscrollarea.appendChild(nc.m_Divmapscrollpoint);

		if (!nc.suppressedVisibility.zoom) {
			nc.m_Divmapnav.appendChild(nc.m_Divmapscrollarea);
		}

		if (!nc.suppressedVisibility.move) {
			nc.m_Divmapnav.appendChild(nc.m_Divmapcursor);
			nc.m_Divmapnav.appendChild(nc.m_Divmapcursorgrip);
		}

		nc.scene.m_Div.appendChild(nc.m_Divmapnav);
	};

	nc.AdaptMinMaxLOD = function(scene) {
		nc.m_MinLOD = nc.scene.GetMinLOD();
		nc.m_MaxLOD = nc.scene.GetMaxLOD();
	};

	nc.Awake = function(scene, target) {
		nc.scene = scene;
		nc.m_MinLOD = nc.scene.GetMinLOD();
		nc.m_MaxLOD = nc.scene.GetMaxLOD();
		var l_vbiObj = jQuery.sap.byId(target);
		nc.m_ID = jQuery(l_vbiObj).attr('id');
		if (VBI.m_bIsMobile) {
			nc.AppendButton();

		} else {
			nc.AppendDiv();
			nc.m_Divmapnav.style.opacity = 0.5;
			nc.m_startScrollPoint = 0;
		}
		nc.AttachEvents();

	};

	nc.AdjustScrollPoint = function(lod) {
		if (VBI.m_bIsMobile) {
			return;
		}
		var currentScrollPointPos;
		if (lod) {
			currentScrollPointPos = ((nc.m_lengthScrollLine * (lod - nc.m_MinLOD)) / (nc.m_MaxLOD - nc.m_MinLOD)) + nc.m_startScrollPoint;
			jQuery(nc.m_Divmapscrollpoint).css('top', currentScrollPointPos + 'px');
		} else {
			var currentZoomLevel = nc.scene.GetCurrentZoomlevel();
			currentScrollPointPos = ((nc.m_lengthScrollLine * (currentZoomLevel - nc.m_MinLOD)) / (nc.m_MaxLOD - nc.m_MinLOD)) + nc.m_startScrollPoint;
			jQuery(nc.m_Divmapscrollpoint).css('top', currentScrollPointPos + 'px');
		}
	};

	nc.StopAnimatedMove = function() {

		window.clearInterval(nc.movetimer);
		nc.movetimer = 0;
		jQuery(nc.m_Divmapcursorleft).removeAttr("style");
		jQuery(nc.m_Divmapcursorright).removeAttr("style");
		jQuery(nc.m_Divmapcursordown).removeAttr("style");
		jQuery(nc.m_Divmapcursortop).removeAttr("style");
		jQuery(nc.m_Divmapcursorreset).removeAttr("style");
		jQuery(nc.m_Divmapcursorreset).css('top', nc.curMoveX + 'px');
		jQuery(nc.m_Divmapcursorreset).css('left', nc.curMoveY + 'px');

	};

	nc.ZoomToNextIntegerLOD = function(zoomDir) {
		var fLod = nc.scene.m_Canvas[0].m_nExactLOD;
		var nLod = zoomDir ? Math.ceil(fLod) : Math.floor(fLod);
		if (fLod != nLod) {
			nc.scene.AnimateZoomToGeo(nc.scene.GetCenterPos(), nLod, nc.zoomtimerfrq);
		} else {
			nc.scene.InternalOnZoomLayer(nc.scene.m_Canvas[nc.scene.m_nOverlayIndex]);
		}
	};

	nc.StartAnimatedZoom = function(zoomin) {
		var zoompoint = nc.scene.GetCenterPos();
		if (nc.zoomtimer) {
			window.clearInterval(nc.zoomtimer);
		}
		nc.zoomtimer = window.setInterval(function() {
			var newZoomLevel = nc.scene.GetCurrentZoomlevel() + 0.2 * zoomin;
			nc.scene.ZoomToZoomlevel(zoompoint, newZoomLevel, true);
		}, nc.zoomtimerfrq);
	};

	nc.processmouseup = function() {
		nc.bInitDrag = false;
		nc.StopAnimatedMove();

		document.removeEventListener('mouseup', nc.processmouseup, true);
		document.removeEventListener('mousemove', nc.processmousemove, true);

	};

	nc.zoom_processmouseup = function(e) {
		document.removeEventListener('mouseup', nc.zoom_processmouseup, true);
		document.removeEventListener('mousemove', nc.zoom_processmousemove, true);

		if (nc.bInitDrag) {
			var newMouseY = e.pageY - nc.offsetY;
			if (newMouseY < 0) {
				newMouseY = 0;
			}
			if (newMouseY > nc.m_lengthScrollLine) {
				newMouseY = nc.m_lengthScrollLine;
			}

			var zoomlevel = nc.m_MinLOD + (((nc.m_MaxLOD - nc.m_MinLOD) * (newMouseY)) / nc.m_lengthScrollLine);
			nc.scene.AnimateZoomToGeo(nc.midpointForZoom, Math.round(zoomlevel), 5);
		}
		nc.bInitDrag = false;
	};

	nc.processmousemove = function(e) {
		var setNewX, setNewY;
		if (nc.bInitDrag == true) {
			// clear timer
			window.clearInterval(nc.movetimer);
			nc.movetimer = 0;

			var newMouseX = e.pageX - nc.offsetX;
			var newMouseY = e.pageY - nc.offsetY;
			var currentDeviationLength = parseInt(Math.sqrt(Math.pow(newMouseX - nc.curMoveX, 2) + Math.pow(newMouseY - nc.curMoveY, 2)), 10);
			var maxDeviationLength = 17;
			if (currentDeviationLength > maxDeviationLength) {
				var angle = Math.atan2(newMouseX - nc.curMoveX, newMouseY - nc.curMoveY);
				setNewX = Math.ceil((nc.curMoveX + (Math.sin(angle) * maxDeviationLength)));
				setNewY = Math.ceil((nc.curMoveY + (Math.cos(angle) * maxDeviationLength)));
				currentDeviationLength = maxDeviationLength;
			} else {
				setNewX = newMouseX;
				setNewY = newMouseY;
			}

			jQuery(nc.m_Divmapcursorreset).css('top', setNewY + 'px');
			jQuery(nc.m_Divmapcursorreset).css('left', setNewX + 'px');

			var newXOffset = -(jQuery(nc.m_Divmapcursorreset).position().left - nc.curMoveX) * (currentDeviationLength / maxDeviationLength);
			var newYOffset = -(jQuery(nc.m_Divmapcursorreset).position().top - nc.curMoveY) * (currentDeviationLength / maxDeviationLength);

			// start timer again
			nc.movetimer = window.setInterval(function() {
				nc.scene.MoveMap(newXOffset, newYOffset);
			}, nc.tint);
		}

	};
	nc.zoom_processmousemove = function(e) {
		var newMouseY = e.pageY - nc.offsetY;

		if (!nc.bInitDrag) {
			if (newMouseY != nc.curZoomY) {
				nc.bInitDrag = true;
			}
		}
		if (nc.bInitDrag) {
			if (newMouseY < 0) {
				newMouseY = 0;
			}
			if (newMouseY > nc.m_lengthScrollLine) {
				newMouseY = nc.m_lengthScrollLine;
			}

			jQuery(nc.m_Divmapscrollpoint).css('top', newMouseY + 'px');
			var zoomlevel = nc.m_MinLOD + (((nc.m_MaxLOD - nc.m_MinLOD) * (newMouseY)) / nc.m_lengthScrollLine);
			nc.scene.ZoomToZoomlevel(nc.midpointForZoom, zoomlevel);
		}
	};

	return nc;
};

});
