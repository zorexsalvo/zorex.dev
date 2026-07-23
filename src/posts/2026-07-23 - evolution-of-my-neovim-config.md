---
layout: post.njk
title: The Evolution of My Neovim Config
date: 2026-07-23
published: 2026-07-23
tags:
  - neovim
  - vim
  - editor
  - config
  - lua
description: Two and a half years of tinkering. From Packer to Lazy.nvim, from init.vim to a lean Lua config.
draft: false
---

I've been tweaking my Neovim config for over two and a half years now. It started as a simple experiment and turned into a 39-commit journey through plugin managers, colorschemes, and LSP setups.

Here's the timeline.

## Phase 1: Packer Era (Dec 2023)

The first commit was December 10, 2023. Back then, **Packer** was the plugin manager of choice. My config was a mix of Vimscript and Lua:

```
init.vim          → lua require('plugins')
lua/
├── plugins.lua   → Packer startup function
├── telescope.lua
├── tree.lua
└── zorx/
    ├── color.lua
    └── remap.lua
plugin/
└── packer_compiled.lua
```

The entry point was `init.vim` with just one line calling into Lua. Packer managed everything in a single `startup()` block with Telescope, nvim-tree, Harpoon, and a Dracula theme.

Classic 2023 Neovim setup. It worked, but it wasn't pretty.

## Phase 2: Plugin Hoarding (Dec 2023 – Apr 2024)

Over the next few months, I kept adding:

- **LSP-zero** to avoid setting up LSP manually
- **Copilot** for AI completions
- **Vim-fugitive** for Git integration
- **Nerdcommenter** for easy commenting
- **Statusline** because the default looks bare
- **Kanagawa and Catppuccin** (yes, I switched themes more than once)

At this point, the config was functional but messy. Everything was in one big Packer block, and loading times were starting to hurt.

## Phase 3: The Migration (Packer to Lazy.nvim, Jun 2025)

June 19, 2025 was the big day. **Packer was deprecated**, and Lazy.nvim had become the standard. I bit the bullet and migrated.

The changes were significant:

- `init.vim` → `init.lua` (full Lua migration)
- One big Packer block → modular plugin files in `lua/plugins/`
- Lazy loading per plugin (load on keymap, command, or filetype)
- `lua/config/` for structured setup

The structure became:

```
init.lua           → require("config.lazy"), require("config.lsp")
lua/
├── config/
│   ├── lazy.lua   → Lazy.nvim bootstrap
│   └── lsp.lua    → LSP config
└── plugins/
    ├── chat.lua
    ├── colorscheme.lua
    ├── copilot.lua
    ├── fugitive.lua
    ├── harpoon.lua
    ├── indent.lua
    ├── lsp.lua
    ├── plugins.lua
    ├── scope.lua
    ├── statusline.lua
    └── which-key.lua
```

Each plugin got its own file with its own `opts` and lazy loading config. Clean, modular, easy to maintain.

## Phase 4: Simplification (Oct 2025 – May 2026)

After the migration, I kept refining:

- **CopilotChat.nvim** for inline AI chat
- **Ruff LSP** for Python linting
- **Which-key** for keymap discovery
- Various colorscheme experiments (Tokyo Night, Catppuccin)

The May 8, 2026 commit was titled *"refactor: simplify nvim config."* That's the natural end state of every Neovim config journey. You start by adding everything, then slowly realize less is more.

## Phase 5: The Category Reorganization (Jul 2026)

And then I did another pass. The most recent commits restructured everything again:

**Plugins reorganized by category:**

```
lua/plugins/
├── chat.lua          → AI chat plugins
├── coding.lua        → coding assistance
├── colorscheme.lua   → themes
├── completion.lua    → autocompletion
├── editor.lua        → editor enhancements
├── git.lua           → Git integration
├── navigation.lua    → file navigation
├── syntax.lua        → syntax highlighting
├── ui.lua            → UI improvements
└── ...individual file for harpoon, fugitive, etc.
```

**LSP modularized:**

```
lua/config/
├── lsp.lua           → core LSP setup
├── lsp-servers.lua   → per-server configs
├── lualine.lua       → statusline
└── ruff.lua          → Python linting
```

**New addition:**

```
lua/utils/            → shared utility functions
```

The README also got a full rewrite with documentation for each module. A sign that the config had matured enough to explain itself to future visitors.

## What I Learned

1. **Start with Lazy.nvim.** If you're setting up Neovim today, don't bother with anything else. It's faster, better documented, and lazy loading is built-in.

2. **Modular over monolithic.** One file per plugin is easier to debug than one massive startup block. You can comment out a whole file instead of hunting for the right lines.

3. **You don't need most plugins.** I started with 15+ plugins. I probably use 5 regularly. The rest are there "just in case."

4. **Config drift is real.** Over two years, you'll switch themes at least three times. Embrace it.

5. **`init.vim` → `init.lua` is worth the migration.** Full Lua configs are faster and more readable. The migration is a weekend project that pays off every time you open a file.

---

The full config is on GitHub if you want to peek: [zorexsalvo/nvim-config](https://github.com/zorexsalvo/nvim-config)

It's nothing special. But it's mine.
