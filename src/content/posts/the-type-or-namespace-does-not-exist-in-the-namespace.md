---
author: "Daniel Little"
date: 2014-08-20T03:48:31Z
description: ""
draft: true
path: "/the-type-or-namespace-does-not-exist-in-the-namespace"
title: "The type or namespace does not exist in the namespace"

---

The other day I came accross the good old `The type or namespace does not exist` compiler error.

    error CS0234: The type or namespace name 'Name' does not exist in the namespace 'Namespace'

When debugging this issue

1. You're just missing a reference
2. Dependancies arn't being built
3. Somewhere in the dependancy chain a dependacy has the wrong .net framework version

MSBuild Normal verbosity
Output window

    warning MSB3268: The primary reference  "C:\Projects\Project\Some.dll" could not be resolved because it has an indirect dependency on the framework assembly "System.Threading.Tasks, Version=1.5.11.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a" which could not be resolved in the currently targeted framework. ".NETFramework,Version=v4.0". To resolve this problem, either remove the reference "C:\Projects\Project\Some.dll" or retarget your application to a framework version which contains "System.Threading.Tasks, Version=1.5.11.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a".
    
    
Eep this was actually because of a warning about Microsoft.Blc.Build and Microsoft.Blc

