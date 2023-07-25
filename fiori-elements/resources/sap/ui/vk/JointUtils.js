/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./glMatrix"],function(e){"use strict";var n=e.mat4;var t=e.glMatrix.ARRAY_TYPE;var a={recalculateJoints:function(e,a,r){var i;if(r.length===16){i=r}else{i=new t(16);n.fromRotationTranslationScale(i,r.quaternion||[0,0,0,1],r.translation||[0,0,0],r.scale||[1,1,1])}var l=new t(16);n.invert(l,i);var o=new t(16);var s=[];e.forEach(function(e){if(!e.node||!e.parent){return}if(e.parent===a){n.multiply(o,l,e.node.matrixWorld.elements)}else if(e.node===a){n.invert(o,e.parent.matrixWorld.elements);n.multiply(o,o,i)}else{return}n.getTranslation(e.translation,o);n.getScaling(e.scale,o);n.scale(o,o,[1/e.scale[0],1/e.scale[1],1/e.scale[2]]);n.getRotation(e.quaternion,o);s.push(e)});return s}};return a});