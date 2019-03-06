---
author: "Daniel Little"
categories: ["iis"]
date: 2013-03-20T02:00:00Z
description: ""
draft: false
path: "/iis-multi-https-bindings"
tags: ["iis"]
title: "Multiple https bindings in IIS7 for developers"

---

When working with websites that require https (SSL) developers always ending up facing the problem: **Why can't you use hostnames with https**. This is because hostname is encrypted so IIS needs to establish the SSL connection before it can even read the hostname.

However we can get around this problem by making use of a wildcard certificate. Then it won't matter what the hostname is and we can happily use SSL on all our internal dev sites.

You can't actually use IIS to setup a wildcard certificate so I'll be using a bit of Powershell to move things along.

The first step is to create the self signed certificate. Any clients will also have to trust this certificate.

	$cert = New-SelfSignedCertificate -DnsName "*.company.internal" -CertStoreLocation cert:\LocalMachine\My
	Export-Certificate -Cert $cert -FilePath "company.internal.cer"

	$password = ConvertTo-SecureString -String "SecretHeHe" -Force –AsPlainText
	Export-PfxCertificate -Cert $cert -FilePath "company.internal.pfx" -Password $password

Next add the bindings to IIS, this script will add a http and https binding for each combination of site and environment.

	$sites = @(
		"website"
	)

	$envs = @(
		"test",
		"stage"
	)
	
	Import-Module WebAdministration
	foreach ($name in $sites) {
		
		foreach ($env in $envs) {
			$name = "$name ($env)"
		
			$siteName = "$name ($env)"
			New-WebBinding -Name $siteName -Port 80 -Protocol http -HostHeader "$env.$name.company.internal"
			New-WebBinding -Name $siteName -Port 443 -Protocol https -HostHeader "$env.$name.company.internal"
		}
	}

Just one thing left, setup IIS to use the certificate. To do that open IIS and import the certificate. Then select the open one of the https bindings and select the certificate (it won't matter which one, any site on that port will use it).