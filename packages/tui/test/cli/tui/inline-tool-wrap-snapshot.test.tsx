import { afterEach, describe, expect, test } from "bun:test"
import { createMemo, createSignal, For, Show } from "solid-js"
import type { BoxRenderable, ScrollBoxRenderable } from "@opentui/core"
import { testRender, type JSX } from "@opentui/solid"
import {
  formatCompletedSubagentDetail,
  formatSubagentRetry,
  formatSubagentTitle,
  formatSubagentToolcalls,
  InlineToolRow,
  parseApplyPatchFiles,
  parseDiagnostics,
  parseQuestionAnswers,
  parseQuestions,
  parseTodos,
  alwaysSeparate,
  skillName,
  toolDisplay,
} from "../../../src/routes/session"
import { Locale } from "../../../src/util/locale"

let testSetup: Awaited<ReturnType<typeof testRender>> | undefined

afterEach(() => {
  testSetup?.renderer.destroy()
  testSetup = undefined
})

type ToolFixture = { icon: string; label: string; error?: string }

const tools: readonly ToolFixture[] = [
  {
    icon: "✱",
    label:
      'Grep "OPENCODE.*DB|database|sqlite|drizzle|dev.*db|data.*dir|xdg|APPDATA" in packages/opencode/src (151 matches)',
  },
  {
    icon: "✱",
    label: 'Glob "**/*db*" in packages/opencode (6 matches)',
  },
  {
    icon: "→",
    label: "Read packages/opencode/src/storage/db.ts [offset=1, limit=130]",
  },
  {
    icon: "→",
    label: "Read packages/opencode/src/index.ts [offset=1, limit=100]",
    error: "No LSP server available for this file type.",
  },
  {
    icon: "✱",
    label:
      'Grep "export const OPENCODE_DB|OPENCODE_DB|OPENCODE_DEV|Global\\.Path\\.data|data =" in packages/opencode/src (115 matches)',
  },
] as const

function ShellOutput() {
  return (
    <box
      ref={(el: BoxRenderable) => alwaysSeparate.add(el)}
      marginTop={1}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      gap={1}
    >
      <box gap={1}>
        <text>$ ls</text>
        <text>file.ts</text>
      </box>
    </box>
  )
}

function UserMessage() {
  return (
    <box ref={(el: BoxRenderable) => alwaysSeparate.add(el)}>
      <box paddingTop={1} paddingBottom={1} paddingLeft={2}>
        <text>Check whether the next tool remains separated.</text>
      </box>
    </box>
  )
}

function Fixture(props: { errorExpanded?: boolean; before?: "shell" | "user" }) {
  return (
    <box flexDirection="column" width={72}>
      <box flexDirection="column">
        {props.before === "shell" && <ShellOutput />}
        {props.before === "user" && <UserMessage />}
        <For each={tools}>
          {(item) => (
            <InlineToolRow
              icon={item.icon}
              complete={true}
              pending=""
              failed={Boolean(item.error)}
              error={item.error}
              errorExpanded={props.errorExpanded}
            >
              {item.label}
            </InlineToolRow>
          )}
        </For>
      </box>
    </box>
  )
}

function TaskRowsFixture() {
  return (
    <box flexDirection="column" width={72}>
      <InlineToolRow icon="✱" complete={true} pending="">
        Grep "Task" (2 matches)
      </InlineToolRow>
      <InlineToolRow icon="⠙" complete={true} pending="" separate={true}>
        Explore Task — Inspect active task spacing
      </InlineToolRow>
      <InlineToolRow icon="✓" complete={true} pending="" separate={true}>
        {"General Task — Confirm completed task spacing\n↳ 1 toolcall · 501ms"}
      </InlineToolRow>
      <InlineToolRow icon="→" complete={true} pending="">
        Read src/cli/cmd/tui/routes/session/index.tsx
      </InlineToolRow>
    </box>
  )
}

function LoadedReadBeforeTaskFixture() {
  return (
    <box flexDirection="column" width={72}>
      <InlineToolRow icon="→" complete={true} pending="">
        Read src/cli/cmd/tui/routes/session/index.tsx
      </InlineToolRow>
      <box paddingLeft={3}>
        <text paddingLeft={3}>↳ Loaded src/cli/cmd/tui/routes/session/tools.tsx</text>
      </box>
      <InlineToolRow icon="✓" complete={true} pending="" separate={true}>
        {"Explore Task — Inspect active task spacing\n↳ 1 toolcall · 501ms"}
      </InlineToolRow>
    </box>
  )
}

