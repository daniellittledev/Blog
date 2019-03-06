---
author: "Daniel Little"
date: 2014-08-28T02:29:19Z
description: ""
draft: true
path: "/null-in-c-and-the-result-type-functional-error-handling"
title: "Null in C# and The Result Type (Functional Error handling)"

---



The concept of null can easily be traced back to C but that's not where the problem lies.

My everyday language of choice is C# and I would keep null with one difference. C# has two kinds of types, values and references. Values can never be null, but there are times I'd like to be able to express that no value is perfectly fine. To do this C# uses Nullable types so int would be the value and int? the nullable value. This is how I think reference types should work as well.

Also see: Null reference may not be a mistake:


    Null references are helpful and sometimes indispensable (consider how much trouble if you may or may not return a string in C++). The mistake really is not in the existence of the null pointers, but in how the type system handles them. Unfortunately most languages (C++, Java, C#) don’t handle them correctly.
