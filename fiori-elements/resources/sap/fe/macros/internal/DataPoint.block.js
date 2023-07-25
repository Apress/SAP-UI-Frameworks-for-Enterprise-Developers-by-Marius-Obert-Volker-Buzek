/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase","sap/fe/core/buildingBlocks/BuildingBlockSupport","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper","sap/fe/core/helpers/TypeGuards","sap/fe/core/templating/CriticalityFormatters","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/PropertyHelper","sap/fe/core/templating/UIFormatters","sap/fe/macros/field/FieldTemplating","sap/fe/macros/internal/helpers/DataPointTemplating"],function(t,e,i,a,r,n,o,l,s,d,u,c,p){"use strict";var h,m,f,v,b,g,P,y,O,T,$,x,j;var V={};var M=p.getValueFormatted;var w=p.getHeaderRatingIndicatorText;var D=p.buildFieldBindingExpression;var z=p.buildExpressionForProgressIndicatorPercentValue;var S=p.buildExpressionForProgressIndicatorDisplayValue;var F=c.isUsedInNavigationWithQuickViewFacets;var E=c.getVisibleExpression;var I=c.getPropertyWithSemanticObject;var C=d.hasUnit;var B=d.hasCurrency;var k=s.getRelativePaths;var N=s.enhanceDataModelPath;var R=l.buildExpressionForCriticalityIcon;var L=l.buildExpressionForCriticalityColor;var A=o.isProperty;var Q=n.generate;var U=r.pathInModel;var _=r.notEqual;var H=r.getExpressionFromAnnotation;var q=r.formatResult;var G=r.compileExpression;var W=a.getInvolvedDataModelObjects;var J=a.convertMetaModelContext;var K=i.xml;var X=e.defineBuildingBlock;var Y=e.blockAttribute;function Z(t,e,i,a){if(!i)return;Object.defineProperty(t,e,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(a):void 0})}function tt(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function et(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;it(t,e)}function it(t,e){it=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,i){e.__proto__=i;return e};return it(t,e)}function at(t,e,i,a,r){var n={};Object.keys(a).forEach(function(t){n[t]=a[t]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,a){return a(t,e,i)||i},n);if(r&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(r):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(t,e,n);n=null}return n}function rt(t,e){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let nt=(h=X({name:"DataPoint",namespace:"sap.fe.macros.internal"}),m=Y({type:"string"}),f=Y({type:"sap.ui.model.Context",required:true}),v=Y({type:"string"}),b=Y({type:"object",validate:function(t){if(t!==null&&t!==void 0&&t.dataPointStyle&&!["","large"].includes(t===null||t===void 0?void 0:t.dataPointStyle)){throw new Error(`Allowed value ${t.dataPointStyle} for dataPointStyle does not match`)}if(t!==null&&t!==void 0&&t.displayMode&&!["Value","Description","ValueDescription","DescriptionValue"].includes(t===null||t===void 0?void 0:t.displayMode)){throw new Error(`Allowed value ${t.displayMode} for displayMode does not match`)}if(t!==null&&t!==void 0&&t.iconSize&&!["1rem","1.375rem","2rem"].includes(t===null||t===void 0?void 0:t.iconSize)){throw new Error(`Allowed value ${t.iconSize} for iconSize does not match`)}if(t!==null&&t!==void 0&&t.measureDisplayMode&&!["Hidden","ReadOnly"].includes(t===null||t===void 0?void 0:t.measureDisplayMode)){throw new Error(`Allowed value ${t.measureDisplayMode} for measureDisplayMode does not match`)}return t}}),g=Y({type:"sap.ui.model.Context",required:true,expectedTypes:["EntitySet","NavigationProperty","EntityType","Singleton"]}),h(P=(y=function(t){et(e,t);e.getTemplatingObjects=function t(e){var i,a;const r=W(e.metaPath,e.contextPath);let n;e.visible=E(r);if(r!==null&&r!==void 0&&(i=r.targetObject)!==null&&i!==void 0&&(a=i.Value)!==null&&a!==void 0&&a.path){n=N(r,r.targetObject.Value.path)}const o=J(e.metaPath);return{dataModelPath:r,valueDataModelPath:n,dataPointConverted:o}};e.getDataPointVisualization=function t(i){const{dataModelPath:a,valueDataModelPath:r,dataPointConverted:n}=e.getTemplatingObjects(i);if((n===null||n===void 0?void 0:n.Visualization)==="UI.VisualizationType/Rating"){i.visualization="Rating";return i}if((n===null||n===void 0?void 0:n.Visualization)==="UI.VisualizationType/Progress"){i.visualization="Progress";return i}const o=r&&r.targetObject;i.hasQuickView=o&&F(a,o);if(I(r)){i.hasQuickView=true}if(!i.hasQuickView){if(A(o)&&(C(o)||B(o))){i.visualization="ObjectNumber";return i}}i.visualization="ObjectStatus";return i};function e(i){var a;i.hasQuickView=false;a=t.call(this,e.getDataPointVisualization(i))||this;Z(a,"idPrefix",O,tt(a));Z(a,"metaPath",T,tt(a));Z(a,"ariaLabelledBy",$,tt(a));Z(a,"formatOptions",x,tt(a));Z(a,"contextPath",j,tt(a));return a}V=e;var i=e.prototype;i.getRatingIndicatorTemplate=function t(){var i;const{dataModelPath:a,valueDataModelPath:r,dataPointConverted:n}=e.getTemplatingObjects(this);const o=a.targetObject;const l=this.getTargetValueBinding();const s=(o===null||o===void 0?void 0:o.Value)||"";const d=s===null||s===void 0?void 0:(i=s.$target)===null||i===void 0?void 0:i.type;let u;if(d==="Edm.Decimal"&&o.ValueFormat){if(o.ValueFormat.NumberOfFractionalDigits){u=o.ValueFormat.NumberOfFractionalDigits}}const c=M(r,s,d,u);const p=w(this.metaPath,o);let h="";let m="";const f=G(q([U("T_HEADER_RATING_INDICATOR_FOOTER","sap.fe.i18n"),H(n.Value,k(a)),n.TargetValue?H(n.TargetValue,k(a)):"5"],"MESSAGE"));if(this.formatOptions.showLabels??false){h=K`<Label xmlns="sap.m"
					${this.attr("text",p)}
					${this.attr("visible",o.SampleSize||o.Description?true:false)}
				/>`;m=K`<Label
			xmlns="sap.m"
			core:require="{MESSAGE: 'sap/base/strings/formatMessage' }"
			${this.attr("text",f)}
			visible="true" />`}return K`
		${h}
		<RatingIndicator
		xmlns="sap.m"

		${this.attr("id",this.idPrefix?Q([this.idPrefix,"RatingIndicator-Field-display"]):undefined)}
		${this.attr("maxValue",l)}
		${this.attr("value",c)}
		${this.attr("tooltip",this.getTooltipValue())}
		${this.attr("iconSize",this.formatOptions.iconSize)}
		${this.attr("class",this.formatOptions.showLabels??false?"sapUiTinyMarginTopBottom":undefined)}
		editable="false"
	/>
	${m}`};i.getProgressIndicatorTemplate=function t(){var i;const{dataModelPath:a,valueDataModelPath:r,dataPointConverted:n}=e.getTemplatingObjects(this);const o=L(n,a);const l=S(a);const s=z(a);const d=a.targetObject;let u="";let c="";if((this===null||this===void 0?void 0:(i=this.formatOptions)===null||i===void 0?void 0:i.showLabels)??false){var p,h,m;u=K`<Label
				xmlns="sap.m"
				${this.attr("text",d===null||d===void 0?void 0:d.Description)}
				${this.attr("visible",!!(d!==null&&d!==void 0&&d.Description))}
			/>`;const t=H(r===null||r===void 0?void 0:(p=r.targetObject)===null||p===void 0?void 0:(h=p.annotations)===null||h===void 0?void 0:(m=h.Common)===null||m===void 0?void 0:m.Label);c=K`<Label
				xmlns="sap.m"
				${this.attr("text",G(t))}
				${this.attr("visible",!!G(_(undefined,t)))}
			/>`}return K`
		${u}
			<ProgressIndicator
				xmlns="sap.m"
				${this.attr("id",this.idPrefix?Q([this.idPrefix,"ProgressIndicator-Field-display"]):undefined)}
				${this.attr("displayValue",l)}
				${this.attr("percentValue",s)}
				${this.attr("state",o)}
				${this.attr("tooltip",this.getTooltipValue())}
			/>
			${c}`};i.getObjectNumberCommonTemplate=function t(){const{dataModelPath:i,valueDataModelPath:a,dataPointConverted:r}=e.getTemplatingObjects(this);const n=L(r,i);const o=this.formatOptions.showEmptyIndicator??false?"On":undefined;const l=D(i,this.formatOptions,true);const s=this.formatOptions.measureDisplayMode==="Hidden"?undefined:G(u.getBindingForUnitOrCurrency(a));return K`<ObjectNumber
			xmlns="sap.m"
			${this.attr("id",this.idPrefix?Q([this.idPrefix,"ObjectNumber-Field-display"]):undefined)}
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			${this.attr("state",n)}
			${this.attr("number",l)}
			${this.attr("unit",s)}
			${this.attr("visible",this.visible)}
			emphasized="false"
			${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectNumberLarge":undefined)}
			${this.attr("tooltip",this.getTooltipValue())}
			${this.attr("emptyIndicatorMode",o)}
		/>`};i.getObjectNumberTemplate=function t(){var i;const{valueDataModelPath:a}=e.getTemplatingObjects(this);if((this===null||this===void 0?void 0:(i=this.formatOptions)===null||i===void 0?void 0:i.isAnalytics)??false){return K`
				<control:ConditionalWrapper
					xmlns:control="sap.fe.macros.controls"
					${this.attr("condition",u.hasValidAnalyticalCurrencyOrUnit(a))}
				>
					<control:contentTrue>
						${this.getObjectNumberCommonTemplate()}
					</control:contentTrue>
					<control:contentFalse>
						<ObjectNumber
							xmlns="sap.m"
							${this.attr("id",this.idPrefix?Q([this.idPrefix,"ObjectNumber-Field-display-differentUnit"]):undefined)}
							number="*"
							unit=""
							${this.attr("visible",this.visible)}
							emphasized="false"
							${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectNumberLarge":undefined)}
						/>
					</control:contentFalse>
				</control:ConditionalWrapper>`}else{return K`${this.getObjectNumberCommonTemplate()}`}};i.getObjectStatusDependentsTemplate=function t(){if(this.hasQuickView){return`<dependents><macro:QuickView\n\t\t\t\t\t\txmlns:macro="sap.fe.macros"\n\t\t\t\t\t\tdataField="{metaPath>}"\n\t\t\t\t\t\tcontextPath="{contextPath>}"\n\t\t\t\t\t/></dependents>`}return""};i.getObjectStatusTemplate=function t(){const{dataModelPath:i,valueDataModelPath:a,dataPointConverted:r}=e.getTemplatingObjects(this);let n=L(r,i);if(n==="None"&&a){n=this.hasQuickView?"Information":"None"}n=n?n:L(r,i);const o=this.formatOptions.showEmptyIndicator??false?"On":undefined;const l=D(i,this.formatOptions,false);const s=R(r,i);return K`<ObjectStatus
						xmlns="sap.m"
						${this.attr("id",this.idPrefix?Q([this.idPrefix,"ObjectStatus-Field-display"]):undefined)}
						core:require="{ FieldRuntime: 'sap/fe/macros/field/FieldRuntime' }"
						${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectStatusLarge":undefined)}
						${this.attr("icon",s)}
						${this.attr("tooltip",this.getTooltipValue())}
						${this.attr("state",n)}
						${this.attr("text",l)}
						${this.attr("emptyIndicatorMode",o)}
						${this.attr("active",this.hasQuickView)}
						press="FieldRuntime.pressLink"
						${this.attr("ariaLabelledBy",this.ariaLabelledBy!==null?this.ariaLabelledBy:undefined)}
				>${this.getObjectStatusDependentsTemplate()}
				</ObjectStatus>`};i.getTooltipValue=function t(){var i,a,r;const{dataModelPath:n,dataPointConverted:o}=e.getTemplatingObjects(this);return H(o===null||o===void 0?void 0:(i=o.annotations)===null||i===void 0?void 0:(a=i.Common)===null||a===void 0?void 0:(r=a.QuickInfo)===null||r===void 0?void 0:r.valueOf(),k(n))};i.getTargetValueBinding=function t(){const{dataModelPath:i,dataPointConverted:a}=e.getTemplatingObjects(this);return H(a.TargetValue,k(i))};i.getTemplate=function t(){switch(this.visualization){case"Rating":{return this.getRatingIndicatorTemplate()}case"Progress":{return this.getProgressIndicatorTemplate()}case"ObjectNumber":{return this.getObjectNumberTemplate()}default:{return this.getObjectStatusTemplate()}}};return e}(t),O=at(y.prototype,"idPrefix",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),T=at(y.prototype,"metaPath",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),$=at(y.prototype,"ariaLabelledBy",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),x=at(y.prototype,"formatOptions",[b],{configurable:true,enumerable:true,writable:true,initializer:function(){return{}}}),j=at(y.prototype,"contextPath",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),y))||P);V=nt;return V},false);