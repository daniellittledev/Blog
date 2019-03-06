---
author: "Daniel Little"
date: 2013-02-01T02:00:00Z
description: ""
draft: false
path: "/dbproviderfactories"
title: "Using ProviderName to get the database connection"

---

When setting your connection string in a .NET config file you can make use of the `providerName` attribute by using `DbProviderFactories.GetFactory` and passing it the provider name. 

	var connectionStringSettings = ConfigurationManager.ConnectionStrings["DefaultConnection"];
    
	connection = DbProviderFactories.GetFactory(connectionStringSettings.ProviderName).CreateConnection();
	connection.ConnectionString = connectionStringSettings.ConnectionString;
	connection.Open();