function AssistantSummaryBeforeInlineFixture() {
  return (
    <box flexDirection="column" width={72}>
      <box ref={(el: BoxRenderable) => alwaysSeparate.add(el)} paddingLeft={3}>
        <text>▣ Build · Little Frank · 53.1s</text>
      </box>
      <InlineToolRow icon="✓" complete={true} pending="">
        {"Build Task — Review changes\n↳ 48 toolcalls · 1m 40s"}
      </InlineToolRow>
    </box>
  )
}

function AssistantErrorBeforeInlineFixture() {
  return (
    <box flexDirection="column" width={72}>
      <box
        ref={(el: BoxRenderable) => alwaysSeparate.add(el)}
        border={["left"]}
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
      >
        <text>Managed inference requires an active Member plan</text>
      </box>
      <InlineToolRow icon="✓" complete={true} pending="">
        {"Build Task — Review changes\n↳ 48 toolcalls · 1m 40s"}
      </InlineToolRow>
    </box>
  )
}

function StickyScrollFixture(props: { separated: boolean; scroll: (scroll: ScrollBoxRenderable) => void }) {
  return (
    <scrollbox ref={props.scroll} stickyScroll={true} stickyStart="bottom" height={3} width={72}>
      <box height={1}>
        <text>First row</text>
      </box>
      <box height={1}>
        <text>Second row</text>
      </box>
      <Show when={props.separated}>
        <box ref={(el: BoxRenderable) => alwaysSeparate.add(el)}>
          <text>Assistant text</text>
        </box>
      </Show>
      <InlineToolRow icon="→" complete={true} pending="">
        Read src/cli/cmd/tui/routes/session/index.tsx
      </InlineToolRow>
    </scrollbox>
  )
}

function FailedPendingToolFixture() {
  return (
    <InlineToolRow icon="%" complete={false} pending="Preparing patch…" failed={true} failure="Patch failed">
      Patch
    </InlineToolRow>
  )
}

function FailedCompleteToolFixture() {
  return (
    <InlineToolRow icon="→" complete={true} pending="Reading file…" failed={true} failure="Read failed">
      Read src/index.ts
    </InlineToolRow>
  )
}

async function renderFrame(component: () => JSX.Element, options: { width: number; height: number }) {
  testSetup = await testRender(component, options)
  await testSetup.renderOnce()
  await testSetup.renderOnce()

  return testSetup
    .captureCharFrame()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()
}

