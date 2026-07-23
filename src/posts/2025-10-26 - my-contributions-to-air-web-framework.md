---
layout: post.njk
title: "My Contributions to the Air Web Framework"
date: 2025-10-26
published: 2025-10-26
tags: [python, opensource, air, pycon, sprints, django]
description: "How I contributed to the Air web framework during PyCon Davao 2025 — and became an early contributor before the sprint even started."
draft: false
---

During PyCon Davao 2025, I didn't just contribute to pandas. I also made several contributions to **Air**, the AI-first Python web framework by **Daniel Roy Greenfeld and Audrey Roy Greenfeld** (the authors of *Two Scoops of Django*).

Both Daniel and Audrey were keynote speakers and sprint leads at PyCon Davao 2025. They noted that I was an **early contributor** — some of my PRs were submitted before the sprint even started.

## The Framework

[Air](https://airwebframework.org/) is described as "the first web framework designed for AI to write." It's a Python web framework built with comprehensive docstrings and predictable patterns so that AI coding assistants can generate reliable code with it. It's early-stage but already has 900+ stars on GitHub.

The project is also notably **built in the Philippines** — the website lists Manila, Davao, and Baguio as development cities.

## My PRs

I submitted 5 pull requests in total, 3 of which were merged:

### Merged

**#527 — docs(requests): add usage and recipes for requests.Request**
*Oct 5, 2025 | +68/-5 | 1 review approval*

Added dedicated documentation for `air.requests.Request`. This was my first PR to the project — submitted weeks before PyCon Davao.

**#683 — docs: Update badges and improve index.md formatting**
*Oct 26, 2025 | +86/-13 | 1 review approval*

Fixed the README badges and formatting. Submitted on the sprint day itself.

**#705 — chore: enable PLC rules and update files that break it**
*Oct 26–27, 2025 | +23/-36 across 8 files | Merged with review*

Enabled Pylint Convention (PLC) rules in Ruff and fixed the 8 files that violated them. A proper lint enforcement PR — find the issues, fix them, turn on the rules.

### Not Merged (but still meaningful)

**#544 — feat(lint): add spell-check for documentation**
*Oct 9, 2025 | +62/-12 across 12 files*

Added codespell as a spell-checker for documentation files. Wasn't merged but got 9 comments and meaningful discussion.

**#606 — Skip codecov upload step if token is unset**
*Oct 22, 2025 | +4/-1 | CI fix*

A small fix to prevent CI failures on forked repos where Codecov tokens aren't available.

## The Sprint Experience

At PyCon Davao, Daniel Roy Greenfeld was giving a talk about Air. During the sprint, he was mentoring contributors directly. Since I'd already submitted PRs before the conference, I had a head start — I knew the codebase, the PR workflow, and the linting setup.

That's probably why he called me out as an early contributor. I wasn't just showing up at the sprint cold — I'd already been poking at the project for weeks.

## What I Learned

1. **Submit PRs before the sprint.** Showing up with existing contributions means you can spend the sprint on harder problems instead of figuring out how to clone the repo.

2. **Documentation PRs are a great entry point.** My first two PRs (#527 and #683) were docs-only. They're low-risk for maintainers and teach you the project's conventions.

3. **Lint enforcement PRs scale well.** #705 touched 8 files but was one logical change — turn on a rule, fix the violations. Clear scope, easy to review.

4. **Not every PR needs to merge.** #544 didn't get merged, but I learned about codespell, got feedback from maintainers, and contributed to the discussion. That's still a win.

---

Two open source projects in one conference weekend — pandas and Air. Not bad for a couple of days in Davao.
