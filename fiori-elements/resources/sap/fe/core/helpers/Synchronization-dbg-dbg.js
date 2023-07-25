/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  let Synchronization = /*#__PURE__*/function () {
    function Synchronization() {
      this._fnResolve = null;
      this._isResolved = false;
    }
    var _proto = Synchronization.prototype;
    _proto.waitFor = function waitFor() {
      if (this._isResolved) {
        return Promise.resolve();
      } else {
        return new Promise(resolve => {
          this._fnResolve = resolve;
        });
      }
    };
    _proto.resolve = function resolve() {
      if (!this._isResolved) {
        this._isResolved = true;
        if (this._fnResolve) {
          this._fnResolve();
        }
      }
    };
    return Synchronization;
  }();
  return Synchronization;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTeW5jaHJvbml6YXRpb24iLCJfZm5SZXNvbHZlIiwiX2lzUmVzb2x2ZWQiLCJ3YWl0Rm9yIiwiUHJvbWlzZSIsInJlc29sdmUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN5bmNocm9uaXphdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTeW5jaHJvbml6YXRpb24ge1xuXHRwcml2YXRlIF9mblJlc29sdmU6IEZ1bmN0aW9uIHwgbnVsbDtcblxuXHRwcml2YXRlIF9pc1Jlc29sdmVkOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuX2ZuUmVzb2x2ZSA9IG51bGw7XG5cdFx0dGhpcy5faXNSZXNvbHZlZCA9IGZhbHNlO1xuXHR9XG5cblx0d2FpdEZvcigpIHtcblx0XHRpZiAodGhpcy5faXNSZXNvbHZlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0dGhpcy5fZm5SZXNvbHZlID0gcmVzb2x2ZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJlc29sdmUoKSB7XG5cdFx0aWYgKCF0aGlzLl9pc1Jlc29sdmVkKSB7XG5cdFx0XHR0aGlzLl9pc1Jlc29sdmVkID0gdHJ1ZTtcblx0XHRcdGlmICh0aGlzLl9mblJlc29sdmUpIHtcblx0XHRcdFx0dGhpcy5fZm5SZXNvbHZlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN5bmNocm9uaXphdGlvbjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztNQUFNQSxlQUFlO0lBS3BCLDJCQUFjO01BQ2IsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNDLFdBQVcsR0FBRyxLQUFLO0lBQ3pCO0lBQUM7SUFBQSxPQUVEQyxPQUFPLEdBQVAsbUJBQVU7TUFDVCxJQUFJLElBQUksQ0FBQ0QsV0FBVyxFQUFFO1FBQ3JCLE9BQU9FLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO01BQ3pCLENBQUMsTUFBTTtRQUNOLE9BQU8sSUFBSUQsT0FBTyxDQUFFQyxPQUFPLElBQUs7VUFDL0IsSUFBSSxDQUFDSixVQUFVLEdBQUdJLE9BQU87UUFDMUIsQ0FBQyxDQUFDO01BQ0g7SUFDRCxDQUFDO0lBQUEsT0FFREEsT0FBTyxHQUFQLG1CQUFVO01BQ1QsSUFBSSxDQUFDLElBQUksQ0FBQ0gsV0FBVyxFQUFFO1FBQ3RCLElBQUksQ0FBQ0EsV0FBVyxHQUFHLElBQUk7UUFDdkIsSUFBSSxJQUFJLENBQUNELFVBQVUsRUFBRTtVQUNwQixJQUFJLENBQUNBLFVBQVUsRUFBRTtRQUNsQjtNQUNEO0lBQ0QsQ0FBQztJQUFBO0VBQUE7RUFBQSxPQUdhRCxlQUFlO0FBQUEifQ==