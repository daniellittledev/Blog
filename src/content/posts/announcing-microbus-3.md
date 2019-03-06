---
author: "Daniel Little"
categories: ["MicroBus", "NuGet Package"]
date: 2016-03-09T20:47:00Z
description: "Awesome! MicroBus 3, what does that mean? Well, I've been using Semver (mostly, sometimes a little Ferver creeps in) for my package versions so it means in this release there's a few breaking changes."
draft: false
path: "/announcing-microbus-3"
tags: ["MicroBus", "NuGet Package"]
title: "Announcing MicroBus 3"

---

Awesome! MicroBus 3, what does that mean? Well, I've been using Semver (mostly, sometimes a little Ferver creeps in) for my package versions so it means in this release there's a few breaking changes. Now, first off, this is a much bigger update than 2.0 was and redefines a few of the MicroBus concepts.

There are three main changes, firstly the Registration API has been reworked, global handlers have been smoothed out and there's a new `IMicroMediator` interface (useful for sending any type as a message). But before I get into the details first here's a little bit of background.

## The Story So Far

MicroBus has been a fantastic project to work on. I've been lucky enough to be able to use it quite substantially in my workplace. However, some things didn't turn out quite the way I expected them to. So it was time for a few changes.

Since the beginning, MicroBus has always had the concept of a pipeline which contains two types of handlers. The first was Message Handlers that resided at the end of the pipeline which do the real work for a given message. The second type of handlers were Pipeline Handlers which could be used to intercept a message as it travelled down the pipeline.

In the first version of MicroBus, the Pipeline Handlers are were explicitly added to the message handlers when registering them. However, even though you assigned the Pipeline Handlers individually, they behaved as if they were global. You could only ever have one set of Pipeline handlers for any one message, even if there were multiple different Message Handlers. It had to be the same instance of the Pipeline. 

In version 2 support for having a global pipeline was added. However, these handlers were restricted to only running once, so they wouldn't run a second time if you sent messages from inside message handlers. Which was super useful, but slightly confusing with regards so naming.

## What's Changed

So it was time to clean up a few things. Version 3 started with wanting a bit more flexibility out of MicroBus. If your message contracts implemented `ICommand`, `IEvent` or `IQuery` then everything was fine. However, there were a few cases, such as handling existing messages that didn't use these interfaces, where handlers needed to support any type of object.

### IMicroMediator interface 

This new interface has the same three methods (send, publish, query) as `IMicroBus` except that messages can be any .NET `object`.  

    public interface IMicroMediator
    {
        Task SendAsync(object message);
        Task PublishAsync(object message);
        Task<TResult> QueryAsync<TResult>(object message);
    }

To handle messages that don't implement our interfaces, a new handler `IMessageHandler` interface has been added. The `Handle` method of this interface takes a message of any type and returns an `object`.

    class Handler : IMessageHandler<Message, Unit>
    {
        public async Task<Unit> Handle(Message message)
        {
            return Unit.Unit;
        }
    }

Traditional MicroBus message types can also be sent using the `IMicroMediator` interface and can be handled by either the type safe or generic message handler interfaces.

### Registration API

The next big change was the Registration API, there are two main changes here. Firstly when registering MicroBus to the Container Builder, instead of having to register everything inside a lambda, you can now pass in a `BusBuilder` like so.

    var busBuilder = new BusBuilder();
    containerBuilder.RegisterMicroBus(busBuilder);

The second change to the Registration API is to the handler registration methods themselves. Previously the registration code looked like this.

    busBuilder
        .RegisterCommand<TestCommand>().To<TestCommandHandler>()
        .RegisterCommand<TestEvent>().To<TestEventHandler>();

The main reason the API was originally designed this way was to make it easier to register events.

    busBuilder
        .RegisterEvent<Event>().To(x => {
            x.Handler<EventHandler>();
            x.Handler<EventHandler2>();
        });

In this version of the API you only have to specify the message type once when registering multiple handlers. However, this required quite a lot of code for not much benefit, especially when most of the time you could just use assembly scanning registration methods instead.

    .RegisterHandlers(x => x.FullName.Contains("BusMessageTests"), assembly);

The explicit handler registration API is now much more flat, and combines the `Register` and `To` methods into a single method in `BusBuilder`.

    busBuilder
        .RegisterQueryHandler<IsItTimeToGetOutOfBedQuery, Result, IsItTimeToGetOutOfBedQueryHandler>()
        .RegisterQueryHandler<BreakfastEvent, MakeBaconHandler>()
        .RegisterQueryHandler<BreakfastEvent, EventHandler>()

### Global Handlers

The last big change is Global handlers. I talked about the problems with the way handlers previously worked. Mainly that pipeline Handlers were Global handlers in disguise except individually registered. In v3 these handlers have been pulled out of the individual registrations and replaced with real global handlers, that are globally registered.  These handlers will run for every message sent over MicroBus. 

    busBuilder
        .RegisterGlobalHandler<InnerHandler>()

Global handlers use the new `IDelegatingHandler` interface which has one main difference to the old `IPipelineHandler` interface mainly the use of `INextHandler` instead of a `Func` to invoke the next handler in the pipeline.

    class DoNothingHandler : IDelegatingHandler
    {
        public async Task<object> Handle(INextHandler next, object message)
        {
            return await next.Handle(message);
        }
    }

Overall global handlers are now much more consistent and much easier to use.

However, this means the global handlers now run all the time, for every message. Needing handlers that know if they're at the Top Level of the call stack is still something I really wanted. So I've brought it back as dependency you can use to tell if it's an outer Handler or not.

Adding `IOuterPipelineDetector` to the constructor of a handler will provide an instance via Dependency Injection. The `IOuterPipelineDetector` interface has a single property called `IsOuterPipeline` which you can use to prevent a handler running a second time if the MicroBus pipeline runs inside an earlier instance of the pipeline.

## Conclusion

It's been quite a bit release, with a few new features that will make MicroBus more powerful and easier to use. The new `IMicroMediator` makes it easier to work with any message types, registration is simplified and global handlers are easier to build. 

So there you have it, all the changes in MicroBus 3! Make sure you try it out the new version. Of if you're installing for the first time use the command below. I'm also always on the lookout for feedback so leave a suggestions or issues on the GitHub page. Happy messaging!

> PM> Install-Package [Enexure.MicroBus.Autofac](https://www.nuget.org/packages/Enexure.MicroBus.Autofac/)
