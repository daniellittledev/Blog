---
author: "Daniel Little"
categories: ["MicroBus", "Mediator Pattern"]
date: 2017-01-07T02:09:43Z
description: "Mediators are an excellent addition to the developer toolbox. Allowing you to define pipeline that is decoupled from any particular framework. Both MediatR and MicroBus ..."
draft: false
path: "/comparing-microbus-and-mediatr"
tags: ["MicroBus", "Mediator Pattern"]
title: "Comparing MicroBus and MediatR"

---

Mediators are an excellent addition to the developer toolbox. Allowing you to define a pipeline that is decoupled from any particular framework. Having a pipeline makes it easy to deal with cross cutting concerns like security, transaction, validation and others. For these reasons and more using a Mediator has become quite a popular choice. They are also used to improve other aspects of an application in regards to structure and architecture. 

Recently there have been a few such Mediator libraries pop-up for .NET including MediatR, GreenPipes and MicroBus. I started MicroBus back in 2015 and have used it in a number of projects since. So I thought now would be great to talk a bit about MicroBus and what it does. In this post, I will be comparing MicroBus and MediatR, so that you can see the similarities and differences. 

But before I begin, I'd like to say; I think both MediatR and MicroBus are great solutions to these problems. I've made some different choices along the way, however, both these projects had similar origins (aka doing it numerous times before making a package), have similar goals and tackle similar problems.

## Wire Up

I'll start with how to wire-up the Mediators, which involves firstly registering them to a dependency injection container.

With MicroBus I wanted to ensure the experience was the same regardless of which container you prefer. It's syntax, is, therefore, a little more succinct than out of the box MediatR.

    // MicroBus
    autofacContainerBuilder.RegisterMicroBus(busBuilder);

MediatR takes the approach of zero dependencies and provides the following sample for setting up MediatR with Autofac.

    // MediatR
    var builder = new ContainerBuilder();
    builder.RegisterSource(new ContravariantRegistrationSource());
    builder.RegisterAssemblyTypes(typeof(IMediator).GetTypeInfo().Assembly).AsImplementedInterfaces();
    builder.RegisterAssemblyTypes(typeof(Ping).GetTypeInfo().Assembly).AsImplementedInterfaces();
    builder.RegisterInstance(Console.Out).As<TextWriter>();
    builder.Register<SingleInstanceFactory>(ctx => {
    	var c = ctx.Resolve<IComponentContext>();
    	return t => c.Resolve(t);
    });
    builder.Register<MultiInstanceFactory>(ctx => {
    	var c = ctx.Resolve<IComponentContext>();
    	return t => (IEnumerable<object>)c.Resolve(typeof(IEnumerable<>).MakeGenericType(t));
    });

However that's not entirely fair, the actual implementation for MicroBus is relatively similar under the covers. MicroBus also currently only provides an Autofac extension. Although you can set-up any other container manually. The Autofac implementation itself consists mainly of this file [ContainerExtensions.cs](https://github.com/Lavinski/Enexure.MicroBus/blob/master/src/Enexure.MicroBus.Autofac/ContainerExtensions.cs) and uses a resolver and scope class similar to ASP.NET MVC instead of factories for resolving dependencies. If you'd like to request a particular container, then feel free to open a GitHub issue.

MicroBus wire-up is slightly more complex in two places, validation, which ensured command and requests only have a single handler and Registrations which support singleton and transient registrations, which is useful for transparently doing complex registrations that can completely change how handlers work. MicroBus uses this to provide Saga support something I'll write more on in a later post.

## Pipeline and Handler Registration

Next, we'll take a look at how to register handlers and how to create a pipeline.

