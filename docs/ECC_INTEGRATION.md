# ECC Integration

BlueLearnerHub includes a project-local ECC integration for Codex-oriented
agent workflows.

## Installed Surface

- `AGENTS.md`: BlueLearnerHub-specific agent guidance.
- `.codex/config.toml`: project-local Codex settings, profiles, MCP server declarations, and multi-agent role wiring.
- `.codex/AGENTS.md`: Codex-specific ECC notes for this repo.
- `.codex/agents/*.toml`: read-only explorer, reviewer, and docs-researcher role configs.
- `.agents/skills/*`: existing project design skills plus ECC workflow skills copied from `D:\ecc\.agents\skills`.

## Source

ECC source checkout:

```text
D:\ecc
```

Integrated ECC package version:

```text
ecc-universal 2.0.0
```

## Intentional Choices

- The global ECC installer was not applied. No files were written to `~/.codex`, `~/.claude`, or other user-level harness directories.
- The Codex plugin marketplace path was not copied because ECC documents plugin mode as fragile for Codex; the project-local skill sync is the reliable path.
- Claude-style hooks were not installed. Treat ECC hook guidance as policy text unless a native hook system is explicitly configured later.
- The upstream macOS notification command was removed from `.codex/config.toml` so the config remains portable on this Windows workspace.

## Verification

The project-local Codex TOML was parsed successfully with the ECC package TOML parser:

```powershell
node -e "const toml=require('D:/ecc/node_modules/@iarna/toml'); const fs=require('fs'); toml.parse(fs.readFileSync('.codex/config.toml','utf8')); console.log('codex config toml ok')"
```

Codex may need a new session or workspace reload before newly copied skills are
listed by the harness.
