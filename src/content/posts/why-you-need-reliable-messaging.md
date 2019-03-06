---
author: "Daniel Little"
categories: ["Distributed-Systems", "Reliable-Messaging"]
date: 2019-01-16T00:00:00Z
description: ""
draft: false
image: "/images/2019/01/photo-1487427076583-392ed176865e.jpg"
path: "/why-you-need-reliable-messaging"
tags: ["Distributed-Systems", "Reliable-Messaging"]
title: "Why you need Reliable Messaging"

---

You might have heard the phrase "there's no such thing as reliable messaging". It's an interesting statement, but aside from being completely untrue, the statement is also entirely unhelpful. What you can't have is "completely reliable messaging", but the real question is how close can you get? How close do you need to get?

The concept of Reliable Messaging is broad and can be somewhat complex at times. I won't get into all the details just yet. Instead, in this post, I'm going to establish what exactly Reliable Messaging is and why it's so important.

## What is Reliable Messaging

Reliable messaging is the concept of commutating with certain guarantees about the successful transmission of messages. For example, if the message is delivered, that it is delivered at least once. In contrast, this can be compared best-effort delivery, where there is no guarantee that messages will be delivered at all. I'm going to focus on message delivery and reliability, but reliable messaging may also refer to message ordering. 

These guarantees don't need to be baked into the protocol or framework you're using either. An interesting property of reliable messaging is that you can add more reliability at higher levels. You can build reliable protocols on top of unreliable protocols. The best example of this is TCP which is built on top of the IP protocol.

The most important aspect of Reliable Messaging is, at the end of the day, the only way to know if something is done is by receiving a message saying it was done. But before I explore exactly why Reliable Messaging is so important, I'll go on a brief tangent to have a look at why you can't have Completely Reliable Messaging.

## Why you can't have Completely Reliable Messaging 

Reliable Messaging can't provide complete reliability for a number of reasons, but you only need one negative example to disprove something is not absolute. In a distributed system the receiver could be faulty, offline, or explosively dismantled and spread around all corners of the globe. Even if the receiver works perfectly, the communication medium may be unreliable in many different ways. The sender may also be unreliable, it may crash, or simply contain a bug or other logic error. You can't guarantee anything in a world where anything can fail, but you can plan for failures.

## What makes Reliable Messaging important?

> It is necessary to understand how a system can fail and how to deal with failures when they inevitability occur. 

When building any kind of distributed system it is important to know what guarantees are needed. Otherwise, the default is always best-effort delivery. Which means the system will loose data, without anyone knowing when, why or how. Even if there are no errors, exceptions or obvious signs. If messages fail to be propagated you might not realise anything went wrong for days, or months, or at all. 

Issues like this also tend to be expensive to track down and fix. Because they're found so late they may also end up being impossible to track down and fix. The core problem is, it is necessary to understand how a system can fail and how to deal with failures when they inevitability occur. In this sense, Reliable Messaging is a means to an end. 

Given that the core problem is dealing with failures, there are situations where you just don't need reliable messaging. In some systems manual monitoring and alerts could be enough; however, this is usually more indirect and coarse. Some actions may not be important at all, in which case best effort would suffice. If an action is user-driven then the user could manually retry instead. Otherwise, if you don't want to be manually adding reliability, because that get's expensive really quickly, then having a good strategy for Reliable Messaging is very important.