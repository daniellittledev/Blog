---
author: "Daniel Little"
categories: ["git pull", "git"]
date: 2013-09-12T01:00:00Z
description: ""
draft: false
path: "/git-when-to-merge"
tags: ["git pull", "git"]
title: "Git - When to Merge"

---

Many people use git pull and merge frequently in an effort to keep a branch up to date while working a feature. However it's actually recommended not to merge into a feature branch until it's complete and ready to be integrated back into the development branch. 

The reason for this is that merge is a is a semantic action and actually has additional meaning than just update this branch. For example a feature branch should only be concerned with adding a single feature to a point in time. This makes development easier, you don't want the system changing around you as you develop a feature. Merge does a great job at integrating branches when they're ready (As long as you're project isn't completely different [if it is you have bigger problems]). It also lets you become more flexible, branches can merge with other branches or features without getting changes they're not interested in.

It's also good to remember if you just want to sync with a remote such as the origin you can use fetch which avoids the implicit merge of pull.