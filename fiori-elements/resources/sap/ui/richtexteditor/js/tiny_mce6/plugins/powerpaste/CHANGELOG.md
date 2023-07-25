# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 6.1.2 - 2022-11-24

### Fixed
- The preventDefault method call on PastePreProcess and PastePostProcess events was ignored. #TINY-9187
- Pasting large documents threw a maximum stack size error. #TINY-9084

## 6.1.1 - 2022-09-08

### Fixed
- The `wordimport.js` resource file was difficult to bundle when using Webpack 5 #TINY-8791

## 6.1.0 - 2022-06-29

### Improved
- Embedded PDF images are now converted to PNG images on Safari #TINY-7673

### Fixed
- Domains like `www.site.com` that gets converted into links will now be prefixed with a default protocol configured through `link_default_protocol` #TINY-8470
- The smart paste URL detection didn't work if a path segment contained valid characters such as `!` and `:` #TINY-8069

## 6.0.1 - 2022-03-04

### Fixed
- Fixed a console warning about the `paste_filter_drop` option not being registered #TINY-8511

## 6.0.0 - 2022-03-03

### Added
- Added translations for Hindi, Malay and Vietnamese #TINY-8428

### Improved
- Dragging content from outside the editor will now focus the editor and place the caret in an appropriate position #TINY-7092

### Changed
- The `mceInsertClipboardContent` command `content` property has been renamed to `html` to better reflect what data is passed #TINY-8310
- Content dragged and dropped into the editor is now cleaned or merged using the same logic as pasted content #TINY-5047

### Fixed
- Fixed the `mceInsertClipboardContent` command to correctly detect Word, GDocs and standard HTML, and use the relevant paste path #TINY-7608
- Pasting word content with a very large (>1.4mb) style block would trigger a stack overflow #TINY-8291

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 5.6.1 - 2021-11-03

### Fixed
- Pasting text content with multiple items on the clipboard did not work #TINY-8106

## 5.6.0 - 2021-08-27

### Added
- Each import setting now accepts a function to lazily specify the import mode (`clean` or `merge`) #TINY-7606

### Improved
- Improved support for detecting custom URL schemes when converting to links #TINY-5074

### Fixed
- Word content was incorrectly parsed when copied from a German user interface #TINY-7679
- Paste incorrectly inserted content when the editor was in readonly mode #TINY-7748

## 5.5.1 - 2021-06-23

### Fixed
- Fixed a performance issue when pasting Google Docs content #TINY-7517
- Fixed indented text pasted from Google Docs unable to be outdented #TINY-7448
- Pasted images that failed to be converted to a blob would cause an uncaught exception and lock up the editor #TINY-7630

## 5.5.0 - 2021-05-06

### Added
- Added Google Docs paste support which can be controlled using the new `powerpaste_googledocs_import` setting #TINY-5000

### Changed
- The editor will now show a "loading" screen while paste events are processed #TINY-7353

### Fixed
- Fixed an issue where automatic linking didn't work with URLs containing commas in the path #TINY-6649
- Fixed an issue where tables or images sometimes had negative left margins after being pasted #TINY-5067
- Fixed an issue where it was possible for the width to be stripped from a table when pasted #TINY-6507
- Fixed merge and clean dialog button text incorrectly using title-style capitalization #TINY-6816

## 5.4.2 - 2021-03-17

### Security
- Fixed an issue where dragging and dropping content wasn't correctly sanitized in some cases #TINY-7024

## 5.4.1 - 2021-02-09

### Fixed
- Fixed an issue where file extensions with uppercase characters were treated as invalid #TINY-6940

## 5.4.0 - 2020-11-18

### Added
- Added a new `images_file_types` setting to determine which image file formats will be automatically processed into `img` tags #TINY-6306

### Fixed
- Fixed the `Cut` menu item not working in the latest version of Firefox #TINY-6615

### Security
- Fixed an issue where internal HTML content wasn't sanitized in some cases #TINY-6568
- Fixed an issue where specific HTML comments weren't sanitized in some cases #TINY-6569

## 5.3.3 - 2020-10-06

### Fixed
- Fixed missing translations #TINY-6374

## 5.3.2 - 2020-08-18

### Fixed
- Fixed an exception thrown on IE 11 due to using `String.startsWith` #TINY-6269
- Fixed an issue where lists would become corrupt on IE 11 due to invalid empty font elements #TINY-6270
- Fixed multiple new lines collapsing into a single new line when pasting plain text #TINY-6063
- Fixed cut and copy not working with table selections #TINY-6117
- Fixed tabs in plain text converted to a single space and added new `paste_tab_spaces` setting to control how many spaces are used to represent a tab #TINY-6237

## 5.3.1 - 2020-07-08

### Fixed
- Fixed the editor `referrer_policy` setting not working when loading additional resources #TINY-5087
- Fixed PowerPaste not able to load the `wordimport.js` resource when bundled #TINY-5087

## 5.3.0 - 2020-05-21

### Improved
- Added pre- and post-processing events and callbacks to image drop #TINY-5939

## 5.2.3 - 2020-04-22

