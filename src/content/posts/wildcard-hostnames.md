---
author: "Daniel Little"
categories: ["local-hosting"]
date: 2013-04-10T01:00:00Z
description: ""
draft: false
path: "/wildcard-hostnames"
tags: ["local-hosting"]
title: "Wildcards hostname in your hosts file"

---

If you've ever wanted to setup a wildcard entry in your hosts file so you don't have to add an entry for every IIS binding you'll be happy to know there is a way.

The trick however is not to use the hosts file but a local DNS proxy instead. [Acrylic DNS](http://mayakron.altervista.org/wikibase/show.php?id=AcrylicHome) is a free and open source which you can download [here](http://mayakron.altervista.org/wikibase/show.php?id=AcrylicHome). You use it in much the same way you would use a hosts file.

Stackoverflow has a great answer detailing how to set it up:

### [Configuring Acrylic DNS Proxy](http://stackoverflow.com/posts/9695861/edit) ###

**To configure Acrylic DNS Proxy, install it from the above link then go to:**

1. Start
1. Programs
1. Acrilic DNS Proxy
1. Config
1. Edit Custom Hosts File

**Add the folowing lines on the end of the file:**

    127.0.0.1	*.localhost
    127.0.0.1	*.local

**Restart the Acrilic DNS Proxy service:**

1. Start
1. Programs
1. Acrilic DNS Proxy
1. Config
1. Restart Acrilic Service

**You will also need to adjust your DNS setting in you network interface settings:**

1. Start
1. Control Panel 
1. Network and Internet 
1. Network Connections 
1. Local Area Connection Properties
1. TCP/IPv4

**Set "Use the following DNS server address":**

    Preferred DNS Server: 127.0.0.1