Again I wanted to ensure that registration for MicroBus was consistent across containers and that the concept of a pipeline was a first class citizen. There are two main types of handlers in MicroBus, Global/Delegating Handlers which execute for every message and Message handlers which sit at the end of the pipeline.

    // MicroBus
    var busBuilder = new BusBuilder()
    
    // Global Handlers run in order so these are explicitly registered
    .RegisterGlobalHandler<LoggingHandler>()
    .RegisterGlobalHandler<SecurityHandler>()
    .RegisterGlobalHandler<ValidationHandler>()
    .RegisterGlobalHandler<TransactionHandler>()
    
    // Scan an assembly to find all the handlers
    .RegisterHandlers(assembly);

Global handlers run in the order they are registered then Message Handlers are executed. The Delegating Handlers are also Task-based which uses `async` in contrast to before and after methods. Again this is very similar to ASP.NET WebApi and ASP.NET Core, which use a similar approach.

Another one of the goals I had in mind when building MicroBus was Safety. To help prevent you from doing the things you probably don't want to be doing anyway. MicroBus supports three message types, commands, events and queries. Each of these types have different semantics which are enforced through validation. Only a single command handler can be registered for a command. The same goes for queries. Events, however, can have multiple handlers (polymorphic handlers are also supported) but no return types.

Registration via MediatR up until very recently (about two days ago) didn't provide any abstractions, so registrations were made directly via the container with decorators. Leaving the pipeline to the container removed a fair amount of complexity from MediatR and delegates it to the container. The trade-off here though is that the user may have to deal with the complexity instead.

MediatR 3.0 now also provides support for pipelines which makes registration much easier for all containers.

    // MediatR
    builder.RegisterGeneric(typeof(IPipelineBehavior<,>)).As(typeof(LoggingBehaviour<,>));
    builder.RegisterGeneric(typeof(IPipelineBehavior<,>)).As(typeof(SecurityBehaviour<,>));
    builder.RegisterGeneric(typeof(IPipelineBehavior<,>)).As(typeof(ValidationBehaviour<,>));
    builder.RegisterGeneric(typeof(IPipelineBehavior<,>)).As(typeof(TransactionBehaviour<,>));



## The API

The primary interface you use to send commands to MicroBus is the `IMicroBus` interface.

    // MicroBus
    public interface IMicroBus
    {
        Task SendAsync(ICommand busCommand);
        Task PublishAsync(IEvent busEvent);
        Task<TResult> QueryAsync<TQuery, TResult>(IQuery<TQuery, TResult> query)
            where TQuery : IQuery<TQuery, TResult>;
    }

This interface is strongly typed and enforces that a given message type is used with the matching method. MicroBus also provides a secondary generic `IMicroMediator` interface which can be used with untyped MessageHandlers, we'll look at these a bit later. 

    // MicroBus
    public interface IMicroMediator
    {
        Task SendAsync(object message);
        Task PublishAsync(object message);
        Task<TResult> QueryAsync<TResult>(object message);
    }

With most choices in MicroBus, I've gone for the opinionated option to get better compile-time safety or better validation. This interface, however, offers much fewer guarantees. In some brownfield projects especially those which already followed a similar pattern but had messages that didn't use the MicroBus marker interfaces, this is extremely useful. 

The MediatR interface is very similar to the IMicroBus interface. It has the three primary methods for Commands, Request/Queries and Events but using different names. One nice feature here is the support for CancellationTokens. 

    // MediatR
    public interface IMediator
    {
        Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default(CancellationToken));

        Task Send(IRequest request, CancellationToken cancellationToken = default(CancellationToken));

        Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default(CancellationToken))
            where TNotification : INotification;
    }

These interfaces are probably the most similar part of the two libraries. It's also interesting to see that MediatR also took the type-safe route here. One thing I did find slightly confusing was that MediatR uses IRequest with no Response for its commands.

## Message Handlers

So far we've covered how to register handlers, and how to send messages to them. Next up is how they are defined. In MicroBus there are three typed handler interfaces and one generic handler interface for the IMicroBus and IMicroMediator interfaces.

