---
layout: post.njk
source: dev.to/zorexsalvo
title: "Adding Proxy to Your Docker Service"
url: https://dev.to/zorexsalvo/adding-proxy-to-your-docker-service
date: 2017-05-13
published: 2017-05-13
tags: [docker, networking, note]
reading_time: 2 min
reactions: 9
comments: 1
description: Personal note on configuring Docker to work behind a corporate network proxy.
---

> *Spring cleaned July 2026. Dusted off, broken images flagged, outdated notes added.*
*This is a personal note for configuring Docker behind a corporate network proxy.*

Have you ever experienced slow Docker builds even on a network proxy? Me? Always.

Then this idea came from one of our interns. At first, he added environment variables inside his Dockerfile. Seemed like a bright idea — but it wasn't, because his image could only be built **if** he was in our office network.

Then came the problem: his build on Docker Hub failed because "it ran on local machine." The issue was that `HTTP_PROXY` couldn't be resolved by Docker Hub. That's the exact opposite of Docker's "Build, Ship, and Run Any App, Anywhere" — it didn't even pass the build part.

Then another idea: what if we add the proxy to Docker itself so we don't have to specify environment variables in the Dockerfile? Now *that's* a great idea.

Here's how to do it:

### Via systemd drop-in (older approach)

```bash
mkdir /etc/systemd/system/docker.service.d/
touch /etc/systemd/system/docker.service.d/http-proxy.conf
```

Edit `http-proxy.conf`:

```
[Service]
Environment="HTTP_PROXY=ip.of.your.proxy:port"
Environment="NO_PROXY=localhost,127.0.0.0/8"
```

Flush and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

Check if it worked:

```bash
docker info
```

And poof — notice the change in build speed!

> **Note 2026:** Docker now also supports proxy configuration via `~/.docker/config.json` or the `daemon.json` file, which is preferred for newer setups. The systemd approach still works but is less portable across Linux distributions. For Docker Desktop or newer Docker CE versions, configure the proxy in `~/.docker/config.json`:
> ```json
> {
>   "proxies": {
>     "default": {
>       "httpProxy": "http://proxy.example.com:8080",
>       "noProxy": "localhost,127.0.0.0/8"
>     }
>   }
> }
> ```

