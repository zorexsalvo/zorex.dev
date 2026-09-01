---
layout: post.njk
title: "Wildcard subdomain DNS for Docker tenant apps on macOS"
date: 2026-09-01
published: 2026-09-01
tags:
  - devops
  - dns
  - docker
  - macos
  - dnsmasq
description: "How I mapped every *.example.com subdomain to a Docker container with dnsmasq, and how to get back to it when I need it again."
draft: false
---

Some apps are multi-tenant, and every tenant gets its own subdomain. The problem: you don't want to edit `/etc/hosts` every time one spins up.

That's the trap. `/etc/hosts` has no wildcard support. Every new tenant means another manual line, and one missed line means a silently broken subdomain. You want `anything.example.com` to just resolve.

## The setup

I ran the containerized app on an Apple Silicon Mac, with tenants living as subdomains of a real domain. The answer is dnsmasq: a lightweight DNS forwarder that does understand wildcards.

If you're on Apple Silicon, install it with Homebrew:

```bash
brew install dnsmasq
```

The config lives in one file, not a directory. It's `/opt/homebrew/etc/dnsmasq.conf`. (This tripped me up for a while. On Linux you'd expect `/etc/dnsmasq.d/`, but Homebrew on macOS keeps everything in that single conf file.)

## The wildcard line

The magic is a single `address=` line:

```
address=/example.com/172.16.238.10
```

That one line tells dnsmasq to resolve every name ending in `example.com` to `172.16.238.10`. New tenant, new subdomain, zero config. It just works.

Then start it as a background service:

```bash
sudo brew services start dnsmasq
```

`*.example.com` now resolves automatically.

## Why the wildcard fell over

At some point I got confused about where this config had gone and started the process of swapping everything back to `/etc/hosts` as a workaround. That's when I realized two things worth remembering.

First, the config was never lost. dnsmasq was still running, still holding the map. I'd just stopped resolving through it. Second, the target `172.16.238.10` is a Docker-internal address. That's fine while the container keeps the same IP, but if Docker ever recreates it and assigns a fresh one, the wildcard (or the `/etc/hosts` entries) go stale the same way.

## Going back to /etc/hosts

If I ever do fall back to `/etc/hosts`, here's the shape. No wildcard, so each subdomain gets its own line:

```
172.16.238.10   tenant-a.example.com   tenant-b.example.com
```

And macOS caches DNS hard, so after editing I need to flush it or the old answers stick:

```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

## Getting the wildcard back

When I want `*.example.com` again, it's one comment toggled and a restart. In `/opt/homebrew/etc/dnsmasq.conf`, uncomment the `address=` line (or add it back), then:

```bash
sudo brew services restart dnsmasq
```

Verify with:

```bash
dig foo.example.com @127.0.0.1
```

If it answers with `172.16.238.10` instead of NXDOMAIN, the wildcard is live again and every tenant subdomain resolves without touching a hosts file.

## Lessons

- `/etc/hosts` can't do wildcards. For tenant-per-subdomain apps, that's the whole reason dnsmasq earns its place.
- Homebrew dnsmasq on macOS keeps config in `/opt/homebrew/etc/dnsmasq.conf`, not a `dnsmasq.d/` directory.
- A single `address=/domain/ip` line is the entire wildcard. Comment it out and the map stops; uncomment and restart to bring it back.
- The Docker-internal IP target breaks on container recreation. Either pin the IP or be ready to update one line.
- After any `/etc/hosts` edit, flush the DNS cache or macOS ignores you.
