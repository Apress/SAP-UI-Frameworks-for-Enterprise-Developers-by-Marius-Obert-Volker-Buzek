/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.GeoMap.
sap.ui.define([
	"./VBI",
	"jquery.sap.global",
	"sap/base/Log",
	"./library",
	"./GeoMapRenderer"
	], function(VBI, jQuery, Log, library, GeoMapRenderer) {
	"use strict";

	var thisModule = "sap.ui.vbm.GeoMap";

	/**
	 * Constructor for a new GeoMap.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Map control with the option to position multiple visual objects on top of a map. The GeoMap control shows an image based map loaded from
	 *        one or more configurable external providers. Per default a map from <a href="http://www.mapquest.com">MapQuest</a> is used. Other map
	 *        providers can be configured via property <i>mapConfiguration</i>. Multiple maps can be mashed up into one map layer stack. If multiple
	 *        map layer stacks are provided via configuration it is possible to switch between them during runtime. The control supports the display
	 *        of copyright information for the visible maps.<br>
	 *        On top of the map the GeoMap control provides a navigation control, a scale, and a legend. Each of them can be switched off separately.<br>
	 *        It is possible to set the initial position and zoom for the map display. Further the control allows to restrict the potentially visible
	 *        map area and zoom range.<br>
	 *        Different visual objects can be placed on the map. Visual objects are grouped in VO aggregations and an arbitrary number of VO
	 *        aggregations can be assigned to the <i>vos</i> aggregation.<br>
	 *        The second aggregation <i>featureCollections</i> allows the use of GeoJSON as source for visual objects.
	 * @extends sap.ui.vbm.VBI
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.GeoMap
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GeoMap = VBI.extend("sap.ui.vbm.GeoMap", /** @lends sap.ui.vbm.GeoMap.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * This is the map configuration for the geo map. The map configuration defines the used maps, the layering of the maps and the
				 * servers that can be used to request the map tiles.
				 */
				mapConfiguration: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Toggles the visibility of the legend
				 */
				legendVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Defines the visibility of the scale. Only supported on initialization!
				 */
				scaleVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Defines the visibility of the navigation control. Only supported on initialization!
				 */
				navcontrolVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Initial position of the Map. Set is only supported on initialization! Format is "&lt;longitude&gt;;&lt;latitude&gt;;0".
				 */
				initialPosition: {
					type: "string",
					group: "Behavior",
					defaultValue: "0;0;0"
				},
				/**
				 * Initial zoom. Value needs to be positive whole number. Set is only supported on initialization!
				 */
				initialZoom: {
					type: "string",
					group: "Behavior",
					defaultValue: "2"
				},
				/**
				 * Center position of the Map. Format is "&lt;longitude&gt;;&lt;latitude&gt;".
				 */
				centerPosition: {
					type: "string",
					group: "Behavior",
					defaultValue: "0;0"
				},
				/**
				 * Zoomlevel for the Map. Value needs to be positive whole number.
				 */
				zoomlevel: {
					type: "int",
					group: "Behavior",
					defaultValue: 2
				},
				/**
				 * Name of the map layer stack (provided in mapConfiguration) which is used for map rendering. If not set the layer stack with the
				 * name 'Default' is chosen. Property can be changed at runtime to switch between map layer stack.
				 */
				refMapLayerStack: {
					type: "string",
					group: "Appearance",
					defaultValue: "Default"
				},
				/**
				 * Visual Frame object. Defining a frame {minX, maxX, minY, maxY, maxLOD, minLOD} to which the scene display is restricted.
				 */
				visualFrame: {
					type: "object",
					group: "Behavior",
					defaultValue: null
				},
				/**
				 * @deprecated since version 1.31 This property should not longer be used. Its functionality has been replaced by the <code>clusters</code>
				 *             aggregation.
				 */
				clustering: {
					type: "object",
					group: "Behavior",
					defaultValue: null
				},
				/**
				 * Disable Map Zooming. This setting works only upon initialization and cannot be changed later on.
				 */
				disableZoom: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Disable Map Paning. This setting works only upon initialization and cannot be changed later on.
				 */
				disablePan: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Enable Animation of Map Zoom. Works in combination of setZoomlevel.
				 */
				enableAnimation: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			defaultAggregation: "vos",
			aggregations: {
				/**
				 * Aggregation of visual object types. A VO aggregation can be considered to be a table of VOs of a common type.
				 */
				vos: {
					type: "sap.ui.vbm.VoAbstract",
					multiple: true,
					singularName: "vo"
				},
				/**
				 * Aggregation of GeoJSON layers. Object from a GeoJSON layer will be behind all other Visual Objects from the <code>vos</code>
				 * aggregation. In case of multiple GeoJSON layers the objects are orderer with the layers they belong to.
				 */
				geoJsonLayers: {
					type: "sap.ui.vbm.GeoJsonLayer",
					multiple: true,
					singularName: "geoJsonLayer"
				},
				/**
				 * @deprecated since version 1.31 This aggregation should not longer be used. Its functionality has been replaced by the more generic<code>geoJsonLayers</code>
				 *             aggregation.
				 */
				featureCollections: {
					type: "sap.ui.vbm.FeatureCollection",
					multiple: true,
					singularName: "featureCollection"
				},
				/**
				 * Aggregation of resources. The images for e.g. Spots have to be provided as resources.
				 */
				resources: {
					type: "sap.ui.vbm.Resource",
					multiple: true,
					singularName: "resource"
				},
				/**
				 * Legend for the Map
				 */
				legend: {
					type: "sap.ui.vbm.Legend",
					multiple: false
				},
				/**
				 * Aggregation of clusters.
				 */
				clusters: {
					type: "sap.ui.vbm.ClusterBase",
					multiple: true,
					singularName: "cluster"
				}
			},
			events: {
				/**
				 * Raised when the map is clicked.
				 */
				click: {
					parameters: {

						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},
				/**
				 * Raised when the map is right clicked/longPressed(tap and hold).
				 */
				contextMenu: {
					parameters: {
						/**
						 * Client coordinate X
						 */
						clientX: {
							type: "int"
						},
						/**
						 * Client coordinate Y
						 */
						clientY: {
							type: "int"
						},
						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},
				/**
				 * Raised when something is dropped on the map.
				 */
				drop: {
					parameters: {

						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},
				/**
				 * This event is raised when a multi selection of visual objects has occurred
				 */
				select: {},
				/**
				 * this event is raised on zoom in or zoom out.
				 */
				zoomChanged: {
					parameters: {
						/**
						 * Center point of the map. Format : Lon;Lat;0.0.
						 */
						centerPoint: {
							type: "string"
						},
						/**
						 * Viewport bounding box's upperLeft and lowerRight coordinates. Format : Lon;Lat;0.0.
						 */
						viewportBB: {
							type: "object"
						},
						/**
						 * Level of detail.
						 */
						zoomLevel: {
							type: "int"
						}
					}
				},
				/**
				 * this event is raised on map move.
				 */
				centerChanged: {
					parameters: {
						/**
						 * Center point of the map. Format : Lon;Lat;0.0.
						 */
						centerPoint: {
							type: "string"
						},
						/**
						 * Viewport bounding box's upperLeft and lowerRight coordinates. Format : Lon;Lat;0.0.
						 */
						viewportBB: {
							type: "object"
						},
						/**
						 * Level of detail.
						 */
						zoomLevel: {
							type: "int"
						}
					}
				},
				/**
				 * this event is raised on map key down
				 */
				keyDown: {
					parameters: {
						/**
						 * Key value of the key
						 */
						key: {
							type: "string"
						},
						/**
						 * Code value of the key
						 */
						code: {
							type: "int"
						},
						/**
						 * Shift key modifier state
						 */
						shift: {
							type: "boolean"
						},
						/**
						 * Ctrl key modifier state
						 */
						ctrl: {
							type: "boolean"
						},
						/**
						 * Alt key modifier state
						 */
						alt: {
							type: "boolean"
						},
						/**
						 * Meta key modifier state
						 */
						meta: {
							type: "boolean"
						}
					}
				},
				/**
				 * this event is raised on map key press
				 */
				keyPress: {
					parameters: {
						/**
						 * Key value of the key
						 */
						key: {
							type: "string"
						},
						/**
						 * Code value of the key
						 */
						code: {
							type: "int"
						},
						/**
						 * Shift key modifier state
						 */
						shift: {
							type: "boolean"
						},
						/**
						 * Ctrl key modifier state
						 */
						ctrl: {
							type: "boolean"
						},
						/**
						 * Alt key modifier state
						 */
						alt: {
							type: "boolean"
						},
						/**
						 * Meta key modifier state
						 */
						meta: {
							type: "boolean"
						}
					}
				},
				/**
				 * this event is raised on map key up
				 */
				keyUp: {
					parameters: {
						/**
						 * Key value of the key
						 */
						key: {
							type: "string"
						},
						/**
						 * Code value of the key
						 */
						code: {
							type: "int"
						},
						/**
						 * Shift key modifier state
						 */
						shift: {
							type: "boolean"
						},
						/**
						 * Ctrl key modifier state
						 */
						ctrl: {
							type: "boolean"
						},
						/**
						 * Alt key modifier state
						 */
						alt: {
							type: "boolean"
						},
						/**
						 * Meta key modifier state
						 */
						meta: {
							type: "boolean"
						}
					}
				}
			}
		},

		renderer: GeoMapRenderer
	});
	// /**
	// * This file defines behavior for the control,
	// */

	// Author: Ulrich Roegelein

	// ...........................................................................//
	// Define static class members................................................//
	// ...........................................................................//

	GeoMap.bEncodedSpotImagesAvailable = false;
	GeoMap.bEncodeSpotImageData = null;

	GeoMap.oBaseApp = {
		SAPVB: {
			version: "2.0",
			MapProviders: {
				Set: {
					MapProvider: {
						name: "404",
						type: "",
						description: "",
						tileX: "256",
						tileY: "256",
						maxLOD: "19",
						copyright: "Map Provider is not configured, please read this {LINK|SCN Article} to configure your own Map Provider.",
						copyrightLink: "//scn.sap.com/docs/DOC-74221",
						copyrightImage: "",
						Source: [
							{
								id: "s1",
								url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAAGkFw+nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMGJiNTIyYy1iMGY1LTRhOTgtOWEyZi1kYTY0MWU2ZTk0MGQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MURCMDcxRkE5NDBDMTFFNjlCODg5Njk4NURERjQ1RTUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MURCMDcxRjk5NDBDMTFFNjlCODg5Njk4NURERjQ1RTUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjExYzk5MTI5LWM0ZWYtNDZmYi05N2Q1LWUwNWExNGZmMDhlYSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxMGJiNTIyYy1iMGY1LTRhOTgtOWEyZi1kYTY0MWU2ZTk0MGQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7y1q/+AAAmXElEQVR42uxWMRJFMBBNVFpHULsXF+AW9NRqo6RV6ikZlZJSGe9PZjKKb5IIXV6xs3aSfZvN2wzKGCNfwiEfwxJYAktgTjCOo2QFe4Su647jKMtSulKDIE1T2DAMtUoh0qTTNPHUIpLn+bZtOIEpwTAMwl/XFRZ5RUTxKFTruW7bFrau66IoFLeoEuz77nnehzL9mz3LsuvnPM9RFJnKtKoqYTniOH5BprhSyOYqJwwBIlwIqP1uo2qLcKuu68JJkgTpfs11HESCIIDv+/7zSW6ahheOYpdl0W0pkY6uIcjdfPV9z94Atf9FlsASkFMA9svYhmEQiKKehqEomYSOSZgDiRWQmIQ+edJJyEqwlZBLdy5O0Nz3x4f1n90DEzABE/iTQK2VughxvwAIuZqkRYR5iXgKAELIOPcFDjQB5IptzpJqCCVohgxV2QGndB+h1Ry8G1rmcOGtTQGxEmOcW77Q3OacdxzQheGZVCwvyJhK3967WjblcjnnQghf8NqHeCOL1ppOuoZnxhgsvPelFOr+z2g5GCmlh9JjucgETOA4ngKwa7UqFgJR+AUMZqNVH0SMZrMvIGafwOA7CDatBoOITeMmwWTQqkUR5O7HHpDLCnfdu/7c3Z0JwzAMer6Z8zPfOXO4Hfz6HWIAGAAGgAFgABiAPwagaRqwCyocep7308/djmkLVauqCv0wDGAD32XuJ3GCcRyTJFEUJU1TMEvMgLuZprle6ThOWZYYuK5LVaAd2tOs+3GCBSdwz8A/5Wp2PIF9VAh4QM8h9NtHW0uMBeixBqj2VaT9r9OWZfV9T4oEvRIE4bm67cVGvFcjPTQMI8/zA1Vo+zOGB4ky0q5708J4SRl1XQdXcRIAegiBf1O+kIReV3IxA/cKy4F5QPolRRQEwTzPF9gAopKu6+v5oigAQ5IkBK+2bTmOs20b89M0xXGsquoL2QBtPGWwaMvJaUZRtPFZyhleiAIWnAzG8DN1XdOAtiMMQ03TTruYfA2ASg4QFzqAXhRFhF7E0SzLZFnmef7i29yWY/J9/2X9LMsLMQAMAAPAAPxvAO8CsHP1KspDQbRZGwURSeOChaKihV1AEFGwsrDRSrAVfQF9APvvBeysLG2sRHwCBW1sLCwU/EUQURCx2IMDFzHZ3XwaY2BninBziTLnzsnMJJm5HAcYAANgAAyAATAABsAAGAADYAAMgAEwAOOFWkKflA/D1F0sFi6XC4NqtRqJRKxWqyRJD/eeGgpgNBptt1u/3w/VcXo4HFKpVL/fl2X5+T9/4WuVUqmUz+en0ynGwWAQR100vhfdvziIcvr5fK7aB6D8lP+MPHsT12q10+lUqVRET7PNZlutVhiA8fF4nCZBHuqRAekHg8GbLdDr9YrFouiHp76UHxabGv9hGfxKexPLCz8xEbmpska1KR6Ty+USFLLb7fv9Xs/iGl0soPrFF4uNBf53lR/2EtCl8/pWHnGjd8sJ9mcyGafTGQgExuMx2QRH4eMnkwkohEE4HIYPhVel9nazeCHVjS2KV4FZqOTsdaKzGy2Xy4JgGED7/91iw2g3KgSRFUcqdRJM83q92re+MEsg01fgssmq31nyDQBwz/wajEXlk/Ba3/UpGppOU5krbox6vY5gQrFZJHzEQyStNNNut3FBIpGg0/V6rR6yDCgzE8VmyiCAlRaxmUhCRzLRcDiczWbGeSEwlfhKe6dAKLQJKisDHxEDGGjHFYyPx2On03mbGxURQLnYYA4xm3RFKnV7XyqbSd8AQDXFwORtv+qtKVqt1vl8NkscuEsxkF80m02aDIVCWH6adzgchUKBxul02mKxmOuZGM8GpKvH49lsNnhsx9NjNBrd7XZ0gc/nM1cgQ85MlfYgNBWKCmY3Gg0DosqDAOA3SO/5VQTFu90u8k0jw6ImCoHN4EMsFoNXdrvdSIYlSYLexBAMRHqcTCYNfrn0oUX7bDaLAInVJX5DXVmWkeVTrejnVd72ekzL1gaiZcGE9Ze/u1GExsvlQuNcLme2d6NcL8QAGAADYAAMgAEwAAbAABjA3wXwJQB7VxMKXRiFLb4NCxZGfhoKi4lSKDsWfmdhZctaForVlI2wG1mxZENM7JSampHJAmHyEyUW/iXkr4Sm0Pc9fc/X2+36jDsM5s49z+LtneveKec57znve+6cc0x/HhANEggBQoBACBACBEKAECAQAoQAgRAgBAiEACFAIAQIAQIhQAgQCAFCgOBN/LLaP+zz+bKzs/mD7+vra5UcLAREE/v7+3l5eS0tLU6n0+/3V1RU7O3t5efnV1dX22y29fX1+vp6r9fLnPifhVl/FbG1tQVdZp4vBM2xra0NSo2/Qq+Zn52amprwNxXga0vVW2cFUNaYsIQAJI4r/f39LpcLao4rV1dX0PGEN5LiYxGxk3PBJEQmxTFllalxGG9ubrq7u9mAUuVY4p4wddv5VUx+DJO1KwW+/+k1tDgYDGJut9sh7sTERFgYFvbPzc19t+g8jT6bqbjd7tnZWYfDAXPk8Xjwze3t7RjhBqJZc8B0K4AptqOjo0oftVoJPTVe5QB3YkFgZGYsFwqLg3CJYA1F1I/2B/F9BFD07NaLicFKKkrKzG3EU7QqJA9rxcj3qOZJlibg3cxXdgSmZDFRek2Jay17eMLY6EOb9P4VjarijQBKFpKC7LSNpl53pWL1IlY2gPorR62sHP7EROaYdbym7LLR09NTVFR0eXlZUFCA3T22oThVBQIBbDrhqFtbW9n1zHQHmlgkIBQKdXZ23t3dYZuPjzjBjoyMnJ+fd3V16dohQfQnJydmlHusn4SxMU1OTu7r6zOdQM/OzhYXFyNo1vRb8CHQObH4DncQaksWke+xRDianUZvb29ZLdHlcvGikQfxFOcrKys47rHzF0Z4I1wpLy+HE4LKl5WVdXR0LC8vRxwFiTPFhPZh/8PThlYZVfHH8OcGRjug3bxfe05kSOO/j7+8vMzMzOCph4eHuN0F6QAtu7+/T09Pn5ubw8eGhga6YtWy06Aa+ny+yclJFk2E/nKuon7Ud20hy9PTU7BbWFhYXFwct06YdSMrKys9Hk9TU5Pdbu/t7XW73VjjGAcGBqCkTqfz4OAAW6MwjlpXbBj2ZHBwEM82NzcPDQ3hCrtdMmSUlZXFPpLKMMzPz19cXNTW1qakpFgiGvo6cKQ9ozEIYTCqynCT1hbRgOC89tpDQsrj4+PBYFAOYh8xRHCDUGEczYaHh7EaYDTYeBq2KCMjA/dom1AvLS0dHR3V1NTwRY28DzAaJoL6q3iOemfAEBujPbpqsjAsExMTCwsLEor4lHeFiGG1IfFAIJCTk5OUlLS6ukrHqLC2trazs1NVVUV9Nx2+9RygipYTY2NjcIxqDIVCuJiWloZxY2MD/nZqagqOMTMzEx9LSkoODw8dDodOY0pLSxsbG00q/W8yQWr7DI1mEVFWW1RxZl3Ic3NzE9uS4+NjK5yoo1nNm/F3jCxer96EqFdgurdUj4+P2Hf7/f7n52fLhjSiQAClrAqJcufHspwqsr+9vQ2l3t3dlSDS1zrhp6en6elpTOrq6j5fIdcKkHI1VtoFCYQAIUAgBAgBAiFACBAIAUKAQAgQAoQAgRAgBAiEACFA8CP4IwB75xZS1brF8VXWgxlFZXi8ZGSauTtdEMuKLMXUKBQE6UEJeumch8BAd0RP4WN0DJIgTj4FdheFTFpmmlQYpVnaRVRM8oaCBV1IjLL9Yw7Oxzwrc6u53XO5xniYzDXXXFMd//H9x39837ccuiCjI0ABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAA1BUABUFMAFAAvsdevX5eUlCgAf5vfT5486YSG8rMWANP8S3oSHD16tLCw0O12G78fO3bM39/foxeEAjBt1t/ff+/evYKCggsXLhD1XBkYGLD7fXh4uK2tzQl95+fOssAXhikqKtq5c+fChQvxdXl5+T8s+/z5s/H7unXrJtHu8a+0eV7qa2nAFhsbm5KS0tvbGxUV1dHRcfHixdzcXGBISEiAfNrb27kzKCjI3oDVcW3lvajXgWmk1NnZKc04pDGH6eYsjZ6lCbd0fNYuStOsYQh2uMVltRrMzMzkJDAw8OrVq7ANJLN///7KysqsrCzTedALzPlNxCTG7cFu4p0xYe9/Pn6veWf+gU5Jwo2NjegWaTFbVlYGj4tEqamp4RgZGQmtMwKkUSeWk5OD6xkHwcHBY44VnsbJPct4LAlDK+GxTbr7FhcXwy03btxAsEdHR+PcjIwMfJecnEy+bWpqGhwcrK+vN8KRm39Mp+Zd0m9FRQWghoWFdXd3kxIkISsAYxgufvnypZzjaGn9iNMJbVTN6dOnkY94lut2MfOjcQ+KCMwYFnv27GGshIaGVldX83wyB3rJmQDMkAyFBHAoR8QiwQvJLFiwQDoAczQVaUhICMcHDx5Igv3TQgnVHx4ezgOpucjDERER586dk4dgS5YsiYmJkZ8oqdt3k7Bp7cbx1q1b0tnanhgn1Yedm8nG0oVPtKnp7SnP8ejtqTLUJbEPpUj+JPw58ff3n1RZRLaAT0inJGS0ZmlpKS8fPny4d+9edCeJlxEwZnlsb+vsozlACF0oZf369dD6RIpScgMfIR/IS2hdWAu/19XVkRKam5s3bdokqn9M72PXrl3TOuD/6tiJMAx8ghCyN6QUYvndskmRlfTVdiwF+fH7zQzScXFx45S4VLCQCUc0KOrFz8/vxYsXyH9Sa0tLS2JiIretWLHi69evR44cGZ/r5s+ff/jwYXTn4sWL4Z/jx4+fPXs2NTVVZehPjdCGT9CgJ06coBSArFD9nz592rdvH9qfKDaqRqYwpV6zO10mJzgSTzASQoiP9/T0DAwMUFg4uduwI2ZDk5KSoHuRj7jMrj5Bwl7rMlZA68CBA5Jdnz9/3traGhAQAH4yAyq34X2cTqo/deqUw6eCnDIZRwE1EamO8Cfx5uXliaYCKgKfqIe+RFkNDQ2NX6/pCBjbxvc+ApSIZnAQ0ffv32dMSOqSkOcl3o+Pj3ey3PTKBRnoOygoiJBPT09ftmzZ27dvYao1a9a4rFbyxD7jJi0tDRhEnnqlOVCZ/ccy6T5vilupez0EpUc5rR21p8cIbci9sbGxu7u7q6uLjIo6cs1ScyIAZWVl+F2W1L3OoRI93g2AF5mINwoRRAHJiVT09OlTypdJyIHvPmnv3r37lY9LKsLpw8PDpCiZfJVcxZVJzcX6xNZEOM2UEbJUSQU3tXiXR1GCcE5mouom8Kk8eJmTk8NbXEEoe7cKmnYjNkVZTWpOELPvbSHq+/v7Oy3jxCw/NDQ0cOVflqHKvHVRfhpN9iIetUwqNcmKlBSQ9fLly7ko4+Bnc+ByUlBQsHTpUiMEZMk6IiKit7eXEzDgYkJCwurVq7n4X8skB1y6dMljtspXRgABSJgTiS8sg45NvHOREP5Z3cCdEu8UH6QH8wQzDuwVyY9Z5M2bN5BSS0vLFH5n1yygF0mGZuVAqEaWLeX6OLmUewCJE47yQQFSNh3JuXmIvQykOgGt2tra0dHRX/n9vXVvKPTy4cMHEX+8fPz4MRSRm5sLY0ALbrd7ImIc+k5PTw8LC4NDCGGyKNVfXFycLNhBVjwtNjbW7LPjyXV1dUNDQ1ANZcq0bO91eg6Q3c6yv0r8LqQsO7T6+vra29sJxqioKFkwWLRoUXNzc3x8/Pi1EvwOTfNZYKuurjYsX1lZybsAIGsPMtsKBUHr8MycOXMSExOzsrLw/myejJMo5mT79u1IurVr1xKk9fX1ZNfIyMiAgABJsyEhIaGhoR6Rbl8A8FiOlynVXbt2uawvEOBTud7U1MRPPHToEOdmzgN47t69y49mBPzTMh+aDeVvRllDI+gN8TKqIyMjo6OjA2fBOfYtcuNMBhQVFeFQXvIQwpZBAzwyknjIqlWr5Fsb5lGoo6qqKggnOTk5ODg4OzvbR+eCiD7xOF7AXzIR/adrBnYAMjMzUZMwzJkzZ2BtKFvC32VtxfCYuwbOnp6e1NTUv2U5wYkjAL8LLUzQ6TBSeXk5mQBiIZyJbryfn5/POeHMW48ePTp48KB9F0xbW9uTJ0+2bNkCp0F0Ohs6xYmw1tbWf1smdVBMTAzZgsDfuHHj+fPnCfkdO3YYvzOM7ty5s3Llyq1bt+qCzBQNSS7fFeAEGS6lln1TosdkwJcvX27evFlRUTEyMuLMv8gLAIBYKJHkixgodylQKZSkbuLIFY/ZTcqCy5cvDw4OOv+vcy4AlJ3EuAltMw0gJa7MENhLUzIBxdSrV6+8a0w7LglLiYt6kUljqTZlTo1jZ2enUY2Q+/v3769fvy5cv8oyXZKciugkYRLXsgFLxA9lEdFN0URRSukfHR1tcum3b98okT5+/JiWliZ7gbzaZnQqwsz0uv6389llbSakXLJvUZXii3KfIzI0KSkJAfPs2TNova+vz8/Pb/fu3Sj9WeD9mVNBsLbMDxsGJ3lK5rRTvMeuE+ojaL25uXkWLxb95SNA/m8GNI03ZVoRii8rKxsYGKDyZBDISp6MBuIdzuHdmpqa0dFRRH12dvaGDRtm8XLpdAJQUlJiFpvQJIWFhZzA15IwoXK5jUo1MDAwLy/P7XbD+DhdYr+0tBRsIBYSb3Jy8ty5vvGvdH6dW4xal1UnjqLczdoIL+Efs9xhjDQAw3R1dX33YftVGZqeni7fUCQrkjwJZ3yKnmlvbzebxeH6dZa5rO3mtbW1UVFRcXFxv1nm8m2bBhkK1eTn53NENRYXF6MOq6qquJ6bmytOHxkZuX379rx581JSUji61KZXBY35zVCK2Pr6+itXrqAgv6vN2Obcjo6OhoaGzZs3yxqh2kxQEBRfXV0dHh6+bds2dagPrQdoHaCmACgAagqAAqCmACgAagqAAqCmACgAagqAAqCmACgAagqAAqCmACgAagqAAqCmACgAagqAAqCmACgAagqAAqCmACgAagqAM+wPAdo7+5iqy/+NSwokFvgAJYkSiiVLSTLEShIzs+l001x/kMuyWXNuuUXMcmNKLSY53Wq1pq2t5sMfjsGmo4HmIDVR0RqiISoSZiCPipmET/1ev/Pe994ZoEPwgYfr+uPsPp/zeeKc63q/r/f9ue8bTdAQFIEEQQIQBAlAECQAQZAABEECEAQJQBAkAEGQAARBAhAECUAQJABBkAAEQQIQBAlAECQAQZAABEECEAQJQBAkAEGQAARBAhAECUAQJABBkAAEQQIQBAlAECQAQZAABEECEAQJQBAkAEGQAARBAhAECUAQJABBkAAEQQIQBAlAEDqOfvoKeg+OHTv25ZdfPvHEE5cuXaqsrFy1alVoaKgEIPQQnD9/Pi8vr7a2Nioq6sUXX2xN96amJnY7ceKE7b9ly5akpCRZIKF7IDk5edOmTS6Wnz59ev369e+9915mZiZbeE1LS5s5c+acOXMKCwvZ2dEd9hvdR40aReOxxx5DFTQiIiL0rSoDdBvMnj178+bNzz//fP/+/Qnt8fHxsL+qqorQHhAQEBwcfPHixYMHDxL7Y2Nj2dOOgu4PPfQQMoDugwYNQjP6Jr3h899//+lbuPf4999/eX3wwQftLeEcpvJ29+7dcHf58uW8TUlJecgD6PvGG2/A7NTU1KFDh8J7UsGePXu++OILDnFtzoMALl++jBieffZZfcntQV/ih76Fu0TxM2fOEHTdFsiNS4HN586da25u/v3339esWTNy5MhHHnmEiF5WVgZrw8PDf/31V/Qwbtw4aF1XV1dfX8+xFRUVxHUi/Y4dOzhk8uTJNTU1Dz/8MMdGR0eTHPp5wOGRkZGIR9+/aoD7DIJxeno6VHZbCOGBgYHW/vnnn7OysnhbWlrK26lTp8L7Q4cO0SbGm3GnwQ74dV5p43w4Ax7mqaeeIvCTB2joe5YF6kIgxpeUlISEhFCMwlHnWLx3MIdDFOetOfi5c+e++uqrtIuKiojxEydOdNZIkADuG44dO3azEIu9IUIbiZOTk3EdCxcuXLZsGU599OjRGzZsYPvKlSuN7u+//773eVCFdcuAZ555BjNzW4EcnWCr2lSIXc78D1fXL6gaoL3AqJhZh9lLly719fUNCwuDpj4+PvjsnJwczDq2BNNSUFCQkJCwb9++b775BuIaF/HlGBU/Pz/2eeWVVyhbcThBQUE4lsbGRrZjzd21OHz2/4Dpx8S3v4oAn3zySUNDA76fTyl8uaXi4mJey8vLX3vtNXwUV//444/1m6oGaC/Onz8Pm10XuwFaHz9+fN26dbQvX77cx9OhfvHiRVSRmZkJswm00I7tQ4YM4RWRzJo1C/Lh0YcNG8Yr+7B9wYIF1uhA/uHG4Lr1F1mX/9q1a2lTHKNYagxuyQoGUhAa4xBqCd7S0M+qDPD/EZRQff369RZBtAUoLgnbOz3AkEBl3hKYsfK5ublkg9DQUCIrMR6u19fXT5o0CbYRyK9du4bjJ9IvWrTIuuef9YCk0YG7tTzDtZAWRD916hS38e2335aVlY0aNWrjxo2UCm+++SYbsToXLlwg3l+9ehUZcGMkiqamphkzZrAnieUWWUXo4TUAjpw4bb3mZriJyklJSUTTtLQ02lCECIr59q5NHQV37drF4c61Q7W6urp58+bdKaOFSLjE/Pnzjx49Crm5DbajLquD7SanTZtm5QdbXBWB8GjYuAaiPke9/vrrtxa20BsFYIwhFhK8kUFAQAA8W7x4MTzGsdiTIxsk40TSwg7B0c53wliVjIGhGODtlClTyAxW/q5evRrimpmxoTgIj3tzXUP2YIt7todZvB0xYkTHfJTQG3uBXOejiYEtBE6oBufwx7R5bTMD3HEduv5N6+tEja5TyIJ9n//1+repxtvKe08//TT1hgh9u+iBY4EoBOEZYf5FD+zpEiG5kyMf4XFBQUFtbe2ECROIza7Pcdy4cWzExniTmEZeXt6BAwfi4uJsC5U0YsCs25NdkgCOv/N/LH8dyQ32kzSoQyyHCL26CKZC9S4EH/OgX7/bljoUz8jI8PPz43BcyrZt295++22qT3hvXZzW5/jOO++gB6J4fn7+9OnT3YWsM/TRRx/18fFJTExEJ2yMjo727hLtQNfQjh07jhw50rdvX/5AclpFRQWVMWmNcp970xAgZYCOV6jp6emBgYFE06KiIkphzHpYWBgbCd5sxKZTuRLFYeH27dsRgKUaK7s5A67du3iAiwiA8NwBb2Nj4ygYuDoNCt8lS5ZwA4hq4cKFth0Xh7q4VZIb18VKIchbPLwTeksG6BjwJI2NjdXV1R9++CHRmnAOvcaPHw/b9u/fP2/ePKI+URauW1+kpRoCP6TEzZNzWg9Bw5NERUVByr1799JAKjU1NSSBFmU3DKby5tPy8nIL4TY2jnzCLXH4559/HhISgirwVEgRn8P2kpISu9Xs7Gxi/1wP1AGqIrhTLt+NzMnMzMTZd75QtsQSHx8/ZswYMon3UGdXAZN2qAe8hwm53s/Bgwe7WzK1oAEr62X3JYCuKCFesSVG03fffbepqYm8wRYrea2HimzguoO8+2TXr19vT9zYk/yj3k8JoEsD63Lw4MHCwkLIOmvWLEyUdeHbZHM3T4Ww7aK4C+2lpaW5ubmchPAfGRkJ7+0Zhb5V1QBdl+7E8oyMDMoAKEvkJpxPmjRp/vz5ffv2/eyzzygScPAUDyiBHXDttDH3MTExfOTr6xvugfVQkQQwP/7+/pgcausZM2ZYN5GgXqCuCDMqixcvTkpKsmFqEJftZ86cgfRW/mLxCfyYmbq6Ot7SdhNw23QyWpGhK0CjQdsFo7sxG1v/0Ucf8Qq/g4ODc3JyiouLMTBWp8L1OzV2SDDgG4k4qgG6xC9BmA8ICFBtelfLKho2LY4vPC8vr7Ky0gazSABCj4ombu0WSiDS5qZNm4qKilasWAHjvUcrHjp0yEY03o3n3LJAvQhr1669j+sCnT59+j0PzM8Q2uE99wOzc3NzqawWLFiwZs2aQYMGlZaWBgYGul4BeE8GyM7OVgYQbgXIdOrUqeeee45oalGzxXyDe3MbFEUHDhwgitsgDjdMNTU1NS4uLisrKz4+3g1czczMLCgo+OCDD2yVUixQSkoKf8L48eNPnDjh3Cbbkc3dWMlUvUDd0iV7P3xwH0VFRcF16vI+nmVXiJr2JNvmG9jDY+95CJ25hx9++IFr2dsWY7lf9cBMDmHeuE4bMdTV1aGKPXv2lJWVrVy50h6V8OmqVau4vSlTplBiRUZG8if079/fW7HUA7C/uroahf/555+zZ88eMGCAMkBvKbvhDURZvnx5U1OT9cbiCtqc1mOUWr16NRy1Cc2dmW/A1bdv325D/ZxTt8Ed7oRciLtyOjzvgQ3TsJBvPPZeCS85OdnS1M2u29zc/Mcff5w8eZJLc2a0ER4e3oHxvMoA3YbltprQ1KlTvSO6m88Je6gOd+7cOWfOnD6tHj54n4pwO2LECOLr2LFj2znfoKqqCqpxTo7Ct+CaFi5caCsuuhEc7n7Ky8txU96HP+gBjmvw4MEobfjw4bYEr82Js47jPl6LQALvc9bW1hLUKyoqfHx8Hn/8ccL/kCFD/P39n/TgHnz5ygD3wcDANmg6ceJEe6RANKXN9s2bN3uHagvnBH78wIYNG+CTDR9yvbGdXEKL8//zzz80oKAjpRussXfvXu/t3h/ZBGWUkJCQQLzn3lqs/9UaV69eJaijkMbGRlvuDrr7+fnd919EQyE6BcLntWvXIOgtojsWHMZHRESw57JlywYOHBgTEwP1YTBRHycNMyZMmAAhjhw5gkJcZ190dPT06dNJDuwJ1X766Seivq2AYq+35QpsNPX+/fttMg1bSCmjR4/Geefm5gYFBdlMHUoLbhi+QmjK0+zs7GHDhkHZffv2YYeQ3Msvv2wDOnDhtsIXSvDuoGxoaCguLkY/R48excMgUfbkooR2eD9u3DhbX4MtXeEXVAa4DQKdPXsWOkJZCGEu1jpeCJMQ9+uvvz537hyxkNebrRVnGcCWEsLBm6vGzVPYwXLI0WKhB9u/A/He/lkGjsXm41sdTPBGeJyNJMOZuT1LKW7cHoSG6LS9V7OzVYbQXot7Q88Im6AO47Fq0BqR416618+qDNBepKWl3bhxg7hI8IOp3333na+vrwuff/31V35+vk2RgTo0rl+/3nqtOKIpeyIhgiLasG5K4rFF9NaZxC34nJGRgWzcfJcWc2sszxw+fJgzsA/tr776ilr5pZdegtO48zFjxnBXf//9NzuUlpaiVc5GnE5MTOQScJezXblyhfD/wgsvtFhZiDa0pkL45ZdfyFG21h1/0QMPPGDD/vg28OvBwcF3qU5VBugqpaqtzEOAJ7Nb8HZOnfD5448/IgbbgTywdOlSwu3WrVvZh+K1M33Y1uFj46VtFrzrFyIwE8jtZqwTHUZ6zzewjnZyFCf57bffyCSUH+QEm0jZ4kKIliyHaKlNkYr1nN7C4PUAqBeovbCFHlp0YoD58+dTShIg53nQooekY3PKKC127dplJ+ckGCT79xmuF9/1C3F+PsLq2OUQ3qVLl7hV/BIZiQOJzXZXT3ngXZUeP34c/0aDM+DTkCi+3MZs956fVRng9iIxQbTF46c7Aqsl3MJ1FtHZSDKxB0bV1dXw3romP/30UxMDodpNK7tZFYFtw3SdPHmSU3EU+YFL3KmnSBKA0N6uz8LCQlvtsI/n+T9mKT4+3rre3dxf6wN1HfDukRPHxsbGWveoJQfrRW3hYSwRISSuSCogqFNy4NT1E0gA9zNpeD+7xWxgqXHtbnAOgZzYDN29p1Bu2bLFem/aPCc/mT29IrRTj1pQ79iKvIIEcAeQnJxs/80uIiKCipOG+/8U3itN2AA1KteGhgYa9igXy/7WW2/dbDEfymjyAFaHRkhICFVpWFhYF+lBlwB6kYFxz25xHebXbYyNDWz0/k8wFvJh/PDhw7///nsjd3tm0pAHCOpnz57t16/fyJEjietBQUH6/iWA+8x+7Aosj4mJqa+vt64SLMrWrVvhqxWstpJPamoqsdzGjd16+lJzc3N5eTniYX+s/5NPPolUumMPugTQMw0Mode777L1s1tiOby31Xv6eMYOkATanLVUU1NDriB7+Pj4cHLObHOLBQngrgC7vHHjRkKyLcVjsRlqQsE+nlWjBw0a5J5nXfJgxYoVxcXFzsA4M4NBh+5xcXEJCQkIoKSkJCoqqnUno+HKlSs20osMgG+xkV6+vr6iV9dHj8q8tlInNp0qs49n+Io9OaIAxcBUVlZC38LCQmdR0ElZWZk94crJyUEAtG0Fc9qukLVl1q3NRwR16E7gCA8PxxQFBwf7+fk94YH4pAxwrwGJbUQxHIXuZkhgM8WosZwMYA/z2chrYmLiunXrzPO4B0mtT3v16lUb6XXhwgUb6UVQ73YjvYRukAGqqqqI2S2shZveOnPmzJSUlKFDh8bGxrK9zf9J4SZ6Y2mMzd6rhGPZDx8+TLSeO3euzVRqMZYBinMtUgGxgHoUp46KMDCjPBBFJIC7i23btsG/JUuW7Ny5083pdtNbm5qapk2blpWVZfTFqxCPbXAL8R49uGkllKe2gAwfLVq0yCnKGZjr16+bU6+rqxswYIAN30V7AwcOtP/uKDbIAt2fDEDBah3q1nYjAmx6KwYmPT0d3kNrK1gDAwPd/6Rok7h8ipaoiSlPw8LCcOrkEB8fH/3eQlesAdwoAJuK6tq7d+8OCAgYO3Ys++Tn5+NPMDbe6xrcuHHDhu/W1NSgE4hOluAQ/a5CdxKALbMxefLkW/x7H/y9jfRqbm4ODQ3FwFAMKKgLPa0XiPvByhPUsUP+/v420gv/o59K6MkCOHDgAHEdv67hu0KvzgCCcC+hcCtIAIIgAQiCBCAIEoAgSACCIAEIggQgCBKAIEgAgiABCIIEIAgSgCBIAIIgAQiCBCAIEoAgSACCIAEIggQgCBKAIEgAgiABCIIEIAgSgCBIAIIgAQiCBCAIEoAgSACCIAEIggQgCHcf/wdDxk1Jq1We/gAAAABJRU5ErkJggg=="
							}
						]
					}
				}
			},
			MapLayerStacks: {
				Set: {
					MapLayerStack: {
						name: "Default",
						MapLayer: {
							name: "layer1",
							refMapProvider: "404",
							opacity: "1.0",
							colBkgnd: "rgb(255,255,255)"
						}
					}
				}
			}
		}
	};

	// sap.ui.vbm.GeoMap.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// This section defines behavior for the control,............................//
	// ...........................................................................//

	GeoMap.prototype.exit = function() {
		VBI.prototype.exit.apply(this, arguments);

		// detach the event.......................................................//
		this.detachSubmit(this.onGeoMapSubmit, this);
		this.detachContainerCreated(this.onGeoMapContainerCreated, this);
		this.detachContainerDestroyed(this.onGeoMapContainerDestroyed, this);
		this.detachCloseWindow(this.onGeoMapWindowClosed, this);


	};

	//helper function
	function delayedUpdate() {
		this.m_bActionsDirty = true;
		this.m_bSceneDirty = true;
		this.invalidate(this);
	}

	// track modifications on event listeners
	GeoMap.prototype.attachEvent = function() {
		VBI.prototype.attachEvent.apply(this, arguments);
		delayedUpdate.apply(this);
	};

	GeoMap.prototype.detachEvent = function() {
		VBI.prototype.detachEvent.apply(this, arguments);
		delayedUpdate.apply(this);
	};

	// track modifications on resources..........................................//
	GeoMap.prototype.destroyResources = function() {
		this.m_bResourcesDirty = true;
		return this.destroyAggregation("resources");
	};

	GeoMap.prototype.addResource = function(o) {
		this.m_bResourcesDirty = true;
		return this.addAggregation("resources", o);
	};

	GeoMap.prototype.insertResource = function(o, index) {
		this.m_bResourcesDirty = true;
		return this.insertAggregation("resources", o, index);
	};

	GeoMap.prototype.removeResource = function(o) {
		this.m_bResourcesDirty = true;
		return this.removeAggregation("resources", o);
	};

	GeoMap.prototype.removeAllResources = function(o) {
		this.m_bResourcesDirty = true;
		return this.removeAllAggregation("resources");
	};

	// track modifications on vos................................................//
	GeoMap.prototype.destroyVos = function() {
		this.m_bVosDirty = true;
		return this.destroyAggregation("vos");
	};

	GeoMap.prototype.addVo = function(o) {
		if (this.indexOfVo(o) < 0) { // prevent from unneccessary rebuild of all VOs
			this.m_bVosDirty = true;
			this.addAggregation("vos", o);
			o.m_bAggRenew = true;
		}
		return this;
	};

	GeoMap.prototype.insertVo = function(o, index) {
		this.m_bVosDirty = true;
		this.insertAggregation("vos", o, index);
		o.m_bAggRenew = true;
		return this;
	};

	GeoMap.prototype.removeVo = function(o) {
		this.m_bVosDirty = true;
		return this.removeAggregation("vos", o);
	};

	GeoMap.prototype.removeAllVos = function(o) {
		this.m_bVosDirty = true;
		return this.removeAllAggregation("vos");
	};

	// track modifications on geoJsonLayers.................................//
	GeoMap.prototype.destroyGeoJsonLayers = function() {
		this.m_bGJLsDirty = true;
		return this.destroyAggregation("geoJsonLayers");
	};

	GeoMap.prototype.addGeoJsonLayer = function(o) {
		this.m_bGJLsDirty = true;
		return this.addAggregation("geoJsonLayers", o);
	};

	GeoMap.prototype.insertGeoJsonLayer = function(o, index) {
		this.m_bGJLsDirty = true;
		return this.insertAggregation("geoJsonLayers", o, index);
	};

	GeoMap.prototype.removeGeoJsonLayer = function(o) {
		this.m_bGJLsDirty = true;
		return this.removeAggregation("geoJsonLayers", o);
	};

	GeoMap.prototype.removeAllGeoJsonLayers = function(o) {
		this.m_bGJLsDirty = true;
		return this.removeAllAggregation("geoJsonLayers");
	};

	// track modifications on featureCollections.................................//
	GeoMap.prototype.destroyFeatureCollections = function() {
		this.m_bFCsDirty = true;
		return this.destroyAggregation("featureCollections");
	};

	GeoMap.prototype.addFeatureCollection = function(o) {
		this.m_bFCsDirty = true;
		return this.addAggregation("featureCollections", o);
	};

	GeoMap.prototype.insertFeatureCollection = function(o, index) {
		this.m_bFCsDirty = true;
		return this.insertAggregation("featureCollections", o, index);
	};

	GeoMap.prototype.removeFeatureCollection = function(o) {
		this.m_bFCsDirty = true;
		return this.removeAggregation("featureCollections", o);
	};

	GeoMap.prototype.removeAllFeatureCollections = function(o) {
		this.m_bFCsDirty = true;
		return this.removeAllAggregation("featureCollections");
	};

	// track modifications on clusters............................................//
	GeoMap.prototype.destroyClusters = function() {
		this.m_bClustersDirty = true;
		return this.destroyAggregation("clusters");
	};

	GeoMap.prototype.addCluster = function(o) {
		this.m_bClustersDirty = true;
		return this.addAggregation("clusters", o);
	};

	GeoMap.prototype.insertCluster = function(o, index) {
		this.m_bClustersDirty = true;
		return this.insertAggregation("clusters", o, index);
	};

	GeoMap.prototype.removeCluster = function(o) {
		this.m_bClustersDirty = true;
		return this.removeAggregation("clusters", o);
	};

	GeoMap.prototype.removeAllClusters = function(o) {
		this.m_bClustersDirty = true;
		return this.removeAllAggregation("clusters");
	};

	// track modifications on mapConfiguration...................................//

	/**
	 * Set Map configuration data. Map Configurations contain a set of Map Providers and Map Layer Stacks refering to those providers. The GeoMap
	 * property refMapLayerStack defines, which Map Layer Stack becomes visible.
	 *
	 * @param {object} oMapConfiguration Map Configuration object
	 * @param {array} oMapConfiguration.MapProvider Array of Map Provider definitions.
	 * @param {string} oMapConfiguration.MapProvider.name Name for the provider. Needed in Map Layer Stack as reference.
	 * @param {string} oMapConfiguration.MapProvider.tileX X-pixel dimension of map tile. Typical 256.
	 * @param {string} oMapConfiguration.MapProvider.tileY Y-pixel dimension of map tile. Typical 256.
	 * @param {string} oMapConfiguration.MapProvider.minLOD Minimal supported Level Of Detail.
	 * @param {string} oMapConfiguration.MapProvider.maxLOD Maximal supported Level Of Detail.
	 * @param {string} oMapConfiguration.MapProvider.copyright Copyright Information to be shown with the map.
	 * @param {array} oMapConfiguration.MapProvider.Header Array of HTTP headers definitions. Optional.
	 * @param {string} oMapConfiguration.MapProvider.Header.name Name of the header.
	 * @param {string} oMapConfiguration.MapProvider.Header.value Value of the header.
	 * @param {array} oMapConfiguration.MapProvider.Source Array of source definitions. At least on Source has to be given. Multiple sources can be used for load distribution.
	 * @param {string} oMapConfiguration.MapProvider.Source.id Source id.
	 * @param {string} oMapConfiguration.MapProvider.Source.url Source URL for map tile service. URL includes place holders for variable informations set at runtime, e.g. {LOD}.
	 * @param {array} oMapConfiguration.MapLayerStacks Array of Map Layer Stacks
	 * @param {string} oMapConfiguration.MapLayerStacks.name Name of Map Layer Stack. Use with the GeoMap refMapLayerStack property.
	 * @param {string} oMapConfiguration.MapLayerStacks.previewPosition.latitude Latitude position to use when creating image tile
	 * @param {string} oMapConfiguration.MapLayerStacks.previewPosition.longitude Longitude position to use when creating image tile
	 * @param {string} oMapConfiguration.MapLayerStacks.previewPosition.lod Lod position to use when creating image tile
	 * @param {array} oMapConfiguration.MapLayerStacks.MapLayer Array of Map Layers. Each Layer refers to a Map Proveride. Map Layers get overlayed in the given sequence.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.name Name of Map Layer.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.refMapProvider Name of referenced Map Provider.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.opacity Opacity of Map Layer. Value range 0 to 1.
	 * @param {sap.ui.core.CSSColor} oMapConfiguration.MapLayerStacks.colBkgnd Background color for Map Layer. Only meaningful if opacity is below 1.
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	GeoMap.prototype.setMapConfiguration = function(o) {
		this.m_bMapConfigurationDirty = true;

		if (o.MapLayerStacks && o.MapProvider) {
			this.m_bMapLayerStacksDirty = true;
			this.m_bMapProvidersDirty = true;
			this.setProperty("mapConfiguration", o).invalidate();
		}
		return this;
	};

	/**
	 * Set clustering definitions.
	 *
	 * @param {object} oClustering Cluster Definition object
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @deprecated since version 1.31 This property should not longer be used. Its functionality has been replaced by the <code>clusters</code> aggregation.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setClustering = function(oClustering) {
		this.m_bClusteringDirty = true;
		this.setProperty("clustering", oClustering);
		return this;
	};

	GeoMap.prototype.setRefMapLayerStack = function(o) {
		if (o === this.getRefMapLayerStack()) {
			return this;
		}
		this.m_bRefMapLayerStackDirty = this.m_bSceneDirty = true;
		this.setProperty("refMapLayerStack", o).invalidate();
		return this;
	};

	/**
	 * Set Visual Frame definition.
	 *
	 * @param {object} oVisFrame Visual Frame definition object
	 * @param {float} oVisFrame.minLon Minimal longitude of visual frame
	 * @param {float} oVisFrame.maxLon Maximal longitude of visual frame
	 * @param {float} oVisFrame.minLat Minimal latitude of visual frame
	 * @param {float} oVisFrame.maxLat Maximal latitude of visual frame
	 * @param {float} oVisFrame.minLOD Minimal Level of Detail for visual frame
	 * @param {float} oVisFrame.maxLOD Maximal Level of Detail for visual frame
	 * @param {float} oVisFrame.maxFraction Maximal fraction [0..1] of minLOD which is acceptable, otherwise minLOD is rounded upwards
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setVisualFrame = function(oVisFrame) {
		this.m_bVisualFrameDirty = true;
		this.setProperty("visualFrame", oVisFrame);
		return this;
	};

	/**
	 * Set Tracking Mode for Rectangular Selection on/off.
	 *
	 * @param {boolean} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setRectangularSelection = function(bSet) {
		VBI.prototype.setRectangularSelection.apply(this, arguments);
		return this;
	};

	/**
	 * Set Tracking Mode for Lasso Selection on/off.
	 *
	 * @param {boolean} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setLassoSelection = function(bSet) {
		VBI.prototype.setLassoSelection.apply(this, arguments);
		return this;
	};

	/**
	 * Set Tracking Mode for Rectangular Zoom on/off.
	 *
	 * @param {boolean} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setRectZoom = function(bSet) {
		VBI.prototype.setRectZoom.apply(this, arguments);
		return this;
	};

	/**
	 * Trigger the interactive creation mode to get a position or position array.
	 *
	 * @param {boolean} bPosArray Indicator if a single position or an array is requested
	 * @param {function} callback Callback function func( sPosArray ) to be called when done. Position(array) sPosArray is provided in format
	 *        "lon;lat;0;..."
	 * @returns {boolean} Indicator whether the creation mode could be triggered successfully or not.
	 * @public
	 * @experimental Since 1.30.0 This method is experimental and might be modified or removerd in future versions.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.getPositionInteractive = function(bPosArray, callback) {
		var isCreationModeTriggered;
		if (!this.mIACreateCB && callback && typeof callback === "function") {
			this.mIACreateCB = callback;

			var sType = bPosArray ? "POSARRAY" : "POS";

			// trigger interactive creation mode by defining an automation call
			var oLoad = {
				"SAPVB": {
					"Automation": {
						"Call": {
							"handler": "OBJECTCREATIONHANDLER",
							"name": "CreateObject",
							"object": "MainScene",
							"scene": "MainScene",
							"instance": "",
							"Param": {
								"name": "data",
								"#": "{" + sType + "}"
							}
						}
					}
				}
			};
			this.load(oLoad);
			isCreationModeTriggered = true;
		} else {
			// callback function registered -> other create still pending!
			isCreationModeTriggered = false;
		}
		return isCreationModeTriggered;
	};

	/**
	 * Retrieves the center position of the current map.
	 * @returns {string} centerPosition A string representing the center position; it is retrieved in the form of "x;y".
	 * @public
	 */
	GeoMap.prototype.getCenterPosition = function() {
		var oScene = this.mVBIContext.GetMainScene(),
			centerPosition;
		//If the main scene exists, we calculate the center position of the scene.
		if (oScene) {
			//converting radians to degrees
			var aCoords = window.VBI.MathLib.RadToDeg(oScene.GetCenterPos());
			centerPosition = aCoords[0] + ";" + aCoords[1];
		} else {
			//If there is no main scene, we return the value of the centerPosition public property.
			centerPosition = this.getProperty("centerPosition");
		}
		return centerPosition;
	};

	GeoMap.prototype.isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

	GeoMap.prototype.setCenterPosition = function(sPosition) {
		var aCoords = sPosition ? sPosition.split(";") : undefined;
		if (!aCoords || aCoords.length <= 1 || !this.isNumeric(aCoords[0]) || !this.isNumeric(aCoords[1])) {
			Log.error(sap.ui.vbm.getResourceBundle().getText("GEOMAP_INVALID_CENTER_POSITION") + ":'" + sPosition + "'", "setCenterPosition", thisModule);
		} else {
			var sPositionInternal = aCoords[0] + ";" + aCoords[1] + ";0";
			this.setProperty("centerPosition", sPositionInternal);
			if (this.isRendered()) {
				// Control already rendered -> need to call function zoom to geopos
				aCoords = sPositionInternal.split(";");
				this.zoomToGeoPosition(aCoords[0], aCoords[1], this.getZoomlevel());
			}
			// else: Control not yet rendered -> position will be taken for initial rendering
		}
		return this;
	};

	// this setter is required for legacy support!
	GeoMap.prototype.setInitialPosition = function(sPosition) {
		this.setCenterPosition(sPosition);
	};

	GeoMap.prototype.getZoomlevel = function() {
		var oScene = this.mVBIContext.GetMainScene();
		if (oScene) {
			return parseInt(oScene.GetCurrentZoomlevel(), 10);
		}
		return this.getProperty("zoomlevel");
	};

	GeoMap.prototype.setZoomlevel = function(iZoom) {
		if (!this.getDisableZoom()) {
			if (iZoom >= 0) {
				if (this.isRendered()) {
					var aCoords = this.getCenterPosition().split(";");
					if (this.getEnableAnimation()) {
						var oScene = this.mVBIContext.GetMainScene();
						oScene.AnimateZoomToGeo(oScene.GetCenterPos(), iZoom, 5);
					} else {
						this.zoomToGeoPosition(aCoords[0], aCoords[1], iZoom);
					}
				}
				this.setProperty("zoomlevel", iZoom);
			} else {
				Log.error(sap.ui.vbm.getResourceBundle().getText("GEOMAP_INVALID_ZOOM_LEVEL") + ": " + iZoom.toString(), "setZoomlevel", thisModule);
			}
		}
	};

	// this setter is required for legacy support!
	GeoMap.prototype.setInitialZoom = function(sZoom) {
		this.setZoomlevel(parseInt(sZoom, 10));
	};

	/**
	 * Open Detail window
	 *
	 * @param {string} sPosition Postion for the Detail Window in format "lon;lat;0"
	 * @param {object} [oParams] Parameter Objects
	 * @param {string} [oParams.caption] Caption of the Detail Window
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.openDetailWindow = function(sPosition, oParams) {
		// set detail window context. The actual opening happens in getWindowsObject()

		this.mDTWindowCxt.key = "";
		this.mDTWindowCxt.open = true;
		this.mDTWindowCxt.bUseClickPos = true;
		this.mDTWindowCxt.params = oParams ? oParams : null;
		this.mDTWindowCxt.src = {
			mClickGeoPos: sPosition
		};
		this.invalidate(this);
		this.m_bWindowsDirty = true;
	};

	/**
	 * Go to Initial Start Position with Initial Zoom Level
	 *
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.goToStartPosition = function() {
		if (this.isRendered()) {
			this.mVBIContext.GetMainScene().GoToInitialStart();
		}
	};

	/**
	 * Close any open Detail window
	 *
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.closeAnyDetailWindow = function() {
		// set detail window open to false and invalide control -> actual closing is triggered in getWindowsObject()
		this.mDTWindowCxt.open = false;
		this.invalidate(this);
		this.m_bWindowsDirty = true;
	};

	/**
	 * Get an aggregated VO instance by its internal ID returned by e.g. function <code>getInfoForCluster</code>.
	 *
	 * @param {string} [voIdentifier] Internal VO Identifier
	 * @returns {sap.ui.vbm.VoBase} VO instance element or null if nothing found
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.getVoByInternalId = function(voIdentifier) {
		var voElement = null;
		var aSplitID = voIdentifier.split(/\./);
		var oAggregation = this.getAggregatorContainer(aSplitID[0]);
		if (oAggregation && oAggregation.findInstance) {
			voElement = oAggregation.findInstance(aSplitID[1]);
		}
		return voElement;
	};

	/**
	 * Retrieves all spot instances of a {sap.ui.vbm.ClusterContainer}
	 * @param {sap.ui.vbm.ClusterContainer} clusterContainer The cluster container whose spots we want to retrieve.
	 * @returns {sap.ui.vbm.Spot[]} spots An array of sap.ui.vbm.Spot instances.
	 * @public
	 */
	GeoMap.prototype.getClusteredSpots = function(clusterContainer) {
		//get the list of all internat spot ids belonging to the cluster container passed as argument
		var spotIds = this.getInfoForCluster(clusterContainer.getKey(), sap.ui.vbm.ClusterInfoType.ContainedVOs),
		//find and retrieved all spot instances based on their internat spot id
		spots = spotIds.map(function (spotId) {
			return this.getVoByInternalId(spotId);
		}.bind(this));
		return spots;
	};

	// ..............................................................................................//
	// write selection property back to model and fire select event on aggregation ..................//
	GeoMap.prototype.setSelectionPropFireSelect = function(dat) {
		var aN = dat.N;
		for (var nJ = 0; nJ < aN.length; ++nJ) {
			var oAgg = aN[nJ];
			var aEl = oAgg.E;
			var cont;
			if ((cont = this.getAggregatorContainer(oAgg.name)) && cont.handleSelectEvent) {
				cont.handleSelectEvent(aEl);
			}
		}
	};

	// ...........................................................................//
	// central event handler.....................................................//

	GeoMap.prototype.onGeoMapSubmit = function(e) {
		// analyze the event......................................................//
		var datEvent = JSON.parse(e.mParameters.data);

		// write changed data back to aggregated elements
		if (datEvent.Data && datEvent.Data.Merge) {
			this.handleChangedData(datEvent.Data.Merge.N);
		}

		// get the container......................................................//
		// and delegate the event to the container first..........................//
		var cont;
		if ((cont = this.getAggregatorContainer(datEvent.Action.object))) {
			cont.handleEvent(datEvent);
			if (datEvent.Action.name == "click" && datEvent.Data && datEvent.Data.Merge) {
				this.setSelectionPropFireSelect(datEvent.Data.Merge); // set selection property on model and call select and deselect on Aggregation
			}
		} else {
			/*
			 * TO DO:
			 * other events might be important later
			 */
			switch (datEvent.Action.name) {
				case "click":
					// fire the click..................................................//
					this.fireClick({
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						data: datEvent //include VBI data to the UI5 event payload
					});
					break;
				case "contextMenu":
					// fire the contextMenu..................................................//
					this.fireContextMenu({
						clientX: datEvent.Action.Params.Param[0]['#'],
						clientY: datEvent.Action.Params.Param[1]['#'],
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						data: datEvent //include VBI data to the UI5 event payload
					});
					break;
				case "drop":
					// fire the drop..................................................//
					this.fireDrop({
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						data: datEvent //include VBI data to the UI5 event payload
					});
					break;
				case "zoomChanged":
					// fire the zoomChanged..................................................//
					this.fireZoomChanged({
						zoomLevel: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						centerPoint: datEvent.Action.AddActionProperties.AddActionProperty[1]['#'],
						viewportBB: {
							upperLeft: datEvent.Action.Params.Param[3]['#'],
							lowerRight: datEvent.Action.Params.Param[4]['#']
						},
						data: datEvent //include VBI data to the UI5 event payload
					});
					break;
				case "centerChanged":
					// fire the centerChanged..................................................//
					this.fireCenterChanged({
						zoomLevel: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						centerPoint: datEvent.Action.AddActionProperties.AddActionProperty[1]['#'],
						viewportBB: {
							upperLeft: datEvent.Action.Params.Param[3]['#'],
							lowerRight: datEvent.Action.Params.Param[4]['#']
						},
						data: datEvent //include VBI data to the UI5 event payload
					});
					break;
				case "select":
					if (datEvent.Data && datEvent.Data.Merge.N) {
						var aSelected = this.getSelectedItems(datEvent.Data.Merge.N);
						// fire the select ...............................................//
						this.fireSelect({
							selected: aSelected,
							data: datEvent //include VBI data to the UI5 event payload
						});
						this.setSelectionPropFireSelect(datEvent.Data.Merge); // set selection property on model and call select and deselect on
						// Aggregation
					}
					break;
				case "GetPosComplete":
					// Interactive Position gathering finished
					if (this.mIACreateCB) {
						try {
							this.mIACreateCB(datEvent.Action.Params.Param[0]['#']);
							this.mIACreateCB = null;
						} catch (exc) {
							// clear callback function in any case
							this.mIACreateCB = null;
							throw exc;
						}
					} else {
						// If interactive editing was triggered indirectly (e.g. via vbiJSON load) then fire event
						datEvent.Action.name = "CreateComplete";
						//include VBI data to the UI5 event payload
						this.fireEvent("createComplete", {data: datEvent}, true);
						e.preventDefault();
					}
					break;
				case "keydown":
					if (!this.fireEvent(
						"keyDown", {
							key: datEvent.Action.Params.Param[0]['#'],
							code: datEvent.Action.Params.Param[1]['#'],
							shift: datEvent.Action.Params.Param[2]['#'],
							ctrl: datEvent.Action.Params.Param[3]['#'],
							alt: datEvent.Action.Params.Param[4]['#'],
							meta: datEvent.Action.Params.Param[5]['#']},
							true)) {
						e.preventDefault();
					}
					break;
				case "keypress":
					if (!this.fireEvent(
						"keyPress", {
							key: datEvent.Action.Params.Param[0]['#'],
							code: datEvent.Action.Params.Param[1]['#'],
							shift: datEvent.Action.Params.Param[2]['#'],
							ctrl: datEvent.Action.Params.Param[3]['#'],
							alt: datEvent.Action.Params.Param[4]['#'],
							meta: datEvent.Action.Params.Param[5]['#']},
							true)) {
						e.preventDefault();
					}
					break;
				case "keyup":
					if (!this.fireEvent(
						"keyUp", {
							key: datEvent.Action.Params.Param[0]['#'],
							code: datEvent.Action.Params.Param[1]['#'],
							shift: datEvent.Action.Params.Param[2]['#'],
							ctrl: datEvent.Action.Params.Param[3]['#'],
							alt: datEvent.Action.Params.Param[4]['#'],
							meta: datEvent.Action.Params.Param[5]['#']},
							true)) {
						e.preventDefault();
					}
					break;
				default:
					this.fireEvent(
							datEvent.Action.name,
							datEvent);
					break;
			}
		}
	};

	GeoMap.prototype.onGeoMapContainerCreated = function(e) {
		// get the id of the div area where to place the control..................//
		var div = e.getParameter("contentarea");
		if (div.m_ID) {
			// get the container...................................................//
			// and delegate the event to the container first.......................//
			var cont;
			if ((cont = this.getAggregatorContainer(div.m_ID)) && cont.handleContainerCreated) {
				cont.handleContainerCreated(e);
			}
		}
	};

	GeoMap.prototype.onGeoMapContainerDestroyed = function(e) {
		// get the id of the div area where to place the control..................//
		var div = e.getParameter("contentarea");
		if (div.m_ID) {
			// get the container..................................................//
			// and delegate the event to the container first......................//
			var cont;
			if ((cont = this.getAggregatorContainer(div.m_ID)) && cont.handleContainerDestroyed) {
				cont.handleContainerDestroyed(e);
			}
		}
		if (this.mDTWindowCxt.open && e.getParameter("id") === "Detail") {
			// detail window gets closed
			this.mDTWindowCxt.open = false;
			this.mDTWindowCxt.src = null; // release VO
			this.m_bWindowsDirty = true;
		}
	};

	GeoMap.prototype.onGeoMapWindowClosed = function(e) {
		if (this.mDTWindowCxt.open && e.getParameter("id") === "Detail") {
			this.mDTWindowCxt.open = false;
			this.mDTWindowCxt.src = null;
		}
	};

	GeoMap.prototype.init = function() {
		// attach the events
		this.attachSubmit(this.onGeoMapSubmit, this);
		this.attachContainerCreated(this.onGeoMapContainerCreated, this);
		this.attachContainerDestroyed(this.onGeoMapContainerDestroyed, this);
		this.attachCloseWindow(this.onGeoMapWindowClosed, this);

		// initially set dirty state for all elements............................//
		this.m_bVosDirty = true;
		this.m_bFCsDirty = true;
		this.m_bGJLsDirty = true;
		this.m_bClustersDirty = true;
		this.m_bMapConfigurationDirty = true;
		this.m_bClusteringDirty = true;
		this.m_bVisualFrameDirty = true;
		this.m_bRefMapLayerStackDirty = true;
		this.m_bResourcesDirty = true;
		this.m_bMapProvidersDirty = true;
		this.m_bMapLayerStacksDirty = true;
		this.m_bWindowsDirty = true;
		this.m_bMapconfigDirty = true;
		this.m_bLegendDirty = true;
		this.m_bSceneDirty = true;
		this.m_bActionsDirty = true;

		this.mbForceDataUpdate = false;
		this.bDataDeltaUpdate = false;
		this.bHandleChangedDataActive = false;

		// Initialize Detail Window Context object
		this.mDTWindowCxt = {
			open: false,
			src: null,
			key: "",
			params: null
		};

		// call base class first
		VBI.prototype.init.apply(this, arguments);
	};

	// common helper functions...................................................//

	GeoMap.prototype.getSelectedItems = function(data) {
		var cont, aContSel, aSel = [];
		if (!data) {
			return null;
		}
		if (jQuery.type(data) === "object") {
			cont = this.getAggregatorContainer(data.name);
			aContSel = cont.findSelected(true, data.E);
			aSel = aSel.concat(aContSel);
		} else if (jQuery.type(data) === "array") {
			for (var nJ = 0; nJ < data.length; ++nJ) {
				cont = this.getAggregatorContainer(data[nJ].name);
				aContSel = cont.findSelected(true, data[nJ].E);
				if (aContSel && aContSel.length) {
					aSel = aSel.concat(aContSel);
				}
			}
		}

		return aSel;

	};

	GeoMap.prototype.getWindowsObject = function() {
		// determine the windows object..........................................//
		// Main window -> needs always to be defined
		var oWindows = {
			"Set": [
				{
					"name": "Main",
					"Window": {
						"id": "Main",
						"caption": "MainWindow",
						"type": "geo",
						"refParent": "",
						"refScene": "MainScene",
						"modal": "true"
					}
				}
			],
			"Remove": []
		};

		// Legend window ........................................................//
		var oLegend = this.getLegend();
		if (oLegend) {
			var legendDiv;
			if ((legendDiv = this.getDomRef(oLegend.getId()))) {
				this.m_curLegendPos = {
					right: parseInt(legendDiv.style.right, 10),
					top: parseInt(legendDiv.style.top, 10)
				};
			}

			var oLegendWindows = oLegend.getTemplateObject();

			// concat the sets
			if (oLegendWindows.Set) {
				oWindows.Set = oWindows.Set.concat(oLegendWindows.Set);
			}
			// concat the removes
			if (oLegendWindows.Remove) {

				oWindows.Remove = oWindows.Remove.concat(oLegendWindows.Remove);

			}
		}

		// Detail window..........................................................//
		if (this.mDTWindowCxt.src) {
			// Make sure any detail window opened before is closed
			var oRemove, oDTWindows;

			oRemove = [
				{
					"name": "Detail"
				}
			];

			// Check if given source element is still valid
			if (this.mDTWindowCxt.key) {
				var oCurrentSourceInst = this.getChildByKey(this.mDTWindowCxt.src, this.mDTWindowCxt.key);
				if (!oCurrentSourceInst) {
					// related source object does not longer exist -> reset context
					this.mDTWindowCxt.open = false;
					this.mDTWindowCxt.src = null;
					this.mDTWindowCxt.key = "";
					this.mDTWindowCxt.params = null;
				} else {
					// Note: Instances are not stable related to keys -> update source instance to match instance for given key
					this.mDTWindowCxt.src = oCurrentSourceInst;
				}
			}
			if (this.mDTWindowCxt.open) {
				oDTWindows = {
					"Set": [
						{
							"name": "Detail",
							"Window": {
								"id": "Detail",
								"type": "callout",
								"refParent": "Main",
								"refScene": "",
								"modal": "true",
								"caption": this.mDTWindowCxt.params.caption ? this.mDTWindowCxt.params.caption : "",
								"offsetX": this.mDTWindowCxt.params.offsetX ? this.mDTWindowCxt.params.offsetX : "0",
								"offsetY": this.mDTWindowCxt.params.offsetY ? this.mDTWindowCxt.params.offsetY : "0"
							}
						}
					]
				};

				// set window position
				if (this.mDTWindowCxt.bUseClickPos == true && this.mDTWindowCxt.src.mClickGeoPos) {
					oDTWindows.Set[0].Window.pos = this.mDTWindowCxt.src.mClickGeoPos;
				} else {
					oDTWindows.Set[0].Window['pos.bind'] = this.mDTWindowCxt.src.getParent().sId + "." + this.mDTWindowCxt.src.UniqueId + ".P";
				}

				// Add detail window to the list of windows
				oWindows.Set = oWindows.Set.concat(oDTWindows.Set);
			}

			oWindows.Remove = oWindows.Remove.concat(oRemove);
		}
		return oWindows;
	};

	GeoMap.prototype.getActionArray = function() {
		var aActions = [];
		// subscribe for map event
		// Note: We register Action only if event are subscribed
		if (this.mEventRegistry["click"]) {
			aActions.push({
				"id": "GMap1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"]) {
			aActions.push({
				"id": "GMap2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "ContextMenu",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["drop"]) {
			aActions.push({
				"id": "GMap3",
				"name": "drop",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "Drop",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["zoomChanged"]) {
			aActions.push({
				"id": "GMap4",
				"name": "zoomChanged",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "ZoomChanged",
				"AddActionProperty": [
					{
						"name": "zoom"
					}, {
						"name": "centerpoint"
					}, {
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["centerChanged"]) {
			aActions.push({
				"id": "GMap5",
				"name": "centerChanged",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "CenterChanged",
				"AddActionProperty": [
					{
						"name": "zoom"
					}, {
						"name": "centerpoint"
					}, {
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["select"]) {
			aActions.push({
				"id": "GMap6",
				"name": "select",
				"refScene": "MainScene",
				"refVO": "General",
				"refEvent": "Select"
			});
		}
		aActions.push({
			"id": "GMap7",
			"name": "GetPosComplete",
			"refScene": "MainScene",
			"refVO": "General",
			"refEvent": "CreateComplete"
		});
		if (this.mEventRegistry["keyDown"]) {
			aActions.push({
				"id": "GMap8",
				"name": "keydown",
				"refScene": "MainScene",
				"refVO": "",
				"refEvent": "KeyDown"
			});
		}
		if (this.mEventRegistry["keyPress"]) {
			aActions.push({
				"id": "GMap9",
				"name": "keypress",
				"refScene": "MainScene",
				"refVO": "",
				"refEvent": "KeyPress"
			});
		}
		if (this.mEventRegistry["keyUp"]) {
			aActions.push({
				"id": "GMap10",
				"name": "keyup",
				"refScene": "MainScene",
				"refVO": "",
				"refEvent": "KeyUp"
			});
		}
		return aActions;
	};

	GeoMap.prototype.getSceneVOdelta = function(oCurrent, oNew) {
		var aVO = [];
		var aRemove = [];
		// build map of current VOs
		var oVOMap = {};
		for (var nI = 0, len = oCurrent.length; nI < len; ++nI) {
			oVOMap[oCurrent[nI].id] = oCurrent[nI];
		}
		for (var nJ = 0; nJ < oNew.length; ++nJ) {
			if (oVOMap[oNew[nJ].id]) { // VO already exists ...
				if (JSON.stringify(oNew[nJ]) != JSON.stringify(oVOMap[oNew[nJ].id])) { // ... but is different
					aRemove.push({
						"id": oNew[nJ].id,
						"type": "VO"
					}); // remove old VO version from scene and
					aVO.push(oNew[nJ]); // add new VO version
					// window.VBI.m_bTrace && window.VBI.Trace( "Scene update VO " + oNew[nI].id );
				} // else {} // nothing to do

			} else { // new VO -> add it
				aVO.push(oNew[nJ]);
				// window.VBI.m_bTrace && window.VBI.Trace( "Scene add VO " + oNew[nI].id );
			}
			delete oVOMap[oNew[nJ].id]; // remove processed VOs from map
		}
		// remove VOs remaining on map
		for ( var id in oVOMap) {
			aRemove.push({
				"id": id,
				"type": "VO"
			});
			// window.VBI.m_bTrace && window.VBI.Trace( "Scene remove VO " + id );
		}
		var retVal = {
			"Merge": {
				"name": "MainScene",
				"type": "SceneGeo",
				"SceneGeo": {
					"id": "MainScene",
					"refMapLayerStack": this.getRefMapLayerStack()
				}
			}
		};
		if (aRemove.length) {
			retVal.Merge.SceneGeo.Remove = aRemove;
		}
		if (aVO.length) {
			retVal.Merge.SceneGeo.VO = aVO;
		}

		return retVal;
	};

	// diagnostics...............................................................//

	GeoMap.prototype.minimizeApp = function(oApp) {
		/*
		 * TO DO:
		 * calculate a hash instead of caching the json string
		 */

		// remove windows section when not necessary..............................//
		var t, s;
		s = null;
		if (!this.m_bWindowsDirty) {
			(t = oApp) && (t = t.SAPVB) && (t = t.Windows) && (s = JSON.stringify(t)) && (s == this.m_curWindows) && (delete oApp.SAPVB.Windows) || (this.m_curWindows = s ? s : this.m_curWindows);
		} else {
			this.m_bWindowsDirty = false;
		}

		// remove unmodified scenes...............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.Scenes) && (s = JSON.stringify(t)) && (s == this.m_curScenes) && (delete oApp.SAPVB.Scenes) || (this.m_curScenes = s ? s : this.m_curScenes);

		// remove unmodified actions..............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.Actions) && (s = JSON.stringify(t)) && (s == this.m_curActions) && (delete oApp.SAPVB.Actions) || (this.m_curActions = s ? s : this.m_curActions);

		// remove unmodified datatypes............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.DataTypes) && (s = JSON.stringify(t)) && (s == this.m_curDataTypes) && (delete oApp.SAPVB.DataTypes) || (this.m_curDataTypes = s ? s : this.m_curDataTypes);

		// remove unmodified data.................................................//
		if (!this.mbForceDataUpdate) {
			s = null;
			(t = oApp) && (t = t.SAPVB) && (t = t.Data) && (s = JSON.stringify(t)) && (s == this.m_curData) && (delete oApp.SAPVB.Data) || (this.m_curData = s ? s : this.m_curData);
		} else {
			this.mbForceDataUpdate = false; // reset
		}

		return oApp;
	};

	// helper functions..........................................................//

	GeoMap.prototype.getAggregatorContainer = function(id) {
		if (id !== "MainScene") { // don't search for preserved ids
			// find the right aggregation instance to delegate the event..............//
			var aCluster = this.getClusters();
			for (var nL = 0; nL < aCluster.length; ++nL) {
				if (aCluster[nL].sId === id) {
					return aCluster[nL];
				}
			}
			var aVO = this.getVos();
			for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
				if (aVO[nJ].sId === id) {
					return aVO[nJ];
				}
			}
			var aGJL = this.getGeoJsonLayers();
			for (var nI = 0; nI < aGJL.length; ++nI) {
				if (id.indexOf(aGJL[nI].sId) === 0) { // id starts with sId
					return aGJL[nI];
				}
			}
			var aFC = this.getFeatureCollections();
			for (var nK = 0; nK < aFC.length; ++nK) {
				if (id.indexOf(aFC[nK].sId) === 0) { // id starts with sId
					return aFC[nK];
				}
			}
			var legend = this.getLegend();
			if (legend && legend.sId == id) {
				return legend;
			}
		}
		return null;
	};

	GeoMap.prototype.update = function() {
		// get the frame application..............................................//
		var oApp = jQuery.extend(true, {}, GeoMap.oBaseApp);

		// update the resource data...............................................//
		if (this.m_bResourcesDirty) {
			this.updateResourceData(oApp);
		}
		var oClusterRefVOs = {};
		if (this.m_bClusteringDirty || this.m_bClustersDirty) {
			this.updateClustering(oApp, oClusterRefVOs);
			this.mCurClusterRefVOs = jQuery.extend(true, {}, oClusterRefVOs); // deep copy!
		} else {
			oClusterRefVOs = jQuery.extend(true, {}, this.mCurClusterRefVOs); // deep copy!
		}
		// update the scene data.....................................................//
		if (this.m_bSceneDirty) {
			this.updateScene(oApp, oClusterRefVOs);
		}
		// new resources may have been added ( e.g. images for vo ) .................//
		if (this.m_bResourcesDirty) {
			this.updateResourceData(oApp);
		}
		if (this.m_bMapConfigurationDirty) {
			this.updateMapConfiguration(oApp);
		}

		this.updateMapProviders(oApp);
		this.updateMapLayerStacks(oApp);
		this.updateWindows(oApp);

		// add non VO related actions
		// legend events
		var legend;
		if ((legend = this.getLegend())) {
			if (oApp.SAPVB.Actions) {
				Array.prototype.push.apply(oApp.SAPVB.Actions.Set.Action, legend.getActionArray());
			}
		// } else {
		// var saAction = [];
		// Array.prototype.push.apply( saAction, legend.getActionArray() );
		// ((oApp.SAPVB.Actions = {}).Set = {}).Action = saAction;
		}

		if (this.m_bActionsDirty && !oApp.SAPVB.Actions) {
			this.m_bActionsDirty = false;
			((oApp.SAPVB.Actions = {}).Set = {}).Action = [];
		}

		if (oApp.SAPVB.Actions) {
			this.m_bActionsDirty = false;
			Array.prototype.push.apply(oApp.SAPVB.Actions.Set.Action, this.getActionArray());
		}
		// remove unnecessary sections and return application JSON...................//
		return this.minimizeApp(oApp);
	};

	GeoMap.prototype.updateMapProviders = function(oApp) {
		if (!this.m_bMapProvidersDirty) {
			delete oApp.SAPVB.MapProviders; // remove MapProviders from app
		}
		this.m_bMapProvidersDirty = false;
	};

	GeoMap.prototype.updateMapLayerStacks = function(oApp) {
		if (!this.m_bMapLayerStacksDirty) {
			delete oApp.SAPVB.MapLayerStacks; // remove MapLayerStacks from app
		}
		this.m_bMapLayerStacksDirty = false;
	};

	GeoMap.prototype.updateWindows = function(oApp) {
		oApp.SAPVB.Windows = this.getWindowsObject();
	};

	GeoMap.prototype.updateScene = function(oApp, oClusterRefVOs) {
		var saVO = []; // visual object array in the scene..................//
		var saData = (oClusterRefVOs.Data) ? oClusterRefVOs.Data : []; // data array in the data section....................//
		var saRemoveData = [];
		var saType = []; // type array in the type section ...................//
		var saAction = (oClusterRefVOs.Actions) ? oClusterRefVOs.Actions : []; // actions...........................................//

		// Insert GeoJSON layers and Feature Collection before VOs to get them rendered behind the VOs
		var bUseDelta = !this.m_bFCsDirty && !this.m_bGJLsDirty && !this.m_bVosDirty;
		this.updateGJLData(saVO, saData, saRemoveData, saType, saAction, bUseDelta);
		this.updateFCData(saVO, saData, saRemoveData, saType, saAction, bUseDelta);
		this.updateVOData(saVO, saData, saRemoveData, saType, saAction, bUseDelta);

		// Insert Cluster Viz VO definitions last to make sure they get painted on top
		if (oClusterRefVOs.VO) {
			saVO = saVO.concat(oClusterRefVOs.VO);
		}

		if (this.m_bLegendDirty) {
			// process legend.........................................................//
			var oLegend = this.getLegend();
			if (oLegend) {
				saRemoveData.push({
					name: oLegend.sId,
					type: "N"
				});

				saData.push(oLegend.getDataObject());
				saType.push(oLegend.getTypeObject());
			}
		}

		// check if an update of the scene is necessary...........................//
		// failsafe but data has to be created first..............................//
		var _saVO = JSON.stringify(saVO);
		var bMetaUpdate = true; // might be reset in else part
		if (!this.m_saVO) { // no prior VO data -> initial scene definition
			((((oApp.SAPVB.Scenes = {}).Set = {}).SceneGeo = {
				"id": "MainScene",
				"refMapLayerStack": this.getRefMapLayerStack(),
				"initialZoom": this.getProperty("zoomlevel"),
				"initialStartPosition": this.getProperty("centerPosition"),
				"scaleVisible": this.getScaleVisible().toString(),
				"navControlVisible": this.getNavcontrolVisible().toString(),
				"rectSelect": this.getRectangularSelection().toString(),
				"lassoSelect": this.getLassoSelection().toString(),
				"rectZoom": this.getRectZoom().toString(),
				"VisualFrame": this.getVisualFrame(),
				"NavigationDisablement": {
					"zoom": this.getDisableZoom().toString(),
					"move": this.getDisablePan().toString()
				},
				"ariaLabel": this.getAriaLabel()
			}).VO = saVO);
		} else if (this.m_bRefMapLayerStackDirty || !(this.m_saVO === _saVO)) {
			// prior VO data exists -> calculate delta and preserve scene
			(oApp.SAPVB.Scenes = this.getSceneVOdelta(JSON.parse(this.m_saVO), saVO));
			// bMetaUpdate = false;
		} else {
			bMetaUpdate = false;
		}
		this.m_saVO = _saVO;

		if (!this.isRendered() && oApp.SAPVB.Scenes && oApp.SAPVB.Scenes.Merge) {
			if (oApp.SAPVB.Scenes.Merge.SceneGeo.initialStartPosition !== this.getProperty("centerPosition")) {
				oApp.SAPVB.Scenes.Merge.SceneGeo.initialStartPosition = this.getProperty("centerPosition");
			}

			if (oApp.SAPVB.Scenes.Merge.SceneGeo.initialZoom !== this.getProperty("zoomlevel")) {
				oApp.SAPVB.Scenes.Merge.SceneGeo.initialZoom = this.getProperty("zoomlevel");
			}
		}

		// now we should have data, data types and instance information...........//
		// merge it into the app..................................................//
		var nI;

		if (this.bDataDeltaUpdate) {
			oApp.SAPVB.Data = {};
			oApp.SAPVB.Data.Set = [];
			for (nI = 0; nI < saData.length; ++nI) {
				oApp.SAPVB.Data.Set.push({
					name: saData[nI].name,
					type: "N",
					N: saData[nI]
				});
			}
		} else {
			oApp.SAPVB.Data = {};
			if (saRemoveData.length) {
				oApp.SAPVB.Data.Remove = [];
				for (nI = 0; nI < saRemoveData.length; ++nI) {
					oApp.SAPVB.Data.Remove.push(saRemoveData[nI]);
				}
			}
			oApp.SAPVB.Data.Set = [];
			for (nI = 0; nI < saData.length; ++nI) {
				oApp.SAPVB.Data.Set.push({
					name: saData[nI].name,
					type: "N",
					N: saData[nI]
				});
			}

		}

		if (bMetaUpdate) {
			(((oApp.SAPVB.DataTypes = {}).Set = {}).N = saType);
		}
		// Update Actions always, since handler could be added or removed at any time!
		(((oApp.SAPVB.Actions = {}).Set = {}).Action = saAction);

		// reset dirty states
		this.resetDirtyStates();
	};

	GeoMap.prototype.resetDirtyStates = function() {
		this.m_bRefMapLayerStackDirty = this.m_bSceneDirty = this.m_bFCsDirty = this.m_bGJLsDirty = this.m_bVosDirty = false;
	};

	GeoMap.prototype.updateMapConfiguration = function(oApp) {
		if (!this.m_bMapConfigurationDirty) {
			return;
		}

		// reset dirty state......................................................//
		this.m_bMapConfigurationDirty = false;
		var aConfig = this.getMapConfiguration();

		// set the map providers
		if (aConfig) {
			oApp.SAPVB.MapProviders = {
				Set: {
					MapProvider: aConfig.MapProvider
				}
			};
			oApp.SAPVB.MapLayerStacks = {
				Set: {
					MapLayerStack: aConfig.MapLayerStacks
				}
			};
		}

		return;
	};

	GeoMap.prototype.updateClustering = function(oApp, oClusterRefVOs) {
		var aClusters = this.getClusters();
		var oClustering = null;

		if (aClusters.length) {
			oClustering = {
				Cluster: []
			};
			oClusterRefVOs.VO = [];
			oClusterRefVOs.Actions = [];
			oClusterRefVOs.Data = [];
			for (var nI = 0, oCluster; nI < aClusters.length; ++nI) {
				oCluster = aClusters[nI];
				// add ref VO for display
				oClusterRefVOs.VO.push(oCluster.getTemplateObject());
				// Note: Do not add a DataType or Data for the VizVO, it is not needed.
				// DataTypes array does not support delta logic and an update destroys the relation to the Data!
				oClusterRefVOs.Actions = oClusterRefVOs.Actions.concat(oCluster.getActionArray());
				oClustering.Cluster.push(oCluster.getClusterDefinition());
			}
		} else if (this.m_bClusteringDirty) {
			// cluster aggregation empty -> check for clustering prperty (to be removed later)
			oClustering = this.getClustering();
		}
		if (oClustering) {
			oApp.SAPVB.Clustering = {
				Set: oClustering
			};
		} else if (this.mCurClusterRefVOs && this.mCurClusterRefVOs.VO && this.mCurClusterRefVOs.VO.length > 0) {
			// BCP: 1870022364 - Turns out that there may be an attempt to switch off clustering
			// even when was no clustering.
			// there was clustering before and now it is switched off
			oApp.SAPVB.Clustering = {
				Set: []
			};
		}
		this.m_bClusteringDirty = this.m_bClustersDirty = false;
	};

	GeoMap.prototype.updateResourceData = function(oApp) {
		if (!this.m_bResourcesDirty) {
			return;
		}

		// reset dirty state......................................................//
		this.m_bResourcesDirty = false;
		var aRes = this.getResources();

		((oApp.SAPVB.Resources = {}).Set = {}).Resource = [];

		// update function for delayed loaded resources...........................//
		function ResUpdate() {
			var oApp = this.update();
			this.load(oApp);
		}

		// image load callback..............................................//
		var funcLoaded = function(res) {
			if (!res.m_Img) {   // check if given resource is still alive and valid
				return;
			}
			if (!res.m_Img.complete) { //skip odd onload event from IE where image is not loaded yet
				return;
			}

			var canvas = document.createElement('canvas');
			canvas.width = res.m_Img.width;
			canvas.height = res.m_Img.height;
			var context = canvas.getContext('2d');
			context.drawImage(res.m_Img, 0, 0);
			res.mProperties.value = canvas.toDataURL();
			delete res.m_Img;
			// mark resources as dirty and apply them again..................//
			this.m_bResourcesDirty = true;
			window.setTimeout(ResUpdate.bind(this), 10);
		};

		// read the resources and update them.....................................//
		for (var nJ = 0, len = aRes.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var res = aRes[nJ];

			// load the data from an url, when done we replace the value...........//
			if (!res.mProperties.value && res.mProperties.src) {
				var img = document.createElement('img');
				img.crossOrigin = 'anonymous'; //enable CORS images rendered on canvas
				res.m_Img = img;
				img.onload = funcLoaded.bind(this, res);
				// we set the data url..............................................//
				img.src = res.mProperties.src;
			} else {
				// when a name is specified, use it. In all other cases use id.........//
				oApp.SAPVB.Resources.Set.Resource.push({
					"name": (res.mProperties.name ? res.mProperties.name : res.sId),
					"value": res.mProperties.value
				});
			}
		}

		return;
	};

	GeoMap.prototype.updateVOData = function(saVO, saData, saRemoveData, saType, saAction, bUseDelta) {
		var aVO = this.getVos();
		// process visual objects.................................................//
		// we collect the different arrays from the vo instances...................//

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oVO = aVO[nJ];
			var aDiff = oVO.aDiff;
			saVO.push(oVO.getTemplateObject());
			saType.push(oVO.getTypeObject());
			Array.prototype.push.apply(saAction, oVO.getActionArray());
			if (aDiff && aDiff.length && oVO.m_bAggChange && bUseDelta) {
				var oDelta = oVO.getDataDeltaObject(aDiff);
				if (oDelta.oData && oDelta.oData.E && oDelta.oData.E.length) {
					saData.push(oDelta.oData);
				}
				if (oDelta.aRemoveData) {
					for (var nK = 0; nK < oDelta.aRemoveData.length; ++nK) {
						saRemoveData.push(oDelta.aRemoveData[nK]);
					}
				}
			} else if (!bUseDelta || oVO.m_bAggRenew) {
				// renew all data
				saRemoveData.push(oVO.getDataRemoveObject());
				if (oVO instanceof sap.ui.vbm.VoAggregation) {
					oVO.resetIndices();
				}
				saData.push(oVO.getDataObject());
			}
			if (oVO instanceof sap.ui.vbm.VoAggregation) {
				oVO.aDiff = [];
				oVO.updateIdxArray();
				oVO.m_bAggRenew = oVO.m_bAggChange = false;
			}
		}

	};

	/*
	 * @private
	 */
	GeoMap.prototype.updateGJLData = function(saVO, saData, saRemoveData, saType, saAction, bUseDelta) {
		var aLayers = this.getGeoJsonLayers();

		// process feature collections.................................................//
		// we collect the different arrays from the fc instances...................//

		for (var nJ = 0, len = aLayers.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oLayer = aLayers[nJ];

			// add the control objects description..................................//
			// Note: A feature collection may return multiple VOs!
			Array.prototype.push.apply(saVO, oLayer.getTemplateObjects());
			Array.prototype.push.apply(saType, oLayer.getTypeObjects());
			Array.prototype.push.apply(saAction, oLayer.getActionArray());
			// add the control data
			Array.prototype.push.apply(saRemoveData, oLayer.getDataRemoveObjects());
			Array.prototype.push.apply(saData, oLayer.getDataObjects());
		}
	};

	/*
	 * @private
	 */
	GeoMap.prototype.updateFCData = function(saVO, saData, saRemoveData, saType, saAction, bUseDelta) {
		var aFC = this.getFeatureCollections();

		// process feature collections.................................................//
		// we collect the different arrays from the fc instances...................//

		for (var nJ = 0, len = aFC.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oFC = aFC[nJ];

			// add the control objects description..................................//
			// Note: A feature collection may return multiple VOs!
			Array.prototype.push.apply(saVO, oFC.getTemplateObjects());
			Array.prototype.push.apply(saType, oFC.getTypeObjects());
			Array.prototype.push.apply(saAction, oFC.getActionArray());
			// add the control data
			Array.prototype.push.apply(saRemoveData, oFC.getDataRemoveObjects());
			Array.prototype.push.apply(saData, oFC.getDataObjects());
		}
	};

	GeoMap.prototype.invalidate = function(oSource) {
		// invalidate scene in any case to trigger updateScene
		this.m_bSceneDirty = true;
		// set the vos dirty state when the aggregations have changed
		if (oSource instanceof sap.ui.vbm.VoAggregation) {
			this.m_bWindowsDirty = true;
			// if invalidate results from internal data change we allow delta update for data
			this.bDataDeltaUpdate = this.bHandleChangedDataActive;
		} else if (oSource instanceof sap.ui.vbm.Legend) {
			this.m_bLegendDirty = true;
		} else if (oSource instanceof sap.ui.vbm.GeoJsonLayer) {
			if (oSource instanceof sap.ui.vbm.FeatureCollection) {
				this.m_bFCsDirty = true;
			} else {
				this.m_bGJLsDirty = true;
			}
		} else if (oSource instanceof sap.ui.vbm.ClusterBase) {
			this.m_bClustersDirty = true;
		}

		sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
	};

	GeoMap.prototype.openContextMenu = function(typ, inst, menu) {
		if (menu && menu.vbi_data && menu.vbi_data.VBIName == "DynContextMenu") {
			if (!this.mVBIContext.m_Menus) {
				this.mVBIContext.m_Menus = new window.VBI.Menus();
			}
			this.mVBIContext.m_Menus.m_menus.push(menu);
			var oAutomation = {

				"SAPVB": {
					"version": "2.0",
					"Automation": {
						"Call": {
							"earliest": "0",
							"handler": "CONTEXTMENUHANDLER",
							"instance": inst.sId,
							"name": "SHOW",
							"object": typ,
							"refID": "CTM",
							"Param": [
								{
									"name": "x",
									"#": inst.mClickPos[0]
								}, {
									"name": "y",
									"#": inst.mClickPos[1]
								}, {
									"name": "scene",
									"#": "MainScene"
								}
							]
						}
					}
				}
			};
			this.loadHtml(oAutomation);
		}
	};

	GeoMap.prototype.addResourceIfNeeded = function(resource) {
		var aRes = this.getResources();
		for (var nJ = 0, len = aRes.length; nJ < len; ++nJ) {
			if (aRes[nJ].getName() === resource) {
				// resource allready loaded
				return;
			}
		}
		if (GeoMap.bEncodedSpotImagesAvailable == false) {
			var aPathImgJSON = sap.ui.resource("sap.ui.vbm", "themes/base/img/Pin_images.json");
			var oResponse = jQuery.sap.syncGetJSON(aPathImgJSON);
			GeoMap.bEncodedSpotImageData = oResponse.data;
			GeoMap.bEncodedSpotImagesAvailable = true;
		}
		if (GeoMap.bEncodedSpotImageData) {
			for ( var key in GeoMap.bEncodedSpotImageData) {
				if (resource == key) {
					this.addResource(new sap.ui.vbm.Resource({
						name: key,
						value: GeoMap.bEncodedSpotImageData[key]
					}));
				}
			}
		} else {
			// resource not found
			this.addResource(new sap.ui.vbm.Resource({
				name: resource,
				src: sap.ui.resource("sap.ui.vbm", "themes/base/img/" + resource)
			}));
		}
		this.m_bResourcesDirty = true;
	};

	GeoMap.prototype.handleChangedData = function(aNodes) {
		try {
			this.bHandleChangedDataActive = true;
			if (aNodes && aNodes.length) {
				for (var nI = 0, oNode, oCont; nI < aNodes.length; ++nI) {
					oNode = aNodes[nI];
					oCont = this.getAggregatorContainer(oNode.name);
					if (oCont) {
						oCont.handleChangedData(oNode.E);
					}
				}
			}
			this.bHandleChangedDataActive = false;
		} catch (exc) {
			this.bHandleChangedDataActive = false;
			throw exc;
		}

	};

	GeoMap.prototype.getChildByKey = function(oChild, sKey) {
		var cont, oChildInst = null;
		if ((cont = oChild.getParent())) {
			if (cont instanceof sap.ui.vbm.VoAggregation) {
				if ((this.getAggregatorContainer(cont.getId()))) {
					oChildInst = cont.findInstanceByKey(sKey);
				}
			} else {
				oChildInst = cont.findInstance(sKey);
			}
		}
		return oChildInst;
	};

	/**
	 * Zoom to Areas by Id.
	 *
	 * @param {string[]} ui5AreaIds is an Array of areas that we want to zoom to.
	 * @param {float} correlationFactor is the correction factor, if correlationFactor is set to 1.0 the bounding box points are exactly on the visible boder of the new area
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 */
	GeoMap.prototype.zoomToAreasById = function(ui5AreaIds, correlationFactor) {
		//if the correlation is undefined use hardcoded value
		if (correlationFactor === undefined || correlationFactor === null) {
			correlationFactor = 0.9999;
		}

		ui5AreaIds = [].concat(ui5AreaIds);

		//Get all Vos and filter to create new array with elements that are instance of sap.ui.vbm.Areas
		var areaAggregations = this.getVos().filter(function(vo) {
			return vo instanceof sap.ui.vbm.Areas;
		});

		//Get Area items of Areas
		var areas = areaAggregations.reduce(function(previous, current) {
			return previous.concat(current.getItems());
		}, []);

		//get uniqueId of each area if it exists in ui5AreaIds
		var areaUniqueIds = areas.map(function(area) {
			if (ui5AreaIds.indexOf(area.getId()) !== -1) {
				return area.UniqueId;
			} else {
				return null;
			}
		});

		areaUniqueIds = areaUniqueIds.filter(function(areaUniqueId) {
			return areaUniqueId ? areaUniqueId : false;
		});

		//Call zoomTo from scene with array of areaUniqueIds
		var scene = this.mVBIContext.GetMainScene();
		scene.ZoomTo(areaUniqueIds, correlationFactor);

		return this;
	};


	return GeoMap;

}, /* bExport= */true);