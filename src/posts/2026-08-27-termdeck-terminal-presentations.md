---
layout: post.njk
title: "TermDeck: A Presentation in Your Terminal"
date: 2026-08-27
published: 2026-08-27
tags:
  - python
  - opensource
  - pypi
  - packaging
  - textual
  - tui
  - markdown
  - presentation
description: I built a terminal presentation tool to give a lightning-talk at PyCon Indonesia, then productionized it into a PyPI package.
draft: false
repo_link: "https://github.com/zorexsalvo/termdeck"
---

**TermDeck** is a terminal presentation tool. A deck is just a folder; each file in that folder is one slide. Drop in a Markdown file for a quick slide, or a Python file for a fully interactive one, and navigate with the arrow keys. It is built on [Textual](https://github.com/Textualize/textual).

Unlike the abstract "here is a tool" story, TermDeck has a messy, specific origin: it started as a live lightning-talk deck for PyCon Indonesia, one that could actually play music. This post covers that arc, from a personal talk deck to a published package, plus the flaws a release audit caught before and after publishing.

## The Idea

I was putting together a lightning talk and I wanted the slides to do something. Not a projector deck, not a static PDF. A slide with music buttons I could hit live in front of a room, chords and drumbeats, even a whole song progression. The presentation lives in my terminal, and I wanted it to play along with me.

That is not something a markdown slide renderer gives you. It dies at text. So the deck had to be able to contain real widgets, not just paragraphs.

The model I landed on: make a deck a folder of files. Each file is a slide, sorted by name, so slide order is explicit with numbered prefixes and zero config. Markdown files produce simple slides. Python files produce full Textual `Screen`s that can render anything, including a music pad. One rule of thumb:

> If a slide is text, write markdown. If a slide should do something, write Python.

## How It's Built

A tiny package split across two modules:

| Module | Role |
|---|---|
| `deck.py` | Loads a folder into slides. Markdown files become `Screen`s with a `Markdown` widget. Python files are imported and must expose a `Slide` class. Sorting happens here. |
| `app.py` | The Textual `App`. Pushes the first slide on mount, maps left/right arrows to slide changes, adds a `Header` and `Footer`. |
| `styles/default.tcss` | Default styling, overridable per deck. |

### Markdown slides

The easy path. Any `.md` file becomes a slide with a `Markdown` widget. Good for bullet-heavy slides, code dumps, and quick notes.

### Python slides

The flexible path. Any `.py` file becomes a full Textual `Screen`. It just has to expose a `Slide` class:

```python
from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Button

class Slide(Screen):
    def compose(self) -> ComposeResult:
        yield Button("Hello")
```

Once a slide is a Python `Screen`, the whole widget toolkit opens up. Which brings me back to the music pad. The deck I gave at PyCon Indonesia had a `p5_musicpad.py` slide that used `musicpy` to build an interactive pad: buttons for individual chords, a drumbeat that loops, and a `wholesong` button that plays a progression. Pressing a button while your slide is on screen plays the chord through a midi instrument. It is silly and it is fun and it would be impossible in a markdown-only tool.

That is the differentiator: most "terminal slides" tools render markdown only and dead-end at text. A TermDeck deck can end on a screen that actually does something. The interactive pad is what became the `[music]` extra today.

#### TermDeck is on PyPI now:

```bash
pip install termdeck
```
