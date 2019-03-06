---
author: "Daniel Little"
categories: ["powershell"]
date: 2014-04-11T02:40:27Z
description: ""
draft: false
path: "/self-executing-anonymous-function-in-powershell"
tags: ["powershell"]
title: "Self executing anonymous function in Powershell"

---

One of the great features of JavaScript is the self-executing anonymous function. It's extremely useful because you can avoid polluting the global scope and express your dependencies in an explicit manner.

PowerShell lets you do something similar by taking advantage of `blocks`, the `param` keyword and the call operator `&`.

	& { param($msg) Write-Host $msg } "Hello World"
    
This function will be automatically invoked with the string `"Hello World"`.