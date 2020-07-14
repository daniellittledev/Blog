---
author: "Daniel Little"
categories: ["Hypermedia"]
date: 2020-07-12T08:00:00Z
draft: true
path: "/type-safe-hypermedia-controls"
tags: ["Typescript", "Hypermedia", "Hypermedia Controls", "REST"]
title: "Type-Safe Hypermedia Controls"
---

Hypermedia Controls in REST provide links and actions with each response pointing to related resources. This concept is a powerful tool that enables the server to remain in control of links and access. If you're not sure what I mean by this, take a moment to read my previous article on my approach regarding [Practical Hypermedia Controls](/practical-hypermedia-controls).

Enter Typescript. Adding types to JavaScript allows us to write safer code, so naturally I wanted to figure out how to make a Hypermedia  Controls type-safe. Typically when writing a type-safe API you might start out with something like this.

```typescript
const api = (fetch: Fetch) => ({
  getAccount: async (id: string) : AccountResource => {
    const response = await fetch(`/account/${id}`, jsonGetOptions);
    return response.json() as AccountResource;
  }
  updateAccount: async (account: AccountResource) : AccountResource => {
    const response = await fetch(`/account/${account.id}`, jsonPutOptionsWith(account));
    return response.json() as AccountResource;
  }
})
```

In this example, the `Request` and `Response` types are strongly typed but the URL is hardcoded and you can't tell when you'd have access or who has access to this endpoint. Using Hypermedia Controls can provide that missing context. Links and actions are related to a resource, and the server can dictate if or when the various links and actions are available.

In order to see how to combine these two concepts, let's look at what the usage of type-safe Hypermedia controls would look like.

```typescript
// Fetch a root resource
const account = await fetchAccount(url)
const accountHypermedia = accountHypermedia(account)

const accountUpdate = { ...account, email: "daniellittle@elsewhere" }

// Invoke the Update action
const updatedAccount = await accountHypermedia.actions.update.call(updatedAccount) // <- Typechecked!
```

In this example the account email address is being updated and then the Hypermedia Controls are used to update the resource. Fetching the account resource contains the raw Hypermedia Controls but passing the resource into the `accountHypermedia` function transforms the hypermedia into a type safe API style object. There are a few interesting things happening here, so let's peel back the covers.

## Types for Links and Actions

First, Let's take a look at what the `AccountResource` type looks like.

```typescript
export type AccountResource = {
  id: Identifier
  username: string
  name: string
  email: string

  _links: {
    self: Relationship
  }
  _actions: {
    activate?: Relationship
    deactivate?: Relationship
    update: Relationship
  }
}
```

The Hypermedia Controls are statically defined inside of the `_links` and `_actions` properties which contain all the well known relationships. Looking at these relationships we can see the resource always contains a `self` link and an `update` action but optionally contains `activate` and `deactivate`. It's important to note that the types are only coupled to the names of the relationships (rels) and their optionality. The server still controls the URLs and the presence of optional relationships.

Be cautious of making the types for the Hypermedia Controls too dynamic. On my first attempt at adding types for hypermedia, I used a more general dictionary type for links and actions. My thinking was that this would more accurately model the changing and dynamic hypermedia relationships a resource would have.

```typescript
type Relationships = { [rel: string]: Relationship | unknown }
```

This assumption quickly turned out to be false and worked against the goal and benefits of strong typing. The relationships were not as dynamic as I had originally assumed. Links and actions don't change frequently, so you can safely define them as part of the type. Another downside was that you can't easily see what relationships are contextual and which ones are always present.

Hypermedia is often taken a bit too far and is often associated with machine-readable metadata or form builders. My advice here is to avoid designing your types for general hypermedia clients. Instead, think of these types as representing a well defined and static contract between the client and the server.

All links and actions use the `Relationship` type which represents the relationship and its location. A relationship can be either a simple URL or a contain extra info such as the `Method` or `Title`.

```typescript
export type Href = string
export type DetailedRelationship = {
  href: Href
  method?: Method
  title?: string
}
export type Relationship =
  | Href
  | DetailedRelationship
```

I usually use the `DetailedRelationship` type but sometimes it's conventient to only provide the URL for links, which typically use the `GET` verb.

## Contextual Relationships

In the `AccountResource`  above you can see there are three potential actions. The `update` action is always available but `activate` and `deactivate` are optional so the client only has to check for the presence of the optional relationships. The server can then decide when these optional actions are available, enabling the actions for the client based on the state of the resource.