The three typed interfaces are for each of the message types, commands, queries and events.

    // MicroBus
    ICommandHandler<Command>
    IQueryHandler<Query, Result>    
    IEventHandler<Event>

Here is what a command handler would look like in MicroBus. 

    // MicroBus
    class CommandHandler : ICommandHandler<Command>
    {
        public async Task Handle(Command command)
        {
            Console.WriteLine("Command handled!");
        }
    }

It's worth mentioning that EventHandlers support polymorphic dispatch so a `IEventHandler<AnimalEscaped>` and `IEventHandler<LionEscaped>` would fire if `LionEscaped` inherits from `AnimalEscaped` (MediatR also supports this). 

The generic handlers are also quite similar. However, in this case, there's only one interface because it's impossible to know what the message will be based on its type. If you're implementing a command or event, you would typically return Unit.

    // MicroBus
    class Handler : IMessageHandler<Message, Unit>
    {
        public async Task<Unit> Handle(Message message)
        {
            return Unit.Unit;
        }
     }

MicroBus is also split up into four main parts.

 - The core package
 - Infrastructure contracts, which include `IMicroBus` and the `IHandler` interfaces
 - Message contracts, which includes `ICommand`, `IQuery`, `IEvent` and `IMessage`
 - Dependency Injection Extensions

Splitting up MicroBus into multiple packages is a nice feature that lets you selectively include the parts of MicroBus you depend on. Most commonly you see Message Contracts defined in a library that depends only on `MicroBus.MessageContracts`.

MediatR's Handler are quite similar the main distinction being that MediatR provides both async and synchronous versions of each interface. The example below shows an async command handler.

    // MediatR
    class CommandHandler : IAsyncRequestHandler<Command>
    {
        public async Task Handle(Command message)
        {
            Console.WriteLine("Command handled!");
        }
    }

Overall you can see a lot of similarities with a few defining features.

## Delegating Handlers

We've already talked a bit about Pipeline and Handler registration and this one of the most useful features of a Mediator. MicroBus has first class support for pipelines and makes writing cross-cutting code effortless.

To start, you implement IDelegatingHandler which has a similarly looking handle method. One of the nice things about IDelegatingHandler is that don't need a constructor, and if you need dependencies, you don't need to worry about where the "inner" handler goes. Instead, the next handler is passed along through `Handle` keeping the scope of the variable as small as possible. Delegating Handlers are also registered globally which means that you'll only need to register them once and they'll run for every type of message.

The example below shows how you could create a global handler which wraps every message handler in a database transaction. 

    // MiroBus
    public class DatabaseTransactionHandler : IDelegatingHandler
    {
        public async Task<IReadOnlyCollection<object>> Handle(INextHandler next, object message)
        {
            using (var transaction = database.NewTransaction()) {
                return await next.Handle(message);
                transaction.Commit();
            }
        }
    }

Delegating Handlers also make use of async and await which means you can make using of `using` and `try` as opposed to having a before and after method.

MediatR didn't have a global pipeline until recently. Before which made registering cross-cutting code for every handlers somewhat tedious. The latest version 3.0 puts it on par in this respect and the handlers which are called Behaviours are again quite similar. The snippet below shows an example of a behaviour in MediatR.

    // MediatR
    public class MyBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> {
        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next) {
            //Before
            var response = await next();
            // After
            return response;
        }
    }

## What's next

Mediators are a great addition to the developer toolbox letting you deal with cross cutting concerns without tying your application to a UI, web or service framework. We've looked at wire-up, declaring and registering handlers, usage, and pipelines while comparing MicroBus and MediatR. 

I hope I've been able to show you a bit about MicroBus and what makes it different. So if you're used a mediator before (or if you haven't) I'd recommend trying MicroBus out for yourself, I'm always looking for feedback and suggestions. You can get the get the bits on github here [Enexure.MicroBus](https://github.com/Lavinski/Enexure.MicroBus).
