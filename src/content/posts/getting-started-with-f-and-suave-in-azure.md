---
author: "Daniel Little"
date: 2016-09-10T05:11:57Z
description: ""
draft: true
path: "/getting-started-with-f-and-suave-in-azure"
title: "Getting started with F# and Suave in Azure"

---

## Setting up the project

Create a new F# console application

Next up we'll use paket to pull down our dependencies

- Create a `.paket` folder in the root of your solution.
- Download the latest [`paket.bootstrapper.exe`](https://github.com/fsprojects/Paket/releases/tag/3.19.3) into that folder.
- Run `.paket/paket.bootstrapper.exe`. This will download the latest paket.exe.
- Commit `.paket/paket.bootstrapper.exe` into your repo and add `.paket/paket.exe` to your `.gitignore` file.

paket.dependencies

    source https://nuget.org/api/v2
    nuget Suave

paket.references

    Suave

Now when you reload the visual studio project you should see `Suave` listed in the references.

open Suave

Now update the Program.fs

    [<EntryPoint>]
    let main argv = 
        startWebServer defaultConfig (Successful.OK "Hello World!")
        0 // return an integer exit code

## Deploying to Azure

Now for the hard part

I'm going to use a build server and generate a web deploy package

A little annoying that you can't zip and push to deploy an azure website.

    "-verb:sync", "-source:iisApp=$sourcePath", "-dest:package=$packagePath"

Now we have Package

    "-verb:sync", "-source:package=$packagePath", `
	"-dest:iisApp='$siteName',ComputerName='https://statusreport.scm.azurewebsites.net:443/msdeploy.axd?site=$siteName',UserName='`$StatusReport',Password='',AuthType='Basic'"

Note the username actually stats with a `$`

That will deploy the site

https://statusreport.scm.azurewebsites.net/Env.cshtml 


https://github.com/aspnet/Home/issues/694 

    -enablerule:AppOffline



