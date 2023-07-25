# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 3.1.0 - 2022-11-23

### Added
- New `advcode_inline` option that when set to `true` will display the code editor inline instead of in a dialog. #TINY-8964
- New language pack files for inline mode. #TINY-9381

## 3.0.0 - 2022-03-03

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 2.3.2 - 2021-11-03

### Fixed
- Fixed an exception getting thrown for hints when the editor was rendered in a shadow root #TINY-8197

## 2.3.1 - 2021-05-20

### Security
- Upgraded third-party dependencies to fix a moderate severity ReDoS vulnerability #TINY-7438

## 2.3.0 - 2020-11-18

### Added
- Added the ability to maintain the cursor position when opening the code dialog #TINY-5091

### Fixed
- Fixed the code view not using monospace fonts #TINY-6579
- Fixed an issue where non-breaking spaces were inserted instead of regular spaces on Safari #TINY-6579

## 2.2.0 - 2020-09-29

### Added
- Added support for loading UI components within a ShadowRoot #TINY-6299

## 2.1.0 - 2020-07-01

### Added
- Added search/replace support #TINY-6113

### Fixed
- Fixed the editor `referrer_policy` setting not working when loading additional resources #TINY-5087

## 2.0.3 - 2020-01-28

### Fixed
- Fixed gutter rendering in the wrong location in TinyMCE 4 #ADVCODE-11
- Fixed code editor dialog not resizing responsively in TinyMCE 5 #ADVCODE-12

## 2.0.2 - 2019-11-07

### Fixed
- Fixed gutter not responding to touch events #ADVCODE-8

## 2.0.0 - 2019-02-04

### Added
- Support for TinyMCE 5

## 1.2.0 - 2018-02-01

### Improved
- Decreased plugin size by improving build steps.

## 1.1.1 - 2017-12-28

### Fixed
- Fixed issue where the ui would be accessed directly instead of though a factory.

## 1.1.0 - 2017-03-01

### Added
- Added HTML autocomplete addon. Open a new tag by writing '<' and a dropdown menu will appear showing a list of suggestions of HTML tags that narrows down as you continue writing. #TINY-556

## 1.0.2 - 2016-10-25

### Added
- Added version detection logic that check if this plugin is used with a compatible tinymce version. #TINY-639
