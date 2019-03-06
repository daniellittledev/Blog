---
author: "Daniel Little"
categories: ["MVC"]
date: 2014-09-25T09:40:14Z
description: ""
draft: false
path: "/mvc-architecture"
tags: ["MVC"]
title: "MVC Architecture"

---

The typical scaffolding tool and sample applications for MVC web apps are usually based on simple CRUD like systems. They'll, usually, have Views written in a templating language, with some kind of ORM and Models for persistence and Controllers to tie the two together. 

![View, Controller and Model](/content/images/2014/Sep/Basic-MVC.png)

But there's a problem with this layout, and it's causing the Controllers to grow out of control. Because this scenario is based on CRUD the design here has found it's way into all kinds of applications, such as applications that need more than trivial amounts of business logic. Hopefully, now we can start to see the issue. All this logic ends up being placed in the Controllers which as a result become bloated. This also negatively impacts the Model, which effectively becomes just a data access layer.

![Big Controller MVC](/content/images/2014/Sep/Big-Controller.png)

So what's the alternative? 

In MVC, the Model is often confused with various other similar concepts such as DTOs or a data layer. However, the Model is a more general concept that refers to the entire set of concepts your application is modelling. Persistence isn't a concern of the MVC pattern. So you can think of the Model as the entire domain, which includes the behaviours (business logic) and state. It's also useful to remember that the MVW (Model View Whatever) patterns are user interface patterns and do not attempt to describe or constrain any of these parts other than to split the View from the Model. 

Moving the majority of application logic into the Model frees the Controller and View from dealing with those concerns and leaves them to focus on their primary role; which is to act as an interface to the outside world. This allows the Model to focus on the domain. Letting it properly encapsulate internal concepts, and exposing it's own facades where needed. It can even be self-contained with a well defined API of its own. With that in mind, the purpose of the controller becomes a bit clearer. Its job is simply to translate a request for the Model and any results back for the views. 

![Big Model MVC](/content/images/2014/Sep/Big-Model.png)

In new applications, it's tempting to use the Models to generate the views and bind changes directly back onto the Models. However, this tends to lead back to large controllers that do too much, and [has other problems](http://www.infoq.com/news/2012/03/GitHub-Compromised) as well. To avoid these issues instead of binding directly onto the Model (which may not even be possible such as when doing Domain Driven Design) data is bound onto a ViewModel. While View Models can sometimes look similar to objects in the Model they are distinct and ideally are never referenced from the Model. Separating them have a number of benefits including security, separation of concerns (think web validation) and most importantly decouple the Model from the View.

![](/content/images/2014/Sep/ViewModels.png)

Decoupling the Model is extremely important as not doing so will severely limit how easy it is to make changes to the system. As the View will diverge from the Model in most systems. A simple example would be a markdown editor where you stored both the original Markdown and generated HTML in the Model as an optimisation. Sharing the Model with the View would have effectively limited the application to basic CRUD as the View must always mirror the Model. 

However, there's still a problem even after introducing View Models. Applications not only diverge between the Model and the View Models. They also Diverge depending on the action you're performing. For example, when creating a record you may wish to include several fields that are read-only after that point. So updates need to use a different View Model from creates. They may even diverge depending on if the View Model is used for Input or Output. Using the same example, we may want to then show these fields as read-only when updating. Which would require them to exist in the Output Update View Model but not the Input Update View Model. In practice, I've found these View Models can start out looking very similar to your Models. But as time goes on and they diverge it becomes apparent the input (parameter) and output (return value) of each Action in the controller can be deserving of its own View Model.

![Splitting the View Models](/content/images/2014/Sep/Split-ViewModels.png)

Because of the similarities that View Models can have with the Model it can be possible to automate this process of converting between the two. In the past, I've used [AutoMapper](http://automapper.org/) to do exactly this. However, as the View Models inevitably diverge you end up with so many mapping rules that it becomes easier to do the mappings explicitly. To read more about why using a mapper should be avoided check out the post [Friends don't let friends use AutoMapper](http://www.uglybugger.org/software/post/friends_dont_let_friends_use_automapper).

So to recap, the aim of MVC is to separate the View from the Model of the application. The Model should be where the bulk of your application lies and is effectively your application without the user interface. The View and the View Models represent the user's representation of the system. The controller then sits between the two and is the glue that brings these two parts together. This results in increased flexibility due to the decoupling between the two sides. Which means changes to the application are both easier and faster as you don't have to fight the Model to fit the design.