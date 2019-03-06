---
author: "Daniel Little"
categories: ["Cloud", "Hosting"]
date: 2011-06-28T01:00:00Z
description: ""
draft: false
path: "/appharbor-first-impressions"
tags: ["Cloud", "Hosting"]
title: "AppHarbor - First Impressions"

---

App Harbor is a great new cloud hosting service, which I’ve been trying out over the last few weeks. It deploys straight from source code using msbuild to transform your webconfigs, run your tests and deploy to the servers. 

However there’s a few things that I didn’t realise untill I’d started using it for a while. Firstly GIT support on windows if not the greatest and while it has been working fine Mercurial has been getting some popularity as an alternative and appharbor even has some support for working with it with bitbucket. 

Secondly its cloud based and when you try to get a CMS running you quickly realise they don’t work too well across multiple servers. As you need a central storage location for uploaded files, and CMS managed files. You can get it working and it’s something App Harbor is also looking into but it’s no simple deploy at the moment. 
