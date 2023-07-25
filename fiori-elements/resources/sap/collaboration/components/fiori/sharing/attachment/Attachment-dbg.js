/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
 * This module is a class whose objects are meant to hold information about a single file.
 */
sap.ui.define(['./InvalidAttachmentConstructorArgumentsException', './InvalidAttachmentParameterException', 'sap/ui/base/Object'],
	function(InvalidAttachmentConstructorArgumentsException, InvalidAttachmentParameterException, BaseObject) {
	"use strict";

	/**
	 * <p>This constructor must be called in the following way:</p>
	 * <p>new Attachment("name", "mimeType", "url")</p>
	 * <p>name, mimeType, and url are only place holders and can be any string.</p>
	 * @since version 1.20
	 * @constructor
	 * @param {string} name - The file's name.
	 * @param {string} mimeType - The file's mime type.
	 * @param {string} url - A url that points to the file.
	 *
	 * @class Attachment
	 *
	 * Attachment objects represent files.
	 * @name sap.collaboration.components.fiori.sharing.attachment.Attachment
	 * @public
	 */
	var Attachment = BaseObject.extend("sap.collaboration.components.fiori.sharing.attachment.Attachment", {
		constructor: function(name, mimeType, url) {
			// There are two ways of calling this constructor
			// new Attachment("name", "mimeType", "url") or
			if (	arguments.length === 3 &&
					Object.prototype.toString.call(name) === "[object String]" &&
					Object.prototype.toString.call(mimeType) === "[object String]" &&
					Object.prototype.toString.call(url) === "[object String]") {
				/** @private */ this.name = name;
				/** @private */ this.mimeType = mimeType;
				/** @private */ this.url = url;
			}
			else {
				throw new InvalidAttachmentConstructorArgumentsException();
			}
		},

		getName: function() {
			return this.name;
		},
		getMimeType: function() {
			return this.mimeType;
		},
		getUrl: function() {
			return this.url;
		},

		setName: function(name) {
			if (arguments.length === 1 && Object.prototype.toString.call(name) === "[object String]") {
				this.name = name;
			}
			else {
				throw new InvalidAttachmentParameterException("name");
			}
		},
		setMimeType: function(mimeType) {
			if (arguments.length === 1 && Object.prototype.toString.call(mimeType) === "[object String]") {
				this.mimeType = mimeType;
			}
			else {
				throw new InvalidAttachmentParameterException("mimeType");
			}
		},
		setUrl: function(url) {
			if (arguments.length === 1 && Object.prototype.toString.call(url) === "[object String]") {
				this.url = url;
			}
			else {
				throw new InvalidAttachmentParameterException("url");
			}
		}
	});

	return Attachment;

});
