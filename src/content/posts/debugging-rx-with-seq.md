---
author: "Daniel Little"
categories: ["Serilog", "Seq", "Reactive Extensions"]
date: 2014-07-21T08:34:02Z
description: ""
draft: false
path: "/debugging-rx-with-seq"
tags: ["Serilog", "Seq", "Reactive Extensions"]
title: "Debugging Rx with Seq"

---

Debugging Reactive Extensions can sometimes be a bit tricky. When you have a few stream to watch, pinpointing failures is time consuming, and a can easily become a burden.  
 
Catching first-chance exceptions can be extremely helpful when debugging Rx.  However, it's much more useful to see how events progress over time. After coming across a thread about [tracing in Reactive Extensions](http://social.msdn.microsoft.com/Forums/en-US/a0215434-8ad6-45e1-9f21-ed2f14d7317a/a-simple-trace-method?forum=rx) I thought I could make a few improvements to their tracing methods by making use of Seq and [Serilog](http://serilog.net/). 

[Seq](https://getseq.net/) is fantastic tool that lets you visualise and explore log data quickly and easily. You can get Seq up and running within minutes. Just download the NuGet for [Serilog](https://github.com/serilog/serilog/wiki/Getting-Started) and install [the latest version of Seq](https://getseq.net/Download).


![Rx events in Seq](/content/images/2014/Jul/Seq.png)
*Some events in Seq.*

To hook this up in your application grab this updated `Trace` extension method using Serilog.

    public static IObservable<TSource> Trace<TSource>(this IObservable<TSource> source, string name)
	{
		var id = 0;
		return Observable.Create<TSource>(observer => {
			
			var itemId = ++id;
			Action<string, object> trace = (m, v) => Log.Information("{name}{id}: {method}({value})", name, itemId, m, v);

			trace("Subscribe", null);
			IDisposable disposable = source.Subscribe(
				v => { trace("OnNext", v); observer.OnNext(v); },
				e => { trace("OnError", e); observer.OnError(e); },
				() => { trace("OnCompleted", null); observer.OnCompleted(); });

			return () => { trace("Dispose", null); disposable.Dispose(); };
		});
	}

Next wire up the trace.

	Observable
		.Interval(100).Trace("Interval")
        .Take(2).Trace("Take")
        .Count();

Then just register Seq with Serilog and log away.

	Log.Logger = new LoggerConfiguration()
		.WriteTo.Seq("http://localhost:5341")
		.CreateLogger();
