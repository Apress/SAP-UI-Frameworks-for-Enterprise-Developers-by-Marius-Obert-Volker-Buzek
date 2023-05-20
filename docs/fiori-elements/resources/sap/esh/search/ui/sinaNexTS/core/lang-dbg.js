/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */

  function getLanguagePreferences() {
    var isFirefox = typeof window.InstallTrigger !== "undefined";
    var isIE = false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var languagePreferences = [];
    if (isIE || isEdge) {
      var ieLang = window.navigator.browserLanguage || window.navigator.language;
      languagePreferences.splice(0, 0, this._getLanguageCountryObject(ieLang));
    } else if (isFirefox || isChrome) {
      var language = window.navigator.language;
      var languages = window.navigator.languages.slice();
      var index = languages.indexOf(language);
      if (index > -1) {
        languages.splice(index, 1);
      }
      languagePreferences.splice(0, 0, this._getLanguageCountryObject(language));
      for (var i = 0; i < languages.length; i++) {
        var languagePreference = this._getLanguageCountryObject(languages[i]);
        if (languagePreference) {
          languagePreferences.splice(languagePreferences.length, 0, languagePreference);
        }
      }
    } else {
      languagePreferences.splice(0, 0, this._getLanguageCountryObject(window.navigator.language));
    }
    return languagePreferences;
  }
  function _getLanguageCountryObject(l) {
    var language;
    var country;
    if (l.length === 2) {
      language = l;
      country = "";
    } else if (l.length === 5 && l.indexOf("-") === 2) {
      language = l.substr(0, 2);
      country = l.substr(3);
    } else {
      return undefined;
    }
    return {
      Language: language,
      Country: country
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.getLanguagePreferences = getLanguagePreferences;
  __exports._getLanguageCountryObject = _getLanguageCountryObject;
  return __exports;
});
})();