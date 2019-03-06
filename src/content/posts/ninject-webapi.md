---
author: "Daniel Little"
categories: ["dependancy-injection", "ninject", "web-api"]
date: 2013-01-11T02:00:00Z
description: ""
draft: false
path: "/ninject-webapi"
tags: ["dependancy-injection", "ninject", "web-api"]
title: "Ninject and Singletons in the WebAPI with Scopes"

---

The new [Activation Blocks](http://www.planetgeek.ch/2012/04/23/future-of-activation-blocks/#more-3392) in Ninject are great for automatically resolving dependencies in the request scope. However they suffer from one flaw which is they don't respect Constant or Singletons in fact they ignore the scope completely!

In my application I needed a reference my dependency injection container in one of my objects. This would end up throwing `Error loading Ninject component ICache` at the end of the request because now I had two kernels. Not good at all however I still had hope.

Luckily there is one type of binding the `ActivationBlock` can't ignore. The `ToMethod` binding. So now I can make a small `ScopedResolver` class which I can then inject into my class instead.

**Binding**  


    kernel.Bind<ScopedResolver>().ToMethod(x => {
        return new ScopedResolver((IActivationBlock)x.GetScope());
    });

**ScopedResolver**  
 

	public class ScopedResolver
	{
		IActivationBlock resolver;

		public ScopedResolver(IActivationBlock resolver)
		{
			this.resolver = resolver;
		}

		public T TryGet<T>()
		{
			return resolver.TryGet<T>();
		}

	}