---
author: "Daniel Little"
categories: ["orm"]
date: 2011-08-19T01:00:00Z
description: ""
draft: false
path: "/orm-exceptions"
tags: ["orm"]
title: "Object-Relational Mapper Exceptions"

---

When working with Object-Relational Mappers like nhibernate and Entity Framework 4 it can seem like a good idea to setup a Session or Context at the start of a request and finalise it at the end of a request.

This is exactly what I was doing until I figured out how wrong it was. I'll be using *[Entity framework](http://stackoverflow.com/questions/2478081/entity-framework-4-poco-where-to-start)* for my examples so I'm not repeating myself. So the problem is basically that a Context is not your database access object but a *Unit of Work* that will be committed to the database. This is an extremely important point and this is because of exception handling. 

Now for a nice example, say you want to save a record to the users table but the username has a uniqueness constraint. If we're using one context per request and try to add a new user with an unavailable username we get a nice *UpdateException*. Now once this happens you can't use the context anymore. As a work around you can test for error states in a transaction before they happen, but that's allot of work and doesn't sound too nice.

The solution therefore is to perform actions as a Unit of Work. That way if one doesn't work out you can handle it properly and recover.

Take a look at this article to point you in the right direction [Using Repository and Unit of Work patterns with Entity Framework 4.0](http://blogs.msdn.com/b/adonet/archive/2009/06/16/using-repository-and-unit-of-work-patterns-with-entity-framework-4-0.aspx).