describe("TUI inline tool wrapping", () => {
  test("falls back for unknown tool names", () => {
    expect(toolDisplay("bash")).toBe("bash")
    expect(toolDisplay("plugin_tool")).toBe("generic")
  })

  test("replaces pending copy when a tool fails before completion", async () => {
    const frame = await renderFrame(() => <FailedPendingToolFixture />, { width: 72, height: 3 })
    expect(frame).toContain("Patch failed")
    expect(frame).not.toContain("Preparing patch")
  })

  test("preserves useful completed copy when a tool fails", async () => {
    const frame = await renderFrame(() => <FailedCompleteToolFixture />, { width: 72, height: 3 })
    expect(frame).toContain("Read src/index.ts")
    expect(frame).not.toContain("Read failed")
  })

  test("filters malformed nested tool wire data", () => {
    expect(
      parseApplyPatchFiles([
        null,
        { type: "add" },
        { type: "add", relativePath: "a.ts", filePath: "a.ts", patch: "diff", deletions: 0 },
      ]),
    ).toEqual([
      { type: "add", relativePath: "a.ts", filePath: "a.ts", patch: "diff", deletions: 0, movePath: undefined },
    ])
    expect(parseTodos([null, { status: "pending" }, { status: "pending", content: "Safe" }])).toEqual([
      { status: "pending", content: "Safe" },
    ])
    expect(parseQuestions([{}, { question: 1 }, { question: "Continue?" }])).toEqual([{ question: "Continue?" }])
    expect(parseQuestionAnswers([null, ["yes", 1], "no"])).toEqual([[], ["yes"], []])
    expect(parseQuestionAnswers({})).toBeUndefined()
  })

  test("ignores diagnostics with malformed nested ranges", () => {
    expect(
      parseDiagnostics(
        {
          "a.ts": [
            { severity: 1, message: "missing range" },
            { severity: 1, message: "bad line", range: { start: { line: "0", character: 1 } } },
            { severity: 1, message: "valid", range: { start: { line: 2, character: 3 } } },
          ],
        },
        "a.ts",
      ),
    ).toEqual([{ message: "valid", range: { start: { line: 2, character: 3 } } }])
  })

  test("formats completed subagent toolcall details", () => {
    expect(formatCompletedSubagentDetail(0, "501ms")).toBe("501ms")
    expect(formatCompletedSubagentDetail(1, "501ms")).toBe("1 Toolcall · 501ms")
    expect(formatCompletedSubagentDetail(2, "501ms")).toBe("2 Toolcalls · 501ms")
    expect(formatSubagentToolcalls(0)).toBe("0 Toolcalls")
  })

  test("keeps background state attached to the subagent identity", () => {
    expect(formatSubagentTitle("Explore", "Inspect renderer", false)).toBe("Explore Task — Inspect renderer")
    expect(formatSubagentTitle("Explore", "Inspect renderer", true)).toBe(
      "Explore Task (Background) — Inspect renderer",
    )
  })

  test("keeps retry status ahead of wrapping messages", () => {
    expect(formatSubagentRetry(2, "Rate limited by provider")).toBe("Retrying (Attempt 2) · Rate limited by provider")
  })


  test("snapshots consecutive grep, glob, and read rows at a narrow width", async () => {
    expect(await renderFrame(() => <Fixture />, { width: 72, height: 12 })).toMatchSnapshot()
  })

  test("snapshots expanded tool errors under the tool text", async () => {
    expect(await renderFrame(() => <Fixture errorExpanded />, { width: 72, height: 12 })).toMatchSnapshot()
  })

  test("keeps separation after a shell output block", async () => {
    expect(await renderFrame(() => <Fixture before="shell" />, { width: 72, height: 16 })).toMatchSnapshot()
  })

  test("keeps separation after a padded user message", async () => {
    expect(await renderFrame(() => <Fixture before="user" />, { width: 72, height: 14 })).toMatchSnapshot()
  })

  test("separates after a multi-line task row", async () => {
    expect(await renderFrame(() => <TaskRowsFixture />, { width: 72, height: 10 })).toMatchSnapshot()
  })

  test("separates a task row from a preceding inline detail", async () => {
    expect(await renderFrame(() => <LoadedReadBeforeTaskFixture />, { width: 72, height: 8 })).toMatchSnapshot()
  })

  test("separates an inline row from the previous assistant summary", async () => {
    expect(await renderFrame(() => <AssistantSummaryBeforeInlineFixture />, { width: 72, height: 5 })).toMatchSnapshot()
  })

  test("separates an inline row from the previous assistant error", async () => {
    expect(await renderFrame(() => <AssistantErrorBeforeInlineFixture />, { width: 72, height: 7 })).toMatchSnapshot()
  })

  test("updates sticky-bottom geometry when a text separator mounts and unmounts", async () => {
    const [separated, setSeparated] = createSignal(false)
    let scroll: ScrollBoxRenderable | undefined
    testSetup = await testRender(
      () => <StickyScrollFixture separated={separated()} scroll={(value) => (scroll = value)} />,
      {
        width: 72,
        height: 3,
      },
    )

    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(3)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))

    setSeparated(true)
    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(5)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))

    setSeparated(false)
    await testSetup.renderOnce()
    expect(scroll?.scrollHeight).toBe(3)
    expect(scroll?.scrollTop).toBe(Math.max(0, scroll!.scrollHeight - scroll!.viewport.height))
  })
})

