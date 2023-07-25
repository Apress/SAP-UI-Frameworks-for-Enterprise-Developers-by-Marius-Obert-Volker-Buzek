/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.SceneOrientationToolGizmo
sap.ui.define([
	"./Gizmo",
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"../thirdparty/three",
	"./SceneOrientationToolGizmoRenderer",
	"../getResourceBundle",
	"./PredefinedView",
	"./AxisColours"
], function(
	Gizmo,
	MenuButton,
	Menu,
	MenuItem,
	THREE,
	SceneOrientationToolGizmoRenderer,
	getResourceBundle,
	PredefinedView,
	AxisColours
) {
	"use strict";

	sap.ui.require("sap.m.Menu");

	/**
	 * Constructor for a new SceneOrientationToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides drop-down list of predefined camera positions
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.SceneOrientationToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SceneOrientationToolGizmo = Gizmo.extend("sap.ui.vk.tools.SceneOrientationToolGizmo", /** @lends sap.ui.vk.tools.SceneOrientationToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	function createGizmoAxis(dir, color) {
		var arrowLength = 64,
			lineRadius = 0.5,
			coneHeight = 15,
			coneRadius = 3,
			boxSize = 29,
			boxCloneSize = 30;
		dir.multiplyScalar(1 / 80);
		var dirX = new THREE.Vector3(dir.y, dir.z, dir.x),
			dirY = new THREE.Vector3(dir.z, dir.x, dir.y);
		var arrowMaterial = new THREE.MeshLambertMaterial({ color: color }),
			boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 }), // white
			boxCloneMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 }); // black
		var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
		var m = new THREE.Matrix4().makeBasis(dirX, dir, dirY).setPosition(dir.clone().multiplyScalar((arrowLength - coneHeight) * 0.5));
		lineGeometry.applyMatrix4(m);
		var axisLine = new THREE.Mesh(lineGeometry, arrowMaterial);

		var coneGeometry = new THREE.CylinderGeometry(0, coneRadius, coneHeight, 12, 1);
		m.setPosition(dir.clone().multiplyScalar(arrowLength - coneHeight * 0.5));
		coneGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(coneGeometry, arrowMaterial));

		var boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxSize, 4);
		m.makeBasis(dir, dirY, dirX).setPosition(dirY.clone().multiplyScalar(0.5).add(dir).multiplyScalar(boxSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxMaterial));

		boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxSize, 4);
		m.setPosition(dirY.clone().multiplyScalar(0.5).add(dir).add(dirX).multiplyScalar(boxSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxMaterial));

		boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxSize, 4);
		m.makeBasis(dirY, dirX, dir).setPosition(dirX.clone().multiplyScalar(0.5).add(dir).multiplyScalar(boxSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxMaterial));

		// boxClone
		boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxCloneSize, 4);
		m.makeBasis(dir, dirY, dirX).setPosition(dirY.clone().multiplyScalar(0.5).add(dir).multiplyScalar(boxCloneSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxCloneMaterial));

		boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxCloneSize, 4);
		m.setPosition(dirY.clone().multiplyScalar(0.5).add(dir).add(dirX).multiplyScalar(boxCloneSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxCloneMaterial));

		boxEdgeGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, boxCloneSize, 4);
		m.makeBasis(dirY, dirX, dir).setPosition(dirX.clone().multiplyScalar(0.5).add(dir).multiplyScalar(boxCloneSize));
		boxEdgeGeometry.applyMatrix4(m);
		axisLine.add(new THREE.Mesh(boxEdgeGeometry, boxCloneMaterial));

		return axisLine;
	}

	SceneOrientationToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}
		this._enableInitialView = true;
		this._viewport = null;
		this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(1, 1);
		this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		this._scene = new THREE.Scene();
		var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		light.position.set(1, 3, 2);
		this._scene.add(light);
		this._scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
		this._scene.add(createGizmoAxis(new THREE.Vector3(1, 0, 0), AxisColours.x));
		this._scene.add(createGizmoAxis(new THREE.Vector3(0, 1, 0), AxisColours.y));
		this._scene.add(createGizmoAxis(new THREE.Vector3(0, 0, 1), AxisColours.z));
		this._scene.traverse(function(obj3D) {
			obj3D.matrixAutoUpdate = false;
		});
		this._axisTitles = this._createAxisTitles(32, 16);
		this._scene.add(this._axisTitles);

		var views = [
			PredefinedView.Initial,
			PredefinedView.Front,
			PredefinedView.Back,
			PredefinedView.Left,
			PredefinedView.Right,
			PredefinedView.Top,
			PredefinedView.Bottom
		];

		this._menu = new Menu({
			items: [
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_INITIAL") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_FRONT") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_BACK") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_LEFT") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_RIGHT") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_TOP") }),
				new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_BOTTOM") })
			]
		}).attachItemSelected(function(event) {
			var item = event.getParameters("item").item;
			var index = event.getSource().indexOfItem(item);
			this.setView(views[index], 1000);
		}, this);

		this._button = new MenuButton({
			icon: "sap-icon://vk-icons/predefined-views",
			tooltip: getResourceBundle().getText("PREDEFINED_VIEW_MENUBUTTONTOOLTIP"),
			menu: this._menu
		}).addStyleClass("sapUiVizKitSceneOrientationGizmoButton").addStyleClass("sapUiSizeCompact");
	};

	SceneOrientationToolGizmo.prototype.setView = function(view, milliseconds) {
		var quaternion;
		switch (view) {
			case PredefinedView.Initial:
				quaternion = null;
				break;
			case PredefinedView.Front:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
				break;
			case PredefinedView.Back:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
				break;
			case PredefinedView.Left:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
				break;
			case PredefinedView.Right:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
				break;
			case PredefinedView.Top:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
				break;
			case PredefinedView.Bottom:
				quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
				break;
			default:
				return this;
		}

		this._viewport._viewportGestureHandler.setView(quaternion, milliseconds || 0);
		return this;
	};

	SceneOrientationToolGizmo.prototype.setEnableInitialView = function(value) {
		this._enableInitialView = value;
		var items = this._menu.getItems();
		items[0].setVisible(value);
		items[1].setStartsSection(value);
	};

	SceneOrientationToolGizmo.prototype.render = function(viewport) {
		this._viewport = viewport;
		this._camera.quaternion.copy(viewport.getCamera().getCameraRef().quaternion);
		this._camera.position.set(0, 0, 1).applyQuaternion(this._camera.quaternion);
		var width = this._renderer.getSize(new THREE.Vector2()).x;
		this._updateAxisTitles(this._axisTitles, this._scene, this._camera, width * 0.45, 2 / width);
		this._renderer.render(this._scene, this._camera);
	};

	SceneOrientationToolGizmo.prototype.onBeforeRendering = function() {
	};

	SceneOrientationToolGizmo.prototype.onAfterRendering = function() {
		var domRef = this.getDomRef();
		this._renderer.setSize(domRef.clientWidth, domRef.clientHeight);
		// domRef.insertBefore(this._renderer.domElement, this._button.getDomRef());
		domRef.appendChild(this._renderer.domElement);
		// domRef.style.display = this._viewport ? "block" : "none";
	};

	SceneOrientationToolGizmo.prototype.exit = function() {
		if (this._axisTitles) {
			if (this._scene) {
				this._scene.remove(this._axisTitles);
			}
			this._axisTitles = null;
		}

		if (this._camera) {
			if (this._scene) {
				this._scene.remove(this._camera);
			}
			this._camera = null;
		}

		this._scene = null;

		Gizmo.prototype.exit.call(this);
	};

	return SceneOrientationToolGizmo;


});
