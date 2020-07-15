---
author: "Daniel Little"
categories: ["Hypermedia"]
date: 2020-07-07T08:00:00Z
draft: false
path: "/practical-hypermedia-controls"
tags: ["Hypermedia", "Hypermedia Controls", "REST"]
title: "Practical Hypermedia Controls"
---

A lot has been written about REST but less so when it comes to Hypermedia Controls. I haven't seen too many Hypermedia based APIs out in the wild. I theorize that there are two main reasons for this. First, it is something many people haven't been exposed to, and second, it requires a little more up-front effort in order to get the ball rolling. However, I believe it's an incredibly useful pattern and it's easier to get started than you might think. This post aims to help out with that first problem, exposure. We'll take a look at what Hypermedia Controls are and why they're useful.

Whatever the reason for the rarity of Hypermedia Controls, what you might commonly see in a REST API instead, is something like this.

```json
{
  "id": "0001"
  "username": "daniellittledev"
  "name": "Daniel Little"
  "email": "daniellittle@somewhere"
  "canUpdate": true
  "canDeactivate": false
}
```

This JSON object represents a user account. In this system, there are a few simple rules. Only the owner of the resource can update it and only admins can deactivate or activate accounts. This resource uses boolean flags to inform the client what state the object is in and what actions it can perform.

However, there are some problems with this model.

- We can't tell if the current user should be able to activate or deactivate the account.
- We can't tell if the account can be activated, we have to assume it can be because we can't deactivate it.
- We don't know how to update or deactivate an account, we'd need more external information like the URL.

Wouldn't it be nice if all these things were a bit easier to figure out? I think so too!

## Enter Hypermedia Controls

Hypermedia Controls in REST APIs are all about adding links and actions to a resource instead of needing to interoperate what links and actions are available based on state. Examples of state are boolean flags like above or a status value like `ready` or `pending`. Here's what the same resource would look like if we added Hypermedia Controls instead.

```json
{
  "id": "0001",
  "username": "daniellittledev",
  "name": "Daniel Little",
  "email": "daniellittle@somewhere",

  "links": { ... }
  "actions": {
    "update": { "href": "/account/0001", "method": "put"}
    "activate": { "href": "/account/0001/activate", "method": "post" }
  }
}
```

Now we can clearly see which actions are available. There are two available actions, update and activate, along with the URL and verb needed to make the calls. Instead of the client needing to infer this from the data, the server directly dictates what actions are available. We don't need to assume the client can activate the account if `canDeactivate` is `false`. There's also no danger of adding conflicting flags. The client can directly show or enable buttons or links directly based on what Hypermedia Controls are present.

Let's look at our previous problems again, now that we're using Hypermedia.

- There is no action for deactivating the account; so the user can't see or perform that action.
- There is an action to activate the account; so the user should see and perform that action.
- We know the URL and method, so the client doesn't need hardcode or build-up any URLs.

Much better! This also helps out immensely when debugging or looking at the REST API directly. There's no need for all that extra context to be extracted from the client because it's all there in the resource.

Also, note that to perform an update you would simply modify the resource as desired and send it right back. You can optionally remove the links and actions, but otherwise, they're typically ignored.

All this makes the API much easier to reason about and use. But the key benefit is the client no longer needs to interpret any state to figure out what is going on. We're able to keep the knowledge, of who can do what and when, on the server without having to duplicate any logic into the client. And while this example is a fairly trivial one, a few more flags like the ones above or worse, enum states where the client has to decide what buttons are available based on states like `Pending`, `InProgress` or `Completed`, can easily increase complexity and the burden of keeping everything in sync.

## More Control

We can also do more than just make links and actions available or unavailable. We could also show that an action exists but isn't available. On the UI this could manifest as a visible but disabled button.

```json
"actions": {
  "update": null // or { disabled: true }
}
```

If you'd like things to be a bit more dynamic or server controlled you can also include a title for an action which could be used as the label for a link or button.

```json
"actions": {
  "update": { "href": "/account/0001", "method": "put", "title": "Update Account" }
}
```

It's really up to you to choose how much information is provided to the client. However, I'd be cautious of adding too much. You might be tempted to include other metadata like field types or validation rules. But the main goal here is to keep duplicate logic out of the client and keep the server in control of application state. Decoupling too much tends to lead to the [Inner Platform Effect](https://en.wikipedia.org/wiki/Inner-platform_effect).

## Client-Side Routing

There's one unexpected question I came across while implementing a Hypermedia based API. Which is how they affect client-side routing. I've found keeping API URLs in sync with the browser URLs to be a good approach. Or to be more accurate, I believe they should be the same URL. If you're coming from a non-hypermedia based API your URLs will most likely have diverged so I'll demonstrate what this looks like in practice.

The root hypermedia resource is the starting point for the API, it provides all the top level links you'd need to get started.

```json
// Request:
GET "/"

// Response:
{
  "links": {
    "my-account": "/account/0001",
    "accounts": "/account"
  }
}
```

Following a link such as `my-account` (which the client knows by name) would update the browsers route to match, eg. `/account/0001`. The client-side routing rules mirror the server-side rules to render the relevant components but simply forward the URL directly to the API to fetch a resource. Note that the value here is that the client doesn't have to hardcode, reconstruct or build any URLs.

```json
// Request:
GET "/account/0001"

// Response:
{
  "links": {
    "self": "/account/0001",
    "home": "/"
  }
}
```

Actions are a little different and don't usually represent a route change. I recommend using a get-post-redirect style pattern so that a link (self) or a redirect is used to determine the next URL for the client.

## Try it out

Next time you're building a form with a few actions especially if those actions change under different conditions or states consider using Hypermedia Controls. I hope you enjoyed this article, and if so make sure to keep an eye out for my next post on [Type Safe Hypermedia with Typescript](/type-safe-hypermedia-controls).