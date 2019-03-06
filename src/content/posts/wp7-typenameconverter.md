---
author: "Daniel Little"
date: 2011-10-18T01:00:00Z
description: ""
draft: false
path: "/wp7-typenameconverter"
title: "WP7 Mango Unit Testing Framework \"Cannot find a Resource with the Name/Key typeNameConverter\""

---

When trying to setup unit testing I was slightly dissapoited you couldn't test a silverlight library using a normal test project. However you can use the testing framework by using the [Silverlight 3 libraries here](http://www.jeff.wilcox.name/2010/05/sl3-utf-bits/).

However you have to make sure you get the right version. I didn't and instead I found a link to an older tutorial and got the nice error `Cannot find a Resource with the Name/Key typeNameConverter` and the only [real match](http://www.silverlightshow.net/news/A-Batch-File-for-Closing-Zune-and-Launching-the-WPConnect-Tool-Workaround-for-WP7-Mango-Unit-Testing-Framework-Cannot-find-a-Resource-with-the-Name-Key-typeNameConverter.aspx) for the error had a broken link. The solution was simple though, find the source and update to the Mango version.

