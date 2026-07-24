---
layout: post.njk
title: "My First Contribution to pandas (and how it happened at PyCon Davao)"
date: 2025-10-26
published: 2025-10-26
tags: [python, opensource, pandas, pycon, sprints]
description: How I made my first contribution to pandas during a sprint at PyCon Davao 2025, adding strict=True to zip() and learning that even the "easy" issues have nuance.
draft: false
---


It was **October 26, 2025**, the sprint day of PyCon Davao. I was sitting in the sprint room, staring at the pandas repository.

If you've ever been to a PyCon sprint, you know the feeling. Here's this massive open source project, used by millions of data scientists and engineers worldwide, and you're supposed to *contribute* to it? In *one afternoon*?

I'd heard of pandas (who hasn't?), but contributing to it? That felt like walking into a different league entirely.

### Finding the Issue

Sprint lead **Kevin Amparado (@KevsterAmp)** pointed us toward issues tagged with "good first issue" and "help wanted." One caught my eye:

**[Issue #62434](https://github.com/pandas-dev/pandas/issues/62434): Enforce Ruff rule B905, zip-without-explicit-strict**

The ask was simple on paper: go through the test files in `pandas/tests/window` and add `strict=True` to every `zip()` call that didn't have it.

In Python 3.10+, `zip()` accepts a `strict` parameter:

```python
# Without strict — silently truncates if lengths differ
for a, b in zip(list_a, list_b):
    ...

# With strict=True — raises ValueError if lengths differ
for a, b in zip(list_a, list_b, strict=True):
    ...
```

Without `strict=True`, if your lists accidentally have different lengths, `zip()` silently drops the extra elements. That's the kind of bug that passes tests, ships to production, and takes hours to track down.

Seemed straightforward. Fork. Edit. PR. Done.

### Except it wasn't that simple

I opened **[PR #62852](https://github.com/pandas-dev/pandas/pull/62852)** with 12 additions and 12 deletions across 4 files. The easy ones got `strict=True`. But three test functions had `zip()` calls where the iterables were legitimately different lengths; that was the *point* of the test:

```python
# Some tests deliberately zip mismatched-length iterables
for expected, actual in zip(expecteds, df.rolling(window), strict=False):
```

So I set those to `strict=False` instead.

Then **mroeschke**, a pandas maintainer, reviewed the PR with the exact right question:

> *"Why is this False?"*

And in another file:

> *"Shouldn't all these be `strict=True`?"*

Fair question. If you're enforcing a rule called "use strict zip," why would *any* of them be `False`?

I explained:

> *"Some of the parametrize cases have mismatched lengths; when run with `strict=True`, they consistently raise `ValueError: zip() argument 2 is shorter than argument 1`."*

I linked to a specific test case where the parametrized inputs were intentionally uneven. After checking, mroeschke replied:

> *"I see. Thanks for highlighting."*

And merged it.

That exchange was the real learning moment. A static analysis rule like B905 isn't a mindless edict; it forces you to think about each call site and decide: *do I expect these to match?* The answer isn't always "yes," and that's okay. What matters is that you're explicit about it.

### By the numbers

| Metric | Value |
|--------|-------|
| Files changed | 4 |
| Lines added | 12 |
| Lines deleted | 12 |
| Commits | 3 |
| CI checks | 42 |
| Review comments | 7 |
| Force pushes | 2 |
| Days from open to merge | 3 |
| Merged by | [@mroeschke](https://github.com/mroeschke) |

The fourth file wasn't test code at all; it was `pyproject.toml`. By fixing the `zip()` calls in those test files, I also removed their entries from the B905 exclusion list. Three lines deleted from the ignore rules. Small, but satisfying.

### What I learned

1. **Sprints are the best entry point.** The mentors, the pre-tagged issues, and the room full of people doing the same thing — it lowers the barrier enormously. Without PyCon Davao's sprint day, I probably wouldn't have taken the first step.

2. **"Easy" issues still require thought.** Adding `strict=True` sounds mechanical, but the review caught nuance I almost glossed over. The maintainer's question, "Why is this False?", is exactly the kind of rigor that keeps pandas solid.

3. **`strict=True` should be your default.** I add it to every `zip()` I write now. If you're not using it, you're silently accepting a class of bugs that are hard to reproduce and harder to debug.

4. **Maintainers appreciate good-faith contributions.** Mroeschke didn't just review the code; they engaged with the reasoning. That's the kind of interaction that makes open source worth contributing to.

### What's next

One PR down. One of the biggest projects in the Python ecosystem, and I've got a commit in it. The bar for "I can contribute to this" has been permanently lowered.

If you're at a conference with a sprint day: go. Pick an issue. Make the change. Ship it. The worst that happens is you learn something. The best? You get a green merge button from one of the most respected projects in the language.

---

*Thanks to sprint lead **Kevin Amparado (@KevsterAmp)**, the PyCon Davao 2025 sprint organizers, the pandas maintainers (especially @mroeschke), and everyone who made the sprint welcoming for first-time contributors.*
