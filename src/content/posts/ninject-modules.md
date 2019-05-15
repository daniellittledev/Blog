---
author: "Daniel Little"
categories: ["Dependency Injection", "Ninject"]
date: 2014-04-04T21:08:50Z
description: ""
draft: false
path: "/ninject-modules"
tags: ["Dependency Injection", "Ninject"]
title: "Ninject Modules"

---

[Ninject](https://github.com/ninject/ninject/wiki/Dependency-Injection-With-Ninject) is a fantastic Dependency Injection framework for the .NET framework. You can bind to the kernel whenever you want however you usually want to setup all your binding in once place right, at the start of your application. Ninject provides the perfect place to declare all you bindings in a single place in the form of a `NinjectModule`.

To create a Kernel using a Module it is passed as a constructor parameter.

	var kernel = new StandardKernel(new ApplicationBindingsModule());

Then you can simply declare the Module which requires you to implement the abstract `Load` method.

    public class ApplicationBindingsModule : NinjectModule
	{
		public override void Load()
		{
			Bind<IClock>().To<Clock>().InSingletonScope();

			// If you use Ninject.Extensions.Convention you have to use `this` to use the extension method syntax.
			//this.Bind(x => x.FromThisAssembly()...
		}
	}

Using Modules allows you to easily swap out bindings when creating a Kernel and provides a standard location for all your bindings.