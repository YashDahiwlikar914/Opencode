# AGENTS.md

## Commands

- Requirements are Bun 1.3+ with `bun install` from repo root.
- `bun dev` runs the `packages/opencode` TUI. `bun dev <directory>` targets another repo and `bun dev .` targets this repo itself.
- `bun dev serve` starts the headless API on port 4096. `bun dev web` starts server plus web UI.
- `bun run --cwd packages/app dev` needs the API server already running. `bun run --cwd packages/desktop dev` runs Electron wrapping `packages/app`.
- Local binary is `./packages/opencode/script/build.ts --single`, output lands under `packages/opencode/dist/opencode-<platform>/bin/opencode`.
- Never run the TUI as a blocking command when inspection is needed. Use `tmux new-session -d -s opencode-dev 'bun dev'`, then `tmux capture-pane -pt opencode-dev`, then `tmux kill-session -t opencode-dev`.

## Structure

- `packages/opencode` holds core business logic, server, and CLI. TUI lives at `src/cli/cmd/tui` in SolidJS with opentui.
- `packages/app` holds shared web UI in SolidJS. `packages/desktop` is Electron wrapping `packages/app`. `packages/plugin` is the source for `@opencode-ai/plugin`.
- Public contract layering is Schema as leaf, Protocol for endpoint groups, Server for concrete hosting, Client for generated network APIs, `sdk-next` for the scoped in-process host.
- Keep runtime imports pointed one way from Schema toward Core and Protocol, then toward Server. Client runtime may use Schema and Protocol but never Core or Server. `sdk-next` composes Client, Core, and Server.
- Drizzle schema lives in `packages/core/src/**/*.sql.ts`. Migrations live in `packages/core` and are applied by core.

## Codegen

- After changing public Protocol or Server `HttpApi`, run `bun run generate` from `packages/client`. Never edit `src/generated` or `src/generated-effect` by hand. CI checks this with `bun run check:generated` and runs HttpApi exerciser gates with `bun run test:httpapi` from `packages/opencode`.
- Legacy JS SDK regenerates with `./packages/sdk/js/script/build.ts`. Full regeneration is `./script/generate.ts` from repo root. CI auto commits `chore: generate` on `dev` when output drifts.

## Verify

- Order is lint, then typecheck, then focused tests.
- Lint with `bun run lint` from root using oxlint in type-aware mode.
- Typecheck with `bun typecheck` from root for every package, or `bun typecheck` inside one package directory. Never call `tsc` directly.
- Tests never run from repo root. The root `bun test` guard fails on purpose.
- Focused examples are `bun test --timeout 30000 --only-failures` in `packages/opencode`, `bun test --only-failures` in `packages/core`, and `bun --cwd packages/app test:e2e:local` for web e2e with Playwright browsers installed.

## Workflow

- Default branch is `dev`. Local `main` may not exist, so diff against `dev` or `origin/dev`.
- Branch names stay short, at most three hyphenated words, with no slashes or type prefixes. Examples are `session-recovery` and `regenerate-sdk`.
- Commit and PR titles use conventional `type(scope): summary` with types `feat`, `fix`, `docs`, `chore`, `refactor`, and `test`. Scope is the affected package when helpful.
- Open an issue before a PR and link it with `Fixes #123`. Automation enforces title format, PR template sections, and linked issues for `fix`, `chore`, and `test`.
- UI PRs show before and after screenshots or video. Logic PRs state what was tested and how a reviewer reproduces it. Keep descriptions short and avoid generated walls of text.

## Style

- Follow `CONTRIBUTING.md` style preferences plus the rules below. Keep logic in one function unless reuse is real. Inline single-use values. Prefer `const`, early returns, no `else`, no `try`/`catch`, and functional array methods.
- Never use `any`. Rely on inference and use `Bun.file()` where it fits.
- Never alias imports and never use star imports. Import the module projected namespace by name, then use dotted access. Keep heavy imports dynamic and branch-local in startup paths.
- Use snake_case Drizzle fields so column names need no string overrides.
- Before touching `packages/opencode/src` or `packages/core/src`, read `packages/opencode/AGENTS.md` for module shape with flat exports plus self-reexport, no barrel files in multi-sibling directories, `Effect.gen` and `Effect.fn` usage, `makeRuntime` versus per-directory `InstanceState`, Effect v4 `forkIn` instead of removed fork APIs, and preferred Effect platform services.

## Session V2

- For session execution, context, or prompt lifecycle changes, read `CONTEXT.md` then `specs/v2/session.md` first. Do not invent a second execution identity or route execution by anything except Session ID through store plus location.
- Keep durable prompt admission separate from model execution. Keep execution process-global and Location-scoped. Keep one explicit `llm.stream(request)` per provider turn and reload projected history before continuation. Keep steering versus queued delivery vocabulary explicit.

## Pointers

- Product and contribution flow lives in `CONTRIBUTING.md`.
- Effect and module conventions live in `packages/opencode/AGENTS.md`.
- Session and context vocabulary lives in `CONTEXT.md` with behavior in `specs/v2/`.
