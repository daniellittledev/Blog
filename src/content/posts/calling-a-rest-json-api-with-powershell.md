---
author: "Daniel Little"
categories: ["powershell", "PowerShell", "Rest"]
date: 2014-11-11T04:39:46Z
description: "A walkthrough for using PowerShell to call simple rest APIs. Showing how to make queries (GET) and updates (POST) to json based endpoints."
draft: false
path: "/calling-a-rest-json-api-with-powershell"
tags: ["powershell", "PowerShell", "Rest"]
title: "Calling a Rest (Json) API with PowerShell"

---

PowerShell makes working with rest API's easy. In PowerShell version 3, the cmdlets `Invoke-RestMethod` and `Invoke-WebRequest` where introduced. These cmdlets are a huge improvement coming from the .NET model you had to work with previously turning a request into a concise one liner similar to curl (Which is also an alias for `Invoke-WebRequest` in PowerShell).

The difference between the two is quite small, `Invoke-RestMethod` simply being a slightly more convenient wrapper around `Invoke-WebRequest` as it only returns the content, omitting the headers.

The most common case I tend to use this method for is querying or posting to a json rest API's. I usually end up just using `Invoke-RestMethod` so I'll focus on it.

The simplest call you can make is to just provide the URL. This will default to a `GET` request, and any unsupplied optional parameters are omitted from the request. For example, this `GET` request won't have a content type. However, if this parameter is omitted and the request method is `POST`, `Invoke-RestMethod` sets the content type to "application/x-www-form-urlencoded".
Invoke-RestMethod -Uri $uri


The value returned will be automatically parsed depending on the content type of the response. For a json endpoint, I'll automatically get a PowerShell object (hashtable) that represents the json response.

So getting data from an endpoint is pretty easy but most rest APIs require an authentication token in order to verify your request. The most common way of supplying the token is via a HTTP header, which looks like this.

    $apiKey = "SomeKey"
    $resource = "http://localhost/api/books"

    Invoke-RestMethod -Method Get -Uri $resource -Header @{ "X-ApiKey" = $apiKey }


Now we can query a json endpoint, but what about sending json. PowerShell objects can be represented using hashtables in a similar way to Javascript objects. PowerShell 2.0 also provides two functions (`ConvertTo-Json` and `ConvertFrom-Json`) for easily converting back and forth between JSON and PowerShell objects. The final step is to just construct a PS object and convert it.

    $body = @{
        Name = "So long and thanks for all the fish"
    }
    
    Invoke-RestMethod -Method Post -Uri "$resource\new" -Body (ConvertTo-Json $body) -Header @{"X-ApiKey"=$apiKey}

So in just four lines of code you an submit a simple POST to any HTTP endpoint. If you want some further reading, you can also find the documentation for `Invoke-RestMethod` at Microsoft TechNet.