---
author: "Daniel Little"
categories: ["Getting Started", "NuGet"]
date: 2014-03-22T03:04:31Z
description: ""
draft: false
path: "/why-use-nuget"
tags: ["Getting Started", "NuGet"]
title: "Why use NuGet"

---

I've had a few people ask me why they should use NuGet and the occasional person that's never heard of it. If you are currently developing software without a package manager, here is why you should be interested.

## What is NuGet?

[NuGet](https://www.nuget.org/) is the official package manager for .NET managed by the [Outercurve Foundation](https://www.outercurve.org/).

But firstly what is a package manager?

    In software, a package management system, also called package manager, is a collection of software tools to automate the process of installing, upgrading, configuring, and removing software packages.

A typical NuGet Package consists simply of a metadata file and some `dll` files for the supported .NET versions.

<div style="width: 200px">
![Package structure](https://pfcjjq.dm2302.livefilestore.com/y2pCBjkRcauQ0pM0ZHiJea7P_cFZgdGtfN6PqYQNV5ldF7nphagBs5D_TNrlGoctoObNNSvNZ_qj82nD3EhJ-LAW4TebxfVtb5GC0_eEYGf7fM/NuGet.png)
</div>

These packages don't just have to contain dlls, they can also contain content such as JavaScript libraries and other text files.

## I've never needed NuGet before, what's wrong with just referencing them directly like it's always been?

Let’s say you just started working on a new project. You want to use a library to help you out. It could be an SQL Generation library to help write a dynamic report viewer.

So you search around for a library and find a one you're happy with. Next you locate and download the binaries for the library and copy them to your project. Now you can reference them from Visual Studio and start work.

The next thing you'll need to worry about is updating that library. If you run into a bug and or want to update the project to get the latest updates or features you have to go through most of the download process again. You'll also never be able to tell if there's an update ready without going to their website.

The worst part is you have to do this for every library you want to use. This is a lot of work.

It gets even worse if that library happened to depend on another project, such as logger, which you or any other projects might also want to depend on.

## How does NuGet make it easier for me?

NuGet can provide consistency, every library you need can be added with just one click. All configuration you need is automatic and any dependencies are automatic added as well.

![Package Manager](https://plcceq.dm2302.livefilestore.com/y2pzM2P0BBh5gNBIpVJ8B1HICQ7yvbJOVg35sT30cEwzU-IDtAARn2cBdlRzxPvBq192Qd-D4ACNei9ldB-bLdJe51Q1aKBEDj5mIIECE38jUo/NuGet_Window.png?psid=1)

Every library you have can be updated with one command. With each package automatically updated to the correct version taking into account each package that depends on it.

## Is NuGet perfect?

Nothing is without flaws and NuGet is no exception. NuGet is community driven and while this is great it also means packages, just like libraries, are only as good as their creators.

It's also leaky abstraction, which just means you still need to know how assemblies work and get referenced.

## Who is actually using it?

The .NET framework team itself [has been adopting NuGet](https://blogs.msdn.com/b/dotnet/archive/2013/10/16/nuget-is-a-net-framework-release-vehicle.aspx) as the primary method of delivery over the last few years. The ASP.NET and EntityFramework teams have been leading that trend. The core .NET team started using NuGet in 2012 and have now been releasing parts of the `Base Class Library` with NuGet.

Along with a community including thousands of projects NuGet has become the standard method of delivering and using .NET libraries.


## How do I get started?

Once you open Visual Studio and create a new project you're already using NuGet.

To check out the packages you're using and to add new ones select `Manage NuGet Packages...` from the References menu.

![Package Manager](https://qfcceq.dm2304.livefilestore.com/y2pmX8RSm6h-KYvyAvxeysD9vrM8suDBMBkNJ6ney-svPuGxDL_9bdtBh84BXh9z-bAJacCUthnj6OvMcdBY4Lp_PxLMLfG8YlJSCDkKls4AlM/NuGet_Open.png?psid=1)

From here you can browse through and install the great range of available packages.

NuGet allows people to share and take advantage of numerous fantastic projects. Allowing the .NET community to innovate and deliver at an accelerated rate. So next time you're looking for a great library, check NuGet first.
