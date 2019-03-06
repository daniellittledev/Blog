---
author: "Daniel Little"
date: 2011-07-01T01:00:00Z
description: ""
draft: false
path: "/audit-data-sharepoint-list-items"
title: "Audit Data of Sharepoint List Items"

---

Here is how to read list item data in sharepoint 2007.

    var listItem = getMyItem();

    string creator = listItem["Created By"];
    DateTime created = listItem["Created"];

