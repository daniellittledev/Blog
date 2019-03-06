---
author: "Daniel Little"
categories: ["aspnetcore", "dnx", "AppVeyor"]
date: 2016-01-30T13:28:04Z
description: ""
draft: false
path: "/porting-microbus-to-dotnetcore"
tags: ["aspnetcore", "dnx", "AppVeyor"]
title: "Porting MicroBus to DotNetCore"

---

When the new .net core reached RC it looked like the perfect time to start to port some of the [Nuget packages](https://www.nuget.org/profiles/lavinski) I've made starting with [MicroBus](https://github.com/Lavinski/Enexure.MicroBus). I've been watching most of the [aspnet standups](https://live.asp.net/) so I've always been relatively familiar with what was going on, but there were still a few challenges along the way. I usually like to have everything figured out before I write about it, but for this post, I want to give a good picture of the experience as I found it.

I started out using [The Road to DNX](http://blog.marcgravell.com/2015/11/the-road-to-dnx-part-1.html) by Marc Gravell as a guide, which was great for figuring out exactly where to start. 

## Porting the project

He starts off moving all the old framework specific csproj files so he can build the project the old way as well as with dnx. I ended by just deleting these as I probably won't be using them again even though it's still an RC. So my first step was creating the project.json files, after that you can add them to the solution and Visual Studio will create some xproj files for you. 

I almost missed the super important part where the blog explains how to include them. 

> IMPORTANT: as soon as you add a project.json to a sln you get a second file per project.json for free: {YourProject}.xproj; these should be included in source control.

It breaks the flow a little bit to point it out as an important note but in doing so I guess I missed it on my first read through.

The next part was getting the project building. One of the first things I discovered was that dnx was not just a runtime it's also a build system. And it supports targeting multiple frameworks in the one project file. I wanted to compile my project for both `.net 4.5.1` and the new portable `dotnet` targets. This turned out alright, but there was a lot of digging to figure out exactly which monikers I needed, [and the name changes didn't help](http://stackoverflow.com/questions/31834593/target-framework-dnx451-or-net451-in-class-library-projects). 

One of the biggest changes I had to make was moving to the new reflection API. I'd used the new API before, but I'm sure I ran into every issue again. The two main things to be aware of here is most of the stuff has moved to `TypeInfo` and methods like `GetInterfaces()` are now properties like `ImplementedInterfaces`. Google didn't help as much here as I expected which probably means it's still a part of .net that is still rarely used. 

## Getting the Tests working

For the tests, the first thing I tried to do was leave them exactly as they were (as .net 4.5.1 tests) and use a test runner executable just like before. However, it quickly became apparent that this wouldn't work well. When I build each project with dnx I would get the .net451 dlls I needed however the output directories only contain the artifacts for that project. Unlike the previous build system which would also copy all the dependencies. I'm still not sure how it discovers project dependencies, but I'm guessing it's related to the projects being siblings on disk.

I then ported my tests to XUnit so I could use the commands. The IDE lets you then select which commands you want to run. However, you have to have that project selected as the startup project to see it's options. Running the tests this way will still run the tests via the console.

## Setting up the Build Server (AppVeyor)

I've been committing my packages to source control recently. The idea of super-deterministic builds is a nice idea. Plus on a build server like AppVeyor restoring packages for each build makes the whole process take much longer than just a git pull. 

I tried a few things to get this working first committing the packages folder which doesn't seem to contain all the dependencies. Then I looked into committing the lock files as well. I was having issues just getting the project to build on the server. So after a few attempts, I abandoned the approach in favor of just getting it working first. 

I had a few issues getting package restore working. Some project dependencies and package dependencies would just fail with "Unable to resolve dependency". At this point, I was trying to figure out if dnx had the equivalent of the solution file. It does have the concept of `global.json` but not 100% clear on all the cases it gets used for. I did find that calling dnu restore with the solution path resoved my dependency resolving issue `dnu restore $solutionDir`. I remember reading somewhere it would search child directories for projects, possibly using the `global.json` to guide the search. 

All this was using the rc1 clr version of the runtime. Initially, it was hard to know what version of the clr I should be using. I actually started out trying to use coreclr for everything, but that can't build .net451. I then switched over to using the clr version and was able to get the project building. However, once I got to the tests, they would then fail. The tests are using `dnxcore50`, and you can only run them using the new coreclr. So what you have to do is build the project with the `clr` then use `dnvm` and switch over to `coreclr` to run the tests.

The last things to note is that restore and build are [incredibly verbose](https://ci.appveyor.com/project/Daniel45729/enexure-microbus/build/93).

## Conclusion

Eventually, I got everything working, packages build with `dnx pack` are pushed to NuGet with the extra support for dotnetcore!

Looking back, I'm not sure if I would have waited until the new dot net cli is ready. There's still a lot of changes happening, and some things could definitely be smoother. It was great to finally get hands on with the new tools, though. Visual studio hid a few things that quickly become apparent when trying to get a project building on a build server. Overall though it feels like a good start although it still feels beta-ish in a few places. 

Now that MicroBus is building again it's time to start work on the next release. 
