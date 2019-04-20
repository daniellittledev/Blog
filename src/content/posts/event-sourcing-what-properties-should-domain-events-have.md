---
author: "Daniel Little"
categories: ["Event Sourcing", "Domain Driven Design", "Domain Events"]
date: 2016-10-31T08:46:13Z
description: "A while ago I wrote about Generating Read Models with Event Sourcing where I suggest adding derived properties to the persisted domain events also known as"
draft: false
image: "/images/2016/10/Events.png"
path: "/event-sourcing-what-properties-should-domain-events-have"
tags: ["Event Sourcing", "Domain Driven Design", "Domain Events"]
title: "Event Sourcing: What properties should Domain Events have?"

---

## What I learned since last time
A while ago I wrote about [Generating Read Models with Event Sourcing](/generating-read-models-with-event-sourcing/) where I suggest adding derived properties to the persisted domain events also known as Enriched Events. Since writing that post, I have been using this approach. However, over time I found that this was not the solution I was hoping for. In short enriching events also has some problems and recently I have switched over to using only delta style events for persisted events. In this article, I will cover the problems that come from enriching events and suggest a (better) alternative solution to the question "What properties should Events have?".

## What problem is Event Enriching meant to solve?
When a Domain Event is raised, it is published to several interested handlers. The first of these is the Apply Method whose job it is to update the state of the Aggregate. Because the Aggregate is the primary source of an event, it has access to all the updated state. The problem stems from needing to pass some of this data to the other interested handlers.

If we look at a bank account, the event would be a transaction resulting in a changed account balance. The other interested handlers could be Read Model Generators, other event handlers or even other services. Some of these are almost certainly interested in the current balance of an account. In this case, Enriching the `Transaction Added` event would involve adding the Current Balance to the events. Enriching solved the issue of easily providing information to all the interested handlers. More importantly, though, it ensured that there is only one place where derived state is calculated.

![Diagram, Derived properties are calculated in the behaviour](/../../images/event-sourcing-what-properties-should-domain-events-have/Before.png)

Sending derived properties to other handlers and services is an important problem that Enriching Events was able to resolve. So it is equally important to ensure that the new solution solves this problem as well. But first, we'll look into what the problems with Enriching Events are.

As a side note, there are still cases where other handlers for an event keep track of their own running totals or tallies (derived state). However, this is usually because it is data that the Aggregate does not care about and does not already calculate or store. In which case, no logic is being duplicated anyway.

## Ok so what’s wrong with Enriching Events
There are a few problems that come from enriching Events which you can avoid by using delta only Events.

### Redundant Data
One of the core ideas in event sourcing is storing a list of all the changes that have happened to an Aggregate. By playing back these events you can determine the state of the Aggregate at a point in time. Because the system is deterministic, you will arrive at exactly the same state every time.

For a bank account given all the deposits and withdrawals ever made can determine what the current balance is. If you were to store the current balance along with every transaction, you would have to store much more data for little benefit. In fact, it stops us from using other nice features of Event Sourcing.

### You can’t do Replay Testing
Replay testing allows you to use all your current production data as test data for your application. The derived state will be re-calculated using the events as they are replayed. Comparing the results of different versions can then be used to spot any divergences and fix them before they make it to production.

The one downside to this is that we must do slightly more work when replaying events. However, processing events in memory is extremely quick and loading the data is usually the bottleneck anyway. Lots of events can still slow things down, but you can use Snapshotting to win back even more performance.

### No Concurrency for Aggregates
Concurrency is probably the biggest issue with Enriched Events. Looking at the `Transaction Added` event for a bank account. If the balance total is part of the event, then it forces you to process all behaviours in serial. This is what it looks like if we add the current balance to the event.

    Event               Amount  Total
    TransactionAdded    50      50
    TransactionAdded   -20      30
    TransactionAdded    10      40
    Total    40

But what happens when both the second and third event occurs at the same time.

    Event               Amount   Total
    TransactionAdded    50      50
    TransactionAdded!  -20      30
    TransactionAdded!   10      60
    Total    60 // Should be 40

If we do not handle concurrency at all, the total from the first event will get overridden by the total from the second event. This would be terrible! Optimistic Concurrency is the next level and a good default, in this scenario, a concurrency exception is thrown instead. This works well for cases where you cannot do work in parallel.

However, if the model does not need the totals to process transactions (at least not in a completely consistent manner), then the order does not matter anymore. You will still end up with 40 regardless of the order you process the behaviours in. So, we can be a bit clever and for transactions that do not conflict, try to insert it again automatically. Speeding up the time it takes to process events.

    Event               Amount
    TransactionAdded    50
    TransactionAdded   -20
    TransactionAdded    10
    Total    40

Even if behaviours cannot be processed in parallel such if we needed the balance to be completely consistent inside the aggregate, we can derive the totals so we can still avoid persisting them.

### Unfocused Events

Enriched Events contain all the derived properties as well as the deltas which can leave you with quite large events. I have found that in most cases individual handlers will only care about one or the other, deltas or totals. For our bank account example if we want to publish the current balance we could have two events instead of one giant event. The first event would still be `Transaction Added` and the second would be `Balance Changed`. If you were updating a SQL Read Model you would probably have two tables (transaction and balances) and an event handler for each table, so two events align perfectly.

## Multiple events to prevent duplicating logic

Using multiple events is also how we will deal with sending derivable state to other handlers. The second event, which includes the derived state, won't be persisted at all. I'll call this a transient event. The Persisted Domain Events that the behaviour creates are created as normal. However, Transient events need to be handled a little differently because they need the internal state from after the `Apply` method is called. Adding a Handle method for behaviours that executes after the Apply method gives us a chance to let the world know about derived or calculated data.

![Diagram](/../../images/event-sourcing-what-properties-should-domain-events-have/DomainEvents-1.png)

Now, when a behaviour is run the persisted event is raised, Apply updates the state, and the Handle method will run. Giving you a place to raise transient events as well. After the behaviour is finished all these events are then published.

Rebuilding the Read Model will also require the transient events to be regenerated. However, we can completely skip the Handle method when Hydrating an Aggregate from an event stream.

## Persisted Domain Events

Now we have small delta only events in our event store, the door is open to leveraging the real power of Event Sourcing. It is much easier to keep other handlers informed and avoid duplicate code. Events are more focused, smaller and easier to work with. There are more options for dealing with concurrency. And you can make use of Replay Testing to eliminate a broad range of regressions.

So, what properties should Events have? Persisted events should only store what they need,  typically only the change or the delta. The rest can be derived from there.

---

I am currently building a more Functional Event Sourcing library for C# called [Eventual](https://github.com/Lavinski/Eventual). It's my playground for Event Sourcing ideas and a good place to dig into some real code. It is, however, an early alpha and still a work in progress, so it doesn't cover everything in this post. Nevertheless, I still recommend you take a look if you want a peek under the covers.
