# Skill Trigger Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every skill in ~/.agents/skills load reliably via core discovery and trigger correctly via the skill tool, then safely promote the fork at Projects/Opencode from temporary symlink to sole installed opencode.

**Architecture:** Three-layer fix. Discovery adds ~/.agents/skills as a native DirectorySource so core and harness agree on the catalog. Guidance at packages/core/src/skill/guidance.ts renders that catalog into system context. Trigger fixes frontmatter descriptions to the Use when contract so the model calls packages/core/src/tool/skill.ts when intent matches. Verification uses evaluating-skills benchmarks before and after.

**Tech Stack:** Opencode core Effect services SkillV2, SkillDiscovery, SkillGuidance, Config, plugin system, Bun build, ~/.agents/skills catalog with 31 skills, ~/.local/share/opencode data dir.

**Spec:** User report that skills are not getting triggered properly. Fork at Projects/Opencode built to packages/opencode/dist/opencode-linux-x64/bin/opencode with symlinks at ~/.opencode/bin/opencode and ~/.local/bin/opencode, official kept as ~/.opencode/bin/opencode-official for testing. No additional spec file exists.

## Global Constraints

- Discovery must not break existing skill/skills subfolders under each config directory and explicit skills entries in opencode.json per packages/core/src/config/plugin/skill.ts.
- Share path ~/.local/share/opencode/opencode.db between official and fork during testing, but verify no contention after cutover.
- Keep ~/.agents/skills as single source of truth for 31 skills. Do not duplicate into ~/.config/opencode/skills.
- Build required after any change under packages/core/src/skill or packages/core/src/config/plugin/skill.

---

## File Structure

- packages/core/src/config/plugin/skill.ts - add default DirectorySource for ~/.agents/skills
- packages/core/src/skill.ts - read for cache behavior and discovery
- packages/core/src/skill/guidance.ts - verify available filtering
- ~/.agents/skills/*/SKILL.md - frontmatter description fixes only
- Projects/Opencode/docs/superpowers/plans/2026-08-20-skill-trigger-reliability.md - this plan
- ~/.agents/skills/evaluating-skills workspace iterations - benchmark outputs

---

### Task 1: Prove discovery gap and symlink health

**Files:**
- Read: ~/.opencode/bin/opencode symlink, ~/.local/bin/opencode symlink, packages/core/src/config/plugin/skill.ts, packages/core/src/skill.ts, ~/.config/opencode/opencode.json, ~/.local/share/opencode/log/opencode.log
- Test: manual diagnostic

**Interfaces:**
- Consumes: live fork PID and build at packages/opencode/dist/opencode-linux-x64/bin/opencode
- Produces: finding that core sources do not include ~/.agents/skills, gates Task 2

- [ ] **Step 1: Inspect symlink targets**
Run: `readlink -f ~/.opencode/bin/opencode && readlink -f ~/.local/bin/opencode && opencode --version`
Expected: both resolve to Projects/Opencode/packages/opencode/dist/opencode-linux-x64/bin/opencode and version 0.0.0-dev

- [ ] **Step 2: Dump core SkillV2 sources**
Diagnostic via SkillV2.Service.sources() and list count
Expected: sources list shows only ~/.config/opencode/skill and ~/.config/opencode/skills, count 0 or 1, proving gap

- [ ] **Step 3: Check log for skill permission**
Run: `grep -i skill ~/.local/share/opencode/log/opencode.log | tail`
Expected: permission allow entries but no skill_content loads for ~/.agents/skills names

- [ ] **Step 4: Record finding**
Finding gates Task 2

### Task 2: Add fork-native discovery for ~/.agents/skills

**Files:**
- Modify: packages/core/src/config/plugin/skill.ts:18-42
- Read: packages/core/src/global.ts for global.home
- Test: rebuild and diagnostic

**Interfaces:**
- Consumes: Task 1 finding
- Produces: SkillV2.list returns 31 skills

- [ ] **Step 1: Edit ConfigSkillPlugin to add default source**
```ts
draft.source(
  SkillV2.DirectorySource.make({
    type: "directory",
    path: AbsolutePath.make(path.join(global.home, ".agents/skills")),
  }),
)
```

- [ ] **Step 2: Rebuild fork**
Run: `bun run script/build.ts --single` in packages/opencode
Expected: dist/opencode-linux-x64/bin/opencode updated, version bumped

- [ ] **Step 3: Restart and re-measure**
Restart opencode, re-run Task 1 diagnostic
Expected: sources include directory:/home/yash/.agents/skills and count 32

- [ ] **Step 4: Commit**
```bash
git add packages/core/src/config/plugin/skill.ts
git commit -m "fix(core): discover ~/.agents/skills by default"
```

### Task 3: Baseline trigger measurement

**Files:**
- Create: workspace iteration eval.json
- Read: ~/.agents/skills/evaluating-skills/scripts/run_eval.py
- Test: benchmark json

**Interfaces:**
- Consumes: 31 skills discoverable
- Produces: baseline benchmark

- [ ] **Step 1: Build eval set**
20 prompts per skill for brainstorming, systematic-debugging, clarifying-requirements, using-superpowers. Include should_trigger true/false, small tasks, indirect wording, typos.

- [ ] **Step 2: Validate frontmatter**
Run: `python ~/.agents/skills/evaluating-skills/scripts/quick_validate.py ~/.agents/skills/<name>`
Expected: pass

- [ ] **Step 3: Run current candidate 3 times**
Run evaluating-skills scripts, note Opencode native fallback

- [ ] **Step 4: Aggregate**
Run aggregate_benchmark

### Task 4: Audit descriptions for optimization debt

**Files:**
- Read: ~/.agents/skills/*/SKILL.md frontmatter
- Test: audit table

