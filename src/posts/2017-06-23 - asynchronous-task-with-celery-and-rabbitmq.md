---
layout: post.njk
source: dev.to/zorexsalvo
title: "Asynchronous Task with Celery and RabbitMQ"
url: https://dev.to/zorexsalvo/asynchronous-task-with-celery-and-rabbitmq
date: 2017-06-23
published: 2017-06-23
tags: [python]
reading_time: 2 min
reactions: 11
comments: 2
description: Personal note on implementing asynchronous tasks in Python with Celery and RabbitMQ.
---
layout: post.njk

> *Spring cleaned July 2026. Dusted off, broken images flagged, outdated notes added.*
Slow API responses? Browser timeouts?

You probably have slow processes — external API calls, email services, SMS — that don't need to be processed synchronously before returning a response.

Last week, I experienced that *awkward pause* / site hanging / infinite loading / "a few moments later" moment while demonstrating my app to QA. I didn't expect it — I never experienced it on my local machine. Turns out, my processing was hanging on the email service, where I had to make a request to our mail server via SMTP. The response time was inconsistent, and unless the mail server responded or my process timed out, my app stayed in that hanging state.

Worry no more — the RabbitMQ × Celery combo is here for you. RabbitMQ acts as the message broker, storing the task queue, and Celery executes them one by one.

### Setup

Install Celery and RabbitMQ:

```bash
pip install celery
sudo apt-get install -y rabbitmq-server
```

> **Note 2026:** The original post pinned `celery==4.0.2`. Current Celery versions are much newer and the API is stable. The code below works with modern Celery too.

Create `tasks.py`:

```python
from celery import Celery

app = Celery('tasks', broker='amqp://localhost//')

@app.task
def create_a_slow_process_needs_async(job_name):
    # Your slow process here
    print(f"Processing: {job_name}")
    return f"Done: {job_name}"
```

Then run the worker:

```bash
$ celery -A tasks worker --loglevel=info
```

You should see output like:

```
-------------- celery@hostname v5.x (singularity)
--- * ***  * --  ...
-- * - **** ---
- ** ---------- [config]
- ** ---------- .> app:         tasks:0x...
- ** ---------- .> transport:   amqp://guest:**@localhost:5672//
- ** ---------- .> results:     disabled://
- *** --- * --- .> concurrency: 4 (prefork)
-- ******* ----
--- ***** -----

[tasks]
  . tasks.create_a_slow_process_needs_async

[INFO/MainProcess] Connected to amqp://guest:**@127.0.0.1:5672//
[INFO/MainProcess] celery@hostname ready.
```

Now execute the task from Python:

```python
>>> from tasks import create_a_slow_process_needs_async
>>> result = create_a_slow_process_needs_async.delay('Send email blast!')
<AsyncResult: 41ba4299-77a1-421b-9c35-873347f98b14>
```

The task runs in the background, and your app responds immediately. No more hanging.

