import type { IssueCategory, IssueSeverity } from "sap/fe/core/converters/helpers/IssueManager";

export type IssueDefinition = {
	category: IssueCategory;
	severity: IssueSeverity;
	details: string;
	subCategory?: string | undefined;
};
class Diagnostics {
	_issues: IssueDefinition[];

	constructor() {
		this._issues = [];
	}

	addIssue(
		issueCategory: IssueCategory,
		issueSeverity: IssueSeverity,
		details: string,
		issueCategoryType?: any | undefined,
		subCategory?: string | undefined
	): void {
		const checkIfIssueExists = this.checkIfIssueExists(issueCategory, issueSeverity, details, issueCategoryType, subCategory);
		if (!checkIfIssueExists) {
			this._issues.push({
				category: issueCategory,
				severity: issueSeverity,
				details: details,
				subCategory: subCategory
			});
		}
	}

	getIssues(): IssueDefinition[] {
		return this._issues;
	}

	getIssuesByCategory(inCategory: IssueCategory, subCategory?: string): IssueDefinition[] {
		if (subCategory) {
			return this._issues.filter((issue) => issue.category === inCategory && issue.subCategory === subCategory);
		} else {
			return this._issues.filter((issue) => issue.category === inCategory);
		}
	}

	checkIfIssueExists(
		inCategory: IssueCategory,
		severity: IssueSeverity,
		details: string,
		issueCategoryType?: any,
		issueSubCategory?: string
	): boolean {
		if (issueCategoryType && issueCategoryType[inCategory] && issueSubCategory) {
			return this._issues.some(
				(issue) =>
					issue.category === inCategory &&
					issue.severity === severity &&
					issue.details.replace(/\n/g, "") === details.replace(/\n/g, "") &&
					issue.subCategory === issueSubCategory
			);
		}
		return this._issues.some(
			(issue) =>
				issue.category === inCategory &&
				issue.severity === severity &&
				issue.details.replace(/\n/g, "") === details.replace(/\n/g, "")
		);
	}
}

export default Diagnostics;
