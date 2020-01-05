---
author: "Daniel Little"
date: 2020-01-05T17:00:00Z
draft: true
path: "/how-to-handle-environment-settings-for-build-once-packages-in-react"
categories: ["Build Once Deploy Everywhere", "Environment Settings", "React"]
tags: ["Build Once Deploy Everywhere", "Environment Settings", "React"]
title: "How to Handle Environment Settings for Build Once Deploy Everywhere Packages in React"
---

Let's look at some questions:

1. How do you specify which API Url to use for an environment?

2. How do you configure the environment settings of frontend apps for each environment?

3. How to you achieve: build once, deploy everywhere packages for a frontend app?

Most frontend applications currently take the approach of [building a package for each environment](https://twitter.com/housecor/status/973881714710908928). This approach is reasonably well supported by Webpack and is a common approach, but doesn't support build once, deploy everywhere packages. There's also a lot of workarounds such as sniffing the URL, injecting extra scripts or using a find and replace script on the bundle. These approaches can provide a single package but are often custom solutions for individual applications.

I think there are two main reasons for this, the first, is that when you `create-react-app` out of the box there is no built-in support for build once, deploy everywhere. You have to fend for yourself. But second, and possibly, more importantly, it is more difficult to set up runtime style environment settings needed for build once, deploy everywhere packages.

## Build Once, Deploy Everywhere

As this approach is less common, let's look at what exactly this is, why it's important and some of the benefits of this approach. The build once, deploy everywhere pattern refers to the building a single deployment artefact which can be deployed to one or many different environments.

### Shorter build times

Building packages is expensive, building a package once saves quite a bit of time and compute. If your build takes 40 seconds, and you have two environments, the total build time is effectively doubled to over a minute. Fast builds and deployment times are also important for low deployment lead times and short development cycles. Today it's also common to have you build/ci agent in the cloud where we'll typically pay per minute or per agent for parallel builds. Here short build times have an even greater impact on development and costs.

### Exact same code

By building the package once and using that same package in every environment you can guarantee they'll all be running the exact same code. There are multiple reasons why you might end up with slight unexpected variations such as non-deterministic compilers, resulting in different optimisations. Dependencies could change, for example, if the build step runs an auto package restore or the build script relies on an external service. There may also be bugs in the tooling which can be unforeseen. By building the package once, there are fewer opportunities for things to go wrong, which means less risk.

### Simplified deployment pipeline

Modern deployment pipelines such as those in products such as Octopus Deploy or Azure DevOps support environment based deployments, deployment promotion and variable substitution. These tools assume a single artefact or package which can then be deployed to an environment. Variable substitution is applied at deployment time after the package has been created, typically as a final configuration step during deployment. Taking advantage of these features results in a simplified deployment pipeline. The tooling can often assist with promoting to the next environment or marking the package as containing defects, managing the lifecycle of the package for us.

## Loading Environment Settings in React

In order to load the settings, I've gone with the approach of using two types of files, both of which are loaded asynchronously.

The first is the `environment.js` file which simply contains a `json string` naming the environment you want to load. In the example below the environment is `development` which is what I'd also check into version control. 

```json
// environment.json
"development"
```

On deployment contents of this file is replaced with the appropriate environment name.

The second type of file is a `settings.json` file. There can be multiple settings files, and by using the environment name in the file name, we can differentiate between them, and load the appropriate file. Let's say I have the following three files. I want to always load `settings.json` but load either `development` or `test` depending on the environment.

```json
// settings.json
{
  "siteName": "Example Website"
}
```

```json
// settings.development.json
{
  "apiUrl": "http://localhost:2019"
  "banner": "You are in the Development Environment"
  "clientId": null
}
```

```json
// settings.test.json
{
  "apiUrl": "https://test.domain.com"
  "banner": "You are in the Test Environment"
  "clientId": "gSxyKjfAqopIcYmbVw"
}
```

After running the application, I'll get the combination (using spread internally) of the two files depending on the environment.

In order to specify which files to load some configuration is required. Here we're provided with the environment name and can return a list of settings files to load.

```tsx
// App.ts

const getConfig(environment: string) => [
  { file: `settings.json`, optional: false },
  { file: `settings.${environment}.json`, optional: true }
];
```

To tie it all together, I'm using a component called `AppSettingsLoader` which loads both file types using a URL and the list of settings files above. It also takes two other props to determine what to show while the settings are being loaded or unavailable, and finally what to render once the settings are available.

```tsx
import AppSettingsLoader from "react-environment-settings";

<AppSettingsLoader
  environmentUrl={"environment.json"}
  getConfig={getConfig}
  loading={() => <div>Loading settings...</div>}
  ready={settings => <pre>{JSON.stringify(settings, null, 2)}</pre>}
/>
```

By using this component at the root of an application, you're then able to delay running the application until the settings have been loaded and are available.

## Installation and Code

If you'd like to try it out, you can install this package.

```
npm i react-environment-settings
```

I won't go into all the code, but you can find the full project on GitHub [daniellittledev/react-environment-settings](https://github.com/daniellittledev/react-environment-settings). Originally I was just planning on sharing my approach with a blog post, but it just wouldn't be complete without a package on npm.

I've tried to keep the code relatively simple so I'll just share a few key parts.

The main file `index.tsx` contains the component itself, the main challenge here was getting allowing the settings object to be typed. I ended up using the approach of statically typing the Props inside the component but exporting it as a generic type.

So if you import the component, you'll get this type.

```
type AppSettingsLoader<T = any> = FunctionComponent<AppSettingsLoaderProps<T>>;
```

Even though the component is defined with a static `Json` type.

```ts
const AppSettingsLoaderComponent: FC<AppSettingsLoaderProps<Json>> = props => {
```

Because it's exported using the open generic type.

```
export default AppSettingsLoader as AppSettingsLoader;
```

The entire component looks like this.

```tsx
import { SettingsConfig, SettingsFileConfig, Json, loadSettings } from "./loadSettings";
import { FC, FunctionComponent, ReactElement, useEffect, useState } from "react";

interface AppSettingsLoaderProps<T> {
  environmentUrl: string;
  getConfig: (environment: string) => SettingsConfig;
  loading: () => ReactElement;
  ready: (settings: T) => ReactElement;
}

type AppSettingsLoader<T = any> = FunctionComponent<AppSettingsLoaderProps<T>>;

const AppSettingsLoaderComponent: FC<AppSettingsLoaderProps<Json>> = props => {
  const [settings, setSettings] = useState<Json | null>(null);

  useEffect(() => {
    loadSettings(props.environmentUrl, props.getConfig).then(s => setSettings(s));
  }, []);

  return settings ? props.ready(settings) : props.loading();
};

const AppSettingsLoader = AppSettingsLoaderComponent;
export default AppSettingsLoader as AppSettingsLoader;

export { Json, SettingsFileConfig, SettingsConfig };
```

## Wrapping up

Good luck out there with your settings loading journey. If you're trying to get a new project up and running or updating an existing project, I hope this post has helped you.