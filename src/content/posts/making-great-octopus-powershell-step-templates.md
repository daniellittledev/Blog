---
author: "Daniel Little"
categories: ["powershell", "Octopus Deploy", "Step Templates"]
date: 2014-07-14T07:52:44Z
description: ""
draft: false
path: "/making-great-octopus-powershell-step-templates"
tags: ["powershell", "Octopus Deploy", "Step Templates"]
title: "Making great Octopus PowerShell step templates"

---

Step templates, introduced in [Octopus Deploy 2.4](https://octopusdeploy.com/blog/2.4), are a great way to share and reuse useful PowerShell scripts.

Anyone can make a step template and submit it via a pull request [over at Github](https://github.com/OctopusDeploy/Library). I've come up with a few tricks to make writing step templates easier.

I wanted to make sure I could do a few things easily like testing the script outside of Octopus, handle errors as well as defaults and provide some structure around the layout of the script.

The first thing I do is declare the parameters I want the script to have. Note the inclusion of the `whatIf` switch parameter which makes it easy to test potentially dangerous scripts with a dry run.

    param(
        [string]$parameter1,
        [int]$parameter2,
        [switch]$whatIf
    )

By default PowerShell will attempt to continue to run a script after any errors so next I like to change that so an error will stop the script. *Note this is just for running outside Octopus, as Octopus also sets this for you.*

    $ErrorActionPreference = "Stop"

Next I declare a helper function called `Get-Param`. This function makes it much easier to run scripts outside Octopus by checking for an Octopus parameter and automatically falling back to use a variable. Additionally it also handles errors for required parameters and default values for optional ones.

    function Get-Param($Name, [switch]$Required, $Default) {
        $result = $null

        if ($OctopusParameters -ne $null) {
            $result = $OctopusParameters[$Name]
        }

        if ($result -eq $null) {
            $variable = Get-Variable $Name -EA SilentlyContinue
            if ($variable -ne $null) {
                $result = $variable.Value
            }
        }

        if ($result -eq $null) {
            if ($Required) {
                throw "Missing parameter value $Name"
            } else {
                $result = $Default
            }
        }

        return $result
    }

Following that you can then declare any other functions that you need.

Finally, and most importantly is the main body of the script. It's executed last because of PowerShell requires you declare a function before you can use it. The body is a [self executing anonymous function](/self-executing-anonymous-function-in-powershell/) similar to how you would do so in JavaScript. This lets you provide a child scope for the parameters and variables your script uses. Declaring the parameters here also ensures that the parameters have the correct types for both Octopus and script parameters.

    & {
        param(
            [string]$parameter1,
            [int]$parameter2
        )

        Write-Host "Script Title"
        Write-Host "PrameterName1: $parameter1"
        Write-Host "PrameterName2: $parameter2"

        # Main body of the script goes here!

     } `
     (Get-Param 'parameter1' -Required) `
     (Get-Param 'parameter2' -Default 10)

If you're wondering about the backticks, they allow the command to span multiple lines.

Here's the whole script.

    # Running outside octopus
	param(
		[string]$parameter,
		[switch]$whatIf
	)

	$ErrorActionPreference = "Stop"

	function Get-Param($Name, [switch]$Required, $Default) {
		$result = $null

		if ($OctopusParameters -ne $null) {
			$result = $OctopusParameters[$Name]
		}

		if ($result -eq $null) {
			$variable = Get-Variable $Name -EA SilentlyContinue
			if ($variable -ne $null) {
				$result = $variable.Value
			}
		}

		if ($result -eq $null) {
			if ($Required) {
				throw "Missing parameter value $Name"
			} else {
				$result = $Default
			}
		}

		return $result
	}

	# More custom functions would go here

	& {
		param(
			[string]$parameter
		)

		Write-Host "Script Title"
		Write-Host "PrameterName: $parameter"

        # Main body of the script goes here!

	 } `
	 (Get-Param 'parameter' -Required)