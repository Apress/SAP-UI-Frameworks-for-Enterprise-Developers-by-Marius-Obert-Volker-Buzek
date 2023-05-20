/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/library","sap/ui/integration/widgets/Card","sap/ui/integration/util/ManifestResolver"],function(t,e,i){"use strict";var r=t.CardDataMode;var n=e.extend("sap.ui.integration.util.SkeletonCard",{metadata:{library:"sap.ui.integration"}});n.prototype.init=function(){e.prototype.init.apply(this,arguments);this.setDataMode(r.Active)};n.prototype.resolveManifest=function(){return i.resolveCard(this)};n.prototype.isSkeleton=function(){return true};n.prototype.refresh=function(){e.prototype.refresh.apply(this);this.startManifestProcessing()};n.prototype._createCard=function(t){return new n(t)};return n});