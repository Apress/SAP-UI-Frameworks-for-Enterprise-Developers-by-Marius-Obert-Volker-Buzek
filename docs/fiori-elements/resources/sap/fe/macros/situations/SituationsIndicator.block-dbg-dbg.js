/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/situations/SituationsPopover"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, SituationsPopover) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var showPopover = SituationsPopover.showPopover;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var and = BindingToolkit.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let SituationsIndicatorBlock = (_dec = defineBuildingBlock({
    name: "SituationsIndicator",
    namespace: "sap.fe.macros.internal.situations"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec3 = blockAttribute({
    type: "string",
    required: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(SituationsIndicatorBlock, _BuildingBlockBase);
    function SituationsIndicatorBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "entitySet", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = SituationsIndicatorBlock;
    SituationsIndicatorBlock.getSituationsNavigationProperty = function getSituationsNavigationProperty(context) {
      let navigationProperties;
      switch (context._type) {
        case "NavigationProperty":
          navigationProperties = context.targetType.navigationProperties;
          break;
        case "EntityType":
          navigationProperties = context.navigationProperties;
          break;
        default:
          navigationProperties = context.entityType.navigationProperties;
      }
      const situationsNavProps = navigationProperties.filter(navigationProperty => {
        var _navigationProperty$t, _navigationProperty$t2;
        return !navigationProperty.isCollection && ((_navigationProperty$t = navigationProperty.targetType.annotations.Common) === null || _navigationProperty$t === void 0 ? void 0 : (_navigationProperty$t2 = _navigationProperty$t.SAPObjectNodeType) === null || _navigationProperty$t2 === void 0 ? void 0 : _navigationProperty$t2.Name) === "BusinessSituation";
      });
      const situationsNavProp = situationsNavProps.length >= 1 ? situationsNavProps[0] : undefined;

      // only one navigation property may lead to an entity tagged as "BusinessSituation"
      if (situationsNavProps.length > 1) {
        const navPropNames = situationsNavProps.map(prop => `'${prop.name}'`).join(", ");
        let name;
        switch (context._type) {
          case "NavigationProperty":
            name = context.targetType.name;
            break;
          case "EntityType":
            name = context.name;
            break;
          default:
            name = context.entityType.name;
        }
        Log.error(`Entity type '${name}' has multiple paths to SAP Situations (${navPropNames}). Using '${situationsNavProp === null || situationsNavProp === void 0 ? void 0 : situationsNavProp.name}'.
Hint: Make sure there is at most one navigation property whose target entity type is annotated with
<Annotation Term="com.sap.vocabularies.Common.v1.SAPObjectNodeType">
  <Record>
    <PropertyValue Property="Name" String="BusinessSituation" />
  </Record>
</Annotation>.`);
      }
      return situationsNavProp;
    };
    var _proto = SituationsIndicatorBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      const context = convertMetaModelContext(this.entitySet);
      const situationsNavProp = SituationsIndicatorBlock.getSituationsNavigationProperty(context);
      if (!situationsNavProp) {
        // No path to SAP Situations. That is, the entity type is not situation-enabled. Ignore this fragment.
        return undefined;
      }
      const numberOfSituations = pathInModel(`${situationsNavProp.name}/SitnNumberOfInstances`);

      // Indicator visibility
      let visible;
      if (!this.propertyPath) {
        // no propertyPath --> visibility depends on the number of situations only
        visible = greaterThan(numberOfSituations, 0);
      } else {
        // propertyPath --> visibility depends on the number of situations and on the semantic key used for showing indicators
        visible = and(greaterThan(numberOfSituations, 0), equal(pathInModel("semanticKeyHasDraftIndicator", "internal"), this.propertyPath));
      }

      // Button text: the number of situations if there are multiple, the empty string otherwise
      const text = ifElse(greaterThan(numberOfSituations, 1), numberOfSituations, "");

      // Button tooltip: "There is one situation" / "There are <n> situations"
      const tooltip = ifElse(equal(numberOfSituations, 1), this.getTranslatedText("situationsTooltipSingular"), fn("formatMessage", [this.getTranslatedText("situationsTooltipPlural"), numberOfSituations]));

      // 'press' handler
      const onPress = fn(showPopover, [ref("$controller"), ref("$event"), situationsNavProp.name]);
      return xml`
			<m:Button core:require="{rt: 'sap/fe/macros/situations/SituationsPopover', formatMessage: 'sap/base/strings/formatMessage'}"
				type="Attention"
				icon="sap-icon://alert"
				text="${text}"
				tooltip="${tooltip}"
				visible="${visible}"
				press="${onPress}"
			/>`;
    };
    return SituationsIndicatorBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = SituationsIndicatorBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaXR1YXRpb25zSW5kaWNhdG9yQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiZ2V0U2l0dWF0aW9uc05hdmlnYXRpb25Qcm9wZXJ0eSIsImNvbnRleHQiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsIl90eXBlIiwidGFyZ2V0VHlwZSIsImVudGl0eVR5cGUiLCJzaXR1YXRpb25zTmF2UHJvcHMiLCJmaWx0ZXIiLCJuYXZpZ2F0aW9uUHJvcGVydHkiLCJpc0NvbGxlY3Rpb24iLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlNBUE9iamVjdE5vZGVUeXBlIiwiTmFtZSIsInNpdHVhdGlvbnNOYXZQcm9wIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwibmF2UHJvcE5hbWVzIiwibWFwIiwicHJvcCIsImpvaW4iLCJMb2ciLCJlcnJvciIsImdldFRlbXBsYXRlIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJlbnRpdHlTZXQiLCJudW1iZXJPZlNpdHVhdGlvbnMiLCJwYXRoSW5Nb2RlbCIsInZpc2libGUiLCJwcm9wZXJ0eVBhdGgiLCJncmVhdGVyVGhhbiIsImFuZCIsImVxdWFsIiwidGV4dCIsImlmRWxzZSIsInRvb2x0aXAiLCJnZXRUcmFuc2xhdGVkVGV4dCIsImZuIiwib25QcmVzcyIsInNob3dQb3BvdmVyIiwicmVmIiwieG1sIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNpdHVhdGlvbnNJbmRpY2F0b3IuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQsIEVudGl0eVR5cGUsIE5hdmlnYXRpb25Qcm9wZXJ0eSwgU2luZ2xldG9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgYW5kLCBlcXVhbCwgZm4sIGdyZWF0ZXJUaGFuLCBpZkVsc2UsIHBhdGhJbk1vZGVsLCByZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgc2hvd1BvcG92ZXIgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9zaXR1YXRpb25zL1NpdHVhdGlvbnNQb3BvdmVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiU2l0dWF0aW9uc0luZGljYXRvclwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5zaXR1YXRpb25zXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpdHVhdGlvbnNJbmRpY2F0b3JCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRlbnRpdHlTZXQhOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIHJlcXVpcmVkOiBmYWxzZSB9KVxuXHRwcm9wZXJ0eVBhdGg/OiBzdHJpbmc7XG5cblx0c3RhdGljIGdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkoXG5cdFx0Y29udGV4dDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgRW50aXR5VHlwZSB8IE5hdmlnYXRpb25Qcm9wZXJ0eVxuXHQpOiBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRcdGxldCBuYXZpZ2F0aW9uUHJvcGVydGllczogTmF2aWdhdGlvblByb3BlcnR5W107XG5cdFx0c3dpdGNoIChjb250ZXh0Ll90eXBlKSB7XG5cdFx0XHRjYXNlIFwiTmF2aWdhdGlvblByb3BlcnR5XCI6XG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29udGV4dC50YXJnZXRUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFbnRpdHlUeXBlXCI6XG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29udGV4dC5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbnRleHQuZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHR9XG5cblx0XHRjb25zdCBzaXR1YXRpb25zTmF2UHJvcHMgPSBuYXZpZ2F0aW9uUHJvcGVydGllcy5maWx0ZXIoXG5cdFx0XHQobmF2aWdhdGlvblByb3BlcnR5KSA9PlxuXHRcdFx0XHQhbmF2aWdhdGlvblByb3BlcnR5LmlzQ29sbGVjdGlvbiAmJlxuXHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydHkudGFyZ2V0VHlwZS5hbm5vdGF0aW9ucy5Db21tb24/LlNBUE9iamVjdE5vZGVUeXBlPy5OYW1lID09PSBcIkJ1c2luZXNzU2l0dWF0aW9uXCJcblx0XHQpO1xuXG5cdFx0Y29uc3Qgc2l0dWF0aW9uc05hdlByb3A6IE5hdmlnYXRpb25Qcm9wZXJ0eSB8IHVuZGVmaW5lZCA9IHNpdHVhdGlvbnNOYXZQcm9wcy5sZW5ndGggPj0gMSA/IHNpdHVhdGlvbnNOYXZQcm9wc1swXSA6IHVuZGVmaW5lZDtcblxuXHRcdC8vIG9ubHkgb25lIG5hdmlnYXRpb24gcHJvcGVydHkgbWF5IGxlYWQgdG8gYW4gZW50aXR5IHRhZ2dlZCBhcyBcIkJ1c2luZXNzU2l0dWF0aW9uXCJcblx0XHRpZiAoc2l0dWF0aW9uc05hdlByb3BzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGNvbnN0IG5hdlByb3BOYW1lcyA9IHNpdHVhdGlvbnNOYXZQcm9wcy5tYXAoKHByb3ApID0+IGAnJHtwcm9wLm5hbWV9J2ApLmpvaW4oXCIsIFwiKTtcblxuXHRcdFx0bGV0IG5hbWU6IHN0cmluZztcblx0XHRcdHN3aXRjaCAoY29udGV4dC5fdHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiTmF2aWdhdGlvblByb3BlcnR5XCI6XG5cdFx0XHRcdFx0bmFtZSA9IGNvbnRleHQudGFyZ2V0VHlwZS5uYW1lO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiRW50aXR5VHlwZVwiOlxuXHRcdFx0XHRcdG5hbWUgPSBjb250ZXh0Lm5hbWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0bmFtZSA9IGNvbnRleHQuZW50aXR5VHlwZS5uYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRMb2cuZXJyb3IoYEVudGl0eSB0eXBlICcke25hbWV9JyBoYXMgbXVsdGlwbGUgcGF0aHMgdG8gU0FQIFNpdHVhdGlvbnMgKCR7bmF2UHJvcE5hbWVzfSkuIFVzaW5nICcke3NpdHVhdGlvbnNOYXZQcm9wPy5uYW1lfScuXG5IaW50OiBNYWtlIHN1cmUgdGhlcmUgaXMgYXQgbW9zdCBvbmUgbmF2aWdhdGlvbiBwcm9wZXJ0eSB3aG9zZSB0YXJnZXQgZW50aXR5IHR5cGUgaXMgYW5ub3RhdGVkIHdpdGhcbjxBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU0FQT2JqZWN0Tm9kZVR5cGVcIj5cbiAgPFJlY29yZD5cbiAgICA8UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIk5hbWVcIiBTdHJpbmc9XCJCdXNpbmVzc1NpdHVhdGlvblwiIC8+XG4gIDwvUmVjb3JkPlxuPC9Bbm5vdGF0aW9uPi5gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc2l0dWF0aW9uc05hdlByb3A7XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBjb250ZXh0ID0gY29udmVydE1ldGFNb2RlbENvbnRleHQodGhpcy5lbnRpdHlTZXQpO1xuXHRcdGNvbnN0IHNpdHVhdGlvbnNOYXZQcm9wID0gU2l0dWF0aW9uc0luZGljYXRvckJsb2NrLmdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkoY29udGV4dCk7XG5cdFx0aWYgKCFzaXR1YXRpb25zTmF2UHJvcCkge1xuXHRcdFx0Ly8gTm8gcGF0aCB0byBTQVAgU2l0dWF0aW9ucy4gVGhhdCBpcywgdGhlIGVudGl0eSB0eXBlIGlzIG5vdCBzaXR1YXRpb24tZW5hYmxlZC4gSWdub3JlIHRoaXMgZnJhZ21lbnQuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGNvbnN0IG51bWJlck9mU2l0dWF0aW9ucyA9IHBhdGhJbk1vZGVsKGAke3NpdHVhdGlvbnNOYXZQcm9wLm5hbWV9L1NpdG5OdW1iZXJPZkluc3RhbmNlc2ApO1xuXG5cdFx0Ly8gSW5kaWNhdG9yIHZpc2liaWxpdHlcblx0XHRsZXQgdmlzaWJsZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRcdGlmICghdGhpcy5wcm9wZXJ0eVBhdGgpIHtcblx0XHRcdC8vIG5vIHByb3BlcnR5UGF0aCAtLT4gdmlzaWJpbGl0eSBkZXBlbmRzIG9uIHRoZSBudW1iZXIgb2Ygc2l0dWF0aW9ucyBvbmx5XG5cdFx0XHR2aXNpYmxlID0gZ3JlYXRlclRoYW4obnVtYmVyT2ZTaXR1YXRpb25zLCAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcHJvcGVydHlQYXRoIC0tPiB2aXNpYmlsaXR5IGRlcGVuZHMgb24gdGhlIG51bWJlciBvZiBzaXR1YXRpb25zIGFuZCBvbiB0aGUgc2VtYW50aWMga2V5IHVzZWQgZm9yIHNob3dpbmcgaW5kaWNhdG9yc1xuXHRcdFx0dmlzaWJsZSA9IGFuZChcblx0XHRcdFx0Z3JlYXRlclRoYW4obnVtYmVyT2ZTaXR1YXRpb25zLCAwKSxcblx0XHRcdFx0ZXF1YWwocGF0aEluTW9kZWwoXCJzZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yXCIsIFwiaW50ZXJuYWxcIiksIHRoaXMucHJvcGVydHlQYXRoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvLyBCdXR0b24gdGV4dDogdGhlIG51bWJlciBvZiBzaXR1YXRpb25zIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2Vcblx0XHRjb25zdCB0ZXh0ID0gaWZFbHNlKGdyZWF0ZXJUaGFuKG51bWJlck9mU2l0dWF0aW9ucywgMSksIG51bWJlck9mU2l0dWF0aW9ucywgXCJcIik7XG5cblx0XHQvLyBCdXR0b24gdG9vbHRpcDogXCJUaGVyZSBpcyBvbmUgc2l0dWF0aW9uXCIgLyBcIlRoZXJlIGFyZSA8bj4gc2l0dWF0aW9uc1wiXG5cdFx0Y29uc3QgdG9vbHRpcCA9IGlmRWxzZShcblx0XHRcdGVxdWFsKG51bWJlck9mU2l0dWF0aW9ucywgMSksXG5cdFx0XHR0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwic2l0dWF0aW9uc1Rvb2x0aXBTaW5ndWxhclwiKSxcblx0XHRcdGZuKFwiZm9ybWF0TWVzc2FnZVwiLCBbdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcInNpdHVhdGlvbnNUb29sdGlwUGx1cmFsXCIpLCBudW1iZXJPZlNpdHVhdGlvbnNdKVxuXHRcdCk7XG5cblx0XHQvLyAncHJlc3MnIGhhbmRsZXJcblx0XHRjb25zdCBvblByZXNzID0gZm4oc2hvd1BvcG92ZXIsIFtyZWYoXCIkY29udHJvbGxlclwiKSwgcmVmKFwiJGV2ZW50XCIpLCBzaXR1YXRpb25zTmF2UHJvcC5uYW1lXSk7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG06QnV0dG9uIGNvcmU6cmVxdWlyZT1cIntydDogJ3NhcC9mZS9tYWNyb3Mvc2l0dWF0aW9ucy9TaXR1YXRpb25zUG9wb3ZlcicsIGZvcm1hdE1lc3NhZ2U6ICdzYXAvYmFzZS9zdHJpbmdzL2Zvcm1hdE1lc3NhZ2UnfVwiXG5cdFx0XHRcdHR5cGU9XCJBdHRlbnRpb25cIlxuXHRcdFx0XHRpY29uPVwic2FwLWljb246Ly9hbGVydFwiXG5cdFx0XHRcdHRleHQ9XCIke3RleHR9XCJcblx0XHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHt2aXNpYmxlfVwiXG5cdFx0XHRcdHByZXNzPVwiJHtvblByZXNzfVwiXG5cdFx0XHQvPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BWXFCQSx3QkFBd0IsV0FENUNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxxQkFBcUI7SUFBRUMsU0FBUyxFQUFFO0VBQW9DLENBQUMsQ0FBQyxVQUVuR0MsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2hFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEseUJBRzdDQywrQkFBK0IsR0FBdEMseUNBQ0NDLE9B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