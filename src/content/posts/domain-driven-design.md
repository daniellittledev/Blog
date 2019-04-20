---
author: "Daniel Little"
categories: ["Domain Driven Design"]
date: 2014-03-31T08:57:51Z
description: ""
draft: false
path: "/domain-driven-design"
tags: ["Domain Driven Design"]
title: "What is Domain Driven Design?"

---

In 2004, Erick Evans coined the term Domain Driven Design in his book also called [Domain Driven Design](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215).

Since then there has been lots of talk about using Domain Driven Design to tackle high complexity business problems, but what about everyday development. Just like all software there are tradeoffs. The difference between projects not complex enough for Domain Driven Design and projects that are is not discrete and is entirely superficial; the domain itself is much more important. I'm hoping I can look at some key ideas presented in the Domain Driven Design space and see how they apply to everyday software.

Traditionally when we set out to design a system we'd start by looking at the database. Relational databases have been so ingrained into us that it's become the only way that we have thought about our applications. We'd model our systems after the tables and their columns. As a result, the business logic was spread between all kinds of manager objects and in the heads of the users.

The focus of Domain Driven Design is to  [develop a consistent language](https://martinfowler.com/bliki/UbiquitousLanguage.html) that describes both entities and their *behaviours* in the domain. Identifying and modelling the behaviours, instead of properties and data, makes the system self describing allowing us to clearly see the business requirements. This is fantastic for the developers as it becomes much easer to see intent. The second thing it provides developers is the ability to use encapsulation instead of exposing all their data via properties. I'll explain why this leads to better software in a later post. On the business side it enables developers and the domain experts to share the same understanding of the domain and communicate effectively. This is very valuable because changing business requirements map very easily back into the application.

Domain Driven Design has the potential to provide many benefits to business and to developers. If your software is the driving force in your business, Domain Driven Design is definitely worth looking into.