```typescript
const account = fetchAccount(url)
const accountHypermedia = accountHypermedia(account)

if (accountHypermedia.deactivate) {
  // The account can be deactivated!

  await accountHypermedia.deactivate.call() // <- Also Typechecked, no request payload is needed!
}
```

In this sample, `deactivate` has to be null checked before it can be used. The `call` function also knows that `deactivate` takes no payload and what the return type is.

## Creating a Hypermedia Model

Next, let's look into the `accountHypermedia` function, which does the heavy lifting of transforming the resource with hypermedia into a typed hypermedia model containing all the links and actions. To make the conversion easier I've also written a function `createHypermediaModel` which helps to create the API for a resource.

```typescript
type none = void // Used when a Request requires no payload (function <T>(arg: T) would need no arguments)

const accountHypermedia = createHypermediaModel((resource: AccountResource, resolve) => ({
  links: {
    self: resolve<none, AccountResource>(resource._links.self)
  },
  actions: {
    deactivate: resolve<none, AccountResource>(resource._actions.deactivate),
    update: resolve<none, AccountResource>(resource._actions.update)
  }
}))
```

You can view this code as a mapping from the resource to a set of, ready to use, functions. The resolve function takes the relationship and returns an object containing a strongly typed `call` function as well as the `href` and `title` if one was provided.

```
resolve<none, AccountResource>(resource._links.self)
```

_Note: In Typescript, you are able to pass through a generic function as a parameter. The `resolve` parameter makes use of this to compose (an instance of) fetch and the request/response types._

The `ResolvedRelationship` makes it convenient to access the `href` and other metadata if you only have access to the hypermedia model.

```typescript
export type ResolvedRelationship<Request, Response> = {
  call: (request: Request) => Promise<Response>
  href: string
  title: string | undefined
}
```

## Multiple Resources

The `createHypermediaModel` function focuses on creating a hypermedia model for a single resource. In order to create a model for an entire API you can use a `createApi` function to create a single object composing the sub-APIs for each individual resource.

```typescript
export function createApi(fetch: Fetch) {
  const resolve = createResolver(fetch)

  return {
    getAccount: (url: string) => resolve<none, AccountResource>(url).call(),
    accounts: accountHypermedia(resolve),

    // More models go here!
  }
}
```

That covers all the main pieces of using `createHypermediaModel` to build a type-safe hypermedia API. Please let me know if you liked this approach as I'm considering wrapping this up into an npm package. However, I've glossed over the detail of how `createHypermediaModel` works. It's mostly the glue and pluming but there are a few interesting parts. Feel free to read the apendix below if you'd like to dig deeper under the covers.

That's all I have for now and as always thanks for reading!

## Apendix: Deeper into the Code

 Here is the bulk of the code, feel free to skim over it and jump to the alaysis at the bottom.

```typescript
export type JsonFetch = <Request, Response>(method: Method, url: string, data?: Request) => Promise<Response>
export type Resolver = <Request, Response>(relationship: Relationship) => ResolvedRelationship<Request, Response>

export const getHref = (rel: Relationship) => (typeof rel === "string" ? rel : rel.href)
export const getTitle = (rel: Relationship) => (typeof rel === "string" ? undefined : rel.title)

export const createResolver = (fetch: JsonFetch) => <Request, Response>(
  relationship: Relationship
): ResolvedRelationship<Request, Response> => {

  const apiCall = async (request: Request) => {
    const rel: { href: Href; method: Method; name?: string } =
      typeof relationship === "string"
        ? {
            href: relationship,
            method: "get"
          }
        : {
            ...relationship,
            method: relationship.method || "get"
          }
    const response = await fetch<Request, Response>(rel.method, rel.href, request)
    return response as Response
  }

  return {
    call: apiCall,
    href: getHref(relationship),
    title: getTitle(relationship)
  }
}

export const createHypermediaModel = <Resource, T>(
  builder: (resource: Resource, resolver: Resolver) => T
) => (resolver: Resolver) => (resource: Resource) => builder(resource, resolver)

```

The code is written in a functional programming style and functions declared before they are used. Therefore it is usually easier to look at functions starting from the bottom and going up.

The first function is, therefore, `ceateHypermediaModel`, which uses a bit of currying so the resolver and resource can be provided at different times. Dependencies such as Fetch and the Resolver are threaded through the call stack so no global references are needed.

The other main function is `createResolver` which constructs the `ResolvedRelationship`. Its main job is to wrap up the call to fetch using the given relationship and the request/response types.