---
author: "Daniel Little"
date: 2011-08-26T01:00:00Z
description: ""
draft: false
path: "/c-apo"
title: "C# and AOP (Aspect-oriented programming)"

---

I just had a very interesting experience with AOP in C#. I have a function with a return type List<Update> which is being intercepted and that's all well and good. However the interceptor function is a validator style function and can prevent the real function by being called and returning the boolean false.

So the code looks a little bit like this:

    List<Update> updates = Manager.ValidateAndCreate();

    // protected void Save(List<Update> updates) { ....
    Save(updates);

The Method Interceptor looks like the following

    public class ExceptionAdvice : AopAlliance.Intercept.IMethodInterceptor {

        public object Invoke(AopAlliance.Intercept.IMethodInvocation invocation) {

            if (isValid(invocation)) {
                return invocation.Proceed();
            } else {
                return false;
            }
        }

        private bool isValid( ...
     }

Now after validation fails the value of updates is actually a boolean not a List<Update>, I thought there would be some kind of runtime error here but there was not, so:

    updates.GetType().Name == "Boolean"

But:

    updates is bool == false

So save will still accept its mutated list of updates and will complain later on when you try to use it.

So how is this possible in a type safe language like C#? btw it's spring-aop.

[Link to the StackOverflow question](https://stackoverflow.com/questions/7200572/c-and-aop-aspect-oriented-programming-how-does-this-work)