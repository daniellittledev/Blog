---
author: "Daniel Little"
date: 2018-01-31T23:40:07Z
description: ""
draft: true
path: "/ddd-in-fsharp"
title: "DDD in FSharp"

---

if you've

https://gorodinski.com/blog/2013/02/17/domain-driven-design-with-fsharp-and-eventstore/

https://disq.us/p/u3kgf6

>The approach described here has evolved a bit. Specifically, I don't usually group commands into a single union type - it needlessly forces you to use a single handler. Instead, I have commands represented as distinct types. With this in mind, you can model an aggregate operation as a function of `Input * State -> Async<output>` (for event sourced aggregates, a more general type would return Async<output *="" state="">) where `Input` is the type of your command and `State` is a type representing the state of the aggregate as before. Since the return type is `Async` a specific operation can retrieve any data required for the operation.

