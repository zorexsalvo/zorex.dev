---
layout: post.njk
title: "Quickcast, Building and Publishing a Radial-Menu Terminal App"
date: 2026-08-26
published: 2026-08-26
tags:
  - python
  - opensource
  - pypi
  - packaging
  - textual
  - tui
  - cli
  - asyncio
description: "Building quickcast, a BG3-inspired radial-menu terminal UI for firing off shell commands, then taking it from scratch to a PyPI-ready package."
draft: false
---

**Quickcast** is a radial-menu terminal application for executing shell scripts ("spells") configured via a TOML dotfile. The gimmick is the interface: instead of a plain list, commands are arranged in a radial ring around a center hub, a nod to Baldur's Gate's quick spell menu.

This post covers the whole arc: what the app does, how it's built, and the work of taking it from an un-versioned directory to a clean, verifiable PyPI-ready package.

## The Idea

A terminal is full of commands you run over and over: `git status`, `df -h`, `top -l 1`, pinging a server. These are my "spells." Quickcast lets me bind each one to a slot on a radial menu and fire it off, with a mouse click or a keyboard press, without ever leaving the terminal.

Spells live in a TOML file, so adding one is just editing config:

```toml
[spell.git_status]
name = "Git Status"
command = "git status"
description = "Check repository status"
icon = "📊"

[spell.disk_usage]
name = "Disk Usage"
command = "df -h"
description = "Show disk usage"
icon = "💾"
```

The config is read from `~/.quickcastrc` first, falling back to `~/.config/quickcast/spells.toml`.

## How It's Built

It's a Textual app (`app.py`) with a clean split of responsibilities:

| Module | Role |
|--------|------|
| `spell.py` | The `Spell` data model, a `dataclass` carrying `id`, `name`, `command`, optional `description`/`icon`, and a `tui` flag |
| `config.py` | TOML loading + validation. Reads the dotfile, validates required `name`/`command` fields, builds `Spell` objects |
| `executor.py` | Async command execution with real-time output streaming (`create_subprocess_shell` + line-by-line `readline`) |
| `widgets/radial_menu.py` | The centerpiece, a BG3-style radial ring **drawn as a Rich canvas** rather than a grid of buttons, with pages of 8 spells and a BG3-inspired palette |
| `widgets/output.py` | Floating overlay that shows command output in real time |
| `app.py` | Ties it together, key bindings, paging, and spell execution |

### The radial menu

The menu is the interesting part. Rather than arranging Button widgets, it draws the ring as a Rich text canvas that scales with the terminal. Spells sit around a center "hub," and you navigate with arrow keys / WASD, paginate with `[` and `]`, and cast with Enter/Space. The color palette is straight out of a fantasy game UI, deep indigo background, gold for the active slot, violet for the hub.

### Execution

Two execution paths exist:

- **Normal spells** stream output into the overlay in real time via `asyncio`.
- **TUI spells** (`tui: true`) hand the whole terminal over to the child command with `self.suspend()`, then resume Quickcast when the child exits, perfect for spawning full-screen tools like `vim` or `htop`.

Errors are wrapped in an `ExecutionError` and surfaced in the overlay, not as a crash.

## Taking It to PyPI

The code was in good shape, but I'd never audited it against PyPI's requirements. So I went through it like a release engineer.

### What was already solid

- Standard **hatchling** build config in `pyproject.toml`
- Proper `src/` layout, the wheel bundles the `widgets/` subpackage
- A valid `[project.scripts]` entry point: `quickcast = "quickcast.app:main"`
- A real test suite (`test_config.py`, `test_executor.py`)

### The blockers

