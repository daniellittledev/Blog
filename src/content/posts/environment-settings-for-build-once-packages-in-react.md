---
author: "Daniel Little"
date: 2020-01-14T17:00:00Z
draft: false
path: "/how-to-handle-environment-settings-for-build-once-packages-in-react"
categories: ["Build Once Deploy Everywhere", "Environment Settings", "React"]
tags: ["Build Once Deploy Everywhere", "Environment Settings", "React"]
title: "Environment Settings for Build Once Packages in React"
---

Let's look at some questions:

1. How do you specify which API to use for an environment?

2. How do you configure the environment settings of frontend apps for each environment?

3. How to you achieve: build once, deploy everywhere packages for a frontend app?

Most frontend applications currently take the approach of [building a package for each environment](https://twitter.com/housecor/status/973881714710908928). This approach is reasonably well supported by Webpack and it is a common approach. There's also a lot of workarounds such as sniffing the URL, injecting extra scripts or using a find and replace script on the bundle. These approaches can provide a single package but are often custom solutions for individual applications.

I think there are two main reasons for this, the first, is that when you `create-react-app` out of the box there is no built-in support for build once, deploy everywhere. You have to fend for yourself. But second, and possibly, more importantly, it is more difficult to set up runtime style environment settings needed for build once, deploy everywhere packages.

## Build Once, Deploy Everywhere

As this approach is less common, let's look at what exactly this is, why it's important and some of the benefits of this approach. The build once, deploy everywhere pattern refers to the building a single deployment artefact which can be deployed to one or many different environments.

### Shorter build times

Building packages is expensive, building a package once saves quite a bit of time and compute. If your build takes 40 seconds, and you have two environments, the total build time is effectively doubled to over a minute. Fast builds and deployment times are also important for low deployment lead times and short development cycles. Today it's also common to have you build/ci agent in the cloud where we'll typically pay per minute or per agent for parallel builds. Here short build times have an even greater impact on development and costs.

### Exact same code

By building the package once and using that same package in every environment, you can guarantee they'll all be running the exact same code. There are multiple reasons why you might end up with slight unexpected variations such as non-deterministic compilers, resulting in different optimisations. Dependencies could change, for example, if the build step runs an auto package restore or the build script relies on an external service. There may also be bugs in the tooling which can be unforeseen. By building the package once, there are fewer opportunities for things to go wrong, which means less risk.

### Simplified deployment pipeline

Modern deployment pipelines such as those in products such as Octopus Deploy or Azure DevOps support environment based deployments, deployment promotion and variable substitution. These tools assume a single artifact or package which can then be deployed to an environment. Variable substitution is applied at deployment time after the package has been created, typically as a final configuration step during deployment. Taking advantage of these features results in a simplified deployment pipeline. The tooling can often assist with promoting to the next environment or marking the package as containing defects, managing the lifecycle of the package for us.

## Loading Environment Settings in React

In order to load the settings, I've gone with the approach of using a single file to keep loading times as low as possible.

There is a single `settings.json` file which contains the environment you want to load settings for, as well as blocks containing the default and environment settings. In the example below the environment is `development` which is what I'd also check into version control.

```json
// settings.json
{
  "environment": "development",
  "default": {
    "api": "defaultapi.com",
    "siteName": "Example Site"
  },
  "development": {
    "api": "developmentapi.com",
    "banner": "You are in the Development Environment"
  }
}
```

On deployment, environment property is replaced with the appropriate environment name. Settings can also be added or modified. Then, when the application is run the application, I'll get the combination of (using spread internally) the default and matching environment blocks.

To tie it all together, I'm using a component called `AppSettingsLoader` which loads the settings given the URL of a settings file. It also takes three other props to determine what to show while the settings are being loaded or unavailable, what to render once the settings are available, and optionally an error prop.

```tsx
import AppSettingsLoader from "react-environment-settings";
import settingsAssetUrl from "./settings.json.txt";

interface Settings {
  api: string;
  banner: string;
}

<AppSettingsLoader<Settings>
  settingsUrl={settingsAssetUrl}
  loading={() => <div>Loading settings...</div>}
  ready={s => <pre>{JSON.stringify(s, null, 2)}</pre>}
/>
```

The AppSettingsLoader is also a generic component; in this example, you can also see the `Settings` interface used to specify the type of the combined settings. Therefore, the final product of the Settings for all environments need to match a common interface.

```tsx
<AppSettingsLoader<Settings> ... />
```

In order to load the settings themselves, there were a number of issues I had to work through. I wanted to keep the settings file separate to the application bundle, but `json` files are bundled if you import them. I also wanted to avoid caching issues so I couldn't just move the file into the public folder and fetch it from there.

In order to load the settings file with Typescript and Webpack I was able to use the [Importing Other Assets](https://webpack.js.org/guides/typescript/#importing-other-assets) functionality which lets you import a file, in this case, a `txt` file. Importing the file will cause it to be processed giving it a unique filename, but unlike a `json` import the file contents are unmodified and the file is stored in the `media` folder.

```
> build
  > static
    > css
    > js
    > media
      > settings.json.4355cbd.txt
```

Above is an example of where you can locate the file after a build. As you can see the settings file is easy to locate, having a similar but also cache busting filename. This means it's easy to locate the settings file and perform environment name and variable substitution.

Importing the file in Typescript also requires a module declaration.

```typescript
// global.d.ts
declare module '*.txt' {
  const content: string;
  export default content;
}
```

And when the file is imported, you'd receive the path to the file which can be passed to the `AppSettingsLoader` and loaded via a fetch.

```typescript
import settingsAssetUrl from "./settings.json.txt";
```

You could also provide a Url from another source if needed.

Finally, by using `AppSettingsLoader` at the root of an application, you're then able to breifly delay running the application until the settings have been loaded and are available.

```tsx
<AppSettingsLoader<Settings>
  settingsUrl={settingsAssetUrl}
  loading={() => <div>Loading...</div>}
  ready={s => <App appSettings={s} />}
/>
```

## Installation and Code

If you'd like to try it out, you can install this package.

```bash
npm i react-environment-settings
```

I won't go into all the code, but you can find the full project on GitHub [daniellittledev/react-environment-settings](https://github.com/daniellittledev/react-environment-settings). Originally I was only planning on sharing my approach with a blog post, but it just wouldn't be complete without a package on npm.

I've tried to keep the code relatively simple, so I'll just share a few key parts.

The bulk of the logic is inside two main files, `loadSettings.ts` which loads the merges the settings, and `index.ts` which contains the component itself.

Below is the main load settings function. Here I'd like to highlight in terms of error handling, fetch and loading issues are both caught at the top level of this function.

```tsx
export async function loadSettings<T>(
  settingsUrl: string
) {
  try {
    const settings = await getSettings(settingsUrl);
    const allSettings = getSelectedSettings(settings);
    const mergedSettings = mergeSettings(allSettings) as unknown;
    return success<T>(mergedSettings as T);
  } catch (ex) {
    return error<T>(ex);
  }
};

```

This error is then directly accessible using the `error` prop on the `AppSettingsLoader` component.

```tsx
switch (settings.type) {
  ...
  case "Error":
    return props.error ? (
      props.error(settings.error)
    ) : (
      <div>Error loading settings</div>
    );
}

```

So you have full control if something goes wrong.

## Wrapping up

Good luck out there with your settings loading journey. If you're trying to get a new project up and running or updating an existing project, I hope this post has helped you.