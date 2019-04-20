---
author: "Daniel Little"
categories: ["Background Tasks", "ASP.NET"]
date: 2014-05-15T10:16:12Z
description: ""
draft: false
path: "/an-update-on-background-tasks-in-asp-net"
tags: ["Background Tasks", "ASP.NET"]
title: "An update on background tasks in ASP.NET"

---

There are two types of background tasks that you'd want to use in .NET. Long running tasks which include things like background services that run every 5, 10 minutes or another interval. Long running tasks could be continuously running, possibly spanning several days. Then there are Short lived tasks which are great for running smaller asynchronous tasks. Long running tasks are not supported in ASP.NET however short lived tasks have always been possible, and just got a little easier. 

But first, To recap on why long-running tasks are problematic. The main issue is that IIS is a request driven web server. Which means, if there's no one hitting your website nothing will happen. You could work around the problem as Phil Haack describes in his post [The Dangers of Implementing Recurring Background Tasks In ASP.NET](https://haacked.com/archive/2011/10/16/the-dangers-of-implementing-recurring-background-tasks-in-asp-net.aspx/#feedback) although you still need some kind of request to trigger the website. In the end, it's much better to just pull the background "Service" out of your website and run it as a Windows Service instead.

On the other hand, ASP.NET provides much better support for reliable short lived tasks through `HostingEnvironment.RegisterObject`. Using `RegisterObject` lets you register objects in IIS so it can provide a warning when the App Domain is being shutdown. Letting you finish up your work and terminate these background threads gracefully. This is extremely useful when you need to run asynchronous tasks like sending a batch of emails on a separate thread. However, implementing this interface is tedious and overly complicated.

In ASP.NET 4.5.2 this has become much easier with the introduction of `HostingEnvironment.QueueBackgroundWorkItem` which provides a much simpler alternative. By making use of the Task library for .NET you can invoke a lambda as a short running task. Two overloads are provided for the function. 

      1. Action<CancellationToken>
      2. Func<CancellationToken, Task>

These methods are both functionally equivalent, fire and forget async. The first simply takes an Action and executes it in the background. The second is exactly the same but returns a `Task` which is required in order to use `async` lambda's, like so.

      HostingEnvironment.QueueBackgroundWorkItem(async cancellationToken => {    
          	// Perform task
      });
    

Under the covers the QueueBackgroundWorkItem method still uses `HostingEnvironment.RegisterObject` along with `ThreadPool.QueueUserWorkItem` to execute the tasks. Meaning you'll still only get 30 seconds to finish what you were doing if cancellation is requested. Even so, this is still an addition that will be greatly appreciated.  