1. **Placeholder author metadata.** `name = "Quickcast Contributors"` and `email = "dev@example.com"`. PyPI flags fake emails. Swapped for my GitHub identity with a noreply address.
2. **No git repository, no URLs.** The project wasn't version-controlled and had no `[project.urls]` (what PyPI renders as Homepage/Repository links). Ran `git init` and added the URL block.
3. **README placeholder.** The install-from-source section had an untemplated `<repo-url>` that would render broken on PyPI. Replaced with the real URL.
4. **A dead relative link.** The README linked to `RADIAL_MENU_DEMO.txt` relatively. That works on GitHub but dies on PyPI. Pointed it at the GitHub blob URL so it resolves everywhere.

### The warnings

- **License format.** `license = {text = "MIT"}` is the deprecated form; switched to the modern SPDX `license = "MIT"`.
- **A dead-weight dependency.** `requires-python` is `>=3.11`, so `tomllib` is always available, yet `config.py` still had a `tomli` fallback for older Pythons. Removed both the dependency and the fallback (plus an unused `sys` import).

## The Verify

Golden rule: don't claim it works, prove it. I made a throwaway venv, installed `build` and `twine`, then:

```bash
python -m build
twine check dist/*
```

Both the sdist and the wheel came back **PASSED**. I inspected the wheel and confirmed it actually contained the `widgets/` subpackage and the `quickcast` console-script entry point. And all 9 tests still pass after the `config.py` change.

## The Naming Fix

Right before publishing, I caught a naming issue. The distribution name was `quickcast-tui`, but the import package (`src/quickcast/`), the module imports, and the console script were already `quickcast`. That split is confusing and gets baked into the PyPI URL and `pip install` command. So I decided the project should simply be called **quickcast**.

I checked whether the name was free on PyPI by hitting the JSON API, `https://pypi.org/pypi/quickcast/json`, which returned a **404** (the standard way to confirm a name is unclaimed). It was available, so I took it.

The rename was small because the code was already right:

- `pyproject.toml` `name = "quickcast-tui"` became `name = "quickcast"`. This is the only place the distribution name lives.
- Everything import/entry-point related already used `quickcast`, so no code renames were needed.
- I normalized the display/product name from "Quickcast TUI" to "Quickcast" across the README, `GETTING_STARTED.md`, `examples/spells.toml`, and module docstrings.
- The GitHub repo (`zorexsalvo/quickcast-tui`) and its URLs stayed as-is.

A helpful habit: verify the name on PyPI *before* investing in the packaging work, and keep the distribution name consistent with the import package from day one. A 404 from the JSON API is the quickest sanity check there is.

## The Commits

With everything verified, I committed the work in two steps on `main`:

- `f52656a`: the initial commit (16 files), the project plus all the PyPI packaging fixes.
- `8e12dd1`: the rename of the distribution to `quickcast`.

Both `python -m build` and `twine check dist/*` PASS on the final state, producing `quickcast-0.1.0`. It's still a local repo, so the last mile is pushing to the remote and running `twine upload`.

## What I Learned

1. **PyPI cares about metadata as much as code.** A fake email or missing URL block will bite you at upload time, even when the code builds fine.

2. **The deprecated-license trap.** `license = {text = "..."}` works but is legacy; SPDX is the current idiom, and `twine check` keeps flagging the old form.

3. **README links need absolute URLs.** A relative link to a repo file is fine on GitHub but silently dies on PyPI. Point at the blob URL instead.

4. **Dead dependencies hide in fallbacks.** A `tomli` fallback for Python < 3.11 is meaningless when your floor is already 3.11. Trim the dead branches.

5. **`twine check` is your friend.** Build it, check it, inspect the wheel contents. A few minutes of verification beats a broken release.

6. **Async + streaming makes a TUI feel alive.** Feeding command output into the overlay line-by-line via asyncio is what turns a menu into a real tool, and `self.suspend()` cleanly hands the terminal to full-screen children.

---

It's a small project, but the pattern holds: understand the architecture, make it releaseable, and verify before you claim done. The discipline of walking the whole checklist, not assuming it's fine because it's "just a TUI", is the part worth keeping.
