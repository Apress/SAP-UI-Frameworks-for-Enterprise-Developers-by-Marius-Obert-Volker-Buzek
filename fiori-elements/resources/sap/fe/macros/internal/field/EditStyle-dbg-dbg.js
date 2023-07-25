/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockTemplateProcessor) {
  "use strict";

  var xml = BuildingBlockTemplateProcessor.xml;
  //This is not yet a "real" building block, but rather a wrapper for the later on yet to be defined solution.
  const EditStyle = {
    /**
     * Generates the Contact template.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getCheckBoxTemplate(internalField) {
      return xml`
		    <CheckBox
                xmlns="sap.m"        
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		        macrodata:sourcePath="${internalField.dataSourcePath}"
				xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
		        core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				unittest:id="MacroInput"
		        id="${internalField.editStyleId}"
		        selected="${internalField.valueBindingExpression}"
		        editable="${internalField.editableExpression}"
		        enabled="${internalField.enabledExpression}"
		        select="FieldRuntime.handleChange($controller, $event)"
		        fieldGroupIds="${internalField.fieldGroupIds}"
		        validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
		        ariaLabelledBy="${internalField.ariaLabelledBy}"
	    />
        `;
    },
    /**
     * Entry point for further templating processings.
     *
     * @param internalField Reference to the current internal field instance
     * @returns An XML-based string with the definition of the field control
     */
    getTemplate: internalField => {
      let innerFieldContent;
      switch (internalField.editStyle) {
        case "CheckBox":
          innerFieldContent = EditStyle.getCheckBoxTemplate(internalField);
          break;
        default:
          innerFieldContent = xml`<core:Fragment
			fragmentName="sap.fe.macros.internal.field.editStyle.${internalField.editStyle}"
			type="XML"
		/>`;
      }
      return innerFieldContent;
    }
  };
  return EditStyle;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0U3R5bGUiLCJnZXRDaGVja0JveFRlbXBsYXRlIiwiaW50ZXJuYWxGaWVsZCIsInhtbCIsImRhdGFTb3VyY2VQYXRoIiwiZWRpdFN0eWxlSWQiLCJ2YWx1ZUJpbmRpbmdFeHByZXNzaW9uIiwiZWRpdGFibGVFeHByZXNzaW9uIiwiZW5hYmxlZEV4cHJlc3Npb24iLCJmaWVsZEdyb3VwSWRzIiwiYXJpYUxhYmVsbGVkQnkiLCJnZXRUZW1wbGF0ZSIsImlubmVyRmllbGRDb250ZW50IiwiZWRpdFN0eWxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFZGl0U3R5bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEludGVybmFsRmllbGRCbG9jayBmcm9tIFwiLi4vSW50ZXJuYWxGaWVsZC5ibG9ja1wiO1xuXG4vL1RoaXMgaXMgbm90IHlldCBhIFwicmVhbFwiIGJ1aWxkaW5nIGJsb2NrLCBidXQgcmF0aGVyIGEgd3JhcHBlciBmb3IgdGhlIGxhdGVyIG9uIHlldCB0byBiZSBkZWZpbmVkIHNvbHV0aW9uLlxuY29uc3QgRWRpdFN0eWxlID0ge1xuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBDb250YWN0IHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRDaGVja0JveFRlbXBsYXRlKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykge1xuXHRcdHJldHVybiB4bWxgXG5cdFx0ICAgIDxDaGVja0JveFxuICAgICAgICAgICAgICAgIHhtbG5zPVwic2FwLm1cIiAgICAgICAgXG4gICAgICAgICAgICAgICAgeG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0ICAgICAgICBtYWNyb2RhdGE6c291cmNlUGF0aD1cIiR7aW50ZXJuYWxGaWVsZC5kYXRhU291cmNlUGF0aH1cIlxuXHRcdFx0XHR4bWxuczp1bml0dGVzdD1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L3ByZXByb2Nlc3NvcmV4dGVuc2lvbi9zYXAuZmUudW5pdHRlc3RpbmcvMVwiXG5cdFx0ICAgICAgICBjb3JlOnJlcXVpcmU9XCJ7RmllbGRSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFJ1bnRpbWUnfVwiXG5cdFx0XHRcdHVuaXR0ZXN0OmlkPVwiTWFjcm9JbnB1dFwiXG5cdFx0ICAgICAgICBpZD1cIiR7aW50ZXJuYWxGaWVsZC5lZGl0U3R5bGVJZH1cIlxuXHRcdCAgICAgICAgc2VsZWN0ZWQ9XCIke2ludGVybmFsRmllbGQudmFsdWVCaW5kaW5nRXhwcmVzc2lvbn1cIlxuXHRcdCAgICAgICAgZWRpdGFibGU9XCIke2ludGVybmFsRmllbGQuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0ICAgICAgICBlbmFibGVkPVwiJHtpbnRlcm5hbEZpZWxkLmVuYWJsZWRFeHByZXNzaW9ufVwiXG5cdFx0ICAgICAgICBzZWxlY3Q9XCJGaWVsZFJ1bnRpbWUuaGFuZGxlQ2hhbmdlKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHQgICAgICAgIGZpZWxkR3JvdXBJZHM9XCIke2ludGVybmFsRmllbGQuZmllbGRHcm91cElkc31cIlxuXHRcdCAgICAgICAgdmFsaWRhdGVGaWVsZEdyb3VwPVwiRmllbGRSdW50aW1lLm9uVmFsaWRhdGVGaWVsZEdyb3VwKCRjb250cm9sbGVyLCAkZXZlbnQpXCJcblx0XHQgICAgICAgIGFyaWFMYWJlbGxlZEJ5PVwiJHtpbnRlcm5hbEZpZWxkLmFyaWFMYWJlbGxlZEJ5fVwiXG5cdCAgICAvPlxuICAgICAgICBgO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBFbnRyeSBwb2ludCBmb3IgZnVydGhlciB0ZW1wbGF0aW5nIHByb2Nlc3NpbmdzLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxGaWVsZCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgaW50ZXJuYWwgZmllbGQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZTogKGludGVybmFsRmllbGQ6IEludGVybmFsRmllbGRCbG9jaykgPT4ge1xuXHRcdGxldCBpbm5lckZpZWxkQ29udGVudDtcblxuXHRcdHN3aXRjaCAoaW50ZXJuYWxGaWVsZC5lZGl0U3R5bGUpIHtcblx0XHRcdGNhc2UgXCJDaGVja0JveFwiOlxuXHRcdFx0XHRpbm5lckZpZWxkQ29udGVudCA9IEVkaXRTdHlsZS5nZXRDaGVja0JveFRlbXBsYXRlKGludGVybmFsRmllbGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlubmVyRmllbGRDb250ZW50ID0geG1sYDxjb3JlOkZyYWdtZW50XG5cdFx0XHRmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLmludGVybmFsLmZpZWxkLmVkaXRTdHlsZS4ke2ludGVybmFsRmllbGQuZWRpdFN0eWxlfVwiXG5cdFx0XHR0eXBlPVwiWE1MXCJcblx0XHQvPmA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlubmVyRmllbGRDb250ZW50O1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFZGl0U3R5bGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBR0E7RUFDQSxNQUFNQSxTQUFTLEdBQUc7SUFDakI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLG1CQUFtQixDQUFDQyxhQUFpQyxFQUFFO01BQ3RELE9BQU9DLEdBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0NELGFBQWEsQ0FBQ0UsY0FBZTtBQUMvRDtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0JGLGFBQWEsQ0FBQ0csV0FBWTtBQUMxQyxzQkFBc0JILGFBQWEsQ0FBQ0ksc0JBQXVCO0FBQzNELHNCQUFzQkosYUFBYSxDQUFDSyxrQkFBbUI7QUFDdkQscUJBQXFCTCxhQUFhLENBQUNNLGlCQUFrQjtBQUNyRDtBQUNBLDJCQUEyQk4sYUFBYSxDQUFDTyxhQUFjO0FBQ3ZEO0FBQ0EsNEJBQTRCUCxhQUFhLENBQUNRLGNBQWU7QUFDekQ7QUFDQSxTQUFTO0lBQ1IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxXQUFXLEVBQUdULGFBQWlDLElBQUs7TUFDbkQsSUFBSVUsaUJBQWlCO01BRXJCLFFBQVFWLGFBQWEsQ0FBQ1csU0FBUztRQUM5QixLQUFLLFVBQVU7VUFDZEQsaUJBQWlCLEdBQUdaLFNBQVMsQ0FBQ0MsbUJBQW1CLENBQUNDLGFBQWEsQ0FBQztVQUNoRTtRQUNEO1VBQ0NVLGlCQUFpQixHQUFHVCxHQUFJO0FBQzVCLDBEQUEwREQsYUFBYSxDQUFDVyxTQUFVO0FBQ2xGO0FBQ0EsS0FBSztNQUFDO01BR0osT0FBT0QsaUJBQWlCO0lBQ3pCO0VBQ0QsQ0FBQztFQUFDLE9BRWFaLFNBQVM7QUFBQSJ9