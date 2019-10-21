---
author: "Daniel Little"
date: 2019-10-21T17:00:00Z
draft: false
path: "/practising-continuous-deployment"
categories: ["Continuous Deployment", "Continuous Integration", "Deployment"]
tags: ["Continuous Deployment", "Continuous Integration", "Deployment"]
title: "Practising Continuous Deployment"
---

I've long been an advocate of Continuous Deployment, but it's always felt somewhat out of reach. I've come close with projects that have had decent test coverage and automated deployments, but there was always something missing. There was always still a button you needed to click to promote from test into production. Often unreleased code could build-up, resulting in a bigger riskier release or more manual testing.

Continuous Deployment can be difficult to adopt *because* you need to build reliability and confidence into your build and deployment pipelines. But more difficult is the culture shift, it's a different way of working and you can't just slap some tests on it and declare Continuous Deployment. Buy-in is important and so is process, because while Continuous Deployment is positively self-reinforcing, not practising it is negatively reinforcing. You need critical mass, and you need to jump the gap quickly. So while I've come close, it remained difficult to bridge the gap into the magical world of Continuous Deployment.

However, during my time with the wonderful folks at Stacktrace, we practised Continuous Delivery amongst a team of eight developers. To date, it's that only team I've joined that was already practising Continuous Delivery. It was everything I hoped it would be. And since then I've brought a lot of what I learnt with me, continuing to put Continuous Delivery into practice.

So I'd like to tell you about the strategies we used.

### Shared code ownership

Everyone was equally across most areas of the codebase, and everyone felt comfortable working on any feature or change. We all paid attention to quality and avoided cutting corners. This made everything easier; you can take for granted cohesion, consistency and tests to cover your back. We also made sure to keep it that way.

### Always production-ready

All commits are production-ready, you know that each push could potentially make it to production. If code isn't ready to go live, then it's either not wired up to the UI, silently running beside an existing version or behind a feature toggle. This ensures each release is small and all code is continuously integrated, so everyone sees the latest code even if it's not finished.

Features also need to be backwards compatibility typically through parallel implementations or on-the-fly database migrations.

### Short-lived branches

Branches are kept small and short-lived typically only lasting for 1-2 days. They're also only used for Pull Requests and usually don't represent a full or complete feature. As long as they're production-ready they're good to go.

### Rebasing onto master

Master is always moving forward and in order to get value out of continuous integration, you need the latest code on your machine. We frequently rebased development branches onto master. To make this even easier, I'll use a function like fmar, which stands for fetch master and rebase.

```
function fmar {
  git fetch
  git rebase origin/master
}
```

### Quick Code Reviews

All code is merged into master from a PR, and each PR must be reviewed by someone else. Sometimes we'd pick someone familiar with the change and sometimes we'd pick someone different to share things around.

We also treated code reviews as a priority. Initially it's the responsibility of the author to find someone to review the PR. Once you agreed to review a PR, it was then up to you to review it promptly or hand the PR back if something unexpected came up.

We also tried to as much as possible give feedback as advice. PRs were almost always approved, instead of blocked, but most feedback was actioned regardless. Sometimes in a follow-up PR instead of delaying an existing PR.

### Clean history

The key to quick PRs is code and commits that are easy to read and easy to follow. We would regularly rebase the commits in a PR so commits would tell a story or make a change easier to follow. And because branches were short-lived force pushing isn't a problem. We'd also use git pushfl or git push --force-with-lease for added safety, which aborts if anyone else has pushed to that branch.

### Automated Code Formatters

Another tool we used to keep PRs quick was automated code formatting. This ensures that all code is consistent and that no one needs to waste time on style discussions in a PR.

### Robust Test Suite

A good test suite is invaluable for continuous integration and deployment. Many changes can be verified via the tests without needing to run the application and perform lots of slower manual testing. Every change is backed by tests, and the tests are first-class code which is also actively maintained and improved.

### Fully Automated deployments

Setting up fully Automated deployments is a key aspect because it reinforces many of the concepts above. Completing a PR doesn't just sit in test until it's ready. Keeping commits production-ready is more than just an ideal. The PR will go all the way to production, and it needs to be production-ready.

This is also where a robust test suite really becomes indispensable. Automated builds always run before PRs can be integrated, and deployments are exercised by deploying to a test environment before they're deployed to production.

### Testing in Prod

The last point I want to mention is testing in production. Having a test tenancy in the production environment allows for the testing and review of new functionality and changes that have not yet been enabled for all users. This was invaluable to exercise the system from end to end with real data and with all the real dependencies.

## A Reflection

I found it an incredibly valuable experience to practice continuous deployment, but even more importantly, the practises that support it, make it possible and sustain it. 

Joining a team and learning through immersing myself in a culture that was already practising helped to bring these strategies into focus for me. 

I find that sometimes, it is hard to do things one step at a time because they can all seem to depend on each other. In the case of Continuous Deployment I still think that's true to some extent. There is a gap you have to jump to truly adopt Continuous Deployment. But I feel I have a much better idea of what makes Continuous Deployment successful.



I'd also love to hear about what makes Continuous Deployment work for you. If you think I've missed something or one thing really stands out for you tag me on twitter [@daniellittledev](https://twitter.com/daniellittledev).