### Security
- Fixed an issue where clipboard HTML content wasn't sanitized in some cases #POW-50

## 5.2.2 - 2020-03-25

### Fixed
- Fixed paragraph alignment being pasted as deprecated align attributes #POW-143

## 5.2.1 - 2020-02-13

### Added
- Added `powerpaste_clean_filtered_inline_elements` for configuring inline element filters when removing formatting #POW-146 #POW-36

### Improved
- Pass paste source and mode to `paste_preprocess` and `paste_postprocess`

### Fixed
- Fixed `cache_suffix` not working when loading external scripts #POW-171
- Fixed cut not removing selected content on Android #TINY-4362

## 5.1.0 - 2019-09-02

### Improved
- Improved parsing of table styles to better match what TinyMCE expects #POW-126 #POW-153

### Fixed
- Fixed bug where images were pasted as base64 instead of blobs #POW-148

## 5.0.2 - 2019-08-19

### Added
- Added `powerpaste_keep_unsupported_src` which allows unsupported images to keep their original src in a data attribute #POW-115

### Fixed
- Fixed bug where pasting local image files did not respect `powerpaste_allow_local_images` #POW-144
- Fixed bug where pasting external URL images caused CORS errors #POW-144

## 5.0.1 - 2019-07-01

### Added
- Added basic support for pasting Word equations #POW-105

### Improved
- Added console logged error codes #POW-138

### Fixed
- Fixed powerpaste ignoring the editor `automatic_uploads` setting #POW-125
- Fixed images incorrectly being pasted when `paste_as_text` was enabled #POW-24
- Cleaned up left over unused Flash files that were getting bundled #POW-109
- Fixed bug where pre elements were not allowed to contain images #POW-116
- Fixed bug where the wrong error banner was displayed when images failed to import #POW-138
- Fixed leading, trailing and sequential spaces being lost when pasting plain text #TINY-3726

## 5.0.0 - 2019-05-08

### Added
- Added support for pasting images that were cropped in MS Word #POW-98

### Improved
- Added detection of Outlook content so it is parsed correctly #POW-107

### Fixed
- Fixed bug where non-file images with valid URLs were losing their src attribute #POW-107
- Fixed bug where inline style elements were not removed when removing formatting #POW-36

### Removed
- Removed legacy Flash code #POW-109

## 4.0.3 - 2019-04-10

### Fixed
- Fixed bug where pasting word content could have unexpected underlines #POW-106

## 4.0.2 - 2019-02-20

### Added
- Added `mceTogglePlainTextPaste` command and `paste_as_text` setting, and removed notification banner when paste as text is toggled #POW-102

## 3.3.3 - 2018-11-14

### Fixed
- Non breaking spaces where inserted if you pasted after a space at the end of a line. #TINY-2259
- Pasting only image data would result in an extra undo level. #TINY-1881
- Removing the editor before it has fully initialized would throw an error. #TINY-2681

## 3.3.2 - 2018-06-26

### Fixed
- Fixed bug where images would be uploaded twice on IE 11. #TINY-1721
- Fixed bug where an error would be thrown when using powerpaste with TinyMCE 4.1.x. #TINY-1721
- Fixed bug where IE 11 would produce an exception when pasting specific contents. #TBIO-5227
- Pasting from word into an empty editor could sometimes put the caret at an incorrect position. #TBIO-5242
- Copying from IE 11 could sometimes put extra html data into the clipboard. #TBIO-5247
- Switched most of the internals to use the HTML5 clipboard api instead of using pastebins. #TBIO-1572

## 3.3.1 - 2018-05-02

### Improved
- Improved list continuation logic. #TBIO-5221

### Fixed
- Fixed bug where some borders would create divs that broke list functionality. #TINY-1632
- Fixed bug where the editor would scroll to top of document on paste in IE11. #TINY-1644
- Fixed bug where msEquation blocks would not produce "incorrect image type" results. #TBIO-5104
- Fixed bug where broken lists with list-style:none would have incorrect margins and/or indents. #TBIO-5222

## 3.3.0 - 2018-04-12

### Fixed
- Fixed bug where `powerpaste_block_drop` would block all drag/drop on a page if the editor was an inline editor. #TINY-1532
- Fixed bug where the latest Safari version didn't handle pasting images from Word correctly. #TBIO-5207
- Fixed bug where fragments/comments where added to contents on paste. #TBIO-5210
- Fixed bug with inconsistent indents on multilevel lists. #TINY-1625
- Fixed bug where some lists wasn't properly retained when pasting from specific documents. #TINY-1491

## 3.2.1 - 2018-02-19

### Fixed
- Fixed bug where an error would be thrown when parsing '=' characters in styles pasted from word. #TINY-1493

## 3.2.0 - 2018-02-01

### Improved
- Decreased the size of the plugin by switching build tools. #TINY-1463

### Fixed
- When the word importer script failed to load it would paste unfiltered html instead of throwing an error. #TBIO-5118

## 3.1.0 - 2017-12-11

