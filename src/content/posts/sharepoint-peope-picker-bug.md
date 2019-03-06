---
author: "Daniel Little"
categories: ["sharepoint"]
date: 2011-08-02T01:00:00Z
description: ""
draft: false
path: "/sharepoint-peope-picker-bug"
tags: ["sharepoint"]
title: "Sharepoint People Picker Displays Selection as Html"

---

When adding a people picker to a custom Html page I encountered an interesting error. When submitting the page the content would return hidden html from the control along with the message “You are only allowed to enter one item”.

The html looks like this.

    < span id=’span xxxxx’ tabindex=’-1’ contentEditable=’false’ class=’ms-entity-resolved’ title=’xxxxx’ />

The issue seems to be I’m using IE 9 Standards mode, as SharePoint usualy runs in quirks mode.

Similar issues: http://blog.richfinn.net/blog/CommentView,guid,4fce2e56-8e53-48cb-b6d9-6249af8e2141.aspx
