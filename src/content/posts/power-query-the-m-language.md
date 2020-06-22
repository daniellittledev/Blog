---
author: "Daniel Little"
categories: ["Functional Programming"]
date: 2020-06-22T10:40:00Z
description: "Recently I had the opportunity to write a Custom Connector for Power BI and come across something I didn't expect. Power Query is a lazy functional programming language."
draft: false
path: "/power-query-the-m-language"
tags: ["Power Query", "Functional Programming"]
title: "Power Query - The M Language"
---

Recently I had the opportunity to write a Custom Connector for Power BI and come across something I didn't expect. To build a Connector you use Power Query also known as the M formula language. Power Query was designed to build data transformation pipelines, focusing on repeatable importing and manipulations of tables.

> A core capability of Power Query is to filter and combine, that is, to mash-up data from one or more of a rich collection of supported data sources.

But what I didn't expect is that Power Query is a lazy functional programming language. The documentation describes it as "a functional, case sensitive language similar to F#". So not only does Power BI include a programming language it's also a functional programming language! Although if I had to describe it, I'd say it's more of a simplified cross between JavaScript and Haskell. Curious? Well then, let's take a quick look at what Power Query looks like, and some of its features.

The first thing you might notice about Power Query is that it's almost entirely expression-based. Every function is comprised of a single expression. 

```fsharp
Function = () => "Hello"

Function() // returns "Hello"
```

Here we have a global variable called `Function` which contains a function which returns "hello". All functions are lambdas.

One of the most common building blocks is the `let` expression, which lets you build up more complex functions using variables.

```haskell
let
   hello = "Hello",  
   world = "World"
in   
   hello & " " & world & "!"
```

If you're not familiar with the `let` syntax it's quite common in expression-based functional languages. A `let` expression allows you to define and bind other expressions for use in the `in` clause. You can read it like, let these "names" be bound to these "values" in this "expression".

Let's look at a more complex function. The function below makes a web request to a given URL and returns the result as JSON.

```haskell
Fetch = (url as text) as record =>
    let
        accessToken = Extension.CurrentCredential()[access_token],
        authHeader = "Bearer " & accessToken,
        response =
            Web.Contents(url, [
                ManualCredentials = true,
                Headers = [ Authorization = authHeader]
            ])
    in
        Json.Document(response);
```

There are a few things going on in this function but one of the interesting things to point out are the two main types you see in Power Query, apart from tables of course. These are lists and records, and the interesting bit is that the symbols are opposite to what you might expect if coming from most other languages. 

Lists are defined using braces `{}` and records are defined using square brackets `[]`, the exact opposite of JavaScript or FSharp.

```haskell
list = { 1, 2, 3}

record = [
    Property = true,
    AnotherProperty = "Hello"
]
```

Accessing a property is also a little different and also uses  `[]`.

```haskell
value = record[Property]
```

In the Fetch function above you can see the `access_token` property being used via the credentials record.

```haskell
Extension.CurrentCredential()[access_token]
```

Briefly, on types, the language is dynamic with optional types and can also be extended with custom metadata. Below the function starts without any types and you can see how the code changes as I add more type information.

```fsharp
(url) => ...expression

(url as text) => ...expression

(url as text) as record => ...expression

(url as text) as record meta [ Documentation.Name = "My Record Type" ] => ...expression
```

Now, I've saved the best until last. One of the most powerful features of Power Query is that it's lazy. Take for example the following code.

```haskell
let
    pets = {
        Fetch("https://api.service.com/dogs"),
        Fetch("https://api.service.com/cats")
    }
in
    pets{0}
```

In this expression, we have a list of pets which contains the result of some API calls to a web service. However, only the first element of the array is ever accessed and because Power Query is lazy the second fetch will never actually be evaluated. In a custom connector, this could be used to access a paged rest API in order to import a table. And because evaluation is lazy using the standard `take` function will only fetch the pages that are needed are fetched.

It's exciting to see functional programming, especially a language as interesting as Power Query, popping up in the mainstream. I had a blast learning about Power Query and I learnt so much along the way. If you're interested in trying out a functional fist language, whatever it may be, I encourage you, now is the time to check one out!