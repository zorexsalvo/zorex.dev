---
layout: post.njk
title: "My Raspberry Pi Homelab: A Self-Hosted Stack on a Shoestring"
date: 2026-07-24
published: 2026-07-24
tags:
  - homelab
  - selfhosting
  - casaos
  - raspberrypi
  - jellyfin
  - tailscale
  - docker
description: "Everything running on my RPi 4B inside CasaOS — Jellyfin, Deluge, Syncthing, Hermes Agent, Tailscale, and the glue that holds it together."
draft: false
---

I run my own infrastructure. No cloud subscriptions, no rented VPS, no vendor lock-in. Just a Raspberry Pi 4B sitting under my desk, humming along 24/7.

It does a surprising amount of work for a small single-board computer.

Here's what's running, how it all fits together, and what I've learned building a homelab on ARM.

## The Hardware

| Component | Spec |
|-----------|------|
| Board | Raspberry Pi 4B |
| RAM | 8 GB |
| Storage | 500 GB SSD (via USB 3.0) |
| OS | Debian 13 "Trixie" (64-bit) |
| Platform | CasaOS |
| Network | Tailscale over home ISP (no public IP) |

The SSD over USB 3.0 is the most important upgrade. SD cards degrade fast under constant write loads (Docker logs, databases, torrents). A USB SSD gives you proper endurance and way better I/O.

## CasaOS: The Dashboard

