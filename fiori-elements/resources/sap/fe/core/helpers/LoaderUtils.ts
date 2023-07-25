export async function requireDependencies(dependencyNames: string[]): Promise<any[]> {
	let resolveFn!: Function;
	const awaiter = new Promise((resolve) => {
		resolveFn = resolve;
	});
	if (dependencyNames.length > 0) {
		sap.ui.require(dependencyNames, (...dependencies: any[]) => {
			resolveFn(dependencies);
		});
	} else {
		resolveFn([]);
	}
	return awaiter as Promise<any[]>;
}
