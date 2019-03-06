---
author: "Daniel Little"
categories: ["OWIN", "C#", "Nancy"]
date: 2014-02-01T05:37:07Z
description: ""
draft: false
path: "/post-post"
tags: ["OWIN", "C#", "Nancy"]
title: "OWIN and System.Web.Optimizations"

---

I struck out to see if I could make use of the Microsoft ASP.NET Web Optimization Framework (version 1.1.2) in my self hosted OWIN Nancy application.

The only real resource I could find on the topic was the page [How to use System.Web.Optimization Bundling with Nancy][1] in the Nancy wiki on GitHub. Which looked good at first sight untill I looked a little deeper. This page is not only wildly out of date but didn't even get me close to a working solution.

The System.Web.Optimization project unfortunately has a large dependancy on System.Web. Which for all practicle purposes makes it unusable when using Microsoft.Owin.Hosting.

While might still be possible to get it working without IIS by replacing the `BundleHandler`, providing a `HttpContext` and emulating a virtual directory for the app domain. Which would look something like the this...

    var domain = Thread.GetDomain();
	domain.SetData(".appDomain", "");
	domain.SetData(".appVPath", "/");
	domain.SetData(".appPath", "/");
	domain.SetData(".appId", "");

I think I'll just wait for some official OWIN support and see how [Cassette][2] goes in the meantime.

[1]: https://github.com/NancyFx/Nancy/wiki/How-to-use-System.Web.Optimization-Bundling-with-Nancy 

[2]: http://getcassette.net/