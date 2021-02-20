---
author: "Daniel Little"
date: 2019-10-07T19:00:00Z
draft: false
path: "/how-to-run-expecto-with-dotnet-test"
categories: ["expecto", "fsharp", "dotnet", "test", "cli"]
tags: ["Expecto", "FSharp", "dotnet"]
title: "How to run Expecto with dotnet test"
---

Expecto is a fantastic test framework and test runner for FSharp. But contrary to the name, the thing I like most about Expecto is that it contains so little magic. Your test project is a simple Console applications and to run you tests you just run the app. No Visual Studio plugins required.

```powershell
dotnet run
```



However, recently I wanted to also run my tests using `dotnet test` to fit into a existing test suit and build script. By default Expecto tests won't be discovered by `dotnet test` but the good news is it's only two packages and an attribute away from working with both `run` and `test`.

I started with an application that used no auto test discovery opting for explicit test registration like the following. 

```fsharp
let allTests =
    testList "all-tests" [
        BuilderTests.tests
        Convention.test
        Domain.tests
    ]
    
[<EntryPoint>]
let main argv =
    printfn "Running tests!"   
    runTestsWithArgs config argv allTests
```

We'll come back to this later, first we need to install some packages.

In order to set up tests with dotnet core we need to add the `Test SDK` to the project file.

```xml
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.3.0" />
```

However this will generate an entry point for your application and because we already have one we'll need to disable that by setting `GenerateProgramFile` to `false` in the project file.

```xml
<PropertyGroup>
    <GenerateProgramFile>false</GenerateProgramFile>
</PropertyGroup>
```

After that we'll need to add the package `YoloDev.Expecto.TestSdk` in order `dotnet test` to discover Expecto tests.

```xml
<PackageReference Include="YoloDev.Expecto.TestSdk" Version="0.8.0" />
```
This package exposes Expecto Test Attributes for discovery via the Microsoft Test SDK.

Finally, we need to make one change to the `Program.fs` file, adding the `Tests` attribute to the tests so they can be discovered.

```fsharp
[<Tests>]
let allTests =
    testList "all-tests" [
        BuilderTests.tests
        Convention.test
        Domain.tests
    ]
    
[<EntryPoint>]
let main argv =
    printfn "Running tests!"   
    runTestsWithArgs config argv allTests
```
Now when we run `dotnet test` we see the following:

```powershell
> dotnet test
Test run for App.Tests.dll(.NETCoreApp,Version=v2.2)
Microsoft (R) Test Execution Command Line Tool Version 16.3.0
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...

A total of 1 test files matched the specified pattern.

Test Run Successful.
Total tests: 31
     Passed: 31
 Total time: 1.3619 Seconds
```

Success!
