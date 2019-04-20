---
author: "Daniel Little"
date: 2017-11-14T00:18:32Z
description: ""
draft: false
path: "/curl-to-postman"
title: "cURL to Postman"

---

Postman is a fantastic tool for testing any HTTP endpoint. But if you're using your browser to look around and you find something of interest it can be a pain to recreate the request in Postman and copy across all the headers. There must be a better way!

Turns out there is! Chrome and Postman both have support for cURL which makes it easy to copy any request from Chromes dev tools and into Postman. You can also export any Postman request as a cURL command which makes sharing much easier as well.

In the Chrome Network tab, you can copy a request via a selection of formats.
![Chrome Copy as cURL](/../../images/curl-to-postman/Curl.png)

Once you have your cURL request you can then use the import command and paste in the cURL command.
![Postman From Curl](/../../images/curl-to-postman/PostmanFromCurl.png)

It took me a while to find out how to export the request, it's hidden under the `code` link.
![Postman Main](/../../images/curl-to-postman/PostmanMain.png)

From there you can export the request into a wide variety of formats.
![Postman Export](/../../images/curl-to-postman/PostmanExport.png)

And there we have it, Chrome to cURL to Postman and back again.

