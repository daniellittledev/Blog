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

I've been building [Praisable](https://praisable.dev), but I noticed was being logged out every day. Nothing was broken. It was a standard React single-page app using MSAL.js, an authorization code flow with PKCE, and tokens in the browser. That design is widely used, well documented, and, as it turns out, no longer what the OAuth standards recommend for most browser apps.

In this post I want share a better alternative: the Backend-for-Frontend (BFF) pattern with `SameSite` cookies. It's more secure, it's simpler for the browser, and it removes the daily sign-out. However, the usual BFF is another service standing in front of your API. But when you only have one service, it can be its own BFF. An **embedded BFF**. After explaining what that is, I'll go through the less comfortable part: .NET's identity packages don't support this well, which is why I ended up writing a small OIDC component instead.

## The problem with tokens in the browser

When a single-page app runs OAuth itself, the browser ends up holding the tokens: an access token for calling the API, an ID token describing the user, and usually a refresh token to get more of both. They have to live somewhere script can read them, typically `localStorage`, `sessionStorage`, memory or even a cookie.

But that's the core issue. Anything your JavaScript can read, any JavaScript running on your page can read. One cross-site scripting bug, or one compromised dependency in a `node_modules` folder the size of a small moon, and an attacker isn't just acting as the user while the tab is open. They can copy the refresh token and keep minting access tokens from their own machine, long after the user has closed the tab.

Identity providers know this, and they compensate by limiting what a browser-held refresh token is worth. Microsoft Entra gives single-page apps refresh tokens that expire after 24 hours, and every token refreshed from one keeps that original expiry. Other clients get refresh tokens with a 90-day inactivity window, which in practice slides along as long as the user keeps coming back. Neither lifetime can be configured, including in External ID. [Microsoft is explicit about the reason](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens): "In order to minimize the risk of stolen refresh tokens, SPAs are issued tokens valid for 24 hours only." That's a [sensible trade-off](https://learn.microsoft.com/en-us/entra/identity-platform/reference-third-party-cookies-spas) from the identity provider's side. From the user's side it means being sent back to the sign-in page at least once a day, and having to type a password again whenever Entra's own session cookie has gone. For a new app, a daily password prompt is not the first impression you want to make.

The fix for the security problem and the fix for the usability problem turn out to be the same thing: stop giving the browser tokens.

## What the standards recommend

The standards have caught up with this. In August 2026 the IETF published [RFC 10017, OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017.html), as a Best Current Practice. It walks through what malicious JavaScript can do once it runs in your app, including that it can "steal data from browser storage mechanisms (e.g., localStorage, IndexedDB)", then compares the architectures browser apps can use. The verdict on the Backend-for-Frontend is direct:

> This architecture is strongly recommended for business applications, sensitive applications, and applications that handle personal data.[^rfc]

And for a browser app that runs OAuth itself, the same RFC says the opposite: that architecture "is not recommended for business applications, sensitive applications, and applications that handle personal data."

OWASP is even blunter: "Do not store authentication tokens, session IDs, JWTs, refresh tokens, or any credential in `localStorage` or `sessionStorage`. … a single XSS vulnerability discloses every token." It recommends `HttpOnly; Secure; SameSite=Strict` cookies or a BFF instead.[^owasp-html5]

The browsers have been nudging in the same direction. With third-party cookies blocked, the hidden-iframe "silent renew" that SPAs relied on stops working.

The reasoning behind the recommendation is straightforward. In a BFF:

- A server-side component, the BFF, is the OAuth client. Because it runs on a server, it's a **confidential client**: it authenticates to the identity provider with a credential no browser can see.
- The BFF runs the sign-in flow, receives the tokens, and keeps them.
- The browser only gets a session cookie, marked `HttpOnly` so script can't read it.

An XSS bug is still bad in a BFF, and the RFC is honest about it: injected script can still send requests through the user's session while the page is open. But, in its words, "the use of HttpOnly cookies prevents the attacker from directly accessing the session state." It can no longer walk away with a long-lived credential, because there isn't one in the browser to take. The attack shrinks from "own the account from anywhere, for as long as the token lives" to "act as the user, in this tab, while it stays open".

## The cookie does the heavy lifting

With no tokens in the browser, the session cookie is the only credential left, so ask for every protection the browser offers:

```
Set-Cookie: __Host-session=<opaque value>; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=7776000
```

- `HttpOnly` keeps it away from script.
- `Secure` keeps it off plain HTTP.
- `__Host-` ties it to one origin: it must be `Secure`, with `Path=/` and no `Domain`. OWASP recommends it for session IDs.[^owasp-session]
- `SameSite=Strict` keeps it off any request that starts on another site.[^mdn-cookie]

Cookies earned their bad reputation because a non strict cookie enabled cross-site request forgery. `SameSite` largely puts that to rest. With `Strict`, a form on `evil.example` that posts to your API arrives without the cookie, so it arrives unauthenticated. As a second check, Praisable rejects cookie-authenticated writes whose `Sec-Fetch-Site` header isn't same-origin.

