---
layout: post.njk
source: dev.to/zorexsalvo
title: "Self-Hosted Git Server with Gogs"
url: https://dev.to/zorexsalvo/self-hosted-git-server-with-gogs--ch9
date: 2018-03-03
published: 2018-03-03
tags: [gitserver, docker, vps]
reading_time: 2 min
reactions: 15
comments: 3
description: How to set up your own GitHub-like git server in under an hour using Gogs and Docker.
---

> *Spring cleaned July 2026. Dusted off, broken images flagged, outdated notes added.*
### What is Gogs?

[Gogs](https://gogs.io) is a painless self-hosted Git service. If you want your own GitHub-like service, it's the best choice for me — I made it work in less than an hour.

Why would anyone create another service like GitHub when there's already GitHub? I needed private repositories for some of my projects. Back then, I couldn't do that on GitHub unless I upgraded to a paid plan. To be honest, $7/month felt expensive just for private repos — or maybe I'm just poor. No discredit to GitHub though; for public repos, I'd still choose GitHub.

> **Note 2026:** GitHub now offers unlimited free private repositories, so this particular motivation is less of a concern. But a self-hosted Git server still gives you full control over your data, no rate limits, and no downtime from someone else's outage. Gogs is still actively maintained, and [Forgejo](https://forgejo.org) (a fork) has become a popular alternative.

### First Things First

You'll need basic knowledge of Docker and have it installed. Gogs doesn't *have* to be dockerized — there are bare metal installation guides — but for this post, we'll use Docker. You'll also need a VPS for cloud access.

Pull the official Gogs image:

```bash
$ docker pull gogs/gogs
```

You'll also need a database (MySQL, Postgres, etc.):

```bash
$ docker pull postgres
```

Once the DB is ready, run the Gogs container:

```bash
$ docker run --name gogs -d -v /var/gogs/:/data gogs/gogs
```

After that, open the address in your browser. You'll see the web UI server configuration — fill in the server details, database, application name, admin account, host, domain, etc. Once that's done, you're good to go.

**For reference:**
- I hosted it (together with this personal site and other apps) on a VPS (1GB RAM, 1 CPU core, 20GB SSD, 1TB transfer) for $5/month
- Domain from GoDaddy for under $1
- Nginx for reverse proxy

**For a personal Git server, Gogs is my go-to. I haven't had any problems setting it up. It has the essential functionality, and it's really lightweight.**

