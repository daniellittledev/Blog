---
author: "Daniel Little"
categories: ["C#", "Functional Programming", "Containers"]
date: 2014-08-27T22:42:52Z
description: ""
draft: false
path: "/avoid-null-with-container-types"
tags: ["C#", "Functional Programming", "Containers"]
title: "Avoid null with Containers"

---

In C# It's often recommended that you should avoidi using nulls wherever possible. Avoiding nulls is a great concept that can simplify your code. Even so, nulls (or some such equivalent concept) will always have their place, such as to convey data is not available.

However, one case where I always pay close attention to using nulls is when working with what object-oriented developers call Containers. A container simply wraps around an instance or multiple insances of some type. This includes types such as Enumerable<T>, List<T>, Lazy<T>, Observable<T>, Task<T>, Nullable<T> (which is partially a special case because it never throws a NullReferenceException) arrays and other similar non-generic types. Typically in these cases returning an empty list or an empty Task over returning null makes the code much more clean and clear. By not returning null, you don't have to check for nulls and hence your code does not need to follow a different path based on the return value. 

Comparing between the two even in a simple case greatly increases the complexity of the code. The first example is a standard foreach over an enumerable.

    foreach (var item in enumerable) {
        item.Dump()
    }

Which when you need to worry about nulls would become the following

    if (enumerable != null) {
        foreach (var item in enumerable) {
            item.Dump()
        }
    }

And for Tasks, here is the what it looks like without nulls

    var result = await DoAsync()

And when the function can return nulls you loose type inference or end up with deeply nested code.

    object result;
    var resultAwaitable = await DoAsync();
    if (resultAwaitable != null) {
        result = await resultAwaitable;
    }

There are two main cases where you still might want to return a null value. Such as to be explicit about the difference between unavailable data and no data. The other is to avoid extra memory allocations in high-performance scenarios. However, I find both of these cases to be relatively rare.

In the end, the most important thing is usually maintainability and standardizing on empty containers offers more reliable and concise code.