describe("skillName", () => {
  test("reads the name from the parsed call input", () => {
    expect(skillName({ name: "brainstorming" })).toBe("brainstorming")
  })

  test("parses a complete streamed JSON input", () => {
    expect(skillName('{"name":"brainstorming"}')).toBe("brainstorming")
  })

  test("extracts the name from a partially streamed JSON input", () => {
    expect(skillName('{"name":"brainstorming"')).toBe("brainstorming")
  })

  test("returns undefined while the name value is incomplete", () => {
    expect(skillName('{"name":"br')).toBeUndefined()
  })

  test("returns undefined for an empty input", () => {
    expect(skillName("")).toBeUndefined()
  })
})

describe("Skill tool rendering", () => {
  function SkillHarness(props: {
    state: { status: "pending" | "running" | "completed"; raw?: string }
    input: Record<string, unknown>
  }) {
    const name = createMemo(() => {
      const state = props.state
      if (state.status === "pending" && "raw" in state && state.raw) return skillName(state.raw)
      return skillName(props.input)
    })
    const pending = createMemo(() => {
      const value = name()
      return value ? `Loading Skill "${Locale.titlecase(value)}"...` : "Loading Skill..."
    })
    return (
      <InlineToolRow icon="→" pending={pending()} complete={name()}>
        Skill "{name() ? Locale.titlecase(name()!) : ""}"
      </InlineToolRow>
    )
  }

  test("shows generic Loading Skill... when name is not yet streamed", async () => {
    const [state] = createSignal<{ status: "pending" | "running" | "completed"; raw?: string }>({
      status: "pending",
      raw: "",
    })
    const [input] = createSignal<Record<string, unknown>>({})

    const frame = await renderFrame(() => <SkillHarness state={state()} input={input()} />, { width: 72, height: 3 })
    expect(frame).toContain("~ Loading Skill...")
    expect(frame).not.toContain("undefined")
  })

  test("old pattern fails to reactively update because value is captured once", async () => {
    function BrokenSkillHarness(props: {
      state: { status: "pending" | "running" | "completed"; raw?: string }
      input: Record<string, unknown>
    }) {
      const name = createMemo(() => {
        const state = props.state
        if (state.status === "pending" && "raw" in state && state.raw) return skillName(state.raw)
        return skillName(props.input)
      })
      const value = name()
      return (
        <InlineToolRow icon="→" pending="Loading Skill..." complete={value}>
          Skill "{value ? Locale.titlecase(value) : value}"
        </InlineToolRow>
      )
    }

    const [state, setState] = createSignal<{ status: "pending" | "running" | "completed"; raw?: string }>({
      status: "pending",
      raw: "",
    })
    const [input] = createSignal<Record<string, unknown>>({})

    testSetup = await testRender(() => <BrokenSkillHarness state={state()} input={input()} />, { width: 72, height: 3 })
    await testSetup.renderOnce()
    let frame = testSetup.captureCharFrame().trimEnd()
    expect(frame).toContain("~ Loading Skill...")

    // In broken pattern, updating state does NOT update frame because value was captured at mount
    setState({ status: "pending", raw: '{"name":"brainstorming"' })
    await testSetup.renderOnce()
    frame = testSetup.captureCharFrame().trimEnd()
    expect(frame).toContain("~ Loading Skill...")
    expect(frame).not.toContain('Skill "Brainstorming"')
  })

  test("reactively shows skill name in pending state when streamed with fixed pattern", async () => {
    const [state, setState] = createSignal<{ status: "pending" | "running" | "completed"; raw?: string }>({
      status: "pending",
      raw: "",
    })
    const [input] = createSignal<Record<string, unknown>>({})

    testSetup = await testRender(() => <SkillHarness state={state()} input={input()} />, { width: 72, height: 3 })
    await testSetup.renderOnce()
    let frame = testSetup.captureCharFrame().trimEnd()
    expect(frame).toContain("~ Loading Skill...")

    setState({ status: "pending", raw: '{"name":"brainstorming"' })
    await testSetup.renderOnce()
    frame = testSetup.captureCharFrame().trimEnd()
    expect(frame).toContain('Skill "Brainstorming"')
  })

  test("renders completed skill name", async () => {
    const frame = await renderFrame(
      () => <SkillHarness state={{ status: "completed" }} input={{ name: "brainstorming" }} />,
      { width: 72, height: 3 },
    )
    expect(frame).toContain('→ Skill "Brainstorming"')
  })
})

