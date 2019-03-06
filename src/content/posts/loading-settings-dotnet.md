---
author: "Daniel Little"
categories: ["config", "web.config"]
date: 2013-04-20T01:00:00Z
description: ""
draft: false
path: "/loading-settings-dotnet"
tags: ["config", "web.config"]
title: "Loading Settings From web.config"

---

It's always a good idea to be as consistent as possible when you're writing code. So when you're using settings from a configuration file it's a good idea to avoid sprinkling `ConfigurationManager.AppSettings["MySetting"]` around the codebase, especially if you've making multiple calls to it.

A great way to provide consistency and to remove this duplication is to create a settings class either one static global one or multiple instance classes which I'll then manage with dependency injection. Then I load all the settings from configuration into that class on start up.

I've also written a little library that makes use of reflection to make this even easier.

Once my settings are in my config file

	<?xml version="1.0" encoding="utf-8" ?>
	<configuration>   
		<appSettings>
			<add key="Domain" value="example.com" />
			<add key="PagingSize" value="30" />
			<add key="Invalid.C#.Identifier" value="test" />
		</appSettings>
	</configuration>

I make a static or instance class depending on my needs. For simple applications with only a few settings one static class is fine.

	private static class Settings
	{
		public string Domain { get; set; }
		
		public int PagingSize { get; set; }
		
		[Named("Invalid.C#.Identifier")]
		public string ICID { get; set; }

	}

Then using my library call either `Inflate.Static` or `Inflate.Instance` and the cool thing is I can use any key value source.

	using Fire.Configuration;

	Inflate.Static( typeof(Settings), x => ConfigurationManager.AppSettings[x] );


	var settings = new SpecificSettings();

	Inflate.Instance( settings, x => ConfigurationManager.AppSettings[x] );


All the code for this is in bitbucket at https://bitbucket.org/Lavinski/fire

There is even a nuget package http://nuget.org/packages/Fire/

	Install-Package Fire
