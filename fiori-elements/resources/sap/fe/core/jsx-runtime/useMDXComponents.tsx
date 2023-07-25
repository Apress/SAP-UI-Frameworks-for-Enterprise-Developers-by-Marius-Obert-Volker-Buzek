import Log from "sap/base/Log";
import { parseXMLString } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { createReference } from "sap/fe/core/helpers/ClassSupport";
import MDXViewLoader from "sap/fe/core/jsx-runtime/ViewLoader";
import macroLibrary from "sap/fe/macros/macroLibrary";
import FormattedText from "sap/m/FormattedText";
import HBox from "sap/m/HBox";
import Panel from "sap/m/Panel";
import Title from "sap/m/Title";
import CodeEditor from "sap/ui/codeeditor/CodeEditor";
import Fragment from "sap/ui/core/Fragment";
import { TitleLevel } from "sap/ui/core/library";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
function p(strValue: any) {
	const content = Array.isArray(strValue.children)
		? strValue.children
				.map((child: any) => {
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
				})
				.join("")
		: strValue.children;
	return <FormattedText htmlText={content} class={"sapUiTinyMarginBottom"} />;
}

function h1(strValue: any) {
	return <Title text={strValue.children} level={TitleLevel.H1} class={"sapUiTinyMarginBottom"} />;
}
function a(strValue: any) {
	return `<a href={strValue.href}>${strValue.children}</a>`;
}
function ul(strValue: any) {
	const ulContent = `<ul>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</ul>`;
	return <FormattedText htmlText={ulContent} />;
}
function li(strValue: any) {
	return `<li>${Array.isArray(strValue.children) ? strValue.children.join("") : strValue.children}</li>`;
}
function h2(strValue: any) {
	return <Title text={strValue.children} level={TitleLevel.H2} class={"sapUiSmallMarginTop sapUiTinyMarginBottom"} />;
}
function pre(content: any) {
	return content.children;
}

function BuildingBlockPlayground(inValue: any) {
	const sourceHBox = createReference<HBox>();
	const binding = inValue.binding ? { path: inValue.binding } : undefined;
	const target = (
		<Panel headerText={inValue.headerText || ""} class={"sapUiSmallMarginTop"}>
			<HBox ref={sourceHBox}></HBox>
		</Panel>
	);
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
	const fragmentOrPromise = XMLPreprocessor.process(
		parseXMLString(`<root>${inValue.children}</root>`, true)[0],
		{ name: "myBuildingBlockFragment" },
		MDXViewLoader.preprocessorData
	);
	Promise.resolve(fragmentOrPromise)
		.then((fragment: Element) => {
			return Fragment.load({ definition: fragment.firstElementChild as any, controller: MDXViewLoader.controller });
		})
		.then((fragmentContent: any) => {
			sourceHBox.current.removeAllItems();
			sourceHBox.current.addItem(fragmentContent);
		})
		.catch((err: any) => {
			Log.error(err);
		});
	return target;
}
function CodeBlock(inValue: any) {
	const snippet = inValue.children?.trim() || "";
	const lineCount = inValue.lineCount || Math.max(snippet.split("\n")?.length, 3);
	const type = inValue.type || inValue?.className?.split("-")[1] || "js";
	const myCodeEditor = (
		<CodeEditor
			class="sapUiTinyMargin"
			lineNumbers={inValue.lineNumbers || false}
			type={type}
			editable={inValue.editable || false}
			maxLines={lineCount}
			height={"auto"}
			width={"98%"}
		></CodeEditor>
	);
	myCodeEditor.setValue(snippet);
	if (inValue.source) {
		fetch(inValue.source)
			.then((res) => res.text())
			.then((text) => {
				const newLineCount = Math.max(text.split("\n")?.length, 3);
				myCodeEditor.setMaxLines(newLineCount);
				myCodeEditor.setValue(text);
			})
			.catch((e) => {
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
export default provideComponenents;
