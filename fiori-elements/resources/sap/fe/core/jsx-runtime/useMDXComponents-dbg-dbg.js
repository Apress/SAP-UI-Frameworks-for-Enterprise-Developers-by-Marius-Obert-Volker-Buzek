/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/jsx-runtime/ViewLoader", "sap/fe/macros/macroLibrary", "sap/m/FormattedText", "sap/m/HBox", "sap/m/Panel", "sap/m/Title", "sap/ui/codeeditor/CodeEditor", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockTemplateProcessor, ClassSupport, MDXViewLoader, macroLibrary, FormattedText, HBox, Panel, Title, CodeEditor, Fragment, library, XMLPreprocessor, _jsx) {
  "use strict";

  var TitleLevel = library.TitleLevel;
  var createReference = ClassSupport.createReference;
  var parseXMLString = BuildingBlockTemplateProcessor.parseXMLString;
  function p(strValue) {
    const content = Array.isArray(strValue.children) ? strValue.children.map(child => {
      let output;
      if (typeof child === "string") {
        output = child;
      } else {
        switch (child.getMetadata().getName()) {
          case "sap.m.Link":
            output = `<a href="${child.getHref()}">${child.getText()}</a>`;
            break;
          case "sap.ui.codeeditor.CodeEditor":
            output = `<code>${child.getValue()}</code>`;
            break;
        }
      }
      return output;
    }).join("") : strValue.children;
    return _jsx(FormattedText, {
      htmlText: content,
      class: "sapUiTinyMarginBottom"
    });
  }
  function h1(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H1,
      class: "sapUiTinyMarginBottom"
    });
  }
  function a(strValue) {
    return `<a href={strValue.href}>${strValue.children}</a>`;
  }
  function ul(strValue) {
    const ulContent = `<ul>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</ul>`;
    return _jsx(FormattedText, {
      htmlText: ulContent
    });
  }
  function li(strValue) {
    return `<li>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</li>`;
  }
  function h2(strValue) {
    return _jsx(Title, {
      text: strValue.children,
      level: TitleLevel.H2,
      class: "sapUiSmallMarginTop sapUiTinyMarginBottom"
    });
  }
  function pre(content) {
    return content.children;
  }
  function BuildingBlockPlayground(inValue) {
    const sourceHBox = createReference();
    const binding = inValue.binding ? {
      path: inValue.binding
    } : undefined;
    const target = _jsx(Panel, {
      headerText: inValue.headerText || "",
      class: "sapUiSmallMarginTop",
      children: _jsx(HBox, {
        ref: sourceHBox
      })
    });
    // 	<TabContainer>
    // 		{{
    // 			items: [
    // 				<TabContainerItem name={"Sample"}>{{ content:  }},</TabContainerItem>,
    // 				<TabContainerItem name={"Source"}>
    // 					{{
    // 						content: (
    // 							<CodeBlock editable={false} lineNumbers={true} type={"xml"} lineCount={10}>
    // 								{inValue.children}
    // 							</CodeBlock>
    // 						)
    // 					}}
    // 				</TabContainerItem>
    // 			]
    // 		}}
    // 	</TabContainer>
    // );
    if (binding) {
      target.bindElement(binding);
    }
    macroLibrary.register();
    const fragmentOrPromise = XMLPreprocessor.process(parseXMLString(`<root>${inValue.children}</root>`, true)[0], {
      name: "myBuildingBlockFragment"
    }, MDXViewLoader.preprocessorData);
    Promise.resolve(fragmentOrPromise).then(fragment => {
      return Fragment.load({
        definition: fragment.firstElementChild,
        controller: MDXViewLoader.controller
      });
    }).then(fragmentContent => {
      sourceHBox.current.removeAllItems();
      sourceHBox.current.addItem(fragmentContent);
    }).catch(err => {
      Log.error(err);
    });
    return target;
  }
  function CodeBlock(inValue) {
    var _inValue$children, _snippet$split, _inValue$className;
    const snippet = ((_inValue$children = inValue.children) === null || _inValue$children === void 0 ? void 0 : _inValue$children.trim()) || "";
    const lineCount = inValue.lineCount || Math.max((_snippet$split = snippet.split("\n")) === null || _snippet$split === void 0 ? void 0 : _snippet$split.length, 3);
    const type = inValue.type || (inValue === null || inValue === void 0 ? void 0 : (_inValue$className = inValue.className) === null || _inValue$className === void 0 ? void 0 : _inValue$className.split("-")[1]) || "js";
    const myCodeEditor = _jsx(CodeEditor, {
      class: "sapUiTinyMargin",
      lineNumbers: inValue.lineNumbers || false,
      type: type,
      editable: inValue.editable || false,
      maxLines: lineCount,
      height: "auto",
      width: "98%"
    });
    myCodeEditor.setValue(snippet);
    if (inValue.source) {
      fetch(inValue.source).then(res => res.text()).then(text => {
        var _text$split;
        const newLineCount = Math.max((_text$split = text.split("\n")) === null || _text$split === void 0 ? void 0 : _text$split.length, 3);
        myCodeEditor.setMaxLines(newLineCount);
        myCodeEditor.setValue(text);
      }).catch(e => {
        myCodeEditor.setValue(e.message);
      });
    }
    return myCodeEditor;
  }
  const provideComponenents = function () {
    return {
      p: p,
      a: a,
      h1: h1,
      h2: h2,
      ul: ul,
      li: li,
      pre: pre,
      code: CodeBlock,
      CodeBlock: CodeBlock,
      BuildingBlockPlayground: BuildingBlockPlayground
    };
  };
  return provideComponenents;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwIiwic3RyVmFsdWUiLCJjb250ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiY2hpbGRyZW4iLCJtYXAiLCJjaGlsZCIsIm91dHB1dCIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEhyZWYiLCJnZXRUZXh0IiwiZ2V0VmFsdWUiLCJqb2luIiwiaDEiLCJUaXRsZUxldmVsIiwiSDEiLCJhIiwidWwiLCJ1bENvbnRlbnQiLCJsaSIsImgyIiwiSDIiLCJwcmUiLCJCdWlsZGluZ0Jsb2NrUGxheWdyb3VuZCIsImluVmFsdWUiLCJzb3VyY2VIQm94IiwiY3JlYXRlUmVmZXJlbmNlIiwiYmluZGluZyIsInBhdGgiLCJ1bmRlZmluZWQiLCJ0YXJnZXQiLCJoZWFkZXJUZXh0IiwiYmluZEVsZW1lbnQiLCJtYWNyb0xpYnJhcnkiLCJyZWdpc3RlciIsImZyYWdtZW50T3JQcm9taXNlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsInBhcnNlWE1MU3RyaW5nIiwibmFtZSIsIk1EWFZpZXdMb2FkZXIiLCJwcmVwcm9jZXNzb3JEYXRhIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwiZnJhZ21lbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJjb250cm9sbGVyIiwiZnJhZ21lbnRDb250ZW50IiwiY3VycmVudCIsInJlbW92ZUFsbEl0ZW1zIiwiYWRkSXRlbSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJDb2RlQmxvY2siLCJzbmlwcGV0IiwidHJpbSIsImxpbmVDb3VudCIsIk1hdGgiLCJtYXgiLCJzcGxpdCIsImxlbmd0aCIsInR5cGUiLCJjbGFzc05hbWUiLCJteUNvZGVFZGl0b3IiLCJsaW5lTnVtYmVycyIsImVkaXRhYmxlIiwic2V0VmFsdWUiLCJzb3VyY2UiLCJmZXRjaCIsInJlcyIsInRleHQiLCJuZXdMaW5lQ291bnQiLCJzZXRNYXhMaW5lcyIsImUiLCJtZXNzYWdlIiwicHJvdmlkZUNvbXBvbmVuZW50cyIsImNvZGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbInVzZU1EWENvbXBvbmVudHMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgcGFyc2VYTUxTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBjcmVhdGVSZWZlcmVuY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNRFhWaWV3TG9hZGVyIGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9WaWV3TG9hZGVyXCI7XG5pbXBvcnQgbWFjcm9MaWJyYXJ5IGZyb20gXCJzYXAvZmUvbWFjcm9zL21hY3JvTGlicmFyeVwiO1xuaW1wb3J0IEZvcm1hdHRlZFRleHQgZnJvbSBcInNhcC9tL0Zvcm1hdHRlZFRleHRcIjtcbmltcG9ydCBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgUGFuZWwgZnJvbSBcInNhcC9tL1BhbmVsXCI7XG5pbXBvcnQgVGl0bGUgZnJvbSBcInNhcC9tL1RpdGxlXCI7XG5pbXBvcnQgQ29kZUVkaXRvciBmcm9tIFwic2FwL3VpL2NvZGVlZGl0b3IvQ29kZUVkaXRvclwiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IHsgVGl0bGVMZXZlbCB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuZnVuY3Rpb24gcChzdHJWYWx1ZTogYW55KSB7XG5cdGNvbnN0IGNvbnRlbnQgPSBBcnJheS5pc0FycmF5KHN0clZhbHVlLmNoaWxkcmVuKVxuXHRcdD8gc3RyVmFsdWUuY2hpbGRyZW5cblx0XHRcdFx0Lm1hcCgoY2hpbGQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGxldCBvdXRwdXQ7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0b3V0cHV0ID0gY2hpbGQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN3aXRjaCAoY2hpbGQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkpIHtcblx0XHRcdFx0XHRcdFx0Y2FzZSBcInNhcC5tLkxpbmtcIjpcblx0XHRcdFx0XHRcdFx0XHRvdXRwdXQgPSBgPGEgaHJlZj1cIiR7Y2hpbGQuZ2V0SHJlZigpfVwiPiR7Y2hpbGQuZ2V0VGV4dCgpfTwvYT5gO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRjYXNlIFwic2FwLnVpLmNvZGVlZGl0b3IuQ29kZUVkaXRvclwiOlxuXHRcdFx0XHRcdFx0XHRcdG91dHB1dCA9IGA8Y29kZT4ke2NoaWxkLmdldFZhbHVlKCl9PC9jb2RlPmA7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5qb2luKFwiXCIpXG5cdFx0OiBzdHJWYWx1ZS5jaGlsZHJlbjtcblx0cmV0dXJuIDxGb3JtYXR0ZWRUZXh0IGh0bWxUZXh0PXtjb250ZW50fSBjbGFzcz17XCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIn0gLz47XG59XG5cbmZ1bmN0aW9uIGgxKHN0clZhbHVlOiBhbnkpIHtcblx0cmV0dXJuIDxUaXRsZSB0ZXh0PXtzdHJWYWx1ZS5jaGlsZHJlbn0gbGV2ZWw9e1RpdGxlTGV2ZWwuSDF9IGNsYXNzPXtcInNhcFVpVGlueU1hcmdpbkJvdHRvbVwifSAvPjtcbn1cbmZ1bmN0aW9uIGEoc3RyVmFsdWU6IGFueSkge1xuXHRyZXR1cm4gYDxhIGhyZWY9e3N0clZhbHVlLmhyZWZ9PiR7c3RyVmFsdWUuY2hpbGRyZW59PC9hPmA7XG59XG5mdW5jdGlvbiB1bChzdHJWYWx1ZTogYW55KSB7XG5cdGNvbnN0IHVsQ29udGVudCA9IGA8dWw+JHtBcnJheS5pc0FycmF5KHN0clZhbHVlLmNoaWxkcmVuKSA/IHN0clZhbHVlLmNoaWxkcmVuLmpvaW4oXCJcIikgOiBzdHJWYWx1ZS5jaGlsZHJlbn08L3VsPmA7XG5cdHJldHVybiA8Rm9ybWF0dGVkVGV4dCBodG1sVGV4dD17dWxDb250ZW50fSAvPjtcbn1cbmZ1bmN0aW9uIGxpKHN0clZhbHVlOiBhbnkpIHtcblx0cmV0dXJuIGA8bGk+JHtBcnJheS5pc0FycmF5KHN0clZhbHVlLmNoaWxkcmVuKSA/IHN0clZhbHVlLmNoaWxkcmVuLmpvaW4oXCJcIikgOiBzdHJWYWx1ZS5jaGlsZHJlbn08L2xpPmA7XG59XG5mdW5jdGlvbiBoMihzdHJWYWx1ZTogYW55KSB7XG5cdHJldHVybiA8VGl0bGUgdGV4dD17c3RyVmFsdWUuY2hpbGRyZW59IGxldmVsPXtUaXRsZUxldmVsLkgyfSBjbGFzcz17XCJzYXBVaVNtYWxsTWFyZ2luVG9wIHNhcFVpVGlueU1hcmdpbkJvdHRvbVwifSAvPjtcbn1cbmZ1bmN0aW9uIHByZShjb250ZW50OiBhbnkpIHtcblx0cmV0dXJuIGNvbnRlbnQuY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIEJ1aWxkaW5nQmxvY2tQbGF5Z3JvdW5kKGluVmFsdWU6IGFueSkge1xuXHRjb25zdCBzb3VyY2VIQm94ID0gY3JlYXRlUmVmZXJlbmNlPEhCb3g+KCk7XG5cdGNvbnN0IGJpbmRpbmcgPSBpblZhbHVlLmJpbmRpbmcgPyB7IHBhdGg6IGluVmFsdWUuYmluZGluZyB9IDogdW5kZWZpbmVkO1xuXHRjb25zdCB0YXJnZXQgPSAoXG5cdFx0PFBhbmVsIGhlYWRlclRleHQ9e2luVmFsdWUuaGVhZGVyVGV4dCB8fCBcIlwifSBjbGFzcz17XCJzYXBVaVNtYWxsTWFyZ2luVG9wXCJ9PlxuXHRcdFx0PEhCb3ggcmVmPXtzb3VyY2VIQm94fT48L0hCb3g+XG5cdFx0PC9QYW5lbD5cblx0KTtcblx0Ly8gXHQ8VGFiQ29udGFpbmVyPlxuXHQvLyBcdFx0e3tcblx0Ly8gXHRcdFx0aXRlbXM6IFtcblx0Ly8gXHRcdFx0XHQ8VGFiQ29udGFpbmVySXRlbSBuYW1lPXtcIlNhbXBsZVwifT57eyBjb250ZW50OiAgfX0sPC9UYWJDb250YWluZXJJdGVtPixcblx0Ly8gXHRcdFx0XHQ8VGFiQ29udGFpbmVySXRlbSBuYW1lPXtcIlNvdXJjZVwifT5cblx0Ly8gXHRcdFx0XHRcdHt7XG5cdC8vIFx0XHRcdFx0XHRcdGNvbnRlbnQ6IChcblx0Ly8gXHRcdFx0XHRcdFx0XHQ8Q29kZUJsb2NrIGVkaXRhYmxlPXtmYWxzZX0gbGluZU51bWJlcnM9e3RydWV9IHR5cGU9e1wieG1sXCJ9IGxpbmVDb3VudD17MTB9PlxuXHQvLyBcdFx0XHRcdFx0XHRcdFx0e2luVmFsdWUuY2hpbGRyZW59XG5cdC8vIFx0XHRcdFx0XHRcdFx0PC9Db2RlQmxvY2s+XG5cdC8vIFx0XHRcdFx0XHRcdClcblx0Ly8gXHRcdFx0XHRcdH19XG5cdC8vIFx0XHRcdFx0PC9UYWJDb250YWluZXJJdGVtPlxuXHQvLyBcdFx0XHRdXG5cdC8vIFx0XHR9fVxuXHQvLyBcdDwvVGFiQ29udGFpbmVyPlxuXHQvLyApO1xuXHRpZiAoYmluZGluZykge1xuXHRcdHRhcmdldC5iaW5kRWxlbWVudChiaW5kaW5nKTtcblx0fVxuXHRtYWNyb0xpYnJhcnkucmVnaXN0ZXIoKTtcblx0Y29uc3QgZnJhZ21lbnRPclByb21pc2UgPSBYTUxQcmVwcm9jZXNzb3IucHJvY2Vzcyhcblx0XHRwYXJzZVhNTFN0cmluZyhgPHJvb3Q+JHtpblZhbHVlLmNoaWxkcmVufTwvcm9vdD5gLCB0cnVlKVswXSxcblx0XHR7IG5hbWU6IFwibXlCdWlsZGluZ0Jsb2NrRnJhZ21lbnRcIiB9LFxuXHRcdE1EWFZpZXdMb2FkZXIucHJlcHJvY2Vzc29yRGF0YVxuXHQpO1xuXHRQcm9taXNlLnJlc29sdmUoZnJhZ21lbnRPclByb21pc2UpXG5cdFx0LnRoZW4oKGZyYWdtZW50OiBFbGVtZW50KSA9PiB7XG5cdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IGZyYWdtZW50LmZpcnN0RWxlbWVudENoaWxkIGFzIGFueSwgY29udHJvbGxlcjogTURYVmlld0xvYWRlci5jb250cm9sbGVyIH0pO1xuXHRcdH0pXG5cdFx0LnRoZW4oKGZyYWdtZW50Q29udGVudDogYW55KSA9PiB7XG5cdFx0XHRzb3VyY2VIQm94LmN1cnJlbnQucmVtb3ZlQWxsSXRlbXMoKTtcblx0XHRcdHNvdXJjZUhCb3guY3VycmVudC5hZGRJdGVtKGZyYWdtZW50Q29udGVudCk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycjogYW55KSA9PiB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHR9KTtcblx0cmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIENvZGVCbG9jayhpblZhbHVlOiBhbnkpIHtcblx0Y29uc3Qgc25pcHBldCA9IGluVmFsdWUuY2hpbGRyZW4/LnRyaW0oKSB8fCBcIlwiO1xuXHRjb25zdCBsaW5lQ291bnQgPSBpblZhbHVlLmxpbmVDb3VudCB8fCBNYXRoLm1heChzbmlwcGV0LnNwbGl0KFwiXFxuXCIpPy5sZW5ndGgsIDMpO1xuXHRjb25zdCB0eXBlID0gaW5WYWx1ZS50eXBlIHx8IGluVmFsdWU/LmNsYXNzTmFtZT8uc3BsaXQoXCItXCIpWzFdIHx8IFwianNcIjtcblx0Y29uc3QgbXlDb2RlRWRpdG9yID0gKFxuXHRcdDxDb2RlRWRpdG9yXG5cdFx0XHRjbGFzcz1cInNhcFVpVGlueU1hcmdpblwiXG5cdFx0XHRsaW5lTnVtYmVycz17aW5WYWx1ZS5saW5lTnVtYmVycyB8fCBmYWxzZX1cblx0XHRcdHR5cGU9e3R5cGV9XG5cdFx0XHRlZGl0YWJsZT17aW5WYWx1ZS5lZGl0YWJsZSB8fCBmYWxzZX1cblx0XHRcdG1heExpbmVzPXtsaW5lQ291bnR9XG5cdFx0XHRoZWlnaHQ9e1wiYXV0b1wifVxuXHRcdFx0d2lkdGg9e1wiOTglXCJ9XG5cdFx0PjwvQ29kZUVkaXRvcj5cblx0KTtcblx0bXlDb2RlRWRpdG9yLnNldFZhbHVlKHNuaXBwZXQpO1xuXHRpZiAoaW5WYWx1ZS5zb3VyY2UpIHtcblx0XHRmZXRjaChpblZhbHVlLnNvdXJjZSlcblx0XHRcdC50aGVuKChyZXMpID0+IHJlcy50ZXh0KCkpXG5cdFx0XHQudGhlbigodGV4dCkgPT4ge1xuXHRcdFx0XHRjb25zdCBuZXdMaW5lQ291bnQgPSBNYXRoLm1heCh0ZXh0LnNwbGl0KFwiXFxuXCIpPy5sZW5ndGgsIDMpO1xuXHRcdFx0XHRteUNvZGVFZGl0b3Iuc2V0TWF4TGluZXMobmV3TGluZUNvdW50KTtcblx0XHRcdFx0bXlDb2RlRWRpdG9yLnNldFZhbHVlKHRleHQpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoZSkgPT4ge1xuXHRcdFx0XHRteUNvZGVFZGl0b3Iuc2V0VmFsdWUoZS5tZXNzYWdlKTtcblx0XHRcdH0pO1xuXHR9XG5cdHJldHVybiBteUNvZGVFZGl0b3I7XG59XG5cbmNvbnN0IHByb3ZpZGVDb21wb25lbmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB7XG5cdFx0cDogcCxcblx0XHRhOiBhLFxuXHRcdGgxOiBoMSxcblx0XHRoMjogaDIsXG5cdFx0dWw6IHVsLFxuXHRcdGxpOiBsaSxcblx0XHRwcmU6IHByZSxcblx0XHRjb2RlOiBDb2RlQmxvY2ssXG5cdFx0Q29kZUJsb2NrOiBDb2RlQmxvY2ssXG5cdFx0QnVpbGRpbmdCbG9ja1BsYXlncm91bmQ6IEJ1aWxkaW5nQmxvY2tQbGF5Z3JvdW5kXG5cdH07XG59O1xuZXhwb3J0IGRlZmF1bHQgcHJvdmlkZUNvbXBvbmVuZW50cztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQWFBLFNBQVNBLENBQUMsQ0FBQ0MsUUFBYSxFQUFFO0lBQ3pCLE1BQU1DLE9BQU8sR0FBR0MsS0FBSyxDQUFDQyxPQUFPLENBQUNILFFBQVEsQ0FBQ0ksUUFBUSxDQUFDLEdBQzdDSixRQUFRLENB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