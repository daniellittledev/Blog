---
author: "Daniel Little"
categories: ["Distributed-Systems", "Reliable-Messaging"]
date: 2020-10-05T20:00:00Z
draft: false
path: "/dont-ignore-your-functions"
tags: ["Safety", "Functions", "CSharp", "FSharp", "dotnet" ]
title: "Don't Ignore Your Functions"
---

Ignoring return values can often be dangerous in subtle ways but you may be so used to doing it that you don't even notice anymore. It's likely that at some point you have run into an issue caused by forgetting to use the return value of a function. It's even more likely you throw away the return values of functions without thinking too much about it. Most of the time there's no real impact of doing so, and if there is it's certainly not immediate. But if you find yourself doing this often it is important to ask why. Presumably, the function is returning this value for a reason? Is there something wrong with the design of the API, or are you missing something important?

## Adding to a date doesn't change it

Have you ever seen code like this?

```csharp
var date = new DateTime(2000, 01, 01);

date.AddYears(1);
Console.WriteLine($"{date.ToShortDateString()}");
```

It looks pretty straightforward, but there's a bug in this code. If you're familiar with the dotnet `DateTime` API it might be an obvious one but it can be subtle and confusing if you've never used it before.

The issue is that when you call `AddYears` it doesn't modify the date, instead it returns a brand new date. Therefore when `WriteLine` is called the value will still say `2000/01/01` instead of `2001/01/01` like you may have expected.

To get this to work correctly you'd have to capture the new date by assigning the new value to the date variable, like so.

```csharp
var date = new DateTime(2000, 01, 01);

date = date.AddYears(1);
Console.WriteLine($"{date.ToShortDateString()}");
```

So why does `AddYears` return a new date object instead of adding a year to the existing date? It does this because date is an immutable type. This means that once you create a date you can never modify or change it, in any way. If you need a different date you'll always need to create a new one.

Immutability itself is a very useful technique because it can help manage complexity due to limiting the possibilities you have to consider; there is only one way to change the date, replace it. However, issues like the example above can be hard to find if you're not looking for them. Wouldn't it be great if the C# compiler could detect issues like this and prevent you from making the mistake in the first place!

## Async and you forgot to await

Let's look at a different problem for a moment. Say you had an async function which calls out to two async functions but you forget to await one of them.

```csharp
async Task<ActionResult<Resource>> GetResource(string id) {

	AuditRequestAsync(id); // Forgot to await this, oops

	return await LoadResourceAsync(id);
}
```

In this case, you'll get a warning from the C# compiler telling you that there might be a missing await. This is fantastic because the majority of the time this is almost certainly a bug. However, depending on how closely you monitor your warning, it's still possible to compile the app with the default compiler options. But what happens if we have the same function but without the async keyword, like so.

```csharp
Task<ActionResult<Resource>> GetResource(string id) {

	AuditRequestAsync(id);

	return LoadResourceAsync(id);
}
```

Semantically this function is exactly the same, it also suffers from the same bug but this time there's not even a warning. I've found this kind of issue to more common than it appears because a function can start off by only returning a task without needing the async keyword. In the example above if the `AuditRequestAsync` function was added later on, or by a different author, they could forget to add the async keyword and the program will still happily compile.

To make matters worst, the function might work in some cases, but fail in others. The `AuditRequestAsync` function will still run, but without `await` there is no guarantee the caller will still be around when it finishes. In some cases you might get an error regarding `multiple active result sets` if they both make database calls. In others, you might not notice anything is wrong at all. Issues like these can often lie dormant until other changes trigger them, or result in indeterministic (or at the very least non obvious) behaviour making them extremely hard to track down and fix.

## Implicitly ignoring functions is dangerous

What these examples have in common is that the value returned by a function (`AddYears` and `AuditResourceRequestAsync`) was implicitly ignored, resulting in a bug. If the compiler had issued a warning or an error indicating that the value was unused or implicitly ignored these issues could have been caught earlier or prevented entirely.

