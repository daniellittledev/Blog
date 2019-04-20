---
author: "Daniel Little"
date: 2011-08-27T01:00:00Z
description: ""
draft: false
path: "/iis-background-threads"
title: "IIS Background Thread Abort Exception"

---

One of my applications creates a background thread on startup which executes a series of tasks at a regular interval. However I get a `ThreadAbortException` after my application pool is recycled.

The problem is simply IIS is aborting my thread and my application is not handling it well. I found the solution in [this Stack Overflow question](https://stackoverflow.com/questions/4347870/how-can-i-find-out-why-my-thread-is-being-stopped-in-asp-net). You have to tell your thread to stop via the Application_End method in Global.asax.cs which gets called when the application is recycled.



