---
author: "Daniel Little"
categories: ["animation", "silverlight", "windows-phone"]
date: 2012-10-07T01:00:00Z
description: ""
draft: false
path: "/silverlight-page-transition"
tags: ["animation", "silverlight", "windows-phone"]
title: "Silverlight Page Transition Complete Event"

---

While creating a mixed silverlight and xna WP7 application I started to add in page transitions with the silverlight toolkit. For the silverlight part of the application they work perfectly however when transitioning to the game screen the animation was not present.

This is because in `OnNavigatedTo` i'm obtaining the graphics device which overrides the rendering and this occurs _before_ the animations starts.

At this point you have two choices, implements a transition like effect manually in xna or delay obtaining the graphics device until the animation completes and display some content to transition with.

I'm going to give a sample of how to do the latter.

    public GamePage()
    {
        tansitionEnd = new RoutedEventHandler(GamePage_EndTransition);
    }

    protected override void OnNavigatedTo(NavigationEventArgs e)
    {
        TransitionService.GetNavigationInTransition(this).EndTransition += tansitionEnd;
        base.OnNavigatedTo(e);
    }

    protected void GamePage_EndTransition(object sender, RoutedEventArgs e)
    {
        TransitionService.GetNavigationInTransition(this).EndTransition -= tansitionEnd;
    }

The reason I picked the latter is because I will be using silverlight to render some parts of the UI. It's also important to note that as soon as you share the graphics device page level transitions will not render as xna takes over. However as stated above it's still possible to create a transition manually inside xna.