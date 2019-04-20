---
author: "Daniel Little"
categories: ["sharepoint", "powershell"]
date: 2012-06-06T01:00:00Z
description: ""
draft: false
path: "/sharepoint-masterpages-powershell"
tags: ["sharepoint", "powershell"]
title: "Inheriting SharePoint masterpages with Powershell"

---

If you want your subsites to inherit their masterpages from their parents the first thing you need to know is the difference between normal sites and publishing sites: Only publishing sites actually support inheriting masterpages. If you're site is not a publishing site you have to iterate over all the `Webs` and set the property manually.

If you have a publishing site your in luck SharePoint makes it easy for you but it's not completely obvious what to do. My first attempt at setting these properties to `Inherit` was by setting the site property. And while this does make the UI say the right thing, it doesn't actually change the property `CustomMasterUrl ` in any way and you'll just get the old masterpage.

    $web.AllProperties["__InheritsCustomMasterUrl"] = "True" // This is wrong

What you have to do is update the `CustomMasterUrl` as well, but then you're getting into unsupported functionality and it's also unnecessary work. Conveniently SharePoint already provides you with a `PublishingWeb` class that supports inheritance for these properties.

Here is an example:

	$isPubWeb = [Microsoft.SharePoint.Publishing.PublishingWeb]::IsPublishingWeb($web)
	if ($isPubWeb) {
		$pubWeb = [Microsoft.SharePoint.Publishing.PublishingWeb]::GetPublishingWeb($web)
	}

	if ($xmlNode.CustomMaster -ne $null) {
		if ($xmlNode.CustomMaster -eq "Inherit") {
			if ($isPubWeb) {
				# https://msdn.microsoft.com/en-us/library/ms562472.aspx
				$pubWeb.CustomMasterUrl.SetInherit($true, $false)
			} else {
				Write-Host -Fore Red "You cannot inherit without a publishing web!"
			}
		} else {
			$url = $($site.ServerRelativeUrl + "/_catalogs/masterpage/" + $xmlNode.CustomMaster)
			if ($isPubWeb) {
				$pubWeb.CustomMasterUrl.SetValue($url, $false)
			} else {
				$web.CustomMasterUrl = $url
			}
		}
	}
