import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import { createMemo, For, type Accessor } from "solid-js"
import { DEFAULT_THEMES, useTheme } from "../../context/theme"
import { useCommandShortcut } from "../../keymap"

const themeCount = Object.keys(DEFAULT_THEMES).length

type TipPart = { text: string; highlight: boolean }
type TipShortcut = Accessor<string>
type Shortcuts = {
  agentCycle: TipShortcut
  childFirst: TipShortcut
  childNext: TipShortcut
  childPrevious: TipShortcut
  commandList: TipShortcut
  editorOpen: TipShortcut
  helpShow: TipShortcut
  inputClear: TipShortcut
  inputNewline: TipShortcut
  inputPaste: TipShortcut
  inputUndo: TipShortcut
  leader: TipShortcut
  messagesCopy: TipShortcut
  messagesFirst: TipShortcut
  messagesLast: TipShortcut
  messagesPageDown: TipShortcut
  messagesPageUp: TipShortcut
  messagesToggleConceal: TipShortcut
  modelCycleRecent: TipShortcut
  modelList: TipShortcut
  sessionExport: TipShortcut
  sessionInterrupt: TipShortcut
  sessionList: TipShortcut
  sessionNew: TipShortcut
  sessionParent: TipShortcut
  sessionPinToggle: TipShortcut
  sessionQuickSwitch1: TipShortcut
  sessionQuickSwitch9: TipShortcut
  sessionSidebarToggle: TipShortcut
  sessionTimeline: TipShortcut
  statusView: TipShortcut
  terminalSuspend: TipShortcut
  themeList: TipShortcut
}
type Tip = string | ((shortcuts: Shortcuts) => string | undefined)

function parse(tip: string): TipPart[] {
  const parts: TipPart[] = []
  const regex = /\{highlight\}(.*?)\{\/highlight\}/g
  const found = Array.from(tip.matchAll(regex))
  const state = found.reduce(
    (acc, match) => {
      const start = match.index ?? 0
      if (start > acc.index) {
        acc.parts.push({ text: tip.slice(acc.index, start), highlight: false })
      }
      acc.parts.push({ text: match[1], highlight: true })
      acc.index = start + match[0].length
      return acc
    },
    { parts, index: 0 },
  )

  if (state.index < tip.length) {
    parts.push({ text: tip.slice(state.index), highlight: false })
  }

  return parts
}

const NO_MODELS_TIP = "Run {highlight}/connect{/highlight} To Add An AI Provider And Start Coding"
const NO_MODELS_PARTS = parse(NO_MODELS_TIP)

function shortcutText(value: string) {
  return `{highlight}${value}{/highlight}`
}

function commandText(command: string, shortcut: string) {
  if (!shortcut) return shortcutText(command)
  return `${shortcutText(command)} or ${shortcutText(shortcut)}`
}

function press(shortcut: string, text: string) {
  if (!shortcut) return undefined
  return `Press ${shortcutText(shortcut)} ${text}`
}

function configShortcut(api: TuiPluginApi, command: string): TipShortcut {
  return () =>
    api.tuiConfig.keybinds
      .get(command)
      .map((binding) => api.keys.formatSequence(Array.from(api.keymap.parseKeySequence(binding.key))))
      .filter(Boolean)
      .join(", ")
}

