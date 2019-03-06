---
author: "Daniel Little"
categories: ["linq"]
date: 2013-02-14T02:00:00Z
description: ""
draft: false
path: "/ef-linq-as-emumerable"
tags: ["linq"]
title: "Switch from 'Entity Framework Linq' to 'Linq to Objects' with AsEnumerable"

---

Most people know what when writing a Linq query with Entity Framework that until that query is enumerated it won't call out to the database. Sometimes it's necessary to do some more work with the results such as use a method as part of the projection. 

    var result =
        from people in Context.People
        where people.DateOfBirth < twentyYearsAgo
        select people;

    function GetAge(DateTime dateOfBirth) { ...

This is where `AsEnumerable` comes in. This generic function allows you to switch from the `IQueryable` source to `IEnumerable` which will use Linq to Objects. Using AsEnumerable instead of `ToList` allows us to still delay the execution of the query until it's needed.

    var query =
        from people in Context.People
        where people.DateOfBirth < twentyYearsAgo
        select people;

    var result =
        from people in query.AsEnumerable()
        select GetAge(people.DateOfBirth);

You could do the same thing by casting to the IEnumerable type but for anonymous objects you'll find you need to use AsEnumerable anyway to infer the type from the query.