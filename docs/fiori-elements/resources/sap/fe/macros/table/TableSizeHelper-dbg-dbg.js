/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/SizeHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/m/table/Util"], function (Log, SizeHelper, DisplayModeFormatter, TableUtil) {
  "use strict";

  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  const TableSizeHelper = {
    /**
     * Method to calculate the width of the MDCColumn.
     *
     * @param dataField The Property or PropertyInfo Object for which the width will be calculated.
     * @param properties An array containing all property definitions (optional)
     * @param convertedMetaData
     * @param includeLabel Indicates if the label should be part of the width calculation
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns The width of the column.
     */
    getMDCColumnWidthFromDataField: function (dataField, properties, convertedMetaData) {
      let includeLabel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      const property = properties.find(prop => {
        var _convertedMetaData$re, _convertedMetaData$re2;
        return prop.metadataPath && ((_convertedMetaData$re = convertedMetaData.resolvePath(prop.metadataPath)) === null || _convertedMetaData$re === void 0 ? void 0 : (_convertedMetaData$re2 = _convertedMetaData$re.target) === null || _convertedMetaData$re2 === void 0 ? void 0 : _convertedMetaData$re2.fullyQualifiedName) === dataField.fullyQualifiedName;
      });
      return property ? this.getMDCColumnWidthFromProperty(property, properties, includeLabel) : 0;
    },
    getMDCColumnWidthFromProperty: function (property, properties) {
      var _property$visualSetti, _property$propertyInf, _property$typeConfig;
      let includeLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      const mWidthCalculation = Object.assign({
        gap: 0,
        truncateLabel: !includeLabel,
        excludeProperties: []
      }, (_property$visualSetti = property.visualSettings) === null || _property$visualSetti === void 0 ? void 0 : _property$visualSetti.widthCalculation);
      let types;
      if ((_property$propertyInf = property.propertyInfos) !== null && _property$propertyInf !== void 0 && _property$propertyInf.length) {
        types = property.propertyInfos.map(propName => {
          var _prop$typeConfig;
          const prop = properties.find(_property => _property.name === propName);
          return prop === null || prop === void 0 ? void 0 : (_prop$typeConfig = prop.typeConfig) === null || _prop$typeConfig === void 0 ? void 0 : _prop$typeConfig.typeInstance;
        }).filter(item => item);
      } else if (property !== null && property !== void 0 && (_property$typeConfig = property.typeConfig) !== null && _property$typeConfig !== void 0 && _property$typeConfig.typeInstance) {
        types = [property === null || property === void 0 ? void 0 : property.typeConfig.typeInstance];
      }
      const sSize = types ? TableUtil.calcColumnWidth(types, property.label, mWidthCalculation) : null;
      if (!sSize) {
        Log.error(`Cannot compute the column width for property: ${property.name}`);
      }
      return sSize ? parseFloat(sSize.replace("Rem", "")) : 0;
    },
    /**
     * Method to calculate the  width of a DataFieldAnnotation object contained in a fieldGroup.
     *
     * @param dataField DataFieldAnnotation object.
     * @param properties Array containing all PropertyInfo objects.
     * @param convertedMetaData
     * @param showDataFieldsLabel Label is displayed inside the field
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns Object containing the width of the label and the width of the property.
     */
    getWidthForDataFieldForAnnotation: function (dataField, properties, convertedMetaData) {
      var _dataField$Target;
      let showDataFieldsLabel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      const oTargetedProperty = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : _dataField$Target.$target;
      let nPropertyWidth = 0,
        fLabelWidth = 0;
      if (oTargetedProperty !== null && oTargetedProperty !== void 0 && oTargetedProperty.Visualization) {
        switch (oTargetedProperty.Visualization) {
          case "UI.VisualizationType/Rating":
            const nbStars = oTargetedProperty.TargetValue;
            nPropertyWidth = parseInt(nbStars, 10) * 1.375;
            break;
          case "UI.VisualizationType/Progress":
          default:
            nPropertyWidth = 5;
        }
        const sLabel = oTargetedProperty ? oTargetedProperty.label : dataField.Label || "";
        fLabelWidth = showDataFieldsLabel && sLabel ? SizeHelper.getButtonWidth(sLabel) : 0;
      } else if (convertedMetaData && properties && (oTargetedProperty === null || oTargetedProperty === void 0 ? void 0 : oTargetedProperty.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
        nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty.fn.$target, properties, convertedMetaData, false);
      }
      return {
        labelWidth: fLabelWidth,
        propertyWidth: nPropertyWidth
      };
    },
    /**
     * Method to calculate the width of a DataField object.
     *
     * @param dataField DataFieldAnnotation object.
     * @param showDataFieldsLabel Label is displayed inside the field.
     * @param properties Array containing all PropertyInfo objects.
     * @param convertedMetaData Context Object of the parent property.
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns {object} Object containing the width of the label and the width of the property.
     */

    getWidthForDataField: function (dataField, showDataFieldsLabel, properties, convertedMetaData) {
      var _dataField$Value, _oTargetedProperty$an, _oTargetedProperty$an2, _dataField$Value2;
      const oTargetedProperty = (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.$target,
        oTextArrangementTarget = oTargetedProperty === null || oTargetedProperty === void 0 ? void 0 : (_oTargetedProperty$an = oTargetedProperty.annotations) === null || _oTargetedProperty$an === void 0 ? void 0 : (_oTargetedProperty$an2 = _oTargetedProperty$an.Common) === null || _oTargetedProperty$an2 === void 0 ? void 0 : _oTargetedProperty$an2.Text,
        displayMode = getDisplayMode((_dataField$Value2 = dataField.Value) === null || _dataField$Value2 === void 0 ? void 0 : _dataField$Value2.$target);
      let nPropertyWidth = 0,
        fLabelWidth = 0;
      if (oTargetedProperty) {
        switch (displayMode) {
          case "Description":
            nPropertyWidth = this.getMDCColumnWidthFromDataField(oTextArrangementTarget.$target, properties, convertedMetaData, false) - 1;
            break;
          case "DescriptionValue":
          case "ValueDescription":
          case "Value":
          default:
            nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty, properties, convertedMetaData, false) - 1;
        }
        const sLabel = dataField.Label ? dataField.Label : oTargetedProperty.label;
        fLabelWidth = showDataFieldsLabel && sLabel ? SizeHelper.getButtonWidth(sLabel) : 0;
      } else {
        Log.error(`Cannot compute width for type object: ${dataField.$Type}`);
      }
      return {
        labelWidth: fLabelWidth,
        propertyWidth: nPropertyWidth
      };
    }
  };
  return TableSizeHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZVNpemVIZWxwZXIiLCJnZXRNRENDb2x1bW5XaWR0aEZyb21EYXRhRmllbGQiLCJkYXRhRmllbGQiLCJwcm9wZXJ0aWVzIiwiY29udmVydGVkTWV0YURhdGEiLCJpbmNsdWRlTGFiZWwiLCJwcm9wZXJ0eSIsImZpbmQiLCJwcm9wIiwibWV0YWRhdGFQYXRoIiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJnZXRNRENDb2x1bW5XaWR0aEZyb21Qcm9wZXJ0eSIsIm1XaWR0aENhbGN1bGF0aW9uIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2FwIiwidHJ1bmNhdGVMYWJlbCIsImV4Y2x1ZGVQcm9wZXJ0aWVzIiwidmlzdWFsU2V0dGluZ3MiLCJ3aWR0aENhbGN1bGF0aW9uIiwidHlwZXMiLCJwcm9wZXJ0eUluZm9zIiwibGVuZ3RoIiwibWFwIiwicHJvcE5hbWUiLCJfcHJvcGVydHkiLCJuYW1lIiwidHlwZUNvbmZpZyIsInR5cGVJbnN0YW5jZSIsImZpbHRlciIsIml0ZW0iLCJzU2l6ZSIsIlRhYmxlVXRpbCIsImNhbGNDb2x1bW5XaWR0aCIsImxhYmVsIiwiTG9nIiwiZXJyb3IiLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsInNob3dEYXRhRmllbGRzTGFiZWwiLCJvVGFyZ2V0ZWRQcm9wZXJ0eSIsIlRhcmdldCIsIiR0YXJnZXQiLCJuUHJvcGVydHlXaWR0aCIsImZMYWJlbFdpZHRoIiwiVmlzdWFsaXphdGlvbiIsIm5iU3RhcnMiLCJUYXJnZXRWYWx1ZSIsInBhcnNlSW50Iiwic0xhYmVsIiwiTGFiZWwiLCJTaXplSGVscGVyIiwiZ2V0QnV0dG9uV2lkdGgiLCIkVHlwZSIsImZuIiwibGFiZWxXaWR0aCIsInByb3BlcnR5V2lkdGgiLCJnZXRXaWR0aEZvckRhdGFGaWVsZCIsIlZhbHVlIiwib1RleHRBcnJhbmdlbWVudFRhcmdldCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlU2l6ZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb252ZXJ0ZWRNZXRhZGF0YSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9FZG1cIjtcbmltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB7IERhdGFGaWVsZCwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IFRhYmxlVXRpbCBmcm9tIFwic2FwL20vdGFibGUvVXRpbFwiO1xuaW1wb3J0IHsgUHJvcGVydHlJbmZvIH0gZnJvbSBcIi4uL0RlbGVnYXRlVXRpbFwiO1xuXG5jb25zdCBUYWJsZVNpemVIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGUgTURDQ29sdW1uLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBQcm9wZXJ0eSBvciBQcm9wZXJ0eUluZm8gT2JqZWN0IGZvciB3aGljaCB0aGUgd2lkdGggd2lsbCBiZSBjYWxjdWxhdGVkLlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBBbiBhcnJheSBjb250YWluaW5nIGFsbCBwcm9wZXJ0eSBkZWZpbml0aW9ucyAob3B0aW9uYWwpXG5cdCAqIEBwYXJhbSBjb252ZXJ0ZWRNZXRhRGF0YVxuXHQgKiBAcGFyYW0gaW5jbHVkZUxhYmVsIEluZGljYXRlcyBpZiB0aGUgbGFiZWwgc2hvdWxkIGJlIHBhcnQgb2YgdGhlIHdpZHRoIGNhbGN1bGF0aW9uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlU2l6ZUhlbHBlclxuXHQgKiBAcmV0dXJucyBUaGUgd2lkdGggb2YgdGhlIGNvbHVtbi5cblx0ICovXG5cdGdldE1EQ0NvbHVtbldpZHRoRnJvbURhdGFGaWVsZDogZnVuY3Rpb24gKFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkLFxuXHRcdHByb3BlcnRpZXM6IFByb3BlcnR5SW5mb1tdLFxuXHRcdGNvbnZlcnRlZE1ldGFEYXRhOiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0XHRpbmNsdWRlTGFiZWwgPSBmYWxzZVxuXHQpOiBudW1iZXIge1xuXHRcdGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllcy5maW5kKFxuXHRcdFx0KHByb3ApID0+XG5cdFx0XHRcdHByb3AubWV0YWRhdGFQYXRoICYmXG5cdFx0XHRcdChjb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChwcm9wLm1ldGFkYXRhUGF0aCkgYXMgYW55KT8udGFyZ2V0Py5mdWxseVF1YWxpZmllZE5hbWUgPT09IGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWVcblx0XHQpO1xuXHRcdHJldHVybiBwcm9wZXJ0eSA/IHRoaXMuZ2V0TURDQ29sdW1uV2lkdGhGcm9tUHJvcGVydHkocHJvcGVydHksIHByb3BlcnRpZXMsIGluY2x1ZGVMYWJlbCkgOiAwO1xuXHR9LFxuXG5cdGdldE1EQ0NvbHVtbldpZHRoRnJvbVByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5SW5mbywgcHJvcGVydGllczogUHJvcGVydHlJbmZvW10sIGluY2x1ZGVMYWJlbCA9IGZhbHNlKTogbnVtYmVyIHtcblx0XHRjb25zdCBtV2lkdGhDYWxjdWxhdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdGdhcDogMCxcblx0XHRcdFx0dHJ1bmNhdGVMYWJlbDogIWluY2x1ZGVMYWJlbCxcblx0XHRcdFx0ZXhjbHVkZVByb3BlcnRpZXM6IFtdXG5cdFx0XHR9LFxuXHRcdFx0cHJvcGVydHkudmlzdWFsU2V0dGluZ3M/LndpZHRoQ2FsY3VsYXRpb25cblx0XHQpO1xuXG5cdFx0bGV0IHR5cGVzO1xuXG5cdFx0aWYgKHByb3BlcnR5LnByb3BlcnR5SW5mb3M/Lmxlbmd0aCkge1xuXHRcdFx0dHlwZXMgPSBwcm9wZXJ0eS5wcm9wZXJ0eUluZm9zXG5cdFx0XHRcdC5tYXAoKHByb3BOYW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcHJvcCA9IHByb3BlcnRpZXMuZmluZCgoX3Byb3BlcnR5KSA9PiBfcHJvcGVydHkubmFtZSA9PT0gcHJvcE5hbWUpO1xuXHRcdFx0XHRcdHJldHVybiBwcm9wPy50eXBlQ29uZmlnPy50eXBlSW5zdGFuY2U7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0pO1xuXHRcdH0gZWxzZSBpZiAocHJvcGVydHk/LnR5cGVDb25maWc/LnR5cGVJbnN0YW5jZSkge1xuXHRcdFx0dHlwZXMgPSBbcHJvcGVydHk/LnR5cGVDb25maWcudHlwZUluc3RhbmNlXTtcblx0XHR9XG5cdFx0Y29uc3Qgc1NpemUgPSB0eXBlcyA/IFRhYmxlVXRpbC5jYWxjQ29sdW1uV2lkdGgodHlwZXMsIHByb3BlcnR5LmxhYmVsLCBtV2lkdGhDYWxjdWxhdGlvbikgOiBudWxsO1xuXHRcdGlmICghc1NpemUpIHtcblx0XHRcdExvZy5lcnJvcihgQ2Fubm90IGNvbXB1dGUgdGhlIGNvbHVtbiB3aWR0aCBmb3IgcHJvcGVydHk6ICR7cHJvcGVydHkubmFtZX1gKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNTaXplID8gcGFyc2VGbG9hdChzU2l6ZS5yZXBsYWNlKFwiUmVtXCIsIFwiXCIpKSA6IDA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjYWxjdWxhdGUgdGhlICB3aWR0aCBvZiBhIERhdGFGaWVsZEFubm90YXRpb24gb2JqZWN0IGNvbnRhaW5lZCBpbiBhIGZpZWxkR3JvdXAuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkQW5ub3RhdGlvbiBvYmplY3QuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIEFycmF5IGNvbnRhaW5pbmcgYWxsIFByb3BlcnR5SW5mbyBvYmplY3RzLlxuXHQgKiBAcGFyYW0gY29udmVydGVkTWV0YURhdGFcblx0ICogQHBhcmFtIHNob3dEYXRhRmllbGRzTGFiZWwgTGFiZWwgaXMgZGlzcGxheWVkIGluc2lkZSB0aGUgZmllbGRcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVTaXplSGVscGVyXG5cdCAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIHRoZSB3aWR0aCBvZiB0aGUgbGFiZWwgYW5kIHRoZSB3aWR0aCBvZiB0aGUgcHJvcGVydHkuXG5cdCAqL1xuXHRnZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb246IGZ1bmN0aW9uIChcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFubm90YXRpb24sXG5cdFx0cHJvcGVydGllcz86IFByb3BlcnR5SW5mb1tdLFxuXHRcdGNvbnZlcnRlZE1ldGFEYXRhPzogQ29udmVydGVkTWV0YWRhdGEsXG5cdFx0c2hvd0RhdGFGaWVsZHNMYWJlbCA9IGZhbHNlXG5cdCkge1xuXHRcdGNvbnN0IG9UYXJnZXRlZFByb3BlcnR5ID0gZGF0YUZpZWxkPy5UYXJnZXQ/LiR0YXJnZXQgYXMgYW55O1xuXHRcdGxldCBuUHJvcGVydHlXaWR0aCA9IDAsXG5cdFx0XHRmTGFiZWxXaWR0aCA9IDA7XG5cdFx0aWYgKG9UYXJnZXRlZFByb3BlcnR5Py5WaXN1YWxpemF0aW9uKSB7XG5cdFx0XHRzd2l0Y2ggKG9UYXJnZXRlZFByb3BlcnR5LlZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0Y2FzZSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiOlxuXHRcdFx0XHRcdGNvbnN0IG5iU3RhcnMgPSBvVGFyZ2V0ZWRQcm9wZXJ0eS5UYXJnZXRWYWx1ZTtcblx0XHRcdFx0XHRuUHJvcGVydHlXaWR0aCA9IHBhcnNlSW50KG5iU3RhcnMsIDEwKSAqIDEuMzc1O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUHJvZ3Jlc3NcIjpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRuUHJvcGVydHlXaWR0aCA9IDU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzTGFiZWwgPSBvVGFyZ2V0ZWRQcm9wZXJ0eSA/IG9UYXJnZXRlZFByb3BlcnR5LmxhYmVsIDogZGF0YUZpZWxkLkxhYmVsIHx8IFwiXCI7XG5cdFx0XHRmTGFiZWxXaWR0aCA9IHNob3dEYXRhRmllbGRzTGFiZWwgJiYgc0xhYmVsID8gU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChzTGFiZWwpIDogMDtcblx0XHR9IGVsc2UgaWYgKGNvbnZlcnRlZE1ldGFEYXRhICYmIHByb3BlcnRpZXMgJiYgb1RhcmdldGVkUHJvcGVydHk/LiRUeXBlID09PSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkNvbnRhY3RUeXBlKSB7XG5cdFx0XHRuUHJvcGVydHlXaWR0aCA9IHRoaXMuZ2V0TURDQ29sdW1uV2lkdGhGcm9tRGF0YUZpZWxkKG9UYXJnZXRlZFByb3BlcnR5LmZuLiR0YXJnZXQsIHByb3BlcnRpZXMsIGNvbnZlcnRlZE1ldGFEYXRhLCBmYWxzZSk7XG5cdFx0fVxuXHRcdHJldHVybiB7IGxhYmVsV2lkdGg6IGZMYWJlbFdpZHRoLCBwcm9wZXJ0eVdpZHRoOiBuUHJvcGVydHlXaWR0aCB9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY2FsY3VsYXRlIHRoZSB3aWR0aCBvZiBhIERhdGFGaWVsZCBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkQW5ub3RhdGlvbiBvYmplY3QuXG5cdCAqIEBwYXJhbSBzaG93RGF0YUZpZWxkc0xhYmVsIExhYmVsIGlzIGRpc3BsYXllZCBpbnNpZGUgdGhlIGZpZWxkLlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBBcnJheSBjb250YWluaW5nIGFsbCBQcm9wZXJ0eUluZm8gb2JqZWN0cy5cblx0ICogQHBhcmFtIGNvbnZlcnRlZE1ldGFEYXRhIENvbnRleHQgT2JqZWN0IG9mIHRoZSBwYXJlbnQgcHJvcGVydHkuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlU2l6ZUhlbHBlclxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBPYmplY3QgY29udGFpbmluZyB0aGUgd2lkdGggb2YgdGhlIGxhYmVsIGFuZCB0aGUgd2lkdGggb2YgdGhlIHByb3BlcnR5LlxuXHQgKi9cblxuXHRnZXRXaWR0aEZvckRhdGFGaWVsZDogZnVuY3Rpb24gKFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkLFxuXHRcdHNob3dEYXRhRmllbGRzTGFiZWw6IGJvb2xlYW4sXG5cdFx0cHJvcGVydGllczogUHJvcGVydHlJbmZvW10sXG5cdFx0Y29udmVydGVkTWV0YURhdGE6IENvbnZlcnRlZE1ldGFkYXRhXG5cdCkge1xuXHRcdGNvbnN0IG9UYXJnZXRlZFByb3BlcnR5ID0gZGF0YUZpZWxkLlZhbHVlPy4kdGFyZ2V0LFxuXHRcdFx0b1RleHRBcnJhbmdlbWVudFRhcmdldCA9IG9UYXJnZXRlZFByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LFxuXHRcdFx0ZGlzcGxheU1vZGUgPSBnZXREaXNwbGF5TW9kZShkYXRhRmllbGQuVmFsdWU/LiR0YXJnZXQpO1xuXG5cdFx0bGV0IG5Qcm9wZXJ0eVdpZHRoID0gMCxcblx0XHRcdGZMYWJlbFdpZHRoID0gMDtcblx0XHRpZiAob1RhcmdldGVkUHJvcGVydHkpIHtcblx0XHRcdHN3aXRjaCAoZGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0blByb3BlcnR5V2lkdGggPVxuXHRcdFx0XHRcdFx0dGhpcy5nZXRNRENDb2x1bW5XaWR0aEZyb21EYXRhRmllbGQob1RleHRBcnJhbmdlbWVudFRhcmdldC4kdGFyZ2V0LCBwcm9wZXJ0aWVzLCBjb252ZXJ0ZWRNZXRhRGF0YSwgZmFsc2UpIC0gMTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0blByb3BlcnR5V2lkdGggPSB0aGlzLmdldE1EQ0NvbHVtbldpZHRoRnJvbURhdGFGaWVsZChvVGFyZ2V0ZWRQcm9wZXJ0eSwgcHJvcGVydGllcywgY29udmVydGVkTWV0YURhdGEsIGZhbHNlKSAtIDE7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzTGFiZWwgPSBkYXRhRmllbGQuTGFiZWwgPyBkYXRhRmllbGQuTGFiZWwgOiBvVGFyZ2V0ZWRQcm9wZXJ0eS5sYWJlbDtcblx0XHRcdGZMYWJlbFdpZHRoID0gc2hvd0RhdGFGaWVsZHNMYWJlbCAmJiBzTGFiZWwgPyBTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKHNMYWJlbCkgOiAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cuZXJyb3IoYENhbm5vdCBjb21wdXRlIHdpZHRoIGZvciB0eXBlIG9iamVjdDogJHtkYXRhRmllbGQuJFR5cGV9YCk7XG5cdFx0fVxuXHRcdHJldHVybiB7IGxhYmVsV2lkdGg6IGZMYWJlbFdpZHRoLCBwcm9wZXJ0eVdpZHRoOiBuUHJvcGVydHlXaWR0aCB9O1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBUYWJsZVNpemVIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FB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