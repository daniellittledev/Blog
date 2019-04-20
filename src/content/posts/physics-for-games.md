---
author: "Daniel Little"
date: 2011-11-22T02:00:00Z
description: ""
draft: false
path: "/physics-for-games"
title: "Physics for games"

---

I'm revisiting a lot of the physics and I predict trigonometry that was once a daily part of my life before graduating university.

I'm surprised by how much I'd forgotten and writing it down always helps you remember it. Especially when it's on a blog and you can search for it later ;).

The system I'll be focusing on is Rigid Body Dynamics so lets start with the basics.

Any input into the system should be in the form of an impulse, which is basically a force against a point on a body. If all the impulses act against the center off mass we can deal with it just like a simple force.

The formula for a force:

    force = mass x acceleration

Which can be rewritten as:

    acceleration = force / mass

Which is great because our input is a force and mass can be whatever fits for our simple system which gives us acceleration.

The next thing we need is the velocity formula:

    velocity = acceleration x Δtime

Now for those of you that don't know Δ or in in English Delta means change or in this case change in time.

You should keep track of your objects velocity and add to it whenever the body experiences acceleration.

So now we have velocity and here comes position which we also keep track off and add to.

Position formula:

    position = velocity x Δtime

Now we can do all the way from the initial push to there the body ends up after a known change in time. The same also applies to angular forces and motion but that's something I'll get to later. To be honest I'm still trying to wrap my head around [inertia tensors](https://en.wikipedia.org/wiki/Inertia_tensor) which you need to

Helpful links
[Dynamical simulation](https://en.wikipedia.org/wiki/Dynamical_simulation)


