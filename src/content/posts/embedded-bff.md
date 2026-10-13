---
author: "Daniel Little"
categories: ["Security", "Web"]
date: 2026-10-13T00:00:00Z
description: "Why browser apps should keep tokens out of the browser with a Backend-for-Frontend and SameSite cookies, why your API can be its own BFF, and where .NET's identity packages leave gaps."
draft: true
path: "/embedded-bff"
tags: ["Security", "OAuth", "OIDC", "FSharp", "dotnet", "Azure"]
title: "The Embedded BFF: Keep Your Tokens Out of the Browser"
---

[Praisable](https://praisable.dev) isn't released yet, which turned out to be the best possible time to discover that its sign-in would log every user out at least once a day. Nothing was broken. The app was doing exactly what it was built to do: a React single-page app using MSAL.js, the authorization code flow with PKCE, and tokens in the browser. That design is widely used, well documented, and, as it turns out, no longer what the OAuth standards recommend for most browser apps.

In this post I want to make the case for the alternative: the Backend-for-Frontend (BFF) pattern with `SameSite` cookies. It's more secure, it's simpler for the browser, and it removes the daily sign-out. But I'll argue for a particular shape of it. The usual BFF is another service standing in front of your API. When the API only serves your own frontend, it can be its own BFF. I'm calling that an **embedded BFF**. Then I'll go through the less comfortable part: .NET's identity packages don't really have a place for it, which is why I ended up writing a small OIDC component instead.

## The problem with tokens in the browser

When a single-page app runs OAuth itself, the browser ends up holding the tokens: an access token for calling the API, an ID token describing the user, and usually a refresh token to get more of both. They have to live somewhere script can read them, typically `localStorage`, `sessionStorage` or memory.

That's the core issue. Anything your JavaScript can read, any JavaScript running on your page can read. One cross-site scripting bug, or one compromised dependency in a `node_modules` folder the size of a small moon, and an attacker isn't just acting as the user while the tab is open. They can copy the refresh token and keep minting access tokens from their own machine, long after the user has closed the tab.

Identity providers know this, and they compensate by limiting what a browser-held refresh token is worth. Microsoft Entra gives single-page apps refresh tokens that expire after 24 hours, and every token refreshed from one keeps that original expiry. Other clients get refresh tokens with a 90-day inactivity window, which in practice slides along as long as the user keeps coming back. Neither lifetime can be configured, including in External ID.[^entra-rt] Microsoft is explicit about the reason: "In order to minimize the risk of stolen refresh tokens, SPAs are issued tokens valid for 24 hours only."[^entra-3pc] That's a sensible trade-off from the identity provider's side. From the user's side it means being sent back to the sign-in page at least once a day, and having to type a password again whenever Entra's own session cookie has gone. For a new app, a daily password prompt is not the first impression you want to make.

The fix for the security problem and the fix for the usability problem turn out to be the same thing: stop giving the browser tokens.

## What the standards recommend

The standards have caught up with this. In August 2026 the IETF published [RFC 10017, OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017.html), as a Best Current Practice. It walks through what malicious JavaScript can do once it runs in your app, including that it can "steal data from origin-based storage mechanisms (e.g., localStorage, IndexedDB)", then compares the architectures browser apps can use. The verdict on the Backend-for-Frontend is direct:

> This architecture is strongly recommended for business applications, sensitive applications, and applications that handle personal data.[^rfc]

And for a browser app that runs OAuth itself, the same RFC says the opposite: that architecture "is not recommended for business applications, sensitive applications, and applications that handle personal data."

OWASP is even blunter: "Do not store authentication tokens, session IDs, JWTs, refresh tokens, or any credential in `localStorage` or `sessionStorage`. … a single XSS vulnerability discloses every token." It recommends `HttpOnly; Secure; SameSite=Strict` cookies or a BFF instead.[^owasp-html5]

The browsers have been nudging in the same direction. With third-party cookies blocked, the hidden-iframe "silent renew" that SPAs relied on stops working, and Microsoft's own guidance notes that "`prompt=none` in an iframe is no longer an option when third-party cookies are blocked."[^entra-3pc]

The reasoning behind the recommendation is straightforward. In a BFF:

- A server-side component, the BFF, is the OAuth client. Because it runs on a server, it's a **confidential client**: it authenticates to the identity provider with a credential no browser can see.
- The BFF runs the sign-in flow, receives the tokens, and keeps them.
- The browser only gets a session cookie, marked `HttpOnly` so script can't read it.

An XSS bug is still bad in a BFF, and the RFC is honest about it: injected script can still send requests through the user's session while the page is open. But, in its words, "the use of HttpOnly cookies prevents the attacker from directly accessing the session state." It can no longer walk away with a long-lived credential, because there isn't one in the browser to take. The attack shrinks from "own the account from anywhere, for as long as the token lives" to "act as the user, in this tab, while it stays open".

## The cookie does the heavy lifting

If the session cookie is now the only credential the browser holds, it's worth getting right. Modern browsers give you everything you need, provided you ask for all of it:

```
Set-Cookie: __Host-session=<opaque value>; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=7776000
```

- `HttpOnly` keeps it away from script.
- `Secure` keeps it off plain HTTP.
- The `__Host-` prefix makes the browser reject the cookie unless it is `Secure`, has `Path=/` and no `Domain` attribute. So it is tied to exactly one origin, and a sibling subdomain can't set or overwrite it. OWASP recommends it specifically for session IDs.[^owasp-session]
- `SameSite=Strict` means the browser won't send it on any request that starts from another site.[^mdn-cookie]

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

There is one place where `Strict` doesn't work, and it's the sign-in itself. The identity provider's redirect back to your callback is a cross-site navigation, so a `Strict` cookie set at the start of sign-in won't come back with it. Praisable uses a second, short-lived `__Host-login` cookie with `SameSite=Lax` to carry the sign-in state (the `state`, `nonce` and PKCE verifier) across that round trip. `Lax` sends cookies on cross-site top-level navigations that use a safe method like `GET`, which is exactly what the redirect is. That's also why Praisable asks for `response_mode=query`: with `form_post`, the redirect back is a cross-site `POST`, and the login cookie would need `SameSite=None`. ASP.NET Core's own OIDC handler sets its nonce and correlation cookies to `None` for exactly this reason.[^aspnet-samesite]

Having a single origin helps a great deal. Praisable's Static Web App proxies `praisable.dev/api` to the Function App, so there's no CORS, and one cookie covers the whole app.

## The embedded BFF

The RFC, and most descriptions of the pattern, picture the BFF as its own service. It sits between the browser and your API, holds the access token, and attaches it to every request it proxies. If your API serves other clients, or you call several downstream APIs, that's the right shape.

But plenty of apps have one frontend and one API that exists only to serve it. Putting a proxy in front of that API adds a service to deploy, a hop on every request, and an access token whose only job is to get from one of your processes to the other. In an embedded BFF the API takes on the BFF's job itself:

- The API is the OAuth confidential client. It runs the sign-in flow and owns the session.
- The browser holds only the session cookie, and calls the API directly.
- There's no proxy, and no access token to forward.

(Not to be confused with the RFC's "token-mediating backend", which runs the flow on the server and then hands the access token to the browser. An embedded BFF gives the browser nothing.)

In Praisable, the BFF *is* the API. That changes which tokens are worth keeping:

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

This is where I expected to install a package and move on. .NET has excellent identity libraries, and none of what follows is a criticism of them. They're good at what they're for. They just weren't built for an embedded BFF: an API on Azure Functions that is its own BFF, with a server-side session and no downstream API. Broadly, the tooling assumes one of two shapes: a web app on the full ASP.NET Core host, or a BFF that is a separate proxy in front of your API.

**Microsoft.Identity.Web** is the obvious first choice for "sign in to an ASP.NET Core app with Entra". By its own description, it's "the glue between the ASP.NET Core middleware and MSAL .NET". `AddMicrosoftIdentityWebApp` configures ASP.NET Core's cookie and OpenID Connect handlers, and `UseAuthentication` runs them in the request pipeline.[^idweb] Praisable's API runs on the Azure Functions isolated worker, and Microsoft is clear about what its ASP.NET Core integration leaves out: "it doesn't provide access to the ASP.NET Core middleware pipeline and routing capabilities."[^functions-aspnet] You get `HttpRequest` and `IActionResult`, but not the pipeline those authentication handlers run in. On top of that, the cookie handler's default session is the authentication ticket itself, encrypted into the cookie. Server-side sessions are possible, but need a custom `ITicketStore`.[^ticket-store] That's a lot of framework to bend for a small flow.

**MSAL.NET** fits Functions much better. `ConfidentialClientApplication` handles PKCE, client assertions and refresh token rotation, and it doesn't care what host it runs in. But its purpose is getting and caching *access tokens* for downstream APIs, which is the one thing Praisable doesn't need. And by design, MSAL doesn't hand you the refresh token: "MSAL.NET doesn't expose refresh tokens for security reasons. MSAL handles refreshing tokens for you."[^msal-rt] Instead you persist an opaque token cache through `SetBeforeAccess` and `SetAfterAccess` callbacks around a stateful client object.[^msal-cache] So each session document would hold MSAL's cache blob rather than a refresh token the app controls, and the daily revocation check would turn into "ask MSAL for a token it thinks it already has, and interpret what happens". MSAL.NET also parses the ID token without validating its signature, while Microsoft's guidance is that "confidential clients should validate ID tokens".[^id-tokens] So you'd still need `Microsoft.IdentityModel` alongside it.

**Duende BFF** is the most complete BFF implementation for .NET, and if you're on a full ASP.NET Core host it's worth a serious look. It targets that host, and production use needs a license. It's free for development, testing and personal projects, and there's a community edition for small organisations.[^duende] I didn't evaluate it in depth, because it doesn't fit the Functions host.

It's also telling where Microsoft's own guidance points. The ASP.NET Core docs now include a Blazor sample that uses the BFF pattern, as a proxy built with YARP and Aspire.[^blazor-bff] The Entra docs for single-page apps, though, still lead with MSAL.js running in the browser. If your BFF is embedded in an API that doesn't run on the full ASP.NET Core host, the pattern the RFC strongly recommends is something you assemble yourself.

Once I'd ruled those out, it became clear what was actually missing. The genuinely hard parts of OIDC were already in a dependency Praisable used, `Microsoft.IdentityModel`:

- Discovery and signing key rollover: `ConfigurationManager<OpenIdConnectConfiguration>` fetches the provider's metadata and keys, caches them, and refreshes them.
- ID token validation: `JsonWebTokenHandler` checks the signature, issuer, audience and lifetime.

What was missing was the protocol glue around them. That's the gap in .NET today: there's a low-level toolkit and there are high-level frameworks, but there's no small, host-agnostic piece in between that runs the authorization code flow for a confidential client and gives you the result. That piece is exactly what an embedded BFF needs.

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

There's no client secret either. The API proves who it is to Entra with a signed client assertion, and the signing key lives in Key Vault and never leaves it.

## Things I learned the hard way

A few things came up in code review, or the first time it ran against the real Entra tenant, that are worth knowing whichever way you build this:

- **The callback is a browser navigation, not an API call.** Every failure, including the user pressing cancel or Entra being unreachable, should redirect back to the app signed out, not return a 500 with a JSON body.
- **Stale callbacks happen.** Back and reload will replay an old callback. It mustn't clear the login cookie of a newer sign-in that's in progress.
- **Signing in again should end the browser's previous session**, rather than leaving an orphaned session document behind.
- **`returnTo` is an open redirect waiting to happen.** Accept only a local path, and reject `//host` and backslashes, which browsers will happily treat as another host.
- **Be careful logging IdentityModel exceptions.** Their messages can contain URLs. Log the `IDX` code and leave the message out.
- **Sign-out to the provider's end-session endpoint is best effort.** Your own session is already gone. Send `client_id` along with `post_logout_redirect_uri`.

## Where it stands

{{TODO for Daniel: Praisable isn't released yet. Does sign-in work end to end in the production environment now? Add a line on status, or drop this section. I haven't written an "it works" conclusion.}}

## Should you do this?

If you're building a browser app today, I think the default should be a BFF with an `HttpOnly`, `__Host-`, `SameSite` cookie, and no tokens in the browser at all. And if your API exists to serve that one frontend, don't put another service in front of it. Embed the BFF. The standards body recommends it, browsers now give you the cookie attributes to do it safely, and for a SPA on a single origin it's simpler in the browser than the alternative: no token storage, no silent renew, no refresh logic in JavaScript. Just `fetch`.

On .NET the picture is less tidy. If you're on a full ASP.NET Core host, use what's there. If you're not, or you want the session to be yours, don't be afraid of the protocol. With `Microsoft.IdentityModel` handling keys and token validation, the remaining glue is small, mostly pure, and very easy to test. And at 300 lines, it's a liability I'm happy to carry.

[^entra-rt]: Microsoft Learn, [Refresh tokens in the Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens) and [Configurable token lifetimes](https://learn.microsoft.com/en-us/entra/identity-platform/configurable-token-lifetimes). For External ID: "Refresh token lifetimes are not configurable in External ID" ([Migrate from Amazon Cognito to External ID](https://learn.microsoft.com/en-us/entra/external-id/customers/migrate-from-cognito-to-external-id)).
[^entra-3pc]: Microsoft Learn, [Handle ITP in Safari and other browsers where third-party cookies are blocked](https://learn.microsoft.com/en-us/entra/identity-platform/reference-third-party-cookies-spas).
[^rfc]: Parecki, De Ryck and Waite, [RFC 10017: OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017.html), BCP 212, August 2026. See the Backend for Frontend section.
[^owasp-html5]: OWASP, [HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), Local Storage.
[^owasp-session]: OWASP, [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), Cookies.
[^mdn-cookie]: MDN, [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), cookie prefixes and `SameSite`.
[^aspnet-samesite]: Microsoft Learn, [Work with SameSite cookies in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/samesite).
[^idweb]: [Microsoft Identity Web basics](https://github.com/AzureAD/microsoft-identity-web/wiki/Microsoft-Identity-Web-basics): "it doesn't replace AddOpenIdConnect, AddJwtBearer or AddCookie … but it uses and configure them correctly."
[^functions-aspnet]: Microsoft Learn, [Guide for running C# Azure Functions in an isolated worker process](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide#aspnet-core-integration), ASP.NET Core integration.
[^ticket-store]: Microsoft Learn, [Use cookie authentication without ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) and [CookieAuthenticationOptions.SessionStore](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.cookies.cookieauthenticationoptions.sessionstore).
[^msal-rt]: Microsoft Learn, [Differences between ADAL.NET and MSAL.NET](https://learn.microsoft.com/en-us/entra/msal/dotnet/how-to/differences-adal-msal-net).
[^msal-cache]: Microsoft Learn, [Token cache serialization in MSAL.NET](https://learn.microsoft.com/en-us/entra/msal/dotnet/how-to/token-cache-serialization).
[^id-tokens]: Microsoft Learn, [ID tokens in the Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/id-tokens). MSAL.NET's `IdToken.Parse` decodes the payload and reads its claims without checking the signature.
[^duende]: Duende, [BFF Security Framework](https://docs.duendesoftware.com/bff/) and [Licensing](https://docs.duendesoftware.com/general/licensing/). Version 4.3.1 at the time of writing.
[^blazor-bff]: Microsoft Learn, [Secure an ASP.NET Core Blazor Web App with OpenID Connect](https://learn.microsoft.com/en-us/aspnet/core/blazor/security/blazor-web-app-with-oidc), BFF version.
