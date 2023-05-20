/**
 * Transforms a jQuery promise into a regular ES6/TS promise.
 *
 * @param oThenable The jQueryPromise
 * @returns The corresponding ES6 Promise
 */
function toES6Promise(oThenable: any): Promise<any> {
	return Promise.resolve(
		oThenable
			.then(function (...args: any[]) {
				return Array.prototype.slice.call(args);
			})
			.catch(function (...args: any[]) {
				return Array.prototype.slice.call(args);
			})
	);
}

export default toES6Promise;
