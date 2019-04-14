---
author: "Daniel Little"
categories: ["ModelState", "Validation", "MVC", "aspnetcore", "dotnetcore"]
date: 2018-07-02T10:35:58Z
description: ""
draft: false
image: "/images/2018/06/Validation2-1.PNG"
path: "/automatic-modelstate-validation"
tags: ["ModelState", "Validation", "MVC", "aspnetcore", "dotnetcore"]
title: "Automatic ModelState Validation for ASP.NET Core"

---

Model State Validation for a JSON API isn't too hard because you only need to send back validation errors, especially with the `ApiController` attribute. However, for all those that are still using server-side rendering and Razor, it's still a bit challenging.

It's challenging because you need to return the correct `View` after posting a form. And the easiest method of getting the job done is writing this type of code in each `Action`.

```csharp
if (ModelState.IsValid)
{
    return RenderTheGetForm();
}
```

It does the job, but it's usually a lot of extra, tedious, code.

Instead we can keep the `Controller`s lean by shifting this code into an `Action Filter` attribute which can be used similarly to the `ApiController` attribute. So I decided to write one and publish it.

Here's how it works. You install the `AutomaticModelStateValidation` package and drop the  `AutoValidateModel` attribute on the `action` that uses a View Model and validation.

```csharp
[Route("/[controller]")]
public class SubmissionController : Controller
{
    [HttpGet]
    public ActionResult NewSubmission()
    {
        // Load data for the blank form
        return View(new NewSubmissionViewModel(...));
    }

    [HttpPost()]
    [AutoValidateModel(nameof(NewSubmission))]
    public RedirectToActionResult SaveSubmission(SaveSubmissionViewModel model)
    {
        // Save submission to database
        return RedirectToAction(nameof(ViewSubmission), new { Id = 1 });
    }

    [HttpGet]
    public ActionResult ViewSubmission(int id)
    {
        // Load submission from database
        return View(new ViewSubmissionViewModel(...));
    }
}
```

The `AutoValidateModel` attribute on the `SaveSubmission` `Action` performs the `ModelState.IsValid` check. If the model is valid everything continues as normal, however, if the model is invalid then the specified fallback `Action` in is invoked and the `ModelState` from the previous `Action` is merged in.

This means you're able to render the invalid `Form` with validation messages and the appropriate HTTP status code with a single line of code!

If you want to get started, grab the [Automatic ModelState Validation](https://www.nuget.org/packages/AutomaticModelStateValidation/) NuGet package. And keep reading if you're interested in some more of the details.

## The deep dive

One of the highlights of this attribute is to invoke the fallback action programmatically without another round trip to the client. In the past, I've achieved similar functionality by temporarily storing the ModelState and redirecting to the previous action. However, this time around I have made use of the advancements in `AspNetCore` to bypass that step entirely.

The bulk of the code resides in the `AutoValidateModelAttribute` which implements the `ActionFilterAttribute` class. After first checking that the `ModelState` is invalid the next step is to determine check controller action to invoke.

```csharp
var controllerName = SansController(controller ?? context.Controller.GetType().Name);
```

If the controller isn't explicitly specified then the fallback is the `Type` name of the controller. Here I also remove the `Controller` suffix.

Next, I have to locate the relevant `ActionDescriptor` by getting the `IActionDescriptorCollectionProvider` and finding the matching descriptor.

```csharp
var controllerActionDescriptor =
    actionDescriptorCollectionProvider
    .ActionDescriptors.Items
    .OfType<ControllerActionDescriptor>()
    .FirstOrDefault(x => x.ControllerName == controllerName && x.ActionName == action);
```

To invoke the `ActionDescriptor` the next thing I'll need is an `ActionContext`. Here is also where I pass along the previous `ModelState` so the validation errors are carried through to the new `Action`.

```csharp
var actionContext = new ActionContext(context.HttpContext, context.RouteData, controllerActionDescriptor, context.ModelState);
```

The last major piece is getting an `IActionInvokerFactory` to create a `ControllerActionInvoker` and then invoking it.

```csharp
var actionInvokerFactory = GetService<IActionInvokerFactory>();
var invoker = actionInvokerFactory.CreateInvoker(actionContext);
await invoker.InvokeAsync();
```

After that, there was just one more problem to fix. When no `View` is explicitly specified when returning a ViewResult, AspNet Mvc will fall back to using the action name from `RouteData`. Because I'm invoking a second Action inside a single Request the wrong view will be used unless I update the `RouteData` to match. So, I also set the action name to the name of the fallback action before calling the `ControllerActionInvoker`.

```csharp
if (context.RouteData.Values.ContainsKey(ActionNameKey)) {
    context.RouteData.Values[ActionNameKey] = controllerActionDescriptor.ActionName;
}
```

If you're interested in the full source code you can check it on [GitHub under Automatic ModelState Validation](https://github.com/Lavinski/AutomaticModelStateValidation).