export function Tips(props: { api: TuiPluginApi; connected?: boolean }) {
  const theme = useTheme().theme
  const tipOffset = Math.random()
  const shortcuts: Shortcuts = {
    agentCycle: useCommandShortcut("agent.cycle"),
    childFirst: configShortcut(props.api, "session.child.first"),
    childNext: configShortcut(props.api, "session.child.next"),
    childPrevious: configShortcut(props.api, "session.child.previous"),
    commandList: useCommandShortcut("command.palette.show"),
    editorOpen: useCommandShortcut("prompt.editor"),
    helpShow: useCommandShortcut("help.show"),
    inputClear: useCommandShortcut("prompt.clear"),
    inputNewline: useCommandShortcut("input.newline"),
    inputPaste: useCommandShortcut("prompt.paste"),
    inputUndo: useCommandShortcut("input.undo"),
    leader: configShortcut(props.api, "leader"),
    messagesCopy: configShortcut(props.api, "messages.copy"),
    messagesFirst: configShortcut(props.api, "session.first"),
    messagesLast: configShortcut(props.api, "session.last"),
    messagesPageDown: configShortcut(props.api, "session.page.down"),
    messagesPageUp: configShortcut(props.api, "session.page.up"),
    messagesToggleConceal: configShortcut(props.api, "session.toggle.conceal"),
    modelCycleRecent: useCommandShortcut("model.cycle_recent"),
    modelList: useCommandShortcut("model.list"),
    sessionExport: configShortcut(props.api, "session.export"),
    sessionInterrupt: configShortcut(props.api, "session.interrupt"),
    sessionList: useCommandShortcut("session.list"),
    sessionNew: useCommandShortcut("session.new"),
    sessionParent: configShortcut(props.api, "session.parent"),
    sessionPinToggle: configShortcut(props.api, "session.pin.toggle"),
    sessionQuickSwitch1: useCommandShortcut("session.quick_switch.1"),
    sessionQuickSwitch9: useCommandShortcut("session.quick_switch.9"),
    sessionSidebarToggle: configShortcut(props.api, "session.sidebar.toggle"),
    sessionTimeline: configShortcut(props.api, "session.timeline"),
    statusView: useCommandShortcut("opencode.status"),
    terminalSuspend: useCommandShortcut("terminal.suspend"),
    themeList: useCommandShortcut("theme.switch"),
  }
  const tip = createMemo(() => {
    if (props.connected === false) return NO_MODELS_TIP
    const tips = [...TIPS, process.platform !== "win32" ? TERMINAL_SUSPEND_TIP : INPUT_UNDO_TIP].flatMap((item) => {
      const value = typeof item === "string" ? item : item(shortcuts)
      return value ? [value] : []
    })
    return tips[Math.floor(tipOffset * tips.length)] ?? NO_MODELS_TIP
  }, NO_MODELS_TIP)
  // Solid can expose a memo's initial value while a pure computation is pending.
  const parts = createMemo(() => {
    const value = tip()
    if (typeof value === "string") return parse(value)
    return NO_MODELS_PARTS
  }, NO_MODELS_PARTS)

  return (
    <box flexDirection="row" maxWidth="100%">
      <text flexShrink={0} style={{ fg: theme.warning }}>
        ● Tip{" "}
      </text>
      <text flexShrink={1} wrapMode="word">
        <For each={parts()}>
          {(part) => <span style={{ fg: part.highlight ? theme.text : theme.textMuted }}>{part.text}</span>}
        </For>
      </text>
    </box>
  )
}

