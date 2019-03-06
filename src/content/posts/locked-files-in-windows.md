---
author: "Daniel Little"
categories: ["Utilities"]
date: 2014-08-01T09:21:35Z
description: ""
draft: false
path: "/locked-files-in-windows"
tags: ["Utilities"]
title: "Unlocking locked files in Windows"

---

Every developer has run into this issue at least once.  There are a few different tools you can use to find out what process is locking a file. In the past I've used a few different tools.

My favorite tool today is [Lock Hunter](http://lockhunter.com) which is powerful and easy to use. It's packed with a bunch of useful features, integrates nicely into explorer and installs without any "bonus" software. I can't recommend it enough. 

Before Lock Hunter I used `Unlocker` by Empty Loop as my go to solution but today it's bundled with a toolbar and isn't early as pleasant as Lock Hunter.

If you're already using [Process Explorer](http://technet.microsoft.com/en-au/sysinternals/bb896653.aspx) it can be a great solution. You can use it's `Find Handle or DLL` to locate the culprit. On the downside (or maybe the upside depending on your point of view) there are is no explorer integration.

[Handle](http://technet.microsoft.com/en-us/sysinternals/bb896655.aspx) is another tool by Systernals but aimed solely at the command like. This tool focus on the basics and leaves the action up to the user.

Missed a tool you love to use? Leave a comment!