### Fixed
- Fixed bug where links with slashes in the query part would be cut off when pasting as plain text. #TINY-1396
- Fixed bug with pasting spreadsheets from Numbers would be inserted an image instead of a table. #TINY-1214
- Paste is now more reliable and less likely to result in unwanted cursor movement #TBIO-1572
- Pasting HTML is now preferred over pasting an image when both are on the clipboard #TINY-1214
- Retaining styles while pasting HTML from external sources is now more consistent across browsers #TBIO-1572
- Pasting images from macOS Preview and iOS Photos into Safari is now supported, by converting the TIFF data to PNG #TBIO-5013

## 3.0.0 - 2017-10-09

### Added
- Added a brand new word import process that supports more types of images, is more reliable and easier to maintain.
- Implemented `mceInsertClipboardContent` command similar to the one provided by the community paste plugin. #TINY-992

### Fixed
- Fixed bug where paste bin proxy elements wasn't properly removed when adding editor undo levels. #TINY-1140
- Fixed bug where single blank line was removed between lists from MS Word. #TINY-1124
- Fixed bug where bullet lists would become letter lists. #TINY-1123
- Fixed bug with posting formatted lists not retaining font family. #TINY-1120
- Fixed bug where local images where not transferred from some Word 2010 documents. #TINY-906
- Fixed bug where some word lists would be pasted as paragraphs instead of lists. #TBIO-4810
- Fixed bug where lists with margins wasn't properly retained in some cases. #TBIO-4995

## 2.2.8 - 2017-07-26

### Improved
- Improved the aria accessibility support for various dialogs. #TINY-1115

### Fixed
- Fixed bug where bound paste events wasn't properly removed when an editor was removed. #TINY-1091
- Fixed bug where chrome would report an error when trying to cut contents using editor UI. #TINY-1179

## 2.2.7 - 2017-06-13

### Fixed
- Fixed bug where the filename did not contain a file extension when being imported into the blobCache. #TINY-1105

## 2.2.6 - 2017-05-31

### Fixed
- Fixed bug where the default settings weren't applied for drag/drop operations. #TINY-1075

## 2.2.5 - 2017-05-23

### Fixed
- Fixed bug where selection context parent formatting wasn't retained on cut/copy operations. #TINY-1062

## 2.2.4 - 2017-05-10

### Fixed
- Fixed bug where an editor.css file was loaded even though it wasn't used. #TINY-1017

## 2.2.3 - 2017-04-26

### Fixed
- Fixed bug with pasting images would upload the image multiple times. #TINY-989
- Fixed bug where inline styles wasn't maintained for list elements. #EL-5946

## 2.2.2 - 2017-03-30

### Fixed
- Fixed bug where it wasn't possible to paste word content in the latest Edge 15. #TBIO-4887
- Fixed so anchors are retained when copy/pasting contents from word. #TINY-831
- Fixed bug where some contents would be incorrect when pasting images on webkit. #TINY-968

## 2.2.1 - 2017-03-07

### Changed
- Changed tinymce version detection from 4.0.0 to 4.0.28. #TINY-914

## 2.2.0 - 2017-03-01

### Added
- Cut/copy now excludes internal html artifacts when pasting into external applications. #TINY-893.
- Internal/external paste is now passed in as a internal flag to PrePasteProcess and PostPasteProcess events. #TINY-916

### Fixed
- Fixed bug where cut/copy of contentEditable=false elements wasn't working properly. #TINY-716
- Paste of text like foo:bar was automatically converted to links. It's now more specific in that pattern matching. #TBIO-4867, #TINY-887
- Pasting from word with links was removing the closing anchor. #EL-5941

## 2.1.10 - 2017-01-11

### Fixed
- Fixed drag/drop support of html from out side of the editor. #TINY-821

## 2.1.9 - 2016-12-13

### Added
- Updated the dialog when pasting using flash to be more clear what the user needs to do. #TINY-700

### Fixed
- Font color wasn't properly retained when pasting on IE 11. #TINY-741
- Paste `pasteallow_local_images` set to false would show notification even if there where no images. #TINY-705
- Removed the visual paste bin from IE and Firefox by moving it offscreen. #TBIO-4562

## 2.1.8 - 2016-10-27

### Added
- Added version detection logic that check if this plugin is used with a compatible tinymce version. #TINY-639

### Fixed
- Fixed bug where drag/drop of image files didn't work correctly in Google chrome. #TINY-698
- Fixed bug where `pasteallow_local_images` set to false didn't work properly on IE 11. #TINY-622

## 2.1.7 - 2016-09-22

### Fixed
- Paste for with allow_images disabled would remove editor contents in FF. #TINY-602
- Some inline styles where stripped when pasting word content that contains conflicting document level styles. #TBIO-4206
- Non-organised lists with '-' characters where being imported as organised lists from word. #EL-5902
- Bullet nesting was not preserved when copying and pasting from Word on some browsers. #EL-5898
- Some Word anchors where not properly removed from lists. #EL-5911
- Significantly reduced flash movie size used for image import on some browsers. #TINY-609
- Fixed XSS issue with flash movie used for image import on some browsers. #TINY-592
- Fixed issue where anchors where removed when pasting from a non Word source. #TINY-606
