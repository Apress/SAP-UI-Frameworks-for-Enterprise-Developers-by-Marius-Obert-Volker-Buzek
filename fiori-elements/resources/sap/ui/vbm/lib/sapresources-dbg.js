/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// resources manager object
// Author: Ulrich Roegelein
// uses: <saputilities.js>

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.ResourceManager = (function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var resourcemanager = {};

	// this is the dummy image used when data is missing......................//
	resourcemanager.m_DummyData = "iVBORw0KGgoAAAANSUhEUgAAABcAAAAfCAYAAAAMeVbNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNzUzN2NlNC1jZDhiLTE5NDQtYTQ0Ni01MTkxY2RjZDI4MDUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0YzODU2OThGNEM3MTFFNDlBRDQ5OUJGNUQ2N0Q4NjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0YzODU2OTdGNEM3MTFFNDlBRDQ5OUJGNUQ2N0Q4NjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmRiODhkOTNmLThiOTAtNDg0Zi1iMjljLThjNTEwOTYxZDNlOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNzUzN2NlNC1jZDhiLTE5NDQtYTQ0Ni01MTkxY2RjZDI4MDUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4LelIfAAADWklEQVR42qyWbUhTYRTHz+7UvTRfZls4FWe+a74wl1EfbFJpfsiMQjAlIcm3vhTUhyIl0KIvJRSF1ocoA78YSIhoJLalYoEvBb3oB80NlkYFLi1sNtc513un5jbn3IH/fc69z93vOXue85z7COx2O2xgR1A5qGxUFOojqg/1AjXg7ocCqNU77bA36K5hk4fKcvN7A6oNdc9Zp58TaC42t1BpdD9knoOnH76B/rMFTJYFSFFug9w4ORSlKiFGLtbhK6RC1BmUyWXkCL6PTSX5/UYL1PZMgWFq1mnIQkYARbuU0HAoGuJCJfTIgjqIGl4HR3ATNtW2JTvU641w3WAC8jeyIJEQmo4mQEn6Dv7Rbn4AhgNrCUxrW94+DvUvjR6ByX7+sUFp2ye4PWjmH7XQH3PA0erpcue1GVrefgVv7EL3BD+FKai77LRgKu7FdvD770WIbXzDRuKtZYTJYPSsFgSC5WShyAvIezQysyUw2buZeXhldCRAAcNtDugY/wG+sI4xByeb4BryRr7M+wQ+Ou3gaAgu+2W1wbzV5hP49JyVd1Vstiz8XQJf2SqWiIUHi/18Bg9ZYVkIbvLDrawOEfsEHrNcCsgmCT7E7tmIQJ/AM1Uy3h1huNoM+fFyn8Dz40N5t4/g3eQdS1ZAgFCwtSmRi0GzEnk/I6gzjKHTq5D6szV6K1aZFc5vfSpeS3zhoq8J1OrUQIvrjVHGVWWp+NsHjqqI0Tdjo09SSqE8M8wr+OX9UXwadvLfVmZV/0O6XD0QDYEi4abAiQopnN8Xwd/e4B0HHKN/gk1XeGAA3MyP9RhM09hyIglEbIFlAxxYB+fsIl0qtCooxOzxxK7oomBPJLtH6NNWvbpvDRyjpzNJM6344+OJkKCQuAXnxsqhLkfN315CLbqEcwPUYNNKq995Kg3kEud1JxkXv604hT0FcNnR8/87jIugTtOJio4Mz0pTQeq/9rXIIBE7MFfwWlFVziBO4Ri9lRvgfbY6GNpLUkHCDaDCBe8tz4CdcrbQ0e4uczVtjMtzXp3BzJ2kJvLwhNVVlgaZ4TLor9BA/HZ2LWgaTqJsm4ZzA0xic5gOn7roEBiu0bL1A+05qhj7Z92m6UaphoAJPDSlo9vIfcz78Nk5T9L0nwADACJ96CJRTtd4AAAAAElFTkSuQmCC";

	return resourcemanager;
})();

