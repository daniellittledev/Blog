---
author: "Daniel Little"
date: 2016-06-29T10:39:58Z
description: ""
draft: true
path: "/generating-read-models-with-event-sourcing-part-2"
title: "Generating Read Models with Event Sourcing Part 2"

---


External services listening to events..
Out of order delivery of events


Multiple events for a single command

Concurrency in the domain


Examples

### The bank balance

CreditAddedEvent
DebitAddedEvent

Desired Info: My total balance

### Booking a ticket

TicketBookedEvent

Desired Info: Total Tickets Booked

### Sagas

Waiting for a number of events

### Blog

Adding comments

### Counting or Tally

InventoryItemAdded

Total number of items 

## Duplicate Logic

Balance total

Each consumer is responsible for tracking it.

## Replaying events

Examples of extra calculations

## Tests

How do I write a test to check the balance total

You don't...




