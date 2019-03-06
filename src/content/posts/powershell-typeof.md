---
author: "Daniel Little"
categories: ["powershell", "PowerShell"]
date: 2014-07-14T07:00:16Z
description: ""
draft: false
path: "/powershell-typeof"
tags: ["powershell", "PowerShell"]
title: "Powershell typeof"

---

Coming from C#, it provides the built in function `typeof()` that you can use to get the `Type` of a class. Powershell also makes it easy to get Type information.

Wrapping the type in square brackets `[TypeName]` evaluates to an instance of `System.Reflection.TypeInfo`. Which you can then use to compare it as per normal.

    PS>"".GetType() -Eq [string]
    True
    PS>(1).GetType() -Eq [int]
    True
    PS>(1.0).GetType() -Eq [int]
    False
    
You can also assign the value to a variable if needed.

    PS>$x = [bool]
    PS>$x
    
    IsPublic IsSerial Name                                     BaseType
    -------- -------- ----                                     --------
    True     True     Boolean                                  System.ValueType
    
I hope this will make it easier to find next time!