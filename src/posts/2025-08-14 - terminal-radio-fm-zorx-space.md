---
layout: post.njk
title: "I Built a Terminal Radio You Can SSH Into"
date: 2025-08-14
published: 2025-08-14
tags: [python, ssh, terminal, radio, homelab]
description: "How I built fm.zorx.space — a terminal radio that streams music over SSH, no browser required."
draft: false
---

I built something silly this week: a terminal radio.

You SSH into it, pick a station, and music plays in your terminal. No browser, no app, no GUI. Just you, a shell, and some SomaFM streams.

```
ssh -T fm@zorx.space | mpg123 -q -
```

## How It Works

The whole thing is a single Python file — about 70 lines.

When you connect, it shows you a menu:

```
🎵 Welcome to fm.zorx.space 🎵

Commands: :next, :list, :quit, <channel:int>

1. DEF CON Radio
2. Drone Zone
3. Beat Blender
4. Underground 80s
5. Groove Salad
6. Lush
7. Bossa
8. In-Sound
```

Pick a number, and it streams the MP3 audio over stdout. The menu and messages go to stderr, so the audio pipe stays clean on the other end.

The commands are simple:

- **`:next`** — skip to the next station
- **`:list`** — show the station list again
- **`:quit`** — disconnect
- **`1`–`8`** — jump to a specific station

## The Code

Here's the core idea:

```python
import requests

def stream_station(url):
    with requests.get(url, stream=True) as r:
        for chunk in r.iter_content(chunk_size=4096):
            if chunk:
                sys.stdout.buffer.write(chunk)
                sys.stdout.buffer.flush()
```

The SSH server runs a restricted shell that executes `python3 main.py` on login. The script blocks stdin for commands and writes audio chunks to stdout. On the client side, `mpg123` reads that pipe and plays it.

The separation of streams is the clever part:

- **stdout** → raw MP3 audio data → piped to `mpg123`
- **stderr** → UI messages (menu, now playing, prompts)
- **stdin** → user commands (`:next`, `:quit`, etc.)

A thread listens for commands while the main thread streams audio, and a threading Event signals station changes.

## Why Not Just Use a Browser?

Because this is more fun. Also:

- It works over slow connections (audio only, no video)
- No ads, no JavaScript, no tracking
- It's a party trick — watching someone's face when music comes out of their terminal is worth the build time
- It's SSH. Everything is better over SSH.

## The Tech Stack

| Component | What |
|-----------|------|
| Language | Python 3 |
| Streaming | `requests.get(stream=True)` |
| Audio source | [SomaFM](https://somafm.com/) public streams |
| Transport | SSH (restricted shell) |
| Client | `mpg123` |
| Lines of code | ~70 |

The code's on GitHub if you want to build your own: [zorexsalvo/fm.zorx.space](https://github.com/zorexsalvo/fm.zorx.space)

Try it out. SSH into it. See if you can guess which station I leave it on most of the time. (Hint: it's Drone Zone.)