const TIPS: Tip[] = [
  "Type {highlight}@{/highlight} Followed By A Filename To Fuzzy Search And Attach Files",
  "Start A Message With {highlight}!{/highlight} To Run Shell Commands (E.g., {highlight}!ls -la{/highlight})",
  (shortcuts) => press(shortcuts.agentCycle(), "To Cycle Between Build And Plan Agents"),
  "Use {highlight}/undo{/highlight} To Revert The Last Message And File Changes",
  "Use {highlight}/redo{/highlight} To Restore Previously Undone Messages And File Changes",
  "Run {highlight}/share{/highlight} To Create A Public opencode.ai Link",
  "Drag And Drop Images Or PDFs Into The Terminal As Context",
  (shortcuts) => press(shortcuts.inputPaste(), "To Paste Images From Your Clipboard Into The Prompt"),
  (shortcuts) => `Use ${commandText("/editor", shortcuts.editorOpen())} To Compose Messages In Your External Editor`,
  "Run {highlight}/init{/highlight} To Auto-Generate Project Rules Based On Your Codebase",
  (shortcuts) => `Use ${commandText("/models", shortcuts.modelList())} To Switch Between Available AI Models`,
  (shortcuts) => `Use ${commandText("/themes", shortcuts.themeList())} To Switch Between ${themeCount} Built-In Themes`,
  (shortcuts) => `Use ${commandText("/new", shortcuts.sessionNew())} To Start A Fresh Conversation Session`,
  (shortcuts) => `Use ${commandText("/sessions", shortcuts.sessionList())} To List, Pin, And Continue Sessions`,
  (shortcuts) => press(shortcuts.sessionPinToggle(), "In The Session List To Pin One At The Top"),
  (shortcuts) =>
    shortcuts.sessionQuickSwitch1() && shortcuts.sessionQuickSwitch9()
      ? `Use ${shortcutText(shortcuts.sessionQuickSwitch1())} through ${shortcutText(shortcuts.sessionQuickSwitch9())} To Switch Pinned Sessions`
      : undefined,
  "Run {highlight}/compact{/highlight} To Summarize Long Sessions Near Context Limits",
  (shortcuts) => `Use ${commandText("/export", shortcuts.sessionExport())} To Save The Conversation As Markdown`,
  (shortcuts) => press(shortcuts.messagesCopy(), "To Copy The Assistant's Last Message To Clipboard"),
  (shortcuts) => press(shortcuts.commandList(), "To See All Available Actions And Commands"),
  "Run {highlight}/connect{/highlight} To Add API Keys For 75+ Supported LLM Providers",
  (shortcuts) => `The Leader Key Is ${shortcutText(shortcuts.leader())}; Combine With Other Keys For Quick Actions`,
  (shortcuts) => press(shortcuts.modelCycleRecent(), "To Quickly Switch Between Recently Used Models"),
  (shortcuts) => press(shortcuts.sessionSidebarToggle(), "In A Session To Show Or Hide The Sidebar Panel"),
  (shortcuts) =>
    shortcuts.messagesPageUp() && shortcuts.messagesPageDown()
      ? `Use ${shortcutText(shortcuts.messagesPageUp())}/${shortcutText(shortcuts.messagesPageDown())} To Navigate Through Conversation History`
      : undefined,
  (shortcuts) => press(shortcuts.messagesFirst(), "To Jump To The Beginning Of The Conversation"),
  (shortcuts) => press(shortcuts.messagesLast(), "To Jump To The Most Recent Message"),
  (shortcuts) => press(shortcuts.inputNewline(), "To Add Newlines In Your Prompt"),
  (shortcuts) => press(shortcuts.inputClear(), "When Typing To Clear The Input Field"),
  (shortcuts) => press(shortcuts.sessionInterrupt(), "To Stop The AI Mid-Response"),
  "Switch To {highlight}Plan{/highlight} Agent For Suggestions Without Making Changes",
  "Use {highlight}@agent-name{/highlight} In Prompts To Invoke Specialized Subagents",
  (shortcuts) => {
    const items = [
      shortcuts.sessionParent(),
      shortcuts.childFirst(),
      shortcuts.childPrevious(),
      shortcuts.childNext(),
    ].filter(Boolean)
    if (!items.length) return undefined
    return `Use ${items.map(shortcutText).join(" / ")} For Parent/Child Sessions`
  },
  "Create {highlight}opencode.json{/highlight} For Server Settings, And {highlight}tui.json{/highlight} For TUI",
  "Place TUI Settings In {highlight}~/.config/opencode/tui.json{/highlight} For Global Config",
  "Add {highlight}$schema{/highlight} To Your Config For Autocomplete In Your Editor",
  "Configure {highlight}model{/highlight} In Config To Set Your Default Model",
  "Override Any Keybind In {highlight}tui.json{/highlight} Via The {highlight}keybinds{/highlight} Section",
  "Set Any Keybind To {highlight}none{/highlight} To Disable It Completely",
  "Configure Local Or Remote MCP Servers In The {highlight}mcp{/highlight} Config Section",
  "Add {highlight}.md{/highlight} Files To {highlight}.opencode/commands/{/highlight} For Reusable Prompts",
  "Use {highlight}$ARGUMENTS{/highlight}, {highlight}$1{/highlight}, {highlight}$2{/highlight} In Custom Commands For Dynamic Input",
  "Use Backticks To Inject Shell Output (E.g., {highlight}`git status`{/highlight})",
  "Add {highlight}.md{/highlight} Files To {highlight}.opencode/agents/{/highlight} For Specialized AI Personas",
  "Configure Per-Agent Permissions For {highlight}edit{/highlight}, {highlight}bash{/highlight}, And {highlight}webfetch{/highlight} Tools",
  'Use Patterns Like {highlight}"git *": "allow"{/highlight} For Granular Bash Permissions',
  'Set {highlight}"rm -rf *": "deny"{/highlight} To Block Destructive Commands',
  'Configure {highlight}"git push": "ask"{/highlight} To Require Approval Before Pushing',
  'Set {highlight}"formatter": true{/highlight} To Enable Built-In Formatters',
  'Set {highlight}"formatter": false{/highlight} To Disable Inherited Formatters',
  "Define Custom Formatter Commands With File Extensions In Config",
  'Set {highlight}"lsp": true{/highlight} To Enable Built-In LSP Code Analysis',
  "Create {highlight}.ts{/highlight} Files In {highlight}.opencode/tools/{/highlight} To Define New LLM Tools",
  "Tool Definitions Can Invoke Scripts Written In Python, Go, Etc",
  "Add {highlight}.ts{/highlight} Files To {highlight}.opencode/plugins/{/highlight} For Event Hooks",
  "Use Plugins To Send OS Notifications When Sessions Complete",
  "Create A Plugin To Prevent OpenCode From Reading Sensitive Files",
  "Use {highlight}opencode run{/highlight} For Non-Interactive Scripting",
  "Use {highlight}opencode --continue{/highlight} To Resume The Last Session",
  "Use {highlight}opencode run -f file.ts{/highlight} To Attach Files Via CLI",
  "Use {highlight}--format json{/highlight} For Machine-Readable Output In Scripts",
  "Run {highlight}opencode serve{/highlight} For Headless API Access To OpenCode",
  "Use {highlight}opencode run --attach{/highlight} To Connect To A Running Server",
  "Run {highlight}opencode upgrade{/highlight} To Update To The Latest Version",
  "Run {highlight}opencode auth list{/highlight} To See All Configured Providers",
  "Run {highlight}opencode agent create{/highlight} For Guided Agent Creation",
  "Use {highlight}/opencode{/highlight} In GitHub Issues/PRs To Trigger AI Actions",
  "Run {highlight}opencode github install{/highlight} To Set Up The GitHub Workflow",
  "Comment {highlight}/opencode fix this{/highlight} On Issues To Auto-Create PRs",
  "Comment {highlight}/oc{/highlight} On PR Code Lines For Targeted Code Reviews",
  'Use {highlight}"theme": "system"{/highlight} To Match Your Terminal\'s Colors',
  "Create JSON Theme Files In {highlight}.opencode/themes/{/highlight} Directory",
  "Themes Support Dark/Light Variants For Both Modes",
  "Use Numeric Xterm Color Codes 0-255 In Custom Theme JSON",
  "Use {highlight}{env:VAR_NAME}{/highlight} For Environment Variables In Config",
  "Use {highlight}{file:path}{/highlight} To Include File Contents In Config Values",
  "Use {highlight}instructions{/highlight} In Config To Load Additional Rules Files",
  "Set Agent {highlight}temperature{/highlight} From 0.0 (Focused) To 1.0 (Creative)",
  "Configure {highlight}steps{/highlight} To Limit Agentic Iterations Per Request",
  'Set {highlight}"tools": {"bash": false}{/highlight} To Disable Specific Tools',
  'Set {highlight}"mcp_*": false{/highlight} To Disable All Tools From An MCP Server',
  "Override Global Tool Settings Per Agent Configuration",
  'Set {highlight}"share": "auto"{/highlight} To Automatically Share All Sessions',
  'Set {highlight}"share": "disabled"{/highlight} To Prevent Any Session Sharing',
  "Run {highlight}/unshare{/highlight} To Remove A Session From Public Access",
  "Permission {highlight}doom_loop{/highlight} Prevents Infinite Tool Call Loops",
  "Permission {highlight}external_directory{/highlight} Protects Files Outside Project",
  "Run {highlight}opencode debug config{/highlight} To Troubleshoot Configuration",
  "Use {highlight}--print-logs{/highlight} Flag To See Detailed Logs In Stderr",
  (shortcuts) => `Use ${commandText("/timeline", shortcuts.sessionTimeline())} To Jump To Specific Messages`,
  (shortcuts) => press(shortcuts.messagesToggleConceal(), "To Toggle Code Block Visibility In Messages"),
  (shortcuts) => `Use ${commandText("/status", shortcuts.statusView())} To See System Status Info`,
  "Enable {highlight}scroll_acceleration{/highlight} In {highlight}tui.json{/highlight} For Smooth Scrolling",
  (shortcuts) =>
    shortcuts.commandList()
      ? `Toggle Username Display In Chat Via The Command Palette (${shortcutText(shortcuts.commandList())})`
      : "Toggle Username Display In Chat Via The Command Palette",
  "Run {highlight}docker run -it --rm ghcr.io/anomalyco/opencode{/highlight} In A Container",
  "Use {highlight}/connect{/highlight} With OpenCode Zen For Curated, Tested Models",
  "Commit Your Project's {highlight}AGENTS.md{/highlight} File To Git For Team Sharing",
  "Use {highlight}/review{/highlight} To Review Uncommitted Changes, Branches, Or PRs",
  (shortcuts) => `Use ${commandText("/help", shortcuts.helpShow())} To Show The Help Dialog`,
  "Use {highlight}/rename{/highlight} To Rename The Current Session",
]

const INPUT_UNDO_TIP: Tip = (shortcuts) => press(shortcuts.inputUndo(), "To Undo Changes In Your Prompt")
const TERMINAL_SUSPEND_TIP: Tip = (shortcuts) =>
  press(shortcuts.terminalSuspend(), "To Suspend The Terminal And Return To Your Shell")
