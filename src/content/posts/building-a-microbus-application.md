---
author: "Daniel Little"
categories: ["Mediator Pattern", "Architecture", "MicroBus", "Message Bus"]
date: 2015-09-19T05:31:08Z
description: ""
draft: false
path: "/building-a-microbus-application"
tags: ["Mediator Pattern", "Architecture", "MicroBus", "Message Bus"]
title: "Building a MicroBus application"

---

I often like to think of software architecture as the art of structuring software. It's goal being to meet requirements while at the same time being resistant to falling into the state most commonly referred to as a Big Ball of Mud. To fight back against this, applications can use a well-defined architecture along with consistency and readability to ensure they don't become a sprawling,  duct-tape-and-baling-wire, spaghetti code jungle. Instead, applications can be structured in such a way as to reduce unnecessary coupling between components. And have a strong foundation that provides consistency, structure and an ideology of the application.

## What is MicroBus

MicroBus is a small library designed to help structure applications using the concepts of the Message Bus and Mediator patterns. The mediator pattern focuses on reducing coupling by communicating through a mediator, and the bus depicts the style of communication. These two aspects enable the application to be constructed as a series of pipelines each responsible for its own vertical of functionality. 

## Sending Messages

MicroBus is centered around sending messages. As an example of what this looks like, here is an example of sending and processing a command.

    await bus.Send(new AddItemToCartCommand(cartId, itemId));

The command, in this case, is adding an item to some shopping cart. The message itself is a data only object that implements `ICommand`. MicroBus also supports events and queries as first class citizens and enforces their semantics though type safety where possible. For instance, events are the only message types that can have multiple handlers registered to them, and queries are the only message types that can return data. The methods to send events and queries are also slightly different to enforce the notion that each has an explicit purpose.

To publish an event to all it's handlers the `Publish` method is used, the event must implement the `IEvent` interface.

    await bus.Publish(new Event(...));

Queries also have their own method that returns the result for the given query. Queries must implement `IQuery<TQuery, TResult>` where TQuery is itself, and TResult is the result. The Result must also implement `IResult`. This enforces the notion that queries must have a result and also enables type inference to work seamlessly for calls to `bus.Query()`. 

    var result = await bus.Query(new Query(...));

In this case, the type of `result` would be inferred from the query type.

## Handling messages

Once the message has been put on the bus, then the handlers take over. More generally, handlers contain core logic of the application. Above we sent a `AddItemToCartCommand` command onto the bus so now to handle the command we need a command handler. This is a class that implements the interface `ICommandHandler<T>`. So our command handler would look something like this.

    class AddItemToCartCommandHandler : ICommandHandler<TestCommand>
    {
        ctor ⇥ ⇥        

        public async Task Handle(AddItemToCartCommand command)
        {
            var cart = repository.Load(command.CartId);

            cart.AddItem(command.ItemId);

            repository.Save(cart);
        }
    }

Similarly, events will use `IEventHandler<T>` and queries will use `IQueryHandler<TQuery, TResult>`. 

After creating the message and handler you then need to register them to the bus. Here is what a registration would look like when using Autofac. In this case handlers will be registered to Autofac with the `InstancePerLifetimeScope` scope.

    container.RegisterMicroBus(busBuilder =>
        busBuilder
            .RegisterCommand<Command>().To<CommandHandler>(...)
            .RegisterEvent<Event>().To<EventHandler>(...)
    );

It's also fairly easy to support any other container, and you can even use it without one at all.

    var bus = new BusBuilder()
        .RegisterQuery<Query, Result>().To<QueryHandler>(...)
        .BuildBus();

In this case, the built-in BusBuilder is used to create a bus without any IOC container.

## The Pipeline

Messages and Handlers are the bread and butter of MicroBus, but the real power comes from the Pipeline. The pipeline consists not only of just the end handler but lets you place any number of intermediary pipeline handlers between receiving the message and handling it.

![Pipeline Handlers](/content/images/2015/08/MicroBus_PipelineHandlers.png)

