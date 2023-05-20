/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/ManagedObject", "sap/ui/core/util/XMLPreprocessor"], function (Log, ManagedObject, XMLPreprocessor) {
  "use strict";

  var bindingParser = ManagedObject.bindingParser;
  //Trace information
  const aTraceInfo = [
    /* Structure for a macro
    		{
    			macro: '', //name of macro
    			metaDataContexts: [ //Properties of type sap.ui.model.Context
    				{
    					name: '', //context property name / key
    					path: '', //from oContext.getPath()
    				}
    			],
    			properties: { // Other properties which become part of {this>}
    				property1: value,
    				property2: value
    			}
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragment creation
    			},
    			traceID: this.index, //ID for this trace information,
    			macroInfo: {
    				macroID: index, // traceID of this macro (redundant for macros)
    				parentMacroID, index // traceID of the parent macro (if it has a parent)
    			}
    		}
    		// Structure for a control
    		{
    			control: '', //control class
    			properties: { // Other properties which become part of {this>}
    				property1: {
    					originalValue: '', //Value before templating
    					resolvedValue: '' //Value after templating
    				}
    			}
    			contexts: { //Models and Contexts used during templating
    				// Model or context name used for this control
    				modelName1: { // For ODataMetaModel
    					path1: {
    						path: '', //absolut path within metamodel
    						data: '', //data of path unless type Object
    					}
    				modelName2: {
    					// for other model types
    					{
    						property1: value,
    						property2: value
    					}
    					// In case binding cannot be resolved -> mark as runtime binding
    					// This is not always true, e.g. in case the path is metamodelpath
    					{
    						"bindingFor": "Runtime"
    					}
    				}
    			},
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragment creation
    			},
    			macroInfo: {
    				macroID: index, // traceID of the macro that created this control
    				parentMacroID, index // traceID of the macro's parent macro
    			},
    			traceID: this.index //ID for this trace information
    		}
    		*/
  ];
  const traceNamespace = "http://schemas.sap.com/sapui5/extension/sap.fe.info/1",
    xmlns = "http://www.w3.org/2000/xmlns/",
    /**
     * Switch is currently based on url parameter
     */
    traceIsOn = location.search.indexOf("sap-ui-xx-feTraceInfo=true") > -1,
    /**
     * Specify all namespaces that shall be traced during templating
     */
    aNamespaces = ["sap.m", "sap.uxap", "sap.ui.unified", "sap.f", "sap.ui.table", "sap.suite.ui.microchart", "sap.ui.layout.form", "sap.ui.mdc", "sap.ui.mdc.link", "sap.ui.mdc.field", "sap.fe.fpm"],
    oCallbacks = {};
  function fnClone(oObject) {
    return JSON.parse(JSON.stringify(oObject));
  }
  async function collectContextInfo(sValue, oContexts, oVisitor, oNode) {
    let aContexts;
    const aPromises = [];
    try {
      aContexts = bindingParser(sValue, undefined, false, true) || [];
    } catch (e) {
      aContexts = [];
    }
    aContexts = Array.isArray(aContexts) ? aContexts : [aContexts];
    aContexts.filter(function (oContext) {
      return oContext.path || oContext.parts;
    }).forEach(function (oContext) {
      const aParts = oContext.parts || [oContext];
      aParts.filter(function (oPartContext) {
        return oPartContext.path;
      }).forEach(function (oPartContext) {
        const oModel = oContexts[oPartContext.model] = oContexts[oPartContext.model] || {};
        const sSimplePath = oPartContext.path.indexOf(">") < 0 ? (oPartContext.model && `${oPartContext.model}>`) + oPartContext.path : oPartContext.path;
        let oRealContext;
        let aInnerParts;
        if (typeof oPartContext.model === "undefined" && sSimplePath.indexOf(">") > -1) {
          aInnerParts = sSimplePath.split(">");
          oPartContext.model = aInnerParts[0];
          oPartContext.path = aInnerParts[1];
        }
        try {
          oRealContext = oVisitor.getContext(sSimplePath);
          const visitorResult = oVisitor.getResult(`{${sSimplePath}}`, oNode);
          aPromises.push(visitorResult.then(function (oResult) {
            var _oRealContext;
            if (((_oRealContext = oRealContext) === null || _oRealContext === void 0 ? void 0 : _oRealContext.getModel().getMetadata().getName()) === "sap.ui.model.json.JSONModel") {
              if (!oResult.getModel()) {
                oModel[oPartContext.path] = oResult; //oRealContext.getObject(oContext.path);
              } else {
                oModel[oPartContext.path] = `Context from ${oResult.getPath()}`;
              }
            } else {
              oModel[oPartContext.path] = {
                path: oRealContext.getPath(),
                data: typeof oResult === "object" ? "[ctrl/cmd-click] on path to see data" : oResult
              };
            }
            return;
          }).catch(function () {
            oModel[oPartContext.path] = {
              bindingFor: "Runtime"
            };
          }));
        } catch (exc) {
          oModel[oPartContext.path] = {
            bindingFor: "Runtime"
          };
        }
      });
    });
    return Promise.all(aPromises);
  }
  async function fillAttributes(oResults, oAttributes, sName, sValue) {
    return oResults.then(function (result) {
      oAttributes[sName] = sValue !== result ? {
        originalValue: sValue,
        resolvedValue: result
      } : sValue;
      return;
    }).catch(function (e) {
      const error = e;
      oAttributes[sName] = {
        originalValue: sValue,
        error: error.stack && error.stack.toString() || e
      };
    });
  }
  async function collectInfo(oNode, oVisitor) {
    const oAttributes = {};
    const aPromises = [];
    const oContexts = {};
    let oResults;
    for (let i = oNode.attributes.length >>> 0; i--;) {
      const oAttribute = oNode.attributes[i],
        sName = oAttribute.nodeName,
        sValue = oNode.getAttribute(sName);
      if (!["core:require"].includes(sName)) {
        aPromises.push(collectContextInfo(sValue, oContexts, oVisitor, oNode));
        oResults = oVisitor.getResult(sValue, oNode);
        if (oResults) {
          aPromises.push(fillAttributes(oResults, oAttributes, sName, sValue));
        } else {
          //What
        }
      }
    }
    return Promise.all(aPromises).then(function () {
      return {
        properties: oAttributes,
        contexts: oContexts
      };
    });
  }
  async function resolve(oNode, oVisitor) {
    try {
      const sControlName = oNode.nodeName.split(":")[1] || oNode.nodeName,
        bIsControl = /^[A-Z]/.test(sControlName),
        oTraceMetadataContext = {
          isError: false,
          control: `${oNode.namespaceURI}.${oNode.nodeName.split(":")[1] || oNode.nodeName}`,
          metaDataContexts: [],
          properties: {}
        };
      if (bIsControl) {
        const firstChild = [...oNode.ownerDocument.children].find(node => !node.nodeName.startsWith("#"));
        if (firstChild && !firstChild.getAttribute("xmlns:trace")) {
          firstChild.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
          firstChild.setAttributeNS(traceNamespace, "trace:is", "on");
        }
        return await collectInfo(oNode, oVisitor).then(async function (result) {
          const bRelevant = Object.keys(result.contexts).length > 0; //If no context was used it is not relevant so we ignore Object.keys(result.properties).length
          if (bRelevant) {
            Object.assign(oTraceMetadataContext, result);
            oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
            oTraceMetadataContext.macroInfo = oVisitor.getSettings()["_macroInfo"];
            oTraceMetadataContext.traceID = aTraceInfo.length;
            oNode.setAttributeNS(traceNamespace, "trace:traceID", oTraceMetadataContext.traceID.toString());
            aTraceInfo.push(oTraceMetadataContext);
          }
          return oVisitor.visitAttributes(oNode);
        }).then(async function () {
          return oVisitor.visitChildNodes(oNode);
        }).catch(function (exc) {
          oTraceMetadataContext.error = {
            exception: exc,
            node: new XMLSerializer().serializeToString(oNode)
          };
        });
      } else {
        await oVisitor.visitAttributes(oNode);
        await oVisitor.visitChildNodes(oNode);
      }
    } catch (exc) {
      Log.error(`Error while tracing '${oNode === null || oNode === void 0 ? void 0 : oNode.nodeName}': ${exc.message}`, "TraceInfo");
      return oVisitor.visitAttributes(oNode).then(async function () {
        return oVisitor.visitChildNodes(oNode);
      });
    }
  }
  /**
   * Register path-through XMLPreprocessor plugin for all namespaces
   * given above in aNamespaces
   */
  if (traceIsOn) {
    aNamespaces.forEach(function (namespace) {
      oCallbacks[namespace] = XMLPreprocessor.plugIn(resolve.bind(namespace), namespace);
    });
  }

  /**
   * Adds information about the processing of one macro to the collection.
   *
   * @name sap.fe.macros.TraceInfo.traceMacroCalls
   * @param sName Macro class name
   * @param oMetadata Definition from macro
   * @param mContexts Available named contexts
   * @param oNode
   * @param oVisitor
   * @returns The traced metadata context
   * @private
   * @ui5-restricted
   * @static
   */

  function traceMacroCalls(sName, oMetadata, mContexts, oNode, oVisitor) {
    try {
      let aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [];
      const aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [];
      const macroInfo = fnClone(oVisitor.getSettings()["_macroInfo"] || {});
      const oTraceMetadataContext = {
        isError: false,
        macro: sName,
        metaDataContexts: [],
        properties: {}
      };
      if (aMetadataContextKeys.length === 0) {
        //In case the macro has no metadata.js we take all metadataContexts except this
        aMetadataContextKeys = Object.keys(mContexts).filter(function (name) {
          return name !== "this";
        });
      }
      if (!oNode.getAttribute("xmlns:trace")) {
        oNode.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
      }
      if (aMetadataContextKeys.length > 0) {
        aMetadataContextKeys.forEach(function (sKey) {
          const oContext = mContexts[sKey],
            oMetaDataContext = oContext && {
              name: sKey,
              path: oContext.getPath()
              //data: JSON.stringify(oContext.getObject(),null,2)
            };

          if (oMetaDataContext) {
            oTraceMetadataContext.metaDataContexts.push(oMetaDataContext);
          }
        });
        aProperties.forEach(function (sKey) {
          const
          //oPropertySettings = oMetadata.properties[sKey],
          oProperty = mContexts.this.getObject(sKey);
          // (oNode.hasAttribute(sKey) && oNode.getAttribute(sKey)) ||
          // (oPropertySettings.hasOwnProperty("defaultValue") && oPropertySettings.define) ||
          // false;

          if (oProperty) {
            oTraceMetadataContext.properties[sKey] = oProperty;
          }
        });
        oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
        oTraceMetadataContext.traceID = aTraceInfo.length;
        macroInfo.parentMacroID = macroInfo.macroID;
        macroInfo.macroID = oTraceMetadataContext.traceID.toString();
        oTraceMetadataContext.macroInfo = macroInfo;
        oNode.setAttributeNS(traceNamespace, "trace:macroID", oTraceMetadataContext.traceID.toString());
        aTraceInfo.push(oTraceMetadataContext);
        return oTraceMetadataContext;
      }
    } catch (exc) {
      var _oVisitor$getContext;
      return {
        isError: true,
        error: exc,
        name: sName,
        node: new XMLSerializer().serializeToString(oNode),
        contextPath: oVisitor === null || oVisitor === void 0 ? void 0 : (_oVisitor$getContext = oVisitor.getContext()) === null || _oVisitor$getContext === void 0 ? void 0 : _oVisitor$getContext.getPath()
      };
    }
  }
  /**
   * Returns the globally stored trace information for the macro or
   * control marked with the given id.
   *
   * Returns all trace information if no id is specified
   *
   *
  <pre>Structure for a macro
  {
  	macro: '', //name of macro
  	metaDataContexts: [ //Properties of type sap.ui.model.Context
  		{
  			name: '', //context property name / key
  			path: '', //from oContext.getPath()
  		}
  	],
  	properties: { // Other properties which become part of {this>}
  		property1: value,
  		property2: value
  	}
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragment creation
  	},
  	traceID: this.index, //ID for this trace information,
  	macroInfo: {
  		macroID: index, // traceID of this macro (redundant for macros)
  		parentMacroID, index // traceID of the parent macro (if it has a parent)
  	}
  }
  Structure for a control
  {
  	control: '', //control class
  	properties: { // Other properties which become part of {this>}
  		property1: {
  			originalValue: '', //Value before templating
  			resolvedValue: '' //Value after templating
  		}
  	}
  	contexts: { //Models and Contexts used during templating
  		// Model or context name used for this control
  		modelName1: { // For ODataMetaModel
  			path1: {
  				path: '', //absolut path within metamodel
  				data: '', //data of path unless type Object
  			}
  		modelName2: {
  			// for other model types
  			{
  				property1: value,
  				property2: value
  			}
  			// In case binding cannot be resolved -> mark as runtime binding
  			// This is not always true, e.g. in case the path is metamodelpath
  			{
  				"bindingFor": "Runtime"
  			}
  		}
  	},
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragment creation
  	},
  	macroInfo: {
  		macroID: index, // traceID of the macro that created this control
  		parentMacroID, index // traceID of the macro's parent macro
  	},
  	traceID: this.index //ID for this trace information
  }</pre>.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.getTraceInfo
   * @param id TraceInfo id
   * @returns Object / Array for TraceInfo
   * @private
   * @static
   */
  function getTraceInfo(id) {
    if (id) {
      return aTraceInfo[id];
    }
    const aErrors = aTraceInfo.filter(function (traceInfo) {
      return traceInfo.error;
    });
    return aErrors.length > 0 && aErrors || aTraceInfo;
  }
  /**
   * Returns true if TraceInfo is active.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.isTraceInfoActive
   * @returns `true` when active
   * @private
   * @static
   */
  function isTraceInfoActive() {
    return traceIsOn;
  }
  /**
   * @typedef sap.fe.macros.TraceInfo
   * TraceInfo for SAP Fiori elements
   *
   * Once traces is switched, information about macros and controls
   * that are processed during xml preprocessing ( @see {@link sap.ui.core.util.XMLPreprocessor})
   * will be collected within this singleton
   * @namespace
   * @private
   * @global
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.74.0
   */
  return {
    isTraceInfoActive: isTraceInfoActive,
    traceMacroCalls: traceMacroCalls,
    getTraceInfo: getTraceInfo
  };
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhVHJhY2VJbmZvIiwidHJhY2VOYW1lc3BhY2UiLCJ4bWxucyIsInRyYWNlSXNPbiIsImxvY2F0aW9uIiwic2VhcmNoIiwiaW5kZXhPZiIsImFOYW1lc3BhY2VzIiwib0NhbGxiYWNrcyIsImZuQ2xvbmUiLCJvT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiY29sbGVjdENvbnRleHRJbmZvIiwic1ZhbHVlIiwib0NvbnRleHRzIiwib1Zpc2l0b3IiLCJvTm9kZSIsImFDb250ZXh0cyIsImFQcm9taXNlcyIsImJpbmRpbmdQYXJzZXIiLCJ1bmRlZmluZWQiLCJlIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwib0NvbnRleHQiLCJwYXRoIiwicGFydHMiLCJmb3JFYWNoIiwiYVBhcnRzIiwib1BhcnRDb250ZXh0Iiwib01vZGVsIiwibW9kZWwiLCJzU2ltcGxlUGF0aCIsIm9SZWFsQ29udGV4dCIsImFJbm5lclBhcnRzIiwic3BsaXQiLCJnZXRDb250ZXh0IiwidmlzaXRvclJlc3VsdCIsImdldFJlc3VsdCIsInB1c2giLCJ0aGVuIiwib1Jlc3VsdCIsImdldE1vZGVsIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZ2V0UGF0aCIsImRhdGEiLCJjYXRjaCIsImJpbmRpbmdGb3IiLCJleGMiLCJQcm9taXNlIiwiYWxsIiwiZmlsbEF0dHJpYnV0ZXMiLCJvUmVzdWx0cyIsIm9BdHRyaWJ1dGVzIiwic05hbWUiLCJyZXN1bHQiLCJvcmlnaW5hbFZhbHVlIiwicmVzb2x2ZWRWYWx1ZSIsImVycm9yIiwic3RhY2siLCJ0b1N0cmluZyIsImNvbGxlY3RJbmZvIiwiaSIsImF0dHJpYnV0ZXMiLCJsZW5ndGgiLCJvQXR0cmlidXRlIiwibm9kZU5hbWUiLCJnZXRBdHRyaWJ1dGUiLCJpbmNsdWRlcyIsInByb3BlcnRpZXMiLCJjb250ZXh0cyIsInJlc29sdmUiLCJzQ29udHJvbE5hbWUiLCJiSXNDb250cm9sIiwidGVzdCIsIm9UcmFjZU1ldGFkYXRhQ29udGV4dCIsImlzRXJyb3IiLCJjb250cm9sIiwibmFtZXNwYWNlVVJJIiwibWV0YURhdGFDb250ZXh0cyIsImZpcnN0Q2hpbGQiLCJvd25lckRvY3VtZW50IiwiY2hpbGRyZW4iLCJmaW5kIiwibm9kZSIsInN0YXJ0c1dpdGgiLCJzZXRBdHRyaWJ1dGVOUyIsImJSZWxldmFudCIsIk9iamVjdCIsImtleXMiLCJhc3NpZ24iLCJ2aWV3SW5mbyIsImdldFZpZXdJbmZvIiwibWFjcm9JbmZvIiwiZ2V0U2V0dGluZ3MiLCJ0cmFjZUlEIiwidmlzaXRBdHRyaWJ1dGVzIiwidmlzaXRDaGlsZE5vZGVzIiwiZXhjZXB0aW9uIiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiTG9nIiwibWVzc2FnZSIsIm5hbWVzcGFjZSIsIlhNTFByZXByb2Nlc3NvciIsInBsdWdJbiIsImJpbmQiLCJ0cmFjZU1hY3JvQ2FsbHMiLCJvTWV0YWRhdGEiLCJtQ29udGV4dHMiLCJhTWV0YWRhdGFDb250ZXh0S2V5cyIsIm1ldGFkYXRhQ29udGV4dHMiLCJhUHJvcGVydGllcyIsIm1hY3JvIiwibmFtZSIsInNLZXkiLCJvTWV0YURhdGFDb250ZXh0Iiwib1Byb3BlcnR5IiwidGhpcyIsImdldE9iamVjdCIsInBhcmVudE1hY3JvSUQiLCJtYWNyb0lEIiwiY29udGV4dFBhdGgiLCJnZXRUcmFjZUluZm8iLCJpZCIsImFFcnJvcnMiLCJ0cmFjZUluZm8iLCJpc1RyYWNlSW5mb0FjdGl2ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHJhY2VJbmZvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgeyBJVmlzaXRvckNhbGxiYWNrLCBUcmFuc2Zvcm1lZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGJpbmRpbmdQYXJzZXIgfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG4vL1RyYWNlIGluZm9ybWF0aW9uXG5jb25zdCBhVHJhY2VJbmZvOiBUcmFjZU1ldGFkYXRhQ29udGV4dFtdID0gW1xuXHQvKiBTdHJ1Y3R1cmUgZm9yIGEgbWFjcm9cblx0XHRcdHtcblx0XHRcdFx0bWFjcm86ICcnLCAvL25hbWUgb2YgbWFjcm9cblx0XHRcdFx0bWV0YURhdGFDb250ZXh0czogWyAvL1Byb3BlcnRpZXMgb2YgdHlwZSBzYXAudWkubW9kZWwuQ29udGV4dFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5hbWU6ICcnLCAvL2NvbnRleHQgcHJvcGVydHkgbmFtZSAvIGtleVxuXHRcdFx0XHRcdFx0cGF0aDogJycsIC8vZnJvbSBvQ29udGV4dC5nZXRQYXRoKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHByb3BlcnRpZXM6IHsgLy8gT3RoZXIgcHJvcGVydGllcyB3aGljaCBiZWNvbWUgcGFydCBvZiB7dGhpcz59XG5cdFx0XHRcdFx0cHJvcGVydHkxOiB2YWx1ZSxcblx0XHRcdFx0XHRwcm9wZXJ0eTI6IHZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdFx0dmlld0luZm86IHtcblx0XHRcdFx0XHR2aWV3SW5mbzoge30gLy8gQXMgc3BlY2lmaWVkIGluIHZpZXcgb3IgZnJhZ21lbnQgY3JlYXRpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0dHJhY2VJRDogdGhpcy5pbmRleCwgLy9JRCBmb3IgdGhpcyB0cmFjZSBpbmZvcm1hdGlvbixcblx0XHRcdFx0bWFjcm9JbmZvOiB7XG5cdFx0XHRcdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhpcyBtYWNybyAocmVkdW5kYW50IGZvciBtYWNyb3MpXG5cdFx0XHRcdFx0cGFyZW50TWFjcm9JRCwgaW5kZXggLy8gdHJhY2VJRCBvZiB0aGUgcGFyZW50IG1hY3JvIChpZiBpdCBoYXMgYSBwYXJlbnQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFN0cnVjdHVyZSBmb3IgYSBjb250cm9sXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRyb2w6ICcnLCAvL2NvbnRyb2wgY2xhc3Ncblx0XHRcdFx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRcdFx0XHRwcm9wZXJ0eTE6IHtcblx0XHRcdFx0XHRcdG9yaWdpbmFsVmFsdWU6ICcnLCAvL1ZhbHVlIGJlZm9yZSB0ZW1wbGF0aW5nXG5cdFx0XHRcdFx0XHRyZXNvbHZlZFZhbHVlOiAnJyAvL1ZhbHVlIGFmdGVyIHRlbXBsYXRpbmdcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGV4dHM6IHsgLy9Nb2RlbHMgYW5kIENvbnRleHRzIHVzZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0XHRcdFx0XHQvLyBNb2RlbCBvciBjb250ZXh0IG5hbWUgdXNlZCBmb3IgdGhpcyBjb250cm9sXG5cdFx0XHRcdFx0bW9kZWxOYW1lMTogeyAvLyBGb3IgT0RhdGFNZXRhTW9kZWxcblx0XHRcdFx0XHRcdHBhdGgxOiB7XG5cdFx0XHRcdFx0XHRcdHBhdGg6ICcnLCAvL2Fic29sdXQgcGF0aCB3aXRoaW4gbWV0YW1vZGVsXG5cdFx0XHRcdFx0XHRcdGRhdGE6ICcnLCAvL2RhdGEgb2YgcGF0aCB1bmxlc3MgdHlwZSBPYmplY3Rcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRtb2RlbE5hbWUyOiB7XG5cdFx0XHRcdFx0XHQvLyBmb3Igb3RoZXIgbW9kZWwgdHlwZXNcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cHJvcGVydHkxOiB2YWx1ZSxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHkyOiB2YWx1ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gSW4gY2FzZSBiaW5kaW5nIGNhbm5vdCBiZSByZXNvbHZlZCAtPiBtYXJrIGFzIHJ1bnRpbWUgYmluZGluZ1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBpcyBub3QgYWx3YXlzIHRydWUsIGUuZy4gaW4gY2FzZSB0aGUgcGF0aCBpcyBtZXRhbW9kZWxwYXRoXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFwiYmluZGluZ0ZvclwiOiBcIlJ1bnRpbWVcIlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0dmlld0luZm86IHtcblx0XHRcdFx0XHR2aWV3SW5mbzoge30gLy8gQXMgc3BlY2lmaWVkIGluIHZpZXcgb3IgZnJhZ21lbnQgY3JlYXRpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0bWFjcm9JbmZvOiB7XG5cdFx0XHRcdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhlIG1hY3JvIHRoYXQgY3JlYXRlZCB0aGlzIGNvbnRyb2xcblx0XHRcdFx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBtYWNybydzIHBhcmVudCBtYWNyb1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0cmFjZUlEOiB0aGlzLmluZGV4IC8vSUQgZm9yIHRoaXMgdHJhY2UgaW5mb3JtYXRpb25cblx0XHRcdH1cblx0XHRcdCovXG5dO1xuY29uc3QgdHJhY2VOYW1lc3BhY2UgPSBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAuZmUuaW5mby8xXCIsXG5cdHhtbG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiLFxuXHQvKipcblx0ICogU3dpdGNoIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB1cmwgcGFyYW1ldGVyXG5cdCAqL1xuXHR0cmFjZUlzT24gPSBsb2NhdGlvbi5zZWFyY2guaW5kZXhPZihcInNhcC11aS14eC1mZVRyYWNlSW5mbz10cnVlXCIpID4gLTEsXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IGFsbCBuYW1lc3BhY2VzIHRoYXQgc2hhbGwgYmUgdHJhY2VkIGR1cmluZyB0ZW1wbGF0aW5nXG5cdCAqL1xuXHRhTmFtZXNwYWNlcyA9IFtcblx0XHRcInNhcC5tXCIsXG5cdFx0XCJzYXAudXhhcFwiLFxuXHRcdFwic2FwLnVpLnVuaWZpZWRcIixcblx0XHRcInNhcC5mXCIsXG5cdFx0XCJzYXAudWkudGFibGVcIixcblx0XHRcInNhcC5zdWl0ZS51aS5taWNyb2NoYXJ0XCIsXG5cdFx0XCJzYXAudWkubGF5b3V0LmZvcm1cIixcblx0XHRcInNhcC51aS5tZGNcIixcblx0XHRcInNhcC51aS5tZGMubGlua1wiLFxuXHRcdFwic2FwLnVpLm1kYy5maWVsZFwiLFxuXHRcdFwic2FwLmZlLmZwbVwiXG5cdF0sXG5cdG9DYWxsYmFja3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbmZ1bmN0aW9uIGZuQ2xvbmUob09iamVjdDogb2JqZWN0KSB7XG5cdHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9PYmplY3QpKTtcbn1cbnR5cGUgVHJhY2VDb250ZXh0ID0ge1xuXHRwYXRoOiBzdHJpbmc7XG5cdG1vZGVsOiBzdHJpbmc7XG5cdHBhcnRzOiBUcmFjZUNvbnRleHRbXTtcbn07XG5hc3luYyBmdW5jdGlvbiBjb2xsZWN0Q29udGV4dEluZm8oXG5cdHNWYWx1ZTogc3RyaW5nIHwgbnVsbCxcblx0b0NvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBUcmFjZUNvbnRleHQ+LFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0b05vZGU6IEVsZW1lbnRcbikge1xuXHRsZXQgYUNvbnRleHRzOiBUcmFjZUNvbnRleHRbXTtcblx0Y29uc3QgYVByb21pc2VzOiBQcm9taXNlPHVua25vd24+W10gPSBbXTtcblx0dHJ5IHtcblx0XHRhQ29udGV4dHMgPSBiaW5kaW5nUGFyc2VyKHNWYWx1ZSwgdW5kZWZpbmVkLCBmYWxzZSwgdHJ1ZSkgfHwgW107XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRhQ29udGV4dHMgPSBbXTtcblx0fVxuXHRhQ29udGV4dHMgPSBBcnJheS5pc0FycmF5KGFDb250ZXh0cykgPyBhQ29udGV4dHMgOiBbYUNvbnRleHRzXTtcblx0YUNvbnRleHRzXG5cdFx0LmZpbHRlcihmdW5jdGlvbiAob0NvbnRleHQpIHtcblx0XHRcdHJldHVybiBvQ29udGV4dC5wYXRoIHx8IG9Db250ZXh0LnBhcnRzO1xuXHRcdH0pXG5cdFx0LmZvckVhY2goZnVuY3Rpb24gKG9Db250ZXh0OiBUcmFjZUNvbnRleHQpIHtcblx0XHRcdGNvbnN0IGFQYXJ0cyA9IG9Db250ZXh0LnBhcnRzIHx8IFtvQ29udGV4dF07XG5cdFx0XHRhUGFydHNcblx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob1BhcnRDb250ZXh0OiBUcmFjZUNvbnRleHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gb1BhcnRDb250ZXh0LnBhdGg7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvUGFydENvbnRleHQ6IFRyYWNlQ29udGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IG9Nb2RlbDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSAob0NvbnRleHRzW29QYXJ0Q29udGV4dC5tb2RlbF0gPSBvQ29udGV4dHNbb1BhcnRDb250ZXh0Lm1vZGVsXSB8fCB7fSk7XG5cdFx0XHRcdFx0Y29uc3Qgc1NpbXBsZVBhdGggPVxuXHRcdFx0XHRcdFx0b1BhcnRDb250ZXh0LnBhdGguaW5kZXhPZihcIj5cIikgPCAwXG5cdFx0XHRcdFx0XHRcdD8gKG9QYXJ0Q29udGV4dC5tb2RlbCAmJiBgJHtvUGFydENvbnRleHQubW9kZWx9PmApICsgb1BhcnRDb250ZXh0LnBhdGhcblx0XHRcdFx0XHRcdFx0OiBvUGFydENvbnRleHQucGF0aDtcblx0XHRcdFx0XHRsZXQgb1JlYWxDb250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGxldCBhSW5uZXJQYXJ0cztcblxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb1BhcnRDb250ZXh0Lm1vZGVsID09PSBcInVuZGVmaW5lZFwiICYmIHNTaW1wbGVQYXRoLmluZGV4T2YoXCI+XCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdGFJbm5lclBhcnRzID0gc1NpbXBsZVBhdGguc3BsaXQoXCI+XCIpO1xuXHRcdFx0XHRcdFx0b1BhcnRDb250ZXh0Lm1vZGVsID0gYUlubmVyUGFydHNbMF07XG5cdFx0XHRcdFx0XHRvUGFydENvbnRleHQucGF0aCA9IGFJbm5lclBhcnRzWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0b1JlYWxDb250ZXh0ID0gb1Zpc2l0b3IuZ2V0Q29udGV4dChzU2ltcGxlUGF0aCk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IHZpc2l0b3JSZXN1bHQgPSBvVmlzaXRvci5nZXRSZXN1bHQoYHske3NTaW1wbGVQYXRofX1gLCBvTm9kZSkhO1xuXHRcdFx0XHRcdFx0YVByb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0XHRcdHZpc2l0b3JSZXN1bHRcblx0XHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAob1Jlc3VsdDogQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9SZWFsQ29udGV4dD8uZ2V0TW9kZWwoKS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubW9kZWwuanNvbi5KU09OTW9kZWxcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9SZXN1bHQuZ2V0TW9kZWwoKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSBvUmVzdWx0OyAvL29SZWFsQ29udGV4dC5nZXRPYmplY3Qob0NvbnRleHQucGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b01vZGVsW29QYXJ0Q29udGV4dC5wYXRoXSA9IGBDb250ZXh0IGZyb20gJHtvUmVzdWx0LmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvTW9kZWxbb1BhcnRDb250ZXh0LnBhdGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGg6IG9SZWFsQ29udGV4dCEuZ2V0UGF0aCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGE6IHR5cGVvZiBvUmVzdWx0ID09PSBcIm9iamVjdFwiID8gXCJbY3RybC9jbWQtY2xpY2tdIG9uIHBhdGggdG8gc2VlIGRhdGFcIiA6IG9SZXN1bHRcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvTW9kZWxbb1BhcnRDb250ZXh0LnBhdGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRiaW5kaW5nRm9yOiBcIlJ1bnRpbWVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGNhdGNoIChleGMpIHtcblx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdGJpbmRpbmdGb3I6IFwiUnVudGltZVwiXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fSk7XG5cdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpO1xufVxuYXN5bmMgZnVuY3Rpb24gZmlsbEF0dHJpYnV0ZXMob1Jlc3VsdHM6IFByb21pc2U8dW5rbm93bj4sIG9BdHRyaWJ1dGVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgc05hbWU6IHN0cmluZywgc1ZhbHVlOiB1bmtub3duKSB7XG5cdHJldHVybiBvUmVzdWx0c1xuXHRcdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQ6IHVua25vd24pIHtcblx0XHRcdG9BdHRyaWJ1dGVzW3NOYW1lXSA9XG5cdFx0XHRcdHNWYWx1ZSAhPT0gcmVzdWx0XG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsVmFsdWU6IHNWYWx1ZSxcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZWRWYWx1ZTogcmVzdWx0XG5cdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0OiBzVmFsdWU7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKGU6IHVua25vd24pIHtcblx0XHRcdGNvbnN0IGVycm9yID0gZSBhcyBFcnJvcjtcblx0XHRcdG9BdHRyaWJ1dGVzW3NOYW1lXSA9IHtcblx0XHRcdFx0b3JpZ2luYWxWYWx1ZTogc1ZhbHVlLFxuXHRcdFx0XHRlcnJvcjogKGVycm9yLnN0YWNrICYmIGVycm9yLnN0YWNrLnRvU3RyaW5nKCkpIHx8IGVcblx0XHRcdH07XG5cdFx0fSk7XG59XG5hc3luYyBmdW5jdGlvbiBjb2xsZWN0SW5mbyhvTm9kZTogRWxlbWVudCwgb1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2spIHtcblx0Y29uc3Qgb0F0dHJpYnV0ZXMgPSB7fTtcblx0Y29uc3QgYVByb21pc2VzID0gW107XG5cdGNvbnN0IG9Db250ZXh0cyA9IHt9O1xuXHRsZXQgb1Jlc3VsdHM7XG5cdGZvciAobGV0IGkgPSBvTm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCA+Pj4gMDsgaS0tOyApIHtcblx0XHRjb25zdCBvQXR0cmlidXRlID0gb05vZGUuYXR0cmlidXRlc1tpXSxcblx0XHRcdHNOYW1lID0gb0F0dHJpYnV0ZS5ub2RlTmFtZSxcblx0XHRcdHNWYWx1ZSA9IG9Ob2RlLmdldEF0dHJpYnV0ZShzTmFtZSkhO1xuXHRcdGlmICghW1wiY29yZTpyZXF1aXJlXCJdLmluY2x1ZGVzKHNOYW1lKSkge1xuXHRcdFx0YVByb21pc2VzLnB1c2goY29sbGVjdENvbnRleHRJbmZvKHNWYWx1ZSwgb0NvbnRleHRzLCBvVmlzaXRvciwgb05vZGUpKTtcblx0XHRcdG9SZXN1bHRzID0gb1Zpc2l0b3IuZ2V0UmVzdWx0KHNWYWx1ZSwgb05vZGUpO1xuXHRcdFx0aWYgKG9SZXN1bHRzKSB7XG5cdFx0XHRcdGFQcm9taXNlcy5wdXNoKGZpbGxBdHRyaWJ1dGVzKG9SZXN1bHRzLCBvQXR0cmlidXRlcywgc05hbWUsIHNWYWx1ZSkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9XaGF0XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7IHByb3BlcnRpZXM6IG9BdHRyaWJ1dGVzLCBjb250ZXh0czogb0NvbnRleHRzIH07XG5cdH0pO1xufVxuZXhwb3J0IHR5cGUgVHJhY2VNZXRhZGF0YUNvbnRleHQgPSB7XG5cdGlzRXJyb3I6IGZhbHNlO1xuXHRtYWNybz86IHN0cmluZztcblx0Y29udHJvbD86IHN0cmluZztcblx0dmlld0luZm8/OiB1bmtub3duO1xuXHRtYWNyb0luZm8/OiBNYWNyb0luZm87XG5cdHRyYWNlSUQ/OiBudW1iZXI7XG5cdGVycm9yPzoge1xuXHRcdGV4Y2VwdGlvbjogRXJyb3I7XG5cdFx0bm9kZTogc3RyaW5nO1xuXHR9O1xuXHRtZXRhRGF0YUNvbnRleHRzOiB7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nIH1bXTtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59O1xuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZShvTm9kZTogRWxlbWVudCwgb1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2spIHtcblx0dHJ5IHtcblx0XHRjb25zdCBzQ29udHJvbE5hbWUgPSBvTm9kZS5ub2RlTmFtZS5zcGxpdChcIjpcIilbMV0gfHwgb05vZGUubm9kZU5hbWUsXG5cdFx0XHRiSXNDb250cm9sID0gL15bQS1aXS8udGVzdChzQ29udHJvbE5hbWUpLFxuXHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0OiBUcmFjZU1ldGFkYXRhQ29udGV4dCA9IHtcblx0XHRcdFx0aXNFcnJvcjogZmFsc2UsXG5cdFx0XHRcdGNvbnRyb2w6IGAke29Ob2RlLm5hbWVzcGFjZVVSSX0uJHtvTm9kZS5ub2RlTmFtZS5zcGxpdChcIjpcIilbMV0gfHwgb05vZGUubm9kZU5hbWV9YCxcblx0XHRcdFx0bWV0YURhdGFDb250ZXh0czogW10sXG5cdFx0XHRcdHByb3BlcnRpZXM6IHt9XG5cdFx0XHR9O1xuXG5cdFx0aWYgKGJJc0NvbnRyb2wpIHtcblx0XHRcdGNvbnN0IGZpcnN0Q2hpbGQgPSBbLi4uKG9Ob2RlLm93bmVyRG9jdW1lbnQuY2hpbGRyZW4gYXMgdW5rbm93biBhcyBFbGVtZW50W10pXS5maW5kKChub2RlKSA9PiAhbm9kZS5ub2RlTmFtZS5zdGFydHNXaXRoKFwiI1wiKSk7XG5cdFx0XHRpZiAoZmlyc3RDaGlsZCAmJiAhZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoXCJ4bWxuczp0cmFjZVwiKSkge1xuXHRcdFx0XHRmaXJzdENoaWxkLnNldEF0dHJpYnV0ZU5TKHhtbG5zLCBcInhtbG5zOnRyYWNlXCIsIHRyYWNlTmFtZXNwYWNlKTtcblx0XHRcdFx0Zmlyc3RDaGlsZC5zZXRBdHRyaWJ1dGVOUyh0cmFjZU5hbWVzcGFjZSwgXCJ0cmFjZTppc1wiLCBcIm9uXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGF3YWl0IGNvbGxlY3RJbmZvKG9Ob2RlLCBvVmlzaXRvcilcblx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJlc3VsdDogeyBwcm9wZXJ0aWVzOiB7fTsgY29udGV4dHM6IHt9IH0pIHtcblx0XHRcdFx0XHRjb25zdCBiUmVsZXZhbnQgPSBPYmplY3Qua2V5cyhyZXN1bHQuY29udGV4dHMpLmxlbmd0aCA+IDA7IC8vSWYgbm8gY29udGV4dCB3YXMgdXNlZCBpdCBpcyBub3QgcmVsZXZhbnQgc28gd2UgaWdub3JlIE9iamVjdC5rZXlzKHJlc3VsdC5wcm9wZXJ0aWVzKS5sZW5ndGhcblx0XHRcdFx0XHRpZiAoYlJlbGV2YW50KSB7XG5cdFx0XHRcdFx0XHRPYmplY3QuYXNzaWduKG9UcmFjZU1ldGFkYXRhQ29udGV4dCwgcmVzdWx0KTtcblx0XHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC52aWV3SW5mbyA9IG9WaXNpdG9yLmdldFZpZXdJbmZvKCk7XG5cdFx0XHRcdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQubWFjcm9JbmZvID0gb1Zpc2l0b3IuZ2V0U2V0dGluZ3MoKVtcIl9tYWNyb0luZm9cIl07XG5cdFx0XHRcdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCA9IGFUcmFjZUluZm8ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0b05vZGUuc2V0QXR0cmlidXRlTlModHJhY2VOYW1lc3BhY2UsIFwidHJhY2U6dHJhY2VJRFwiLCBvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRC50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdGFUcmFjZUluZm8ucHVzaChvVHJhY2VNZXRhZGF0YUNvbnRleHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gb1Zpc2l0b3IudmlzaXRBdHRyaWJ1dGVzKG9Ob2RlKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBvVmlzaXRvci52aXNpdENoaWxkTm9kZXMob05vZGUpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGV4YzogdW5rbm93bikge1xuXHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5lcnJvciA9IHtcblx0XHRcdFx0XHRcdGV4Y2VwdGlvbjogZXhjIGFzIEVycm9yLFxuXHRcdFx0XHRcdFx0bm9kZTogbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhvTm9kZSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXRBdHRyaWJ1dGVzKG9Ob2RlKTtcblx0XHRcdGF3YWl0IG9WaXNpdG9yLnZpc2l0Q2hpbGROb2RlcyhvTm9kZSk7XG5cdFx0fVxuXHR9IGNhdGNoIChleGM6IHVua25vd24pIHtcblx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIHRyYWNpbmcgJyR7b05vZGU/Lm5vZGVOYW1lfSc6ICR7KGV4YyBhcyBFcnJvcikubWVzc2FnZX1gLCBcIlRyYWNlSW5mb1wiKTtcblx0XHRyZXR1cm4gb1Zpc2l0b3IudmlzaXRBdHRyaWJ1dGVzKG9Ob2RlKS50aGVuKGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBvVmlzaXRvci52aXNpdENoaWxkTm9kZXMob05vZGUpO1xuXHRcdH0pO1xuXHR9XG59XG4vKipcbiAqIFJlZ2lzdGVyIHBhdGgtdGhyb3VnaCBYTUxQcmVwcm9jZXNzb3IgcGx1Z2luIGZvciBhbGwgbmFtZXNwYWNlc1xuICogZ2l2ZW4gYWJvdmUgaW4gYU5hbWVzcGFjZXNcbiAqL1xuaWYgKHRyYWNlSXNPbikge1xuXHRhTmFtZXNwYWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lc3BhY2U6IHN0cmluZykge1xuXHRcdG9DYWxsYmFja3NbbmFtZXNwYWNlXSA9IFhNTFByZXByb2Nlc3Nvci5wbHVnSW4ocmVzb2x2ZS5iaW5kKG5hbWVzcGFjZSksIG5hbWVzcGFjZSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIEFkZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHByb2Nlc3Npbmcgb2Ygb25lIG1hY3JvIHRvIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuVHJhY2VJbmZvLnRyYWNlTWFjcm9DYWxsc1xuICogQHBhcmFtIHNOYW1lIE1hY3JvIGNsYXNzIG5hbWVcbiAqIEBwYXJhbSBvTWV0YWRhdGEgRGVmaW5pdGlvbiBmcm9tIG1hY3JvXG4gKiBAcGFyYW0gbUNvbnRleHRzIEF2YWlsYWJsZSBuYW1lZCBjb250ZXh0c1xuICogQHBhcmFtIG9Ob2RlXG4gKiBAcGFyYW0gb1Zpc2l0b3JcbiAqIEByZXR1cm5zIFRoZSB0cmFjZWQgbWV0YWRhdGEgY29udGV4dFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICogQHN0YXRpY1xuICovXG5leHBvcnQgdHlwZSBNYWNyb0luZm8gPSB7XG5cdHBhcmVudE1hY3JvSUQ6IHN0cmluZztcblx0bWFjcm9JRDogc3RyaW5nO1xufTtcbmZ1bmN0aW9uIHRyYWNlTWFjcm9DYWxscyhcblx0c05hbWU6IHN0cmluZyxcblx0b01ldGFkYXRhOiBUcmFuc2Zvcm1lZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0bUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0Pixcblx0b05vZGU6IEVsZW1lbnQsXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrXG4pIHtcblx0dHJ5IHtcblx0XHRsZXQgYU1ldGFkYXRhQ29udGV4dEtleXMgPSAob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMgJiYgT2JqZWN0LmtleXMob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMpKSB8fCBbXTtcblx0XHRjb25zdCBhUHJvcGVydGllcyA9IChvTWV0YWRhdGEucHJvcGVydGllcyAmJiBPYmplY3Qua2V5cyhvTWV0YWRhdGEucHJvcGVydGllcykpIHx8IFtdO1xuXHRcdGNvbnN0IG1hY3JvSW5mbzogTWFjcm9JbmZvID0gZm5DbG9uZShvVmlzaXRvci5nZXRTZXR0aW5ncygpW1wiX21hY3JvSW5mb1wiXSB8fCB7fSk7XG5cdFx0Y29uc3Qgb1RyYWNlTWV0YWRhdGFDb250ZXh0OiBUcmFjZU1ldGFkYXRhQ29udGV4dCA9IHtcblx0XHRcdGlzRXJyb3I6IGZhbHNlLFxuXHRcdFx0bWFjcm86IHNOYW1lLFxuXHRcdFx0bWV0YURhdGFDb250ZXh0czogW10sXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fVxuXHRcdH07XG5cblx0XHRpZiAoYU1ldGFkYXRhQ29udGV4dEtleXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQvL0luIGNhc2UgdGhlIG1hY3JvIGhhcyBubyBtZXRhZGF0YS5qcyB3ZSB0YWtlIGFsbCBtZXRhZGF0YUNvbnRleHRzIGV4Y2VwdCB0aGlzXG5cdFx0XHRhTWV0YWRhdGFDb250ZXh0S2V5cyA9IE9iamVjdC5rZXlzKG1Db250ZXh0cykuZmlsdGVyKGZ1bmN0aW9uIChuYW1lOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIG5hbWUgIT09IFwidGhpc1wiO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFvTm9kZS5nZXRBdHRyaWJ1dGUoXCJ4bWxuczp0cmFjZVwiKSkge1xuXHRcdFx0b05vZGUuc2V0QXR0cmlidXRlTlMoeG1sbnMsIFwieG1sbnM6dHJhY2VcIiwgdHJhY2VOYW1lc3BhY2UpO1xuXHRcdH1cblxuXHRcdGlmIChhTWV0YWRhdGFDb250ZXh0S2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhTWV0YWRhdGFDb250ZXh0S2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0Y29uc3Qgb0NvbnRleHQgPSBtQ29udGV4dHNbc0tleV0sXG5cdFx0XHRcdFx0b01ldGFEYXRhQ29udGV4dCA9IG9Db250ZXh0ICYmIHtcblx0XHRcdFx0XHRcdG5hbWU6IHNLZXksXG5cdFx0XHRcdFx0XHRwYXRoOiBvQ29udGV4dC5nZXRQYXRoKClcblx0XHRcdFx0XHRcdC8vZGF0YTogSlNPTi5zdHJpbmdpZnkob0NvbnRleHQuZ2V0T2JqZWN0KCksbnVsbCwyKVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKG9NZXRhRGF0YUNvbnRleHQpIHtcblx0XHRcdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQubWV0YURhdGFDb250ZXh0cy5wdXNoKG9NZXRhRGF0YUNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0YVByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IC8vb1Byb3BlcnR5U2V0dGluZ3MgPSBvTWV0YWRhdGEucHJvcGVydGllc1tzS2V5XSxcblx0XHRcdFx0XHRvUHJvcGVydHkgPSBtQ29udGV4dHMudGhpcy5nZXRPYmplY3Qoc0tleSk7XG5cdFx0XHRcdC8vIChvTm9kZS5oYXNBdHRyaWJ1dGUoc0tleSkgJiYgb05vZGUuZ2V0QXR0cmlidXRlKHNLZXkpKSB8fFxuXHRcdFx0XHQvLyAob1Byb3BlcnR5U2V0dGluZ3MuaGFzT3duUHJvcGVydHkoXCJkZWZhdWx0VmFsdWVcIikgJiYgb1Byb3BlcnR5U2V0dGluZ3MuZGVmaW5lKSB8fFxuXHRcdFx0XHQvLyBmYWxzZTtcblxuXHRcdFx0XHRpZiAob1Byb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0LnByb3BlcnRpZXNbc0tleV0gPSBvUHJvcGVydHk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0LnZpZXdJbmZvID0gb1Zpc2l0b3IuZ2V0Vmlld0luZm8oKTtcblx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC50cmFjZUlEID0gYVRyYWNlSW5mby5sZW5ndGg7XG5cdFx0XHRtYWNyb0luZm8ucGFyZW50TWFjcm9JRCA9IG1hY3JvSW5mby5tYWNyb0lEO1xuXHRcdFx0bWFjcm9JbmZvLm1hY3JvSUQgPSBvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRC50b1N0cmluZygpO1xuXHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0Lm1hY3JvSW5mbyA9IG1hY3JvSW5mbztcblx0XHRcdG9Ob2RlLnNldEF0dHJpYnV0ZU5TKHRyYWNlTmFtZXNwYWNlLCBcInRyYWNlOm1hY3JvSURcIiwgb1RyYWNlTWV0YWRhdGFDb250ZXh0LnRyYWNlSUQudG9TdHJpbmcoKSk7XG5cdFx0XHRhVHJhY2VJbmZvLnB1c2gob1RyYWNlTWV0YWRhdGFDb250ZXh0KTtcblx0XHRcdHJldHVybiBvVHJhY2VNZXRhZGF0YUNvbnRleHQ7XG5cdFx0fVxuXHR9IGNhdGNoIChleGMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXNFcnJvcjogdHJ1ZSxcblx0XHRcdGVycm9yOiBleGMsXG5cdFx0XHRuYW1lOiBzTmFtZSxcblx0XHRcdG5vZGU6IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcob05vZGUpLFxuXHRcdFx0Y29udGV4dFBhdGg6IG9WaXNpdG9yPy5nZXRDb250ZXh0KCk/LmdldFBhdGgoKVxuXHRcdH07XG5cdH1cbn1cbi8qKlxuICogUmV0dXJucyB0aGUgZ2xvYmFsbHkgc3RvcmVkIHRyYWNlIGluZm9ybWF0aW9uIGZvciB0aGUgbWFjcm8gb3JcbiAqIGNvbnRyb2wgbWFya2VkIHdpdGggdGhlIGdpdmVuIGlkLlxuICpcbiAqIFJldHVybnMgYWxsIHRyYWNlIGluZm9ybWF0aW9uIGlmIG5vIGlkIGlzIHNwZWNpZmllZFxuICpcbiAqXG48cHJlPlN0cnVjdHVyZSBmb3IgYSBtYWNyb1xue1xuXHRtYWNybzogJycsIC8vbmFtZSBvZiBtYWNyb1xuXHRtZXRhRGF0YUNvbnRleHRzOiBbIC8vUHJvcGVydGllcyBvZiB0eXBlIHNhcC51aS5tb2RlbC5Db250ZXh0XG5cdFx0e1xuXHRcdFx0bmFtZTogJycsIC8vY29udGV4dCBwcm9wZXJ0eSBuYW1lIC8ga2V5XG5cdFx0XHRwYXRoOiAnJywgLy9mcm9tIG9Db250ZXh0LmdldFBhdGgoKVxuXHRcdH1cblx0XSxcblx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdHByb3BlcnR5MjogdmFsdWVcblx0fVxuXHR2aWV3SW5mbzoge1xuXHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnbWVudCBjcmVhdGlvblxuXHR9LFxuXHR0cmFjZUlEOiB0aGlzLmluZGV4LCAvL0lEIGZvciB0aGlzIHRyYWNlIGluZm9ybWF0aW9uLFxuXHRtYWNyb0luZm86IHtcblx0XHRtYWNyb0lEOiBpbmRleCwgLy8gdHJhY2VJRCBvZiB0aGlzIG1hY3JvIChyZWR1bmRhbnQgZm9yIG1hY3Jvcylcblx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBwYXJlbnQgbWFjcm8gKGlmIGl0IGhhcyBhIHBhcmVudClcblx0fVxufVxuU3RydWN0dXJlIGZvciBhIGNvbnRyb2xcbntcblx0Y29udHJvbDogJycsIC8vY29udHJvbCBjbGFzc1xuXHRwcm9wZXJ0aWVzOiB7IC8vIE90aGVyIHByb3BlcnRpZXMgd2hpY2ggYmVjb21lIHBhcnQgb2Yge3RoaXM+fVxuXHRcdHByb3BlcnR5MToge1xuXHRcdFx0b3JpZ2luYWxWYWx1ZTogJycsIC8vVmFsdWUgYmVmb3JlIHRlbXBsYXRpbmdcblx0XHRcdHJlc29sdmVkVmFsdWU6ICcnIC8vVmFsdWUgYWZ0ZXIgdGVtcGxhdGluZ1xuXHRcdH1cblx0fVxuXHRjb250ZXh0czogeyAvL01vZGVscyBhbmQgQ29udGV4dHMgdXNlZCBkdXJpbmcgdGVtcGxhdGluZ1xuXHRcdC8vIE1vZGVsIG9yIGNvbnRleHQgbmFtZSB1c2VkIGZvciB0aGlzIGNvbnRyb2xcblx0XHRtb2RlbE5hbWUxOiB7IC8vIEZvciBPRGF0YU1ldGFNb2RlbFxuXHRcdFx0cGF0aDE6IHtcblx0XHRcdFx0cGF0aDogJycsIC8vYWJzb2x1dCBwYXRoIHdpdGhpbiBtZXRhbW9kZWxcblx0XHRcdFx0ZGF0YTogJycsIC8vZGF0YSBvZiBwYXRoIHVubGVzcyB0eXBlIE9iamVjdFxuXHRcdFx0fVxuXHRcdG1vZGVsTmFtZTI6IHtcblx0XHRcdC8vIGZvciBvdGhlciBtb2RlbCB0eXBlc1xuXHRcdFx0e1xuXHRcdFx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdFx0XHRwcm9wZXJ0eTI6IHZhbHVlXG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBjYXNlIGJpbmRpbmcgY2Fubm90IGJlIHJlc29sdmVkIC0+IG1hcmsgYXMgcnVudGltZSBiaW5kaW5nXG5cdFx0XHQvLyBUaGlzIGlzIG5vdCBhbHdheXMgdHJ1ZSwgZS5nLiBpbiBjYXNlIHRoZSBwYXRoIGlzIG1ldGFtb2RlbHBhdGhcblx0XHRcdHtcblx0XHRcdFx0XCJiaW5kaW5nRm9yXCI6IFwiUnVudGltZVwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHR2aWV3SW5mbzoge1xuXHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnbWVudCBjcmVhdGlvblxuXHR9LFxuXHRtYWNyb0luZm86IHtcblx0XHRtYWNyb0lEOiBpbmRleCwgLy8gdHJhY2VJRCBvZiB0aGUgbWFjcm8gdGhhdCBjcmVhdGVkIHRoaXMgY29udHJvbFxuXHRcdHBhcmVudE1hY3JvSUQsIGluZGV4IC8vIHRyYWNlSUQgb2YgdGhlIG1hY3JvJ3MgcGFyZW50IG1hY3JvXG5cdH0sXG5cdHRyYWNlSUQ6IHRoaXMuaW5kZXggLy9JRCBmb3IgdGhpcyB0cmFjZSBpbmZvcm1hdGlvblxufTwvcHJlPi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuVHJhY2VJbmZvLmdldFRyYWNlSW5mb1xuICogQHBhcmFtIGlkIFRyYWNlSW5mbyBpZFxuICogQHJldHVybnMgT2JqZWN0IC8gQXJyYXkgZm9yIFRyYWNlSW5mb1xuICogQHByaXZhdGVcbiAqIEBzdGF0aWNcbiAqL1xuZnVuY3Rpb24gZ2V0VHJhY2VJbmZvKGlkOiBudW1iZXIpIHtcblx0aWYgKGlkKSB7XG5cdFx0cmV0dXJuIGFUcmFjZUluZm9baWRdO1xuXHR9XG5cdGNvbnN0IGFFcnJvcnMgPSBhVHJhY2VJbmZvLmZpbHRlcihmdW5jdGlvbiAodHJhY2VJbmZvOiBUcmFjZU1ldGFkYXRhQ29udGV4dCkge1xuXHRcdHJldHVybiB0cmFjZUluZm8uZXJyb3I7XG5cdH0pO1xuXHRyZXR1cm4gKGFFcnJvcnMubGVuZ3RoID4gMCAmJiBhRXJyb3JzKSB8fCBhVHJhY2VJbmZvO1xufVxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgVHJhY2VJbmZvIGlzIGFjdGl2ZS5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuVHJhY2VJbmZvLmlzVHJhY2VJbmZvQWN0aXZlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgd2hlbiBhY3RpdmVcbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKi9cbmZ1bmN0aW9uIGlzVHJhY2VJbmZvQWN0aXZlKCkge1xuXHRyZXR1cm4gdHJhY2VJc09uO1xufVxuLyoqXG4gKiBAdHlwZWRlZiBzYXAuZmUubWFjcm9zLlRyYWNlSW5mb1xuICogVHJhY2VJbmZvIGZvciBTQVAgRmlvcmkgZWxlbWVudHNcbiAqXG4gKiBPbmNlIHRyYWNlcyBpcyBzd2l0Y2hlZCwgaW5mb3JtYXRpb24gYWJvdXQgbWFjcm9zIGFuZCBjb250cm9sc1xuICogdGhhdCBhcmUgcHJvY2Vzc2VkIGR1cmluZyB4bWwgcHJlcHJvY2Vzc2luZyAoIEBzZWUge0BsaW5rIHNhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yfSlcbiAqIHdpbGwgYmUgY29sbGVjdGVkIHdpdGhpbiB0aGlzIHNpbmdsZXRvblxuICogQG5hbWVzcGFjZVxuICogQHByaXZhdGVcbiAqIEBnbG9iYWxcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS43NC4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblx0aXNUcmFjZUluZm9BY3RpdmU6IGlzVHJhY2VJbmZvQWN0aXZlLFxuXHR0cmFjZU1hY3JvQ2FsbHM6IHRyYWNlTWFjcm9DYWxscyxcblx0Z2V0VHJhY2VJbmZvOiBnZXRUcmFjZUluZm9cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBS0E7RUFDQSxNQUFNQSxVQUFrQyxHQUFHO0lBQzFDO0FBQ0Q7QUFDQTtBQUNB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