[CasaOS](https://casaos.io) is my starting point. It's a lightweight home server dashboard that runs on top of Docker. Think of it as a prettier, simpler alternative to Unraid or TrueNAS.

It gives me:

- **A web UI** to manage apps, storage, and system resources
- **One-click Docker app installs** for common services
- **Storage management** (mounting external drives, setting up shares)
- **System monitoring** (CPU, RAM, disk usage at a glance)

The killer feature for me is the app store. I don't need to write docker-compose files from scratch for every service. CasaOS has templates for Jellyfin, Syncthing, Deluge — the whole media stack. Click, configure, done.

But under the hood, it's still just Docker. CasaOS uses `docker-compose.yml` files stored in `/DATA/AppData/`. You can tweak them manually if the UI doesn't give you enough control.

## The Media Stack

This is the reason I built the homelab in the first place. I wanted my own Netflix.

### Jellyfin

[Jellyfin](https://jellyfin.org) is the media server. Open source, no subscriptions, no tracking. It serves my movie and TV show libraries to any device on the network.

The setup is straightforward:

```yaml
services:
  jellyfin:
    image: jellyfin/jellyfin
    container_name: jellyfin
    network_mode: host
    volumes:
      - /DATA/AppData/jellyfin/config:/config
      - /DATA/AppData/jellyfin/cache:/cache
      - /Media:/media
    devices:
      - /dev/dri:/dev/dri  # hardware transcoding
```

The `network_mode: host` is important. It lets Jellyfin broadcast DLNA on the LAN without port mapping headaches. And the `/dev/dri` mount enables hardware transcoding using the RPi's VideoCore GPU, which handles most formats without breaking a sweat.

### Deluge

Torrent downloading happens in [Deluge](http://deluge-torrent.org). It downloads to a watch directory, and a script organizes the files before moving them to the media library.

### Symlink-Based Organization

Here's where it gets interesting. I don't dump everything into one flat folder. The media library is structured so Jellyfin understands it:

```
/Media/
├── Movies/          <-- torrent download location
└── TV Shows/        <-- symlinks organized by show/season
```

For TV shows, I use symlinks. The actual files stay in a flat download directory, and I create symlinks in the Jellyfin-friendly structure (Show Name/Season XX/Episode files). This way:

- Deluge can keep seeding without file path conflicts
- Jellyfin gets a clean, scrapable library structure
- I don't double the storage space with copies

## Syncthing: The Sync Layer

[Syncthing](https://syncthing.net) syncs my Obsidian vault between my Mac and the Pi. It's a peer-to-peer file sync tool with no cloud middleman. Just two devices talking to each other directly.

The vault is my knowledge base. Meeting notes, draft blog posts, project docs, CFP submissions, random ideas. All synced in real time. I write on the Mac, it appears on the Pi within seconds.

Setup was simple: install Syncthing via CasaOS, add the vault folder, share the device ID with my Mac, done.

One gotcha: the Syncthing container runs as uid 1000, but Hermes Agent (another service) runs as uid 10000. When both containers write to the same vault folder, ownership metadata gets out of sync. The fix is simple: turn off "Sync Ownership" and enable "Ignore Permissions" in the Syncthing folder settings. The content syncs fine, and you avoid spurious conflict files.

## Hermes Agent

This is the newest addition. [Hermes Agent](https://hermes-agent.nousresearch.com) is an open source autonomous AI agent by Nous Research. It lives in a Docker container, connects to Discord, and does whatever I ask it to.

I covered the full setup in [another post](/posts/how-i-set-up-hermes-agent-on-a-raspberry-pi), but the short version is:

- It runs as a Discord bot (User Install, so I DM it directly)
- It uses DeepSeek V4 Flash via OpenCode-Go for the LLM backend
- It has access to my Obsidian vault for reading and writing notes
- It runs scheduled tasks (cron) for RSS monitoring and media management
- Its skills system lets me teach it workflows I use repeatedly

The Pi handles the agent loop and Discord connection with ease. The LLM calls are handled remotely by OpenCode-Go, so the Pi only needs around 200-400 MB RAM for the agent itself.

## Tailscale and Networking

My Pi is behind a regular home ISP connection with CGNAT. No public IPv4, no static IP. [Tailscale](https://tailscale.com) solves that.

Tailscale creates a WireGuard-based mesh network. Every device gets a private IP (100.x.y.z) that's reachable from any other device in the network, even through NAT. It just works.

```
┌──────┐    ┌──────────┐    ┌──────────┐
│ Mac  │────│ Tailscale │────│  RPi 4B  │
└──────┘    │ (Mesh VPN)│    ├──────────┤
             │           │    │ Jellyfin │
┌──────┐    │           │    │ Syncthing│
│Phone │────│           │    │ Hermes   │
└──────┘    └──────────┘    │ Deluge   │
                            └──────────┘
```

For services that need to be accessible from outside my network (like Jellyfin), I use **Tailscale Funnel**. It exposes a local port to the internet through Tailscale's edge servers, with TLS termination. My setup is:

1. Jellyfin listens on `localhost:8097`
2. Tailscale Funnel exposes a subdomain
3. Cloudflare proxies `tv.zorx.space` to the Tailscale Funnel endpoint

The chain looks like:

```
User → tv.zorx.space → Cloudflare (TLS, redirect) → Tailscale Funnel → Jellyfin
```

No open ports on my home router. No port forwarding. No dynamic DNS.

## What It Costs

Let me break down the actual running costs:

| Item                            | Cost                            |
| ------------------------------- | ------------------------------- |
| Raspberry Pi 4B 8GB             | ₱4,500 (one-time)               |
| 500 GB USB SSD                  | ₱3,500 (one-time)               |
| Electricity                     | ~₱170/month                     |
| Domains (zorx.space, zorex.dev) | ~₱1,140/year                    |
| LLM API (AI usage)              | ~₱115-285/month                 |
| **Total**                       | **~₱285-455/month**             |

That's less than a Netflix subscription for a full self-hosted stack with media serving, file sync, and an AI assistant.

## Lessons Learned

A few things I wish I knew when I started:

1. **Use an SSD, not an SD card.** This is the most common homelab advice for a reason. SD cards die fast under Docker workloads. A USB SSD costs more upfront but saves you from rebuilding your whole setup every 6 months.

2. **Don't chase CPU specs.** The RPi 4B's 4 Cortex-A72 cores are enough for everything I run. Jellyfin transcoding happens on the GPU. Hermes offloads computation to the cloud. File syncing is I/O bound. CPU is rarely the bottleneck.

3. **Tailscale is worth the hype.** It replaces port forwarding, dynamic DNS, VPN servers, and reverse proxies all at once. One install, one login, everything works.

4. **Document your setup.** CasaOS makes it easy to forget that your services are just Docker containers with configs. Write things down (or put them in your Obsidian vault) so you can rebuild from scratch if the SD card dies anyway.

5. **Over-provisioning RAM is fine.** 8 GB sounds tight for a server, but most services on ARM are lightweight. Jellyfin uses 300 MB idle. Syncthing uses 100 MB. Hermes uses 200-400 MB. I rarely cross 4 GB used.

## What's Next

The stack is stable, but there's always room to grow:

- **Offsite backup.** Right now everything lives on one SSD. I want to set up Borg backup to a friend's server or a cheap storage VPS.
- **Monitoring and alerts.** Uptime Kuma or Beszel for tracking service health and sending alerts when something goes down.
- **A Telegram gateway** for Hermes Agent as backup to Discord.
- **Home Assistant.** The next logical addition. Smart home control on the same Pi, with Tailscale access.

---

That's the lab. A single Raspberry Pi, some Docker containers, and a mesh VPN. No subscriptions, no data leaving my network unless I choose, no arbitrary limits.

If you've got an old Raspberry Pi gathering dust, pick one of these services and set it up. Start with Syncthing. Then add Jellyfin. Before you know it, you'll have a full homelab and wonder how you lived without it.
