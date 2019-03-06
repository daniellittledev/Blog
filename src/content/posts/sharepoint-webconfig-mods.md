---
author: "Daniel Little"
categories: ["WebConfig", "sharepoint"]
date: 2012-07-25T01:00:00Z
description: ""
draft: false
path: "/sharepoint-webconfig-mods"
tags: ["WebConfig", "sharepoint"]
title: "SharePoint WebConfig Modifications"

---

Example for adding or removing a webconfig modification in SharePoint 2010. 

	private void UpdateWebConfig(string name, string path, string owner, SPWebConfigModification.SPWebConfigModificationType type, string value, SPWebApplication app, bool removeModification)
	{

		if (removeModification) {
			var removals = app.WebConfigModifications.Where(item => item.Name == name).ToList();

			foreach (var item in removals) {
				app.WebConfigModifications.Remove(item);
			}

		} else {

			SPWebConfigModification modification = new SPWebConfigModification();
			modification.Name = name;
			modification.Path = path;
			modification.Owner = owner;
			modification.Sequence = 0;
			modification.Type = type;
			modification.Value = value;

			app.WebConfigModifications.Add(modification);
		}

		app.Update();
		app.Farm.Services.GetValue<SPWebService>().ApplyWebConfigModifications();
	}

Usage:

    UpdateWebConfig(
		"add[@name='handlerName']",
		"configuration/system.webServer/handlers",
		"FeatureName",
		SPWebConfigModification.SPWebConfigModificationType.EnsureChildNode,
		"<add name='handlerName' verb='*' path='service.axd' type='Namespace, Assembily, Version=1.0.0.0, Culture=neutral, PublicKeyToken=0x0xx00000x00xx0' />",
		webApplication,
		false	
    );