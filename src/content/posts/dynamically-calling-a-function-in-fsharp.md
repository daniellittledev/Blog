---
author: "Daniel Little"
date: 2017-02-11T06:16:03Z
description: ""
draft: false
path: "/dynamically-calling-a-function-in-fsharp"
title: "Dynamically calling a Function in FSharp"

---

Sometimes you just want to make a dynamic call.

There is no equivalent for `Func<>.DynamicInvoke` in `FSharpFunc` so I guess we'll have to roll our own. 

In this post I'll go though how to build a function called `dynamicInvoke ` which you use like this:

    let sayHello name = printfn "Hello %s!" name
    let objectResult = dynamicInvoke sayHello ["Daniel"]

    let typedResult = objectResult :> string
    // typedResult = "Hello Daniel!"


The example above starts off with a normal FSharp function that takes a typed argument, in this case, a `string` and returns a `string`. Then `dynamicInvoke` is used to call the function with a list of arguments which returns the result as an object.

You could also use `dynamicInvoke` on its own to build a function with the signature `obj seq -> obj`. Which I'd say is the functional equivalent of `DynamicInvoke`, just what we're looking for!

    let dynamicFunction = dynamicInvoke sayHello

The actual signature of `dynamicInvoke` therefore is as follows `obj -> obj seq -> obj`. In other words, it takes the original function (as an object), an `obj seq` for the arguments and returns an object, which is the result of the original function.

## How it works

At its core, the solution is to use standard .NET reflection to dynamically invoke [`FSharpFunc<'T,'U>.Invoke : 'T -> 'U`](https://msdn.microsoft.com/en-us/visualfsharpdocs/conceptual/core.fsharpfunc%5B%27t,%27u%5D-class-%5Bfsharp%5D?f=255&MSPPError=-2147217396). The other tricky bit involves how functions work in FSharp.

In FSharp, functions that take multiple parameters return a function that takes the rest of the parameters. Which itself is a function that takes a single parameter and does the same. All of these functions take a single parameter. So we could also say, there is no such thing as a function that takes multiple parameters! 

Let's have a look at a function with multiple parameters:

    let sayHello name age =
        printfn "Hello %s, you are %i years old!" name

The type hierarchy of this `sayHello` function will contain the following type:

    FSharpFunc<string, FSharpFunc<int, string>>

In order to dynamically invoke the function, each `FSharpFunc` that makes up the function can be invoked recursively until a result is reached. And because `FSharpFunc` is a standard .NET type we can get the `MethodInfo` for `Invoke` and dynamically invoke it!

For each argument, the function is partially applied. The code below does exactly this, using reflection to get the `MethodInfo` for the `Invoke` method and calling `Invoke` on it. Such invoke.

    let partiallyApply anyFSharpFunc argument
        let funcType = anyFSharpFunc.GetType()
        // Guard: FSharpType.IsFunction funcType 
       
        let invokeMethodInfo = 
            funcType.GetMethods()
            |> Seq.filter (fun x -> x.Name = "Invoke")
            |> Seq.head
        methodInfo.Invoke(anyFSharpFunc, [| argument |])

Now, all it takes to call a function is to recursively partially apply it until we run out of arguments to apply. Add some error handling and we're done! The complete code is below and I'll also publish a NuGet package shortly.

    open System
    open FSharp.Reflection

    type InvokeResult = 
        | Success of obj
        | ObjectWasNotAFunction of Type

    let dynamicFunction (fn:obj) (args:obj seq) =
        let rec dynamicFunctionInternal (next:obj) (args:obj list) : InvokeResult =
            match args.IsEmpty with
            | false ->
                let fType = next.GetType()
                if FSharpType.IsFunction fType then
                    let (head, tail) = (args.Head, args.Tail)
                    let methodInfo = 
                        fType.GetMethods()
                        |> Seq.filter (fun x -> x.Name = "Invoke" && x.GetParameters().Length = 1)
                        |> Seq.head
                    let partalResult = methodInfo.Invoke(next, [| head |])
                    dynamicFunctionInternal partalResult tail
                else ObjectWasNotAFunction fType
            | true ->
                Success(next)
        dynamicFunctionInternal fn (args |> List.ofSeq )


Now it's possible to dynamically call any FSharp function!

A quick word on error handling. This function can fail if something other than a function is invoked. Sadly there's no `IAmAFunction` marker interface. So the only option is to use a runtime check and return a `ObjectWasNotAFunction` `InvokeResult`.

This is an explicit failure of this function and therefore an explicit result is returned. Exceptions caused by invoking the function, however, are exceptional, and never caught (except at the application boundary), so they pass right through.

If you found this post useful, I'd love to hear about it. So leave a comment if you found this post interesting or if it helped you out! 

