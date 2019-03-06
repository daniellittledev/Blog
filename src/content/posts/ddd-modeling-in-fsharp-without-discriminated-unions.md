---
author: "Daniel Little"
date: 2017-03-22T00:45:31Z
description: ""
draft: true
path: "/ddd-modeling-in-fsharp-without-discriminated-unions"
title: "DDD Modeling in FSharp without Discriminated Unions"

---

I've been going a lot with FSharp lately.

One of the things you see people talking about is Domain Modeling and you'll see something like this.

Discriminated Unions for all the things

    type OrderCreated = { ... }
    type ItemRemoved = { ... }
    type ItemAdded = { ... }

    type OrderEvents =
        | OrderCreated of OrderCreated
        | ItemRemoved of ItemRemoved
        | ItemAdded of ItemAdded 

    let behaviour command (aggregate: State) = 
        match command with       
        | CreateOrder

    let apply (aggregate: State) event = 
        match event with
        | OrderCreated 

And then 

    type Aggregate<'State, 'Command, 'Event> =
        {
            Zero: 'State
            Exec: 'Command -> 'State -> 'Event
            Apply: 'State -> 'Event -> 'State
            Name: string
        }

And the tests look pretty good too

    Given aggregate [
        Created { ... }
    ]
    |> When (AddItem { ... })
    |> Expect (ItemAdded { ... })

But there's a problem (although it's nice for returning one of many events, or multiple events)
Let's look at the whole picture
Starting from web endpoint

    let ``POST /order`` bus bindingModel =
        let orderId = Guid.NewId()
        let command = mapCreateCommand orderId  bindingModel
        bus command

Then when do we wrap it? You need to wrap if you want to be stateful.

    let toAggregatecommand command =
        match command with
        | :? Type as typedCommand -> Created typedCommand

We'd probably need to unwrap the event too?
Depends if we bother to wrap it now..

Why bother?

Strong typing all the way through? It's basically the same as it would be in C# anyway.

    // Aggregate.behave
    let handler = toAggregateCommand >> statefullAggregate >> fromAggregateEvent
    let handlers = [
       generalise (globalPipeline >> handler)
    ]
    let bus = handlers |> toBus