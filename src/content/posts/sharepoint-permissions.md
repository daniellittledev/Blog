---
author: "Daniel Little"
date: 2011-07-05T01:00:00Z
description: ""
draft: false
path: "/sharepoint-permissions"
title: "Sharepoint Permissions"

---

The SharePoint permission model uses user impersonation, where a typical asp.net application will run under the permissions of the application pool SharePoint runs under the users credentials.

The scenario we’ll be looking at is updating a sharepoint list programmatically.

SharePoint has four default user groups, Read, Contributor, Designer and Full Control. Users would usually be in any of these groups or anything in between. This means that unless the users are also given explicit access to the list directly or via a group they may not have access to update a list even if allow unsafe updates is on.

To resolve this issue there are two solutions.

*The first is no revert back to the app pool, using this method means you have to identify the current user manually and by default all updates will appear as created or modified by the system account.
 *The second option is to assign users access to the list explicitly or create a group with access and add the group to the users (either automatically or manually via SharePoint).

In my case I needed a solution where users could not access the list normally but using my custom solution allowed them to make updates. Therefore option one was the way to go for me.