**Interfaces:**
- Consumes: benchmark
- Produces: flagged list

- [ ] **Step 1: Flag workflow summaries**
Search descriptions that copy body workflow

- [ ] **Step 2: Check length and keyword coverage**
Flag over 500 target, missing Use when

- [ ] **Step 3: Map neighbour collisions**
Compare clarifying-requirements vs brainstorming

- [ ] **Step 4: Output audit table**
Pipe table with Skill, Flag Reason, Colliding Skill

### Task 5: Rewrite descriptions to Use when contract and retest

**Files:**
- Modify: ~/.agents/skills/*/SKILL.md frontmatter only
- Read: ~/.agents/skills/writing-skills/SKILL.md SDO
- Test: quick_validate plus held-out benchmark

**Interfaces:**
- Consumes: audit table
- Produces: optimized descriptions

- [ ] **Step 1: Rewrite example skill**
Fix ponytail argument-hint moved to metadata

- [ ] **Step 2: Rewrite remaining flagged**
Keep under 1024 targeting under 500

- [ ] **Step 3: Hold out 20% eval set**
Never show held-out to rewrite

- [ ] **Step 4: Rerun benchmark on held-out**

- [ ] **Step 5: Commit**

### Task 6: End-to-end invocation check

**Files:**
- Read: packages/core/src/tool/skill.ts:35, packages/core/src/skill/guidance.ts:23
- Test: transcript checks

**Interfaces:**
- Consumes: optimized descriptions
- Produces: transcript evidence

- [ ] **Step 1: Replay should-trigger prompts**
Assert skill_content blocks

- [ ] **Step 2: Replay near-miss**
Assert no skill call

- [ ] **Step 3: Test co-trigger**
pdf plus web-scraping

- [ ] **Step 4: Check guidance update**
Available skills changed message

### Task 7: Safe cutover from temporary symlink to fork as main

**Files:**
- Modify: symlinks ~/.opencode/bin/opencode, ~/.local/bin/opencode
- Read: build output, DB files
- Test: restart checks

**Interfaces:**
- Consumes: passing benchmarks
- Produces: fork is sole opencode

- [ ] **Step 1: Gate on Task 6**
Do not proceed if benchmark failed

- [ ] **Step 2: Fresh rebuild and install**
Verify symlinks

- [ ] **Step 3: Remove original**
Backup then delete ~/.opencode/bin/opencode-official

- [ ] **Step 4: Post-cutover verification**
Assert 31 skills and version after reboot

- [ ] **Step 5: Document**
Note in AGENTS.md that fork is now main
