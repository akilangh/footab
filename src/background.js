// Copyright (c) 2013 mike_sf@outlook.com. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const ftInactive = "ftInactive";
const ftTimeout = 10000;

var activated = null;
var active = false;

function ftDeactivate()
{
	active = false;
	var s = new Object();
	s[ftInactive] = true;
	chrome.storage.local.set(s);
}

chrome.tabs.onActivated.addListener(function(info) {
//	console.log(info.tabId+' act: '+active);
	activated = 't'+info.tabId;
	chrome.storage.local.get(activated, function(stor)
	{
		if (stor[activated])
		{
			chrome.storage.local.remove(activated);
			chrome.tabs.reload();
		}
	});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//	console.log(tabId+' upd: '+active+' stat: '+changeInfo.status+' act: '+tab.active);
	if (changeInfo.status == 'complete' && tab.active)
	{
		activated = 't'+tabId;
		chrome.storage.local.get(activated, function(stor)
		{
			if (stor[activated])
			{
				chrome.storage.local.remove(activated);
				chrome.tabs.reload();
			}
		});
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(info) {
//	console.log(info.tabId+' webrq: '+active);
	if (!active)
		return;
	setTimeout(ftDeactivate, ftTimeout);
	var tid = 't'+info.tabId;
	if (tid == activated)
		return;
	else
	{
		var s = new Object();
		s[tid] = true;
		chrome.storage.local.set(s);
	}
	return {cancel: true};
},
// filters
{urls: ["*://*/*"]
//,types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "other"]
},
// extraInfoSpec
["blocking"]
);

chrome.windows.onCreated.addListener(function(window)
{
//	console.log('create: '+active);
	chrome.storage.local.get(ftInactive, function(stor)
	{
//		console.log('got from storage: '+stor);
		if (!stor[ftInactive])
		{
//			console.log('no inactive in store');
			active = true;
			setTimeout(ftDeactivate, ftTimeout);
		}
	});
//	console.log('create: '+active);
});

chrome.runtime.onStartup.addListener(function()
{
//	console.log('start: '+active);
	active = true;
//	console.log('start: '+active);
});