//

VBI.Resources = function() {
	var resources = {};

	resources.m_resourcedata = [];
	resources.m_resourceinstance = [];

	resources.clear = function() {
		// clear instances and data............................................//
		resources.m_resourcedata = [];
		resources.m_resourceinstance = [];
	};

	// load the resources specified in the application area...................//

	resources.load = function(dat, ctx) {
		// load the json delta data............................................//
		if (dat.Set) {
			// todo: process different kinds of set to enable delta
			resources.clear();

			var res = dat.Set.Resource;
			if (jQuery.type(res) == 'object') {
				resources.m_resourcedata[res.name] = res.value;
			} else if (jQuery.type(res) == 'array') {
				// load from array...............................................//
				for (var nJ = 0, len = res.length; nJ < len; ++nJ) {
					resources.m_resourcedata[res[nJ].name] = res[nJ].value;
				}
			}
		}
	};

	resources.GetData = function(name) {
		return resources.m_resourcedata[name];
	};

	resources.GetImageBits = function(name, rhls1, rhls2, lcb) {
		var ri, nname = name;
		if (rhls1) {
			nname += rhls1;
		}
		if (rhls2) {
			nname += rhls2;
		}

		ri = resources.m_resourceinstance[name];
		if (ri && ri.m_Bits) {
			return ([
				ri.m_Bits, ri.m_Image.naturalWidth, ri.m_Image.naturalHeight
			]); // everything created
		}

		// todo: use the color shifted image to be precise, currently the original image is used
		var img = resources.GetImage(name, null, null, lcb);
		if (img) {
			var imageData = VBI.Utilities.GetImagePixelData(img).data;
			resources.m_resourceinstance[name].m_Bits = imageData;
			return ([
				resources.m_resourceinstance[name].m_Bits, img.naturalWidth, img.naturalHeight
			]);
		}
		return null;
	};

	resources.GetImage = function(name, rhls1, rhls2, lcb) {
		var ri, rd;

		var imgType = "";
		if (name != undefined) {
			var dotPos = name.lastIndexOf(".");
			if (dotPos >= 0) {
				imgType = "/" + name.substring(dotPos + 1);
			}
		}

		var nname = name;
		if (rhls1) {
			nname += rhls1;
		}
		if (rhls2) {
			nname += rhls2;
		}
		// the hue shifted image is stored under the name + the rhls1 string + th rhls2 string
		ri = resources.m_resourceinstance[nname];
		if (ri && ri.m_Image) {
			return ri.m_Image; // everything created
		}

		// try to create the resource..........................................//
		if (ri) {
			// try to parse rhls1...............................................//
			if (rhls1 || rhls2) {
				ri.m_Image = VBI.Utilities.CreateDOMColorShiftedImageFromData(resources.m_resourcedata[name], imgType, rhls1, rhls2, lcb);
				return (ri.m_Image);
			}
			ri.m_Image = VBI.Utilities.CreateDOMImageFromData(resources.m_resourcedata[name], imgType, lcb);
			return (ri.m_Image);
		} else {
			var bResFound = (rd = resources.m_resourcedata[name]);
			if (!bResFound) {
				if (VBI.m_bTrace) {
					VBI.Trace("resource not found; default image loaded");
				}
				imgType = '/png';
				rd = VBI.ResourceManager.m_DummyData;
			}
			// try to parse rhls1...............................................//
			if (rhls1 || rhls2) {
				resources.m_resourceinstance[nname] = {
					m_Image: VBI.Utilities.CreateDOMColorShiftedImageFromData(rd, imgType, rhls1, rhls2, lcb)
				};
				return resources.GetImage(name, null, null, lcb); // Hot Stated Image not yet there, so we take normal one. Will be updated with
				// next onLoad
			}

			return (resources.m_resourceinstance[nname] = {
				m_Image: VBI.Utilities.CreateDOMImageFromData(rd, imgType, lcb)
			}).m_Image;
		}
	};

	return resources;
};

});
