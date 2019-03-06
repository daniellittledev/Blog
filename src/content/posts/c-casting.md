---
author: "Daniel Little"
date: 2011-09-27T01:00:00Z
description: ""
draft: false
path: "/c-casting"
title: "C# and casting"

---

I see alot of people using the `as` keywork where they really just want to do a cast. Most of the time a cast will be what you want because it's faster and will fail early when somthing goes wrong.

When should you `cast`? 
You should cast when you already know what type the object is. A cast also will **not ** fail your value is null.

    var value = (Apple)appleDictionary[key];

When should you use `as`?
When you don't know the type of object.
    
    bool makeA = true;
    BaseClass baseClass = null;
    baseClass = makeA ? new SuperClassA() : new SuperClassB();

    SuperClassB val = baseClass as SuperClassB;
    if (val != null) { //...

You will almost always be compairing the value to `null` after using as.

It's important to know `as` does not replace `cast` in any way, always pick the one you need for your situation.