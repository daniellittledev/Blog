---
author: "Daniel Little"
date: 2017-01-07T09:51:42Z
description: ""
draft: true
path: "/introduction-to-fsharp"
title: "Introduction to FSharp"

---

We'll be making a twitter scanner that alerts people when a tweet contains a certain work appears on their timeline. Step one, we'll create a NuGet package to wrap up the alert API over twitter. Step two, we'll use Akka.NET to 

------

# Introduction  to FSharp

## Introduction 

> High-level overview of that we'll be doing

 - Leaning the basics of F#
 - Building a twitter alert app

Today we're going to get a bit more acquainted with the F# programming language. In order to so, I'll walk you through how to build a Twitter alert service with F# and Akka.NET. This service will look at a twitter feed and send some kind of notification when it detects a given word or phrase.

-----------------------------

## Part A - High-level overview of FSharp

> High level overview of FSharp bits

 - Starting a project from scratch
 - Setting up Paket
 - Creating Build scripts with FAKE
 - Creating a NuGet package

I'll take you through how to start a new F# project from scratch. Including how to use the package manager paket, setting up build scripts with FAKE and creating a NuGet package. Which we'll use to make some of the code reusable.


### The basics of FSharp

F# is a multi-paradigm programming language for .net

### Creating a new project

SharpTalk

First, we'll start with File -> New Project, call it anything you like. Next we'll delete the default project and create a few of our own. 

Create the following projects:

- SharpTalk.Twitter.Alerts (F# Class Library)
- SharpTalk.TwitterAlertService (F# Console App)


Syntax using Serilog

### Variables
### Functions
### Overloads
### Type Inference

Maybe - Units of Measure...

-------------------------------

## Part B - Akka and Twitter

### This will be a console like service

### Actors

### The twitter API

### Actors

/user
/user/alerts/
/user/alerts/watcher-lavinski
/user/alerts/alerts

### Windows API to do a Ding or something

------------------------------

## Part C - Wrap up

> The outcomes

- What I like/dislike about F#
- What I like/dislike about Akka.NET, comment about Akkling
- How to get started with F#
- VS: Visual F# PowerTools
- Iodine F#
- Suave 
- FSharp For Fun and Profit
- FSharp scripts and type providers

### Trying out your first functional language

### For .NET Developers

#### Practical usage

- Fake
- Resharper

### Actors

What I have found
- Compatibility (or keeping type info)
- Libraries (Akkling)

### Tooling

No Resharper
FSharp Interactive