There are also many more scenarios that suffer from this problem. For example using APIs like LINQ, Reactive Extensions, using Structs, and all immutable types, are cases where forgetting to use the value is almost certainly a bug. Even regular functions, particularly those that return values without side effects would benefit from making it obvious that a return value was ignored or forgotten.

## Explicitly ignoring functions is safer

Instead of implicitly throwing away unused values, if we don't want to use a value we should explicitly discard it.

To help catch unused values you could use a custom analyzer to create a warning for all unused values, not just a missing await inside an async function. There are no analyzers that do this yet, however, there are a few similar existing analyzers for some of these cases, such as [async await](https://docs.particular.net/nservicebus/operations/nservicebus-analyzer).

Once there are warnings for unused return values it becomes clearer that an unused value is either a bug or something that can be explicitly discarded.

A task, for example, would result in a warning about a possible missing await. If you do want to ignore the task then you can use a `standalone discard` to let others know you don't care about it.

```csharp
_ = Task.Run(() => { ... }) // Explicitly discard the result
```

This makes it clear that you made a conscious decision not to use the value. It shows other developers that a decision was made not to use the value as opposed to forgetting to use it.

When someone else reads that code it is the difference between:

- _Did they_ _forget to use the return value? I'll need to investigate, versus..._
- _They've chosen to ignore the_ _return value_. _I can move on._

Making things more explicit will prevent bugs and save you and others a lot of time.

## Would this really work

There's a lot of code out there today which was written without explicit discards in mind. And I don't expect the world of C# to change drastically overnight. Nevertheless, the aim of this article is to get more you interested in an analyzer that warns developers about unused return values in the same way your editor warns you about an unused variable today.

You may still be wondering if so much C# code was written without explicit ignores in mind, would this be even practical to do in C#? Recently I've been doing a lot of dotnet development using F# which does emit compiler warning if a function return value is not used. So I can say that even with the dotnet as it exists today, I have been pleasantly surprised. I didn't need to discard half as many values as I thought I would.

The large majority of code didn't need a single discard. There were only a few cases where I needed to use a discard, for example discarding the value at the end of a mutable fluent API.

In that case, I would use an extension method to explicitly "cap off" the expression.

```csharp
builder
    .RegisterType<HttpClient>().AsSelf()
    .InstancePerLifetimeScope()
    .Ignore() // <- Takes a type <T> and returns a void
```

I did however still run into at least one bug where I explicitly discarded a value that I shouldn't have. In the end, I found that even explicitly discarding values was something that should be done sparingly. Whenever I discarded a return value I found myself rethinking the code instead.

I was more likely to use or log a status code or return code.

```csharp
var response = await httpClient.PostAsync(url, null);
log.Information("Responded with {StatusCode}", response.StatusCode);
```

If I wanted to run a task in the background I kept the task in a Task service and it simplified error handling for all background tasks.

```csharp
BackgroundService.Register(async () => {...})

// Instead of

_ = Task.Run(async () => {...}) // Hope you handled the exceptions in here
```

If I used the builder pattern or a fluent API I considered using an immutable API and returning the value instead of a using a mutable one. For example using LINQ vs using the List API.

```csharp
public IEnumerable<Out> GetResults(IEnumerable<In> items) => items
	.Where(x => ...)
	**.Select(x => ...)
	.OrderBy(x => ...)
```

I'm also cautious of functions that don't return values but that's another story.

## I'm interested but maybe not convinced

Whenever I first stumble across a new concept or technique I find that I need to play with it for a while to start to get a good feel for how it works. Have a go at building an analyzer and see where the warnings are. Try writing a program from scratch with the warnings on. Turn on warnings as errors so you aren't tempted to take shortcuts and follow where the analyzer takes you.

But most importantly, if you find yourself discarding values without using them, ask yourself why.
