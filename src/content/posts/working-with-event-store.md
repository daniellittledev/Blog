---
author: "Daniel Little"
date: 2016-11-23T01:06:21Z
description: ""
draft: true
path: "/working-with-event-store"
title: "Working with Event Store"

---

What event store is.

Heavy use of the web api, the website doesn't support half of the operations

And the docs don't describe the operations that the website does support.

Not too bad, just means I had to break out the web tools and take a look what was happening

The first thing I wanted to know was how to list all the streams.

    http://127.0.0.1:2113/streams/$all