`Strict` normally has a cost: a link from another site arrives without the cookie, so a server-rendered page looks signed out. A SPA pays nothing. Its HTML is static, and the first request that needs the cookie is the page's own same-origin `fetch`. Serving the app and the API from one origin also means no CORS and a single cookie.

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

I also store the session id as hash of the cookie's secret, so a leaked document can't be replayed as a cookie. The refresh token inside it can only be redeemed with the API's client credential, so a database leak alone doesn't give an attacker usable tokens.

## The gaps in .NET

This is where I expected to install a package and move on. .NET has excellent identity libraries, and none of what follows is a criticism of them. They're good at what they're for. They just weren't built for an embedded BFF: an API that is its own BFF, with a server-side session and no downstream API. Broadly, the tooling assumes one of two shapes: a web app on the full ASP.NET Core host, or a BFF that is a separate proxy in front of your API.

**Microsoft.Identity.Web** is built on ASP.NET Core's authentication middleware, a cookie handler and an OpenID Connect handler in the request pipeline. It expects your app to own that pipeline, and by default it keeps the whole session in an encrypted cookie. Turning that into a server-side session for an API means bending a lot of framework for a small flow.[^idweb]

**MSAL.NET** is built to get and cache access tokens for calling downstream APIs. An embedded BFF has no downstream API, so that's the part you don't need. By design, it also hides the refresh token inside its own token cache, and that's the one token an embedded BFF wants to manage itself.[^msal-rt]

**Duende BFF** is the most complete BFF for .NET, and worth a serious look if your app runs on ASP.NET Core and its licence suits you.[^duende]

Microsoft's own guidance shows the same split. The ASP.NET Core docs include a BFF sample built as a proxy with YARP and Aspire, while the Entra docs for single-page apps still lead with MSAL.js in the browser.[^blazor-bff]

The hard parts of OpenID Connect are already in `Microsoft.IdentityModel`: fetching the provider's signing keys and validating ID tokens. What's missing is the protocol glue around them, a small piece that runs the authorization code flow for a confidential client, hands you the tokens, and leaves the session to you. That piece is exactly what an embedded BFF needs.

## What filling the gap looks like

Filling it took a bit under 300 lines of F#. The library already handles the cryptography, so what's left is the flow itself: send the browser to sign in, check what comes back against what the browser remembered, swap the code for tokens, and later use the refresh token to check the account is still good.

Almost all of that is pure functions. Each takes what arrived and returns either the next step or the reason it failed. That makes every protocol rule easy to test on its own, from a mismatched state to an open redirect through the return URL, with no framework or identity provider in the loop.

There's no client secret either. The API proves who it is to Entra with a signed client assertion, and the signing key never leaves Key Vault.

## Where it stands

Praisable isn't released yet, but sign-in now works end to end in production, and it's working great. I sign in once and stay signed in, with no daily trip back to the sign-in page.

## Should you do this?

If you're building a browser app today, keep tokens out of the browser and give it a session cookie instead. And if your API exists to serve that one frontend, don't put another service in front of it: embed the BFF. The standards recommend it, and for a SPA on one origin it's simpler too. No token storage, no silent renew, no refresh logic in JavaScript. Just `fetch`.

On .NET, if you're on ASP.NET Core, use what's there. If you're not, or you want the session to be yours, don't be afraid of the protocol. `Microsoft.IdentityModel` handles the hard parts, and the rest is small, mostly pure and easy to test. At 300 lines, it's a small cost I'm happy to carry.

[^rfc]: Parecki, De Ryck and Waite, [RFC 10017: OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017.html), BCP 212, August 2026. See the Backend for Frontend section.
[^owasp-html5]: OWASP, [HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), Local Storage.
[^owasp-session]: OWASP, [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), Cookies.
[^mdn-cookie]: MDN, [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).
[^idweb]: [Microsoft Identity Web basics](https://github.com/AzureAD/microsoft-identity-web/wiki/Microsoft-Identity-Web-basics): "it doesn't replace AddOpenIdConnect, AddJwtBearer or AddCookie … but it uses and configure them correctly."
[^msal-rt]: Microsoft Learn, [Differences between ADAL.NET and MSAL.NET](https://learn.microsoft.com/en-us/entra/msal/dotnet/how-to/differences-adal-msal-net).
[^duende]: Duende, [BFF Security Framework](https://docs.duendesoftware.com/bff/) and [Licensing](https://docs.duendesoftware.com/general/licensing/). Version 4.3.1 at the time of writing.
[^blazor-bff]: Microsoft Learn, [Secure an ASP.NET Core Blazor Web App with OpenID Connect](https://learn.microsoft.com/en-us/aspnet/core/blazor/security/blazor-web-app-with-oidc), BFF version.
