---
author: "Daniel Little"
categories: ["testing", "smtp"]
date: 2013-04-29T01:00:00Z
description: ""
draft: false
path: "/testing-emails-with-smtp4dev"
tags: ["testing", "smtp"]
title: "Testing emails in .NET"

---

Testing emails can sometimes be a bit challenging.  [smtp4dev ](https://smtp4dev.codeplex.com/)is a small program that intercepts all received emails so you can quickly send and view emails from any application that uses it as the SMTP server.

For a .NET application just add this to the config file.

	<mailSettings>
		<smtp>
			<network host="localhost"/>
		</smtp>
	</mailSettings>

Now all emails that the application sends will appear for your viewing pleasure in the email list (pictured below).

![](https://media.tumblr.com/ae0bed5688e8d01ea2d03a68430b17cf/tumblr_inline_mm04feyvwV1qz4rgp.png)

