---
layout: note.njk
title: "Building a Python Package with python -m build"
date: 2026-09-03
published: 2026-09-03
tags:
  - python
  - packaging
  - setuptools
  - build
description: "How to package a Python project with python -m build: build system, project metadata, and packages, plus a minimal pyproject.toml and the build/install/import workflow."
draft: false
---

# Building a Python Package with **python -m build**

## Overview

Packaging turns your Python code into an installable artifact (a wheel) that `pip` can install and any Python process can import. `python -m build` is the standard tool that produces this artifact from a `pyproject.toml`.

A package consists of three parts:

| Part | Role | Where |
|---|---|---|
| **Build system** | Declares the backend that assembles the artifact | `[build-system]` in `pyproject.toml` |
| **Project metadata** | Name, version, description, dependencies | `[project]` in `pyproject.toml` |
| **Packages** | The actual code you ship | Your module(s) |

## Terminology

A "package" is a **directory** containing an `__init__.py`. A single `.py` file is called a **module**:

- Module (one file) → `py_modules = ["foo"]`
- Package (a folder) → `packages = ["demo"]`

## Project layout

```
project/
├── pyproject.toml     # build config + metadata
└── demo/
    └── __init__.py    # your package code
```

## Configuration

```toml
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "demo"
version = "0.1.0"
requires-python = ">=3.8"

[tool.setuptools]
packages = ["demo"]
```

## Build workflow

```sh
python -m build                                  # produces dist/*.tar.gz + *.whl
pip install dist/demo-0.1.0-py3-none-any.whl     # install the wheel
```

```python
from demo import greet, add   # import anywhere after install
```

## Key point

A package is a folder with `__init__.py`. Install once, import anywhere.