Pipeline handlers let you intercept messages as they are passed through to the message handlers, and then the responses as they bubble back up through the pipeline. This makes pipeline handlers the ideal place to handle all the cross-cutting concerns in an application. Such as logging, security, unit-of-work/transactions to name a few. 

Here is an example of a pipeline handler responsible for starting and committing a Unit of Work.

    class TransactionHandler : IPipelineHandler
    {
        private readonly UnitOfWork unitOfWork;

        public PipelineHandler(UnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork
        }

        public async Task<object> Handle(Func<IMessage, Task<object>> next, IMessage message)
        {
            try {
                var response = await next(message);
                unitOfWork.Commit();
            } catch {
                unitOfWork.Rollback();
            }
        }
    }

The same `IPipelineHandler` interface is used for all messages. This enables the use of the same pipeline can be used across all types of messages. This interface is fairly typical, but there's one thing worth point out here which is the first parameter of the Handle method. This method takes a `Func<IMessage, Task<object>>` which instantiates or resolved the next handler in the pipeline and calls its handle method. This is a kind of Russian doll model in that each handler contains the next handler. 

Creating a pipeline just consists of creating a new `Pipeline` object and adding a series of pipeline handlers to it.

    var pipeline = new Pipeline()
        .AddHandler<PipelineHandler>();

Once the pipeline has been created you can use it for as many different messages as you want. For example here the same pipeline is used to register a command and a query.

    container.RegisterMicroBus(busBuilder => busBuilder
            .RegisterCommand<Command>().To<CommandHandler>(pipeline)
            .RegisterQuery<Query>().To<QueryHandler>(pipeline)
    );

## Compared to MVC/WebApi

So far we've seen MicroBus handling messages and handling cross-cutting concerns using the pipeline. While most frameworks, such as *ASP.NET Web API*, *ASP.NET MVC*, and *Nancy* will let you do something similar with handlers and action filters. One of the advantages behind the MicroBus is that it allows the application code to define the pipeline itself as opposed to embedding it in the frameworks themselves. These frameworks many also have other concerns going on besides the very simple “message in, message out” pattern. 

Decoupling the application from these frameworks also has the added benefit of being able to use the same code for multiple different entry points. For example, you have a web app that can also consume messages from a service bus. Because all the cross cutting concerns are handling by MicroBus, it becomes trivial to support.

![Multiple invokers](/content/images/2015/08/MicroBus_Invokers.png)

Entry points can also include Tests making Integration and Unit testing much easier. Part of the reason for this is each feature already maps to one command and handler pair. Integration tests can simply use the bus as is with the existing pipeline, and Unit Tests can focus on handlers as a unit.

## MicroBus Lifecycle

Lastly, I wanted to touch a little bit on Object Lifecycles in MicroBus. For a Bus setup using Autofac, most components will be registered as instance per lifetime scope except the bus itself. The bus is registered as transient and will create a new lifetime scope for each message. So even without using Autofac in WebAPI, each request would get a new instance of the bus and the pipeline. 

![MicroBus Pipeline Lifecycle](/content/images/2015/08/MicroBus_Pipeline-1.png)

Things get a little more complicated when handlers themselves send messages. In that case, no new scope is created so lifetime scope registrations can be shared across nested pipelines as well. It's also possible to override when MicroBus creates new scopes by implementing the `IDependencyScope` and `IDependencyResolver` interfaces.

## Getting Started

So there you have it. MicroBus, a tiny in memory message bus that can help you structure your app, reuse your cross-cutting concerns and decouple it from communication concerns.

I hope you enjoyed learning a little bit about what MicroBus is and how it can help you. If you're, keep to see more make sure you check out the [MicroBus GitHub page](https://github.com/Lavinski/Enexure.MicroBus). Or just go right ahead and install the NuGet package and have a play yourself.

> PM> Install-Package [Enexure.MicroBus](https://www.nuget.org/packages/Enexure.MicroBus/)

For more examples, you can also check out the [Enexure.MicroBus.Tests](https://github.com/Lavinski/Enexure.MicroBus/tree/master/src/Enexure.MicroBus.Tests) project.