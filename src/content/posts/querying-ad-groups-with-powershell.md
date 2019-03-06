---
author: "Daniel Little"
categories: ["PowerShell", "ActiveDirectory"]
date: 2015-10-22T02:33:15Z
description: ""
draft: false
path: "/querying-ad-groups-with-powershell"
tags: ["PowerShell", "ActiveDirectory"]
title: "Querying AD Groups with PowerShell"

---

Getting the list of the AD groups if nice and easy in PowerShell. All the CmdLets are located in the `ActiveDirectory` module which you might not have installed on your system.

To install the module you'll need these Windows features

    Add-WindowsFeature RSAT-AD-PowerShell, RSAT-AD-AdminCenter

Then you can import the module

    Import-Module ActiveDirectory

Then query the user you want to see the groups for. This command can also list the groups for other groups in case of inheritance.

    Get-ADPrincipalGroupMembership "username" | select name

