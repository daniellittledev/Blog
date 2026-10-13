---
author: "Daniel Little"
categories: ["Security", "Web"]
date: 2026-10-13T00:00:00Z
description: "Why browser apps should keep tokens out of the browser with a Backend-for-Frontend and SameSite cookies, what the IETF recommends, and where .NET's identity packages leave gaps."
draft: true
path: "/bff-same-site-cookies-dotnet"
tags: ["Security", "OAuth", "OIDC", "FSharp", "dotnet", "Azure"]
title: "Keep Your Tokens Out of the Browser"
---

Every morning, the users of [Praisable](https://praisable.dev) were signed out. Not because they'd done anything wrong, and not because of a bug in the usual sense. The app was doing exactly what it was built to do: a React single-page app using MSAL.js, the authorization code flow with PKCE, and tokens in the browser. That design is widely used, well documented, and, as it turns out, no longer what the people who write the OAuth standards recommend for browser apps.

In this post I want to make the case for the alternative: the Backend-for-Frontend (BFF) pattern with `SameSite` cookies. It's more secure, it's simpler for the browser, and in my case it also fixed the daily sign-outs. Then I'll go through the less comfortable part, which is what happens when you try to build one on .NET today, and why I ended up writing a small OIDC component instead of reaching for Microsoft's packages.

## The problem with tokens in the browser

When a single-page app runs OAuth itself, the browser ends up holding the tokens: an access token for calling the API, an ID token describing the user, and usually a refresh token to get more of both. They have to live somewhere script can read them, typically `localStorage`, `sessionStorage` or memory.

That's the core issue. Anything your JavaScript can read, any JavaScript running on your page can read. One cross-site scripting bug, or one compromised dependency in a `node_modules` folder the size of a small moon, and an attacker isn't just acting as the user while the tab is open. They can copy the refresh token and keep minting access tokens from their own machine, long after the user has closed the tab.

Identity providers know this, and they compensate by limiting what a browser-held refresh token is worth. Microsoft Entra issues refresh tokens to single-page apps with a fixed 24-hour lifetime that can't be configured, while confidential clients get refresh tokens that last 90 days and are replaced each time they're used.[^entra-rt] That's a sensible trade-off from the identity provider's side. From the user's side it means being sent back to the sign-in page at least once a day, and having to type a password again whenever Entra's own session cookie has gone. Which is how Praisable's users ended up with their morning ritual.

The fix for the security problem and the fix for the usability problem turn out to be the same thing: stop giving the browser tokens.

## What the standards recommend

The IETF OAuth working group's [OAuth 2.0 for Browser-Based Applications](https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/) is the best current guidance on this, and it is unusually direct. It walks through the attacks that become possible once malicious JavaScript runs in your app, then compares the architectures that browser apps can use. Of these, it describes the Backend-for-Frontend as the most secure option.[^ietf-bff]

{{VERIFY: exact quote from the IETF draft, its current revision, and whether it is an RFC yet. Filled in from the verification pass.}}

The reasoning is straightforward. In a BFF:

- A server-side component, the BFF, is the OAuth client. Because it runs on a server, it's a **confidential client**: it authenticates to the identity provider with a credential no browser can see.
- The BFF runs the sign-in flow, receives the tokens, and keeps them.
- The browser only gets a session cookie, marked `HttpOnly` so script can't read it.

An XSS bug is still bad in a BFF. Malicious script can still make requests from the user's browser while the page is open. But it can no longer walk away with a long-lived credential, because there isn't one in the browser to take. The attack shrinks from "own the account from anywhere, for as long as the token lives" to "act as the user, in this tab, while it stays open".

## The cookie does the heavy lifting

If the session cookie is now the only credential the browser holds, it's worth getting right. Modern browsers give you everything you need, provided you ask for all of it:

```
Set-Cookie: __Host-session=<opaque value>; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=7776000
```

- `HttpOnly` keeps it away from script.
- `Secure` keeps it off plain HTTP.
- The `__Host-` prefix makes the browser reject the cookie unless it is `Secure`, has `Path=/` and no `Domain` attribute. So it is tied to exactly one origin, and a sibling subdomain can't set or overwrite it.
- `SameSite=Strict` means the browser won't send it on any request that starts from another site.

That last one is the reason cookies earned their bad reputation in the first place: cross-site request forgery. `SameSite` largely puts that to rest. With `Strict`, a form on `evil.example` that posts to your API arrives without the cookie, so it arrives unauthenticated. For defence in depth, Praisable also rejects any cookie-authenticated write whose `Sec-Fetch-Site` header says it didn't come from our own origin:

```fsharp
/// Fetch Metadata: not from our own pages. Browsers that don't send `Sec-Fetch-Site`
/// still withhold the `SameSite=Strict` cookie from other sites.
let isCrossSite (secFetchSite: string) =
    not (String.IsNullOrEmpty secFetchSite || secFetchSite = "same-origin")

/// A write authenticated by the cookie must come from our own pages.
let isCrossSiteWrite (method: string) (secFetchSite: string) =
    not (HttpMethods.IsGet method || HttpMethods.IsHead method) && isCrossSite secFetchSite
```

`Strict` does have a cost: following a link to your site from somewhere else arrives without the cookie. For a server-rendered app, that's a user who looks signed out until they navigate again. For a SPA whose HTML is static and whose API calls are same-origin `fetch` requests, it costs nothing, because the first request that needs the cookie is the page's own `fetch`, which is same-site. That is a nice property of SPAs that tends to get overlooked.

There is one place where `Strict` doesn't work, and it's the sign-in itself. The identity provider's redirect back to your callback is a cross-site navigation, so a `Strict` cookie set at the start of sign-in won't come back with it. Praisable uses a second, short-lived `__Host-login` cookie with `SameSite=Lax` to carry the sign-in state (the `state`, `nonce` and PKCE verifier) across that round trip. `Lax` sends cookies on top-level `GET` navigations, which is exactly what the redirect is.

Having a single origin helps a great deal. Praisable's Static Web App proxies `praisable.dev/api` to the Function App, so there's no CORS, and one cookie covers the whole app.

## When the BFF is the API

Most descriptions of the pattern assume the BFF sits in front of a separate API. It keeps an access token and attaches it to requests it forwards. In Praisable, the BFF *is* the API. That changes which tokens are worth keeping:

- **The ID token** proves who signed in. It's validated once, at the callback, and then dropped. The UI gets the user's profile from `GET /api/me` instead.
- **The access token** has nowhere to go. There's no downstream API to call, so it's discarded.
- **The refresh token** is the only one kept, and only for one job: checking, about once a day, that the account is still good in Entra.

That last point is what keeps the server-side session honest. Praisable's session lasts 90 days idle, matching the refresh token. The first request a day after the session was last renewed redeems the refresh token before serving the request. If Entra answers `invalid_grant`, because the account was disabled or its sessions were revoked, the session is deleted and the request gets a `401`. If Entra doesn't answer, the session slides by a day, so an Entra outage can't sign everyone out or make every request wait on it. The decision is a small pure function:

```fsharp
/// The daily renewal of an Entra session, given Entra's answer. Without a verdict
/// the session slides and is checked again in a day, so an outage can't sign
/// everyone out, nor make every request wait on Entra.
let renew (now: Instant) (session: Session) (outcome: RefreshOutcome) =
    match outcome with
    | Refreshed token -> Renew { refreshed now session with RefreshToken = token |> Option.orElse session.RefreshToken }
    | Revoked -> End
    | Unreachable _ -> Renew(refreshed now session)
```

The session itself is a Cosmos DB document in the user's partition. Its id is a hash of the cookie's secret, so a leaked document can't be replayed as a cookie. The refresh token inside it can only be redeemed with the API's client credential, so a database leak alone doesn't give an attacker usable tokens. Cosmos's per-item `ttl` deletes idle sessions without a scheduled job.

## The gaps in .NET

This is where I expected to install a package and move on. .NET has excellent identity libraries, and none of what follows is a criticism of them. They're good at what they're for. They just weren't built for this shape of app: an API on Azure Functions that is its own BFF, with a server-side session and no downstream API.

**Microsoft.Identity.Web** is the obvious first choice for "sign in to an ASP.NET Core app with Entra". It's built on ASP.NET Core's authentication middleware: `AddMicrosoftIdentityWebApp`, the cookie authentication handler, and `UseAuthentication` in the request pipeline. Praisable's API runs on the Azure Functions isolated worker. Its ASP.NET Core integration gives you `HttpContext`, `HttpRequest` and `IActionResult`, but not the ASP.NET Core middleware pipeline those authentication handlers expect.[^functions-aspnet] On top of that, its default session is the authentication ticket itself, encrypted into the cookie. Server-side sessions are possible, but need a custom `ITicketStore`.[^ticket-store] That's a lot of framework to bend for a small flow.

{{VERIFY: Functions isolated worker + UseAuthentication support; Microsoft.Identity.Web default cookie ticket / ITicketStore.}}

**MSAL.NET** fits Functions much better. `ConfidentialClientApplication` handles PKCE, client assertions and refresh token rotation, and it doesn't care what host it runs in. But its purpose is getting and caching *access tokens* for downstream APIs, which is the one thing Praisable doesn't need. And it deliberately doesn't expose the refresh token; Microsoft documents this as by design.[^msal-rt] Instead you persist an opaque token cache through serialization callbacks around a stateful client object. So each session document would hold MSAL's cache blob rather than a refresh token the app controls. The daily revocation check would turn into "ask MSAL for a token it thinks it already has, and interpret what happens".

{{VERIFY: MSAL.NET refresh token not exposed by design; whether it validates ID token signatures.}}

**Duende BFF** is the most complete BFF implementation for .NET, and if you're on a full ASP.NET Core host it's worth a look. It targets that host and its middleware, and it's covered by Duende's commercial licence.[^duende] I didn't evaluate it in depth, because it doesn't fit the Functions host.

{{VERIFY: Duende BFF host requirements and licensing, current version.}}

Once I'd ruled those out, it became clear what was actually missing. The genuinely hard parts of OIDC were already in a dependency Praisable used, `Microsoft.IdentityModel`:

- Discovery and signing key rollover: `ConfigurationManager<OpenIdConnectConfiguration>` fetches the provider's metadata and keys, caches them, and refreshes them.
- ID token validation: `JsonWebTokenHandler` checks the signature, issuer, audience and lifetime.

What was missing was the protocol glue around them. That's the gap in .NET today: there's a low-level toolkit and there are high-level frameworks, but there's no small, host-agnostic piece in between that runs the authorization code flow for a confidential client and gives you the result.

## What filling the gap looks like

Filling it took a bit under 300 lines of F#, most of them pure functions:

- An authorize URL builder.
- PKCE S256, which is a single line.
- The login state (`state`, `nonce`, PKCE verifier and `returnTo`) in the `__Host-login` cookie.
- A pure callback check.
- Parsing the token endpoint's response.
- Two form POSTs: redeeming the code, and redeeming a refresh token.

The callback check shows the style. It takes what arrived and what the browser remembered, and returns either the code to redeem or the reason it can't:

```fsharp
/// Checks Entra's redirect against the login cookie, and returns the code to redeem.
let checkCallback (login: LoginState option) (state: string option) (code: string option) (error: string option) =
    result {
        let! login = login |> Result.requireSome NoLoginState
        do!
            match error with
            | Some e -> Error(Refused e)
            | None -> Ok()

        let! state = state |> Result.requireSome StateMismatch
        do! Result.requireTrue StateMismatch (sameText state login.State)
        let! code = code |> Result.requireSome NoCode
        return login, code
    }
```

Because the protocol rules are pure functions, each one gets a test: state mismatch, nonce mismatch, a missing verifier, a missing or expired login cookie, Entra's `error=` reply, an open redirect through `returnTo`, the PKCE challenge, and token error parsing. That's a level of confidence that's hard to get when the same rules are inside framework event handlers.

The API authenticates to Entra without a client secret. It signs a client assertion (RFC 7523) with a certificate whose private key is non-exportable and never leaves Key Vault. The Function App's managed identity can only ask Key Vault to sign.

## Things I learned the hard way

A few things came up in code review, or in production, that are worth knowing whichever way you build this:

- **The callback is a browser navigation, not an API call.** Every failure, including the user pressing cancel or Entra being unreachable, should redirect back to the app signed out, not return a 500 with a JSON body.
- **Stale callbacks happen.** Back and reload will replay an old callback. It mustn't clear the login cookie of a newer sign-in that's in progress.
- **Signing in again should end the browser's previous session**, rather than leaving an orphaned session document behind.
- **`returnTo` is an open redirect waiting to happen.** Accept only a local path, and reject `//host` and backslashes, which browsers will happily treat as another host.
- **Be careful logging IdentityModel exceptions.** Their messages can contain URLs. Log the `IDX` code and leave the message out.
- **Sign-out to the provider's end-session endpoint is best effort.** Your own session is already gone. Send `client_id` along with `post_logout_redirect_uri`.
- **Cross-tenant federated credentials don't work.** My first design had the Function App's managed identity act as a federated credential on the app registration, so there'd be no certificate to manage either. The first production sign-in came back to the sign-in page, because Entra answered the code redemption with `401 invalid_client`. A managed identity can only be a federated credential for an app registration in its own tenant, and an External ID tenant is a separate directory from the Azure tenant the Function App lives in. Hence the Key Vault certificate.

{{VERIFY: Microsoft doc for managed identity as federated credential being same-tenant only (and user-assigned only).}}

## Where it stands

{{TODO for Daniel: the outcome after the Key Vault certificate change (PR #29). Does production sign-in now work, and have the daily sign-outs stopped? I've deliberately not written an "it works" conclusion.}}

## Should you do this?

If you're building a browser app today, I think the default should be a BFF with an `HttpOnly`, `__Host-`, `SameSite` cookie, and no tokens in the browser at all. The standards body recommends it, browsers now give you the cookie attributes to do it safely, and for a SPA on a single origin it's simpler in the browser than the alternative: no token storage, no silent renew, no refresh logic in JavaScript. Just `fetch`.

On .NET the picture is less tidy. If you're on a full ASP.NET Core host, use what's there. If you're not, or you want the session to be yours, don't be afraid of the protocol. With `Microsoft.IdentityModel` handling keys and token validation, the remaining glue is small, mostly pure, and very easy to test. And at 300 lines, it's a liability I'm happy to carry.

[^entra-rt]: {{VERIFY: Microsoft Learn, "Refresh tokens in the Microsoft identity platform" — URL and quote.}}
[^ietf-bff]: {{VERIFY: draft-ietf-oauth-browser-based-apps, section on the BFF pattern — URL, revision and quote.}}
[^functions-aspnet]: {{VERIFY}}
[^ticket-store]: {{VERIFY}}
[^msal-rt]: {{VERIFY}}
[^duende]: {{VERIFY}}
