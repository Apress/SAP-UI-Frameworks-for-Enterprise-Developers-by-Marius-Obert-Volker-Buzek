/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/ui/core/Core", "sap/ui/dom/units/Rem"], function (Button, Core, Rem) {
  "use strict";

  const SizeHelper = {
    calls: 0,
    hiddenButton: undefined,
    /**
     * Creates a hidden button and places it in the static area.
     */
    init: function () {
      // Create a new button in static area
      this.calls++;
      this.hiddenButton = this.hiddenButton ? this.hiddenButton : new Button().placeAt(Core.getStaticAreaRef());
      // Hide button from accessibility tree
      this.hiddenButton.setVisible(false);
    },
    /**
     * Method to calculate the width of the button from a temporarily created button placed in the static area.
     *
     * @param text The text to measure inside the Button.
     * @returns The value of the Button width.
     */
    getButtonWidth: function (text) {
      var _this$hiddenButton$ge;
      if (!text || !this.hiddenButton) {
        return 0;
      }
      this.hiddenButton.setVisible(true);
      this.hiddenButton.setText(text);
      this.hiddenButton.rerender();
      const buttonWidth = Rem.fromPx((_this$hiddenButton$ge = this.hiddenButton.getDomRef()) === null || _this$hiddenButton$ge === void 0 ? void 0 : _this$hiddenButton$ge.scrollWidth);
      this.hiddenButton.setVisible(false);
      return Math.round(buttonWidth * 100) / 100;
    },
    /**
     * Deletes the hidden button if not needed anymore.
     */
    exit: function () {
      this.calls--;
      if (this.calls === 0) {
        var _this$hiddenButton;
        (_this$hiddenButton = this.hiddenButton) === null || _this$hiddenButton === void 0 ? void 0 : _this$hiddenButton.destroy();
        this.hiddenButton = undefined;
      }
    }
  };
  return SizeHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaXplSGVscGVyIiwiY2FsbHMiLCJoaWRkZW5CdXR0b24iLCJ1bmRlZmluZWQiLCJpbml0IiwiQnV0dG9uIiwicGxhY2VBdCIsIkNvcmUiLCJnZXRTdGF0aWNBcmVhUmVmIiwic2V0VmlzaWJsZSIsImdldEJ1dHRvbldpZHRoIiwidGV4dCIsInNldFRleHQiLCJyZXJlbmRlciIsImJ1dHRvbldpZHRoIiwiUmVtIiwiZnJvbVB4IiwiZ2V0RG9tUmVmIiwic2Nyb2xsV2lkdGgiLCJNYXRoIiwicm91bmQiLCJleGl0IiwiZGVzdHJveSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2l6ZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgUmVtIGZyb20gXCJzYXAvdWkvZG9tL3VuaXRzL1JlbVwiO1xuXG5jb25zdCBTaXplSGVscGVyID0ge1xuXHRjYWxsczogMCxcblx0aGlkZGVuQnV0dG9uOiB1bmRlZmluZWQgYXMgdW5kZWZpbmVkIHwgQnV0dG9uLFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgaGlkZGVuIGJ1dHRvbiBhbmQgcGxhY2VzIGl0IGluIHRoZSBzdGF0aWMgYXJlYS5cblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBDcmVhdGUgYSBuZXcgYnV0dG9uIGluIHN0YXRpYyBhcmVhXG5cdFx0dGhpcy5jYWxscysrO1xuXHRcdHRoaXMuaGlkZGVuQnV0dG9uID0gdGhpcy5oaWRkZW5CdXR0b24gPyB0aGlzLmhpZGRlbkJ1dHRvbiA6IG5ldyBCdXR0b24oKS5wbGFjZUF0KENvcmUuZ2V0U3RhdGljQXJlYVJlZigpKTtcblx0XHQvLyBIaWRlIGJ1dHRvbiBmcm9tIGFjY2Vzc2liaWxpdHkgdHJlZVxuXHRcdHRoaXMuaGlkZGVuQnV0dG9uLnNldFZpc2libGUoZmFsc2UpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgdGhlIGJ1dHRvbiBmcm9tIGEgdGVtcG9yYXJpbHkgY3JlYXRlZCBidXR0b24gcGxhY2VkIGluIHRoZSBzdGF0aWMgYXJlYS5cblx0ICpcblx0ICogQHBhcmFtIHRleHQgVGhlIHRleHQgdG8gbWVhc3VyZSBpbnNpZGUgdGhlIEJ1dHRvbi5cblx0ICogQHJldHVybnMgVGhlIHZhbHVlIG9mIHRoZSBCdXR0b24gd2lkdGguXG5cdCAqL1xuXHRnZXRCdXR0b25XaWR0aDogZnVuY3Rpb24gKHRleHQ/OiBzdHJpbmcpOiBudW1iZXIge1xuXHRcdGlmICghdGV4dCB8fCAhdGhpcy5oaWRkZW5CdXR0b24pIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdHRoaXMuaGlkZGVuQnV0dG9uLnNldFZpc2libGUodHJ1ZSk7XG5cdFx0dGhpcy5oaWRkZW5CdXR0b24uc2V0VGV4dCh0ZXh0KTtcblx0XHR0aGlzLmhpZGRlbkJ1dHRvbi5yZXJlbmRlcigpO1xuXG5cdFx0Y29uc3QgYnV0dG9uV2lkdGggPSBSZW0uZnJvbVB4KHRoaXMuaGlkZGVuQnV0dG9uLmdldERvbVJlZigpPy5zY3JvbGxXaWR0aCk7XG5cdFx0dGhpcy5oaWRkZW5CdXR0b24uc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0cmV0dXJuIE1hdGgucm91bmQoYnV0dG9uV2lkdGggKiAxMDApIC8gMTAwO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBoaWRkZW4gYnV0dG9uIGlmIG5vdCBuZWVkZWQgYW55bW9yZS5cblx0ICovXG5cdGV4aXQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmNhbGxzLS07XG5cdFx0aWYgKHRoaXMuY2FsbHMgPT09IDApIHtcblx0XHRcdHRoaXMuaGlkZGVuQnV0dG9uPy5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLmhpZGRlbkJ1dHRvbiA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNpemVIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFJQSxNQUFNQSxVQUFVLEdBQUc7SUFDbEJDLEtBQUssRUFBRSxDQUFDO0lBQ1JDLFlBQVksRUFBRUMsU0FBK0I7SUFFN0M7QUFDRDtBQUNBO0lBQ0NDLElBQUksRUFBRSxZQUFZO01BQ2pCO01BQ0EsSUFBSSxDQUFDSCxLQUFLLEVBQUU7TUFDWixJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJLENBQUNBLFlBQVksR0FBRyxJQUFJLENBQUNBLFlBQVksR0FBRyxJQUFJRyxNQUFNLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUNDLGdCQUFnQixFQUFFLENBQUM7TUFDekc7TUFDQSxJQUFJLENBQUNOLFlBQVksQ0FBQ08sVUFBVSxDQUFDLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLGNBQWMsRUFBRSxVQUFVQyxJQUFhLEVBQVU7TUFBQTtNQUNoRCxJQUFJLENBQUNBLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQ1QsWUFBWSxFQUFFO1FBQ2hDLE9BQU8sQ0FBQztNQUNUO01BRUEsSUFBSSxDQUFDQSxZQUFZLENBQUNPLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDbEMsSUFBSSxDQUFDUCxZQUFZLENBQUNVLE9BQU8sQ0FBQ0QsSUFBSSxDQUFDO01BQy9CLElBQUksQ0FBQ1QsWUFBWSxDQUFDVyxRQUFRLEVBQUU7TUFFNUIsTUFBTUMsV0FBVyxHQUFHQyxHQUFHLENBQUNDLE1BQU0sMEJBQUMsSUFBSSxDQUFDZCxZQUFZLENBQUNlLFNBQVMsRUFBRSwwREFBN0Isc0JBQStCQyxXQUFXLENBQUM7TUFDMUUsSUFBSSxDQUFDaEIsWUFBWSxDQUFDTyxVQUFVLENBQUMsS0FBSyxDQUFDO01BQ25DLE9BQU9VLElBQUksQ0FBQ0MsS0FBSyxDQUFDTixXQUFXLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRztJQUMzQyxDQUFDO0lBRUQ7QUFDRDtBQUNBO0lBQ0NPLElBQUksRUFBRSxZQUFZO01BQ2pCLElBQUksQ0FBQ3BCLEtBQUssRUFBRTtNQUNaLElBQUksSUFBSSxDQUFDQSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQUE7UUFDckIsMEJBQUksQ0FBQ0MsWUFBWSx1REFBakIsbUJBQW1Cb0IsT0FBTyxFQUFFO1FBQzVCLElBQUksQ0FBQ3BCLFlBQVksR0FBR0MsU0FBUztNQUM5QjtJQUNEO0VBQ0QsQ0FBQztFQUFDLE9BRWFILFVBQVU7QUFBQSJ9