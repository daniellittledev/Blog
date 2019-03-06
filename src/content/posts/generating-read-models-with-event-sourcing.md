---
author: "Daniel Little"
categories: ["Event Sourcing", "CQRS", "Domain Driven Design"]
date: 2015-07-21T22:28:00Z
description: ""
draft: false
path: "/generating-read-models-with-event-sourcing"
tags: ["Event Sourcing", "CQRS", "Domain Driven Design"]
title: "Generating Read Models with Event Sourcing"

---

Event sourcing is a very powerful tool that allows you to capture information you didn't even know you wanted. One of the things you usually find yourself doing when event sourcing is applying the principle of CQRS. CQRS effectively splits your application into two parts, a read side for queries and a write side for commands. These two sides are kept in sync by events that the read side listens to, which represent the results of the commands. One of the issues I've tackled recently is how to go about generating the read model from these events.

<div class="alert alert-danger">
    Update! I've learnt a lot since writing this article and no longer recommend the conclusion I came to here. In short enriching events had unforeseen problems and I would instead recommend using only delta style events in a persisted event streams. To learn more read <a href="/event-sourcing-what-properties-should-domain-events-have">Event Sourcing: What Properties should Domain Event have?</a>
</div>

So to set the scene, imagine a bank account, it contains a series of transactions and the total for the account. The two main events that we have to handle here are credits and debits. I'll skip over why they're not just one transaction event for this post. The part I want to focus on is what properties these events need. My first thought was that these events should just represent the deltas of the system. So my credit event would only need to specify the amount. The event would then be saved to the event store and published so any other potential listeners could handle it as well.

## Handlers keeping track themselves

Ok, now it's time to update the read model! My read model is a typical set of database tables, accounts and transactions. I'll start with transactions because it's easy, all I need to do here is write in my event. Now for the tricky bit. My accounts table has a balance total column that I need to update in response to the event as well, but I don't know what the new total is. Could I use the existing value in the read model and just add my amount to it? No, that doesn't feel right at all, worse my values could drift between models. There's also another problem. If another service wanted to listen for these events and keep track of the total. They'd have to deal with the same problem, doing the calculation again themselves. They might not even have persisted memory to keep track of the total.

> The Credit Added event containing just the amount to add

    /* CreditAddedEvent */ {
        'amount': 10.0
    }

> With deltas each listener has to duplicate the work done

    Who needs the total:
    - Domain model
    - Read model to display total
    - Reporting

## Using the domain model's current state

It would be fantastic if I somehow had access to the information when the credit event is raised. The model in the write side keeps track of the balance total already. Can I get the information from the model when processing the event? This could work, but it would require exposing the total via a property so the handler could access it. 

> I could get the information from the model when processing the event

    // Maybe something like this
    public void Handle(Metadata<CreditAddedEvent> metadataEvent) {
       
        metadataEvent.DomainEvent.Amount
        metadataEvent.DomainModel.Total
    }

This didn't quite sit well with me either, one of the great things about the models in CRQS+ES is they can shed all their properties and properly encapsulate their state. If I expose properties here command handlers would then have access when they really shouldn't. There's also one other concern, tests. I also need to check the total in my tests and exposing this makes testing harder because my model is exposing more of its implementation. So either I can't change my model, or my tests become more prone to change. 

## Enriching the event

My last option to get the total is to put the total on the event itself (enriching the event). So that the event would then contain the amount of credit and the new total for the balance. I'd been avoiding this because the total could be derived from the events that just contained the credits and debits. Adding the derived totals would then mean they had to be persisted in the event store. However looking back this gives us exactly what we want and solves some other problems along the way.

> Enriching the event means that it now represents the state change

    /* CreditAddedEvent */ {
        'amount': 10.0,
        'newTotal': 70.0
    }

Enriching the event means that it now represents the state change of the aggregate. Therefore, the state change becomes completely explicit and simplifies usage of the event stream immensely. Consumers don't have to keep track of any state themselves, in my case keeping their own tally. Enriching the events also helps keep my code dry, all my calculations take place in the behaviours of my models. This also makes replaying my events blisteringly fast because only have to set fields; no other calculations are needed. This would be even more beneficial if derived values were computationally expensive. As for the idea of exposing properties, enriching the event means I don't need to expose any properties for tests or to generate the real model. Everything they need is on the events, and the aggregates completely encapsulate all their internal state. The domain models should only need to process commands and emit events as side effects. This also helps unit tests become more resilient to change while giving me more freedom to change the internals of the models. You'll also find that some state doesn't even need to be kept in the memory of the models but may only be used in the events and the read model.

## Enriching the event but not storing it

However, there's one more possible path I could have taken. Which is to have two different events. The delta that is stored in the event store and the enriched event that is only in memory. There are also problems with this approach, but I want to include it for completeness. While this gives me most of the benefits from just having one event, replaying the events becomes a much more expensive operation. I'd also have to write two events instead of just one which adds a whole bunch of other complexities and raised a whole bunch of questions. Would the events have the same identity? Would I need to store things that are not deltas anyway, such as answers from external services? What would I call the new event?  They are the same event but have different models, it feels awkward giving two events the same name. I'd much rather just store the extra data and have just one event. 

## In the end

Enriching my domain events and saving them in the event store lets me generate the read model I need easily and avoids unnecessary complexity. Thus keeping the application in a maintainable state. I get the benefits of fast replaying of events, having all state change explicitly represented in the events and fully encapsulated state in my domain models. I could also data mine the raw event stream much more easily without using my application to process the events or duplicating the logic in it. 