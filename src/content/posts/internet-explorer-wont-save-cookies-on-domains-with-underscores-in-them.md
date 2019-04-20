---
author: "Daniel Little"
categories: ["browsers"]
date: 2014-04-15T23:41:23Z
description: ""
draft: false
path: "/internet-explorer-wont-save-cookies-on-domains-with-underscores-in-them"
tags: ["browsers"]
title: "Internet Explorer Won't Save Cookies On Domains With Underscores In Them."

---

All versions of Internet Explorer (version 5.5 all the way to version 11) will discard all cookies if the domain has an underscore in it. This can lead to the following issues, which can be quite difficult to debug:

- Cookies are not set on the client system.
- ASP.NET Session variables are lost.

When debugging web applications I can't recommend [Fiddler](https://www.telerik.com/fiddler) enough. It will be able to pick up these kinds of issues and in this case provides the following warning.

	!! WARNING !!: Server hostname contains an underscore and this response sets a cookie. Internet Explorer does not permit cookies to be set on hostnames containing underscores. See https://support.microsoft.com/kb/316112.

It's perfectly legal for a domain to have an underscore in it, so this issue goes against the standard (See [RFC 2181](https://www.ietf.org/rfc/rfc1034.txt), section 11, "Name syntax"). Part of the reason it is hard to debug is that the domain will work fine in all other browsers.

The support article has the following to say about the issue:

    PRB: Session Variables Do Not Persist Between Requests After You Install Internet Explorer Security Patch MS01-055

    A potential security vulnerability exists in Internet Explorer versions 5.5 and 6.0 in which a malicious user could create a URL that allows a Web site to gain unauthorized access to cookies that are stored on a client computer and then (potentially) modify the values that are contained in these cookies. Because some Web sites use cookies that are stored on client computers to store sensitive information, this security vulnerability could expose personal information.

So this issue is caused to prevent a security issue on a deprecated version of Internet Explorer. I think it's about time this restriction was removed.

You can vote to fix this issue at [Microsoft Connect](https://connect.microsoft.com/IE/feedback/details/853796/internet-explorer-wont-save-cookies-on-domains-with-underscores-in-them).