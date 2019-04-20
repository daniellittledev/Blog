---
author: "Daniel Little"
categories: ["Domain Driven Design"]
date: 2014-04-28T01:55:35Z
description: ""
draft: false
path: "/implementing-domain-driven-design"
tags: ["Domain Driven Design"]
title: "Implementing Domain Driven Design"

---

I've talked about [what Domain Driven Design is](https://lavinski.me/domain-driven-design/) and what kind of benefits you can expect from it.

The next concept to explore is what the implementation looks like. I'll be focusing on the architecture of such a system more than how to model a domain, which [Eric Evans covers in his book](https://dddcommunity.org/book/evans_2003/).

The domain in DDD contains all the business logic in the application. Its equivalent in a layered system would be the domain/business layer. A typical domain implementation can be said to look like this:

![Domain Driven Design Concepts Diagram](/../../images/implementing-domain-driven-design/Domain-Driven-Design-Concepts.png)

In Domain Driven Design there are three main types of objects the `Aggregate Root`, `Entities` and `Value Objects`. These are objects in the typical object orientated sense and represent a concept from the domain/business. The other two concepts show are `Aggregates` and `Bounded Context`, which relate to the logical grouping of these domain objects.

###Entities

`Entities` are a model of an object or concept in the domain and always have a distinct Id, usually a `Guid`. An `Entity` could be anything from such as a user, a product, or any other object. The `Aggregate Root` shown is actually also an entity but it sits at the root of the hierarchy and has no direct references to it.

`Entities` are a model of the business, but what does an `Entity` actually look like? They are objects like, Product, Customer and Order which contain the behaviours (methods) of domain objects they are modeled after. These behaviours are owned by the `Entities`, not stowed away in a manager or service. This also means that `Entities` don't need to expose all those properties that services or managers would otherwise need. Instead, the state is encapsulated inside the object. `Entities` are not `Data Transfer Objects` and they should have very few, if any, properties. It also makes the behaviours discoverable, more expressive and more consistent as they are all local members of objects.

Take the following two lines for example:
```
company.Hire(newEmployee);
```
```
companyService.Hire(company, newEmployee);
```
When `Hire` is simply another behaviour of the company it becomes easy to find and clear to read.

So if `Entities` don't have any Properties how do you perform queries? The answer is; by using a read model not the domain model. The domain is primarily concerned with the business logic. It is only used to change the state of the domain. All queries are separated from the domain and instead a thin read layer is used. This is also known as Command and Query Responsibility Segregation or CQRS, which I'll talk about in a future post.

Once entities have behaviours they sometimes need to use services or take other dependencies. However, an entity should never have any dependencies injected into it. Instead, it's better to make things explicit. It's actually the behaviours that have dependencies, not the `Entities`. Therefore, when a service is needed, it can be provided as an argument in the method where it is used.

    user.ChangePassword(hashingService, newPassword);

In regards to validation in the domain, we can view it as just another aspect of the behaviour. Once the entities have behaviours it's quite straightforward to check the arguments are valid and invariants and are maintained. Then the entity itself can ensure it is never put into an invalid state. This also applies for any constructors, which really are just another behaviour.

The final concern to address is persistence of the domain. The domain model should be persistence ignorant as it’s only concerned with the domain. Object relational mappers tend to make this more difficult although it is possible. However, I tend to use Domain Events to handle persistence and avoid ORMs altogether.

###Values

`Values` on the other hand are just data and never have an Id. Their equality is determined as the sum of its parts. For example the value Position could contain Latitude and Longitude components. Two values where all the components are equal are also equal. For this reason `Values` are usually also immutable.

Now that I've explained `Entities` and `Values` I'll move up to `Aggregates` and the `Bounded Context`.

###Aggregates

An `Aggregate` is a boundary around one or more Entities. This boundary is also a transactional boundary. Such that all `Entities` in one `Aggregate` cannot directly reference `Entities` in another. An `Aggregate` would represent a single unit, for example a Tree. The aggregate is composed of the tree or trunk (the `Aggregate Root`) and leaves (the other `Entities`). `Aggregates` are also the basic element of data storage, much like in a document database. You only save or load whole  `Aggregates`.

I mentioned earlier that you cannot directly reference `Entities` in another `Aggregate`. Any references from outside the aggregate should only go to the aggregate root, as you cannot cross the `Aggregate` boundary. Unlike references inside an `Aggregate` that link directly to an instance. References to another `Aggregate Root` will only use its identifier. This would also apply to circular references to the `Aggregates` own `Aggregate Root`.

###Contexts

Context is extremely important in Domain Driven Design. An entity could logically exist in multiple `Bounded Contexts` or even `Aggregates` with different representations. As an Example, Human Resources sees a person as a resource with a different set of information and behaviours than Accountant would. In an online store items in a user’s cart could be different to items in their order, even though conceptually they're the same thing.

Modeling one concept as multiple `Entities` is more common in larger domain where it becomes much more difficult to find a single unified model. Especially when different groups of people need different things from the model.

###Other Concepts

There are three other concepts I didn't fully cover here; Repositories, Domain Events and Services.

Repositories are a very simple concept and simply load or save `Aggregates`.

I did briefly mention Domain Events; the basic premise here is that instead of an ORM implicitly tracking changes `Events` are used to describe what changes happened.

The concept of [services](https://stackoverflow.com/questions/2268699/domain-driven-design-domain-service-application-service) which could be application, domain or infrastructure services.

###In Conculsion

These are the core concepts of a Domain Driven Design implementation. The design of the domain model is built around the concepts of `Aggregates` and `Entities`. Modelling a domain in this way is results in code that is much more expressive, clear and cohesive.
