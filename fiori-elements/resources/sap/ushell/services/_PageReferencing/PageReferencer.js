// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/deepExtend","sap/ui/thirdparty/jquery"],function(n,e){"use strict";var t={};function i(n,t){var i={};n.forEach(function(n){n.viz.forEach(function(n){var e=n.target;if(e&&!i[e]){i[e]=t.resolveHashFragment(e)}})});return new Promise(function(n,t){var r=[];Object.keys(i).forEach(function(n){r.push(i[n])});e.when.apply(null,r).then(function(){var e=arguments;Object.keys(i).forEach(function(n,t){i[n]=e[t].inboundPermanentKey});n(i)},t)})}function r(n,e){return{inboundPermanentKey:n[e.target],vizId:e.tileCatalogId}}function a(n,e){return{id:e.id,title:e.title,visualizations:e.viz.map(r.bind(null,n))}}t.createReferencePage=function(e,t){t=t||[];return sap.ushell.Container.getServiceAsync("NavTargetResolution").then(i.bind(null,t)).then(function(i){var r=n({},e);r.sections=t.map(a.bind(null,i));return Promise.resolve(r)})};return t});