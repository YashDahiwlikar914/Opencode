export * as TuiKeybind from "./keybind"

import type { KeyEvent, Renderable } from "@opentui/core"
import type { Binding } from "@opentui/keymap"
import type { BindingCommandMap, BindingConfig, BindingDefaults } from "@opentui/keymap/extras"
import { Schema } from "effect"

const KeyStroke = Schema.Struct({
  name: Schema.String,
  ctrl: Schema.optional(Schema.Boolean),
  shift: Schema.optional(Schema.Boolean),
  meta: Schema.optional(Schema.Boolean),
  super: Schema.optional(Schema.Boolean),
  hyper: Schema.optional(Schema.Boolean),
})

const BindingObject = Schema.StructWithRest(
  Schema.Struct({
    key: Schema.Union([Schema.String, KeyStroke]),
    event: Schema.optional(Schema.Literals(["press", "release"])),
    preventDefault: Schema.optional(Schema.Boolean),
    fallthrough: Schema.optional(Schema.Boolean),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
)

const BindingItem = Schema.Union([Schema.String, KeyStroke, BindingObject])
export const BindingValueSchema = Schema.Union([
  Schema.Literal(false),
  Schema.Literal("none"),
  BindingItem,
  Schema.Array(BindingItem),
])
export type BindingValueSchema = Schema.Schema.Type<typeof BindingValueSchema>

type Definition = {
  default: BindingValueSchema
  description: string
}

export const LeaderDefault = "ctrl+x"

const keybind = (value: Definition["default"], description: string): Definition => ({ default: value, description })

export const Definitions = {
  leader: keybind(LeaderDefault, "Leader Key For Keybind Combinations"),

  app_exit: keybind("ctrl+c,ctrl+d,<leader>q", "Exit The Application"),
  app_debug: keybind("none", "Toggle Debug Panel"),
  app_console: keybind("none", "Toggle Console"),
  app_heap_snapshot: keybind("none", "Write Heap Snapshot"),
  app_toggle_animations: keybind("none", "Toggle Animations"),
  app_toggle_file_context: keybind("none", "Toggle File Context"),
  app_toggle_diffwrap: keybind("none", "Toggle Diff Wrapping"),
  app_toggle_paste_summary: keybind("none", "Toggle Paste Summary"),
  app_toggle_session_directory_filter: keybind("none", "Toggle Session Directory Filtering"),
  command_list: keybind("ctrl+p", "List Available Commands"),
  help_show: keybind("none", "Open Help Dialog"),
  docs_open: keybind("none", "Open Documentation"),
  diff_open: keybind("none", "Open Diff Viewer"),
  diff_close: keybind("escape,q", "Close Diff Viewer"),
  diff_toggle: keybind("enter,space", "Toggle Diff Viewer Item"),
  diff_expand: keybind("right", "Expand Diff Viewer Item"),
  diff_expand_all: keybind("E", "Expand All Diff Viewer Folders"),
  diff_collapse: keybind("left", "Collapse Diff Viewer Item"),
  diff_switch_focus: keybind("tab", "Switch Diff Viewer Focus"),
  diff_next_hunk: keybind("]", "Jump To Next Diff Hunk"),
  diff_previous_hunk: keybind("[", "Jump To Previous Diff Hunk"),
  diff_next_file: keybind("n", "Jump To Next Diff File"),
  diff_previous_file: keybind("p", "Jump To Previous Diff File"),
  diff_toggle_file_tree: keybind("b", "Toggle Diff Viewer File Tree"),
  diff_single_patch: keybind("s", "Toggle Single Patch View"),
  diff_switch_source: keybind("d", "Switch Diff Viewer Source"),
  diff_toggle_view: keybind("v", "Toggle Diff Viewer Split Or Unified View"),
  diff_help: keybind("?", "Show More Diff Viewer Shortcuts"),

  editor_open: keybind("<leader>e", "Open External Editor"),
  theme_list: keybind("<leader>t", "List Available Themes"),
  theme_switch_mode: keybind("none", "Switch Between Light And Dark Theme Mode"),
  theme_mode_lock: keybind("none", "Lock Or Unlock Theme Mode"),
  sidebar_toggle: keybind("<leader>b", "Toggle Sidebar"),
  scrollbar_toggle: keybind("none", "Toggle Session Scrollbar"),
  status_view: keybind("<leader>s", "View Status"),
  debug_view: keybind("none", "View Debug Info"),

  session_export: keybind("<leader>x", "Export Session To Editor"),
  session_copy: keybind("none", "Copy Session Transcript"),
  session_move: keybind("none", "Move Session"),
  session_new: keybind("<leader>n", "Create A New Session"),
  session_list: keybind("<leader>l", "List All Sessions"),
  session_timeline: keybind("<leader>g", "Show Session Timeline"),
  session_fork: keybind("none", "Fork Session From Message"),
  session_rename: keybind("ctrl+r", "Rename Session"),
  session_delete: keybind("ctrl+d", "Delete Session"),
  session_share: keybind("none", "Share Current Session"),
  session_unshare: keybind("none", "Unshare Current Session"),
  session_interrupt: keybind("escape", "Interrupt Current Session"),
  session_background: keybind("ctrl+b", "Background Synchronous Subagents"),
  session_compact: keybind("<leader>c", "Compact The Session"),
  session_toggle_timestamps: keybind("none", "Toggle Message Timestamps"),
  session_toggle_generic_tool_output: keybind("none", "Toggle Generic Tool Output"),
  session_queued_prompts: keybind("<leader>q", "Manage Queued Prompts"),
  session_child_first: keybind("<leader>down", "Go To First Child Session"),
  session_child_cycle: keybind("right", "Go To Next Child Session"),
  session_child_cycle_reverse: keybind("left", "Go To Previous Child Session"),
  session_parent: keybind("up", "Go To Parent Session"),
  session_pin_toggle: keybind("ctrl+f", "Pin Or Unpin Session In The Session List"),
  session_quick_switch_1: keybind("<leader>1", "Switch To Session In Quick Slot 1"),
  session_quick_switch_2: keybind("<leader>2", "Switch To Session In Quick Slot 2"),
  session_quick_switch_3: keybind("<leader>3", "Switch To Session In Quick Slot 3"),
  session_quick_switch_4: keybind("<leader>4", "Switch To Session In Quick Slot 4"),
  session_quick_switch_5: keybind("<leader>5", "Switch To Session In Quick Slot 5"),
  session_quick_switch_6: keybind("<leader>6", "Switch To Session In Quick Slot 6"),
  session_quick_switch_7: keybind("<leader>7", "Switch To Session In Quick Slot 7"),
  session_quick_switch_8: keybind("<leader>8", "Switch To Session In Quick Slot 8"),
  session_quick_switch_9: keybind("<leader>9", "Switch To Session In Quick Slot 9"),

  stash_delete: keybind("ctrl+d", "Delete Stash Entry"),
  model_provider_list: keybind("ctrl+a", "Open Provider List From Model Dialog"),
  model_favorite_toggle: keybind("ctrl+f", "Toggle Model Favorite Status"),
  model_list: keybind("<leader>m", "List Available Models"),
  model_cycle_recent: keybind("f2", "Next Recently Used Model"),
  model_cycle_recent_reverse: keybind("shift+f2", "Previous Recently Used Model"),
  model_cycle_favorite: keybind("none", "Next Favorite Model"),
  model_cycle_favorite_reverse: keybind("none", "Previous Favorite Model"),
  mcp_list: keybind("none", "List MCP Servers"),
  provider_connect: keybind("none", "Connect Provider"),
  console_org_switch: keybind("none", "Switch Console Organization"),
  agent_list: keybind("<leader>a", "List Agents"),
  agent_cycle: keybind("tab", "Next Agent"),
  agent_cycle_reverse: keybind("shift+tab", "Previous Agent"),
  variant_cycle: keybind("ctrl+t", "Cycle Model Variants"),
  variant_list: keybind("none", "List Model Variants"),

  messages_page_up: keybind("pageup,ctrl+alt+b", "Scroll Messages Up By One Page"),
  messages_page_down: keybind("pagedown,ctrl+alt+f", "Scroll Messages Down By One Page"),
  messages_line_up: keybind("ctrl+alt+y", "Scroll Messages Up By One Line"),
  messages_line_down: keybind("ctrl+alt+e", "Scroll Messages Down By One Line"),
  messages_half_page_up: keybind("ctrl+alt+u", "Scroll Messages Up By Half Page"),
  messages_half_page_down: keybind("ctrl+alt+d", "Scroll Messages Down By Half Page"),
  messages_first: keybind("ctrl+g,home", "Navigate To First Message"),
  messages_last: keybind("ctrl+alt+g,end", "Navigate To Last Message"),
  messages_next: keybind("none", "Navigate To Next Message"),
  messages_previous: keybind("none", "Navigate To Previous Message"),
  messages_last_user: keybind("none", "Navigate To Last User Message"),
  messages_copy: keybind("<leader>y", "Copy Message"),
  messages_undo: keybind("<leader>u", "Undo Message"),
  messages_redo: keybind("<leader>r", "Redo Message"),
  messages_toggle_conceal: keybind("<leader>h", "Toggle Code Block Concealment In Messages"),
  tool_details: keybind("none", "Toggle Tool Details Visibility"),
  display_thinking: keybind("none", "Toggle Thinking Blocks Visibility"),

  prompt_submit: keybind("none", "Submit Prompt"),
  prompt_editor_context_clear: keybind("none", "Clear Editor Context"),
  prompt_skills: keybind("none", "Open Skill Selector"),
  prompt_stash: keybind("none", "Stash Prompt"),
  prompt_stash_pop: keybind("none", "Pop Stashed Prompt"),
  prompt_stash_list: keybind("none", "List Stashed Prompts"),
  workspace_set: keybind("none", "Set Workspace"),

  input_clear: keybind("ctrl+c", "Clear Input Field"),
  input_paste: keybind({ key: "ctrl+v", preventDefault: false }, "Paste From Clipboard"),
  input_submit: keybind("return", "Submit Input"),
  input_newline: keybind("shift+return,ctrl+return,alt+return,ctrl+j", "Insert Newline In Input"),
  input_move_left: keybind("left,ctrl+b", "Move Cursor Left In Input"),
  input_move_right: keybind("right,ctrl+f", "Move Cursor Right In Input"),
  input_move_up: keybind("up", "Move Cursor Up In Input"),
  input_move_down: keybind("down", "Move Cursor Down In Input"),
  input_select_left: keybind("shift+left", "Select Left In Input"),
  input_select_right: keybind("shift+right", "Select Right In Input"),
  input_select_up: keybind("shift+up", "Select Up In Input"),
  input_select_down: keybind("shift+down", "Select Down In Input"),
  input_line_home: keybind("ctrl+a", "Move To Start Of Line In Input"),
  input_line_end: keybind("ctrl+e", "Move To End Of Line In Input"),
  input_select_line_home: keybind("ctrl+shift+a", "Select To Start Of Line In Input"),
  input_select_line_end: keybind("ctrl+shift+e", "Select To End Of Line In Input"),
  input_visual_line_home: keybind("alt+a", "Move To Start Of Visual Line In Input"),
  input_visual_line_end: keybind("alt+e", "Move To End Of Visual Line In Input"),
  input_select_visual_line_home: keybind("alt+shift+a", "Select To Start Of Visual Line In Input"),
  input_select_visual_line_end: keybind("alt+shift+e", "Select To End Of Visual Line In Input"),
  input_buffer_home: keybind("home", "Move To Start Of Buffer In Input"),
  input_buffer_end: keybind("end", "Move To End Of Buffer In Input"),
  input_select_buffer_home: keybind("shift+home", "Select To Start Of Buffer In Input"),
  input_select_buffer_end: keybind("shift+end", "Select To End Of Buffer In Input"),
  input_delete_line: keybind("ctrl+shift+d", "Delete Line In Input"),
  input_delete_to_line_end: keybind("ctrl+k", "Delete To End Of Line In Input"),
  input_delete_to_line_start: keybind("ctrl+u", "Delete To Start Of Line In Input"),
  input_backspace: keybind("backspace,shift+backspace", "Backspace In Input"),
  input_delete: keybind("ctrl+d,delete,shift+delete", "Delete Character In Input"),
  input_undo: keybind("ctrl+-,super+z", "Undo In Input"),
  input_redo: keybind("ctrl+.,super+shift+z", "Redo In Input"),
  input_word_forward: keybind("alt+f,alt+right,ctrl+right", "Move Word Forward In Input"),
  input_word_backward: keybind("alt+b,alt+left,ctrl+left", "Move Word Backward In Input"),
  input_select_word_forward: keybind("alt+shift+f,alt+shift+right", "Select Word Forward In Input"),
  input_select_word_backward: keybind("alt+shift+b,alt+shift+left", "Select Word Backward In Input"),
  input_delete_word_forward: keybind("alt+d,alt+delete,ctrl+delete", "Delete Word Forward In Input"),
  input_delete_word_backward: keybind("ctrl+w,ctrl+backspace,alt+backspace", "Delete Word Backward In Input"),
  input_select_all: keybind("super+a", "Select All In Input"),
  history_previous: keybind("up", "Previous History Item"),
  history_next: keybind("down", "Next History Item"),

  "dialog.select.prev": keybind("up,ctrl+p", "Move To Previous Dialog Item"),
  "dialog.select.next": keybind("down,ctrl+n", "Move To Next Dialog Item"),
  "dialog.select.page_up": keybind("pageup", "Move Up One Page In Dialog"),
  "dialog.select.page_down": keybind("pagedown", "Move Down One Page In Dialog"),
  "dialog.select.home": keybind("home", "Move To First Dialog Item"),
  "dialog.select.end": keybind("end", "Move To Last Dialog Item"),
  "dialog.select.submit": keybind("return", "Submit Selected Dialog Item"),
  "dialog.prompt.submit": keybind("return", "Submit Dialog Prompt"),
  "dialog.mcp.toggle": keybind("space", "Toggle MCP In MCP Dialog"),
  "dialog.move_session.new": keybind("ctrl+m", "New Project Copy"),
  "dialog.move_session.delete": keybind("ctrl+d", "Delete Project Copy"),
  "dialog.move_session.refresh": keybind("ctrl+r", "Refresh Project Copies"),
  "prompt.autocomplete.prev": keybind("up,ctrl+p", "Move To Previous Autocomplete Item"),
  "prompt.autocomplete.next": keybind("down,ctrl+n", "Move To Next Autocomplete Item"),
  "prompt.autocomplete.hide": keybind("escape", "Hide Autocomplete"),
  "prompt.autocomplete.select": keybind("return", "Select Autocomplete Item"),
  "prompt.autocomplete.complete": keybind("tab", "Complete Autocomplete Item"),
  "permission.prompt.fullscreen": keybind("ctrl+f", "Toggle Permission Prompt Fullscreen"),
  "plugins.toggle": keybind("space", "Toggle Plugin"),
  "dialog.plugins.install": keybind("shift+i", "Install Plugin From Plugin Dialog"),

  terminal_suspend: keybind("ctrl+z", "Suspend Terminal"),
  terminal_title_toggle: keybind("none", "Toggle Terminal Title"),
  tips_toggle: keybind("<leader>h", "Toggle Tips On Home Screen"),
  plugin_manager: keybind("none", "Open Plugin Manager Dialog"),
  plugin_install: keybind("none", "Install Plugin"),

  which_key_toggle: keybind("ctrl+alt+k", "Toggle Which-Key Panel"),
  which_key_layout_toggle: keybind("ctrl+alt+shift+k", "Switch Which-Key Layout"),
  which_key_pending_toggle: keybind("ctrl+alt+shift+p", "Toggle Which-Key Pending Preview"),
  which_key_group_previous: keybind("ctrl+alt+left,ctrl+alt+[", "Previous Which-Key Group"),
  which_key_group_next: keybind("ctrl+alt+right,ctrl+alt+]", "Next Which-Key Group"),
  which_key_scroll_up: keybind("ctrl+alt+up,ctrl+alt+p", "Scroll Which-Key Up"),
  which_key_scroll_down: keybind("ctrl+alt+down,ctrl+alt+n", "Scroll Which-Key Down"),
  which_key_page_up: keybind("ctrl+alt+pageup", "Page Which-Key Up"),
  which_key_page_down: keybind("ctrl+alt+pagedown", "Page Which-Key Down"),
  which_key_home: keybind("ctrl+alt+home", "Jump To First Which-Key Binding"),
  which_key_end: keybind("ctrl+alt+end", "Jump To Last Which-Key Binding"),
} satisfies Record<string, Definition>

type KeybindName = keyof typeof Definitions
const KeybindNames = new Set<string>(Object.keys(Definitions))

export const KeybindOverrides = Schema.Struct(
  Object.fromEntries(
    Object.entries(Definitions).map(([name, item]) => [
      name,
      Schema.optional(BindingValueSchema).annotate({ description: item.description }),
    ]),
  ),
).annotate({ description: "TUI keybinding overrides" })
export const Descriptions = Object.fromEntries(
  Object.entries(Definitions).map(([name, item]) => [name, item.description]),
) as Record<KeybindName, string>
export const CommandMap = {
  app_exit: "app.exit",
  app_debug: "app.debug",
  app_console: "app.console",
  app_heap_snapshot: "app.heap_snapshot",
  app_toggle_animations: "app.toggle.animations",
  app_toggle_file_context: "app.toggle.file_context",
  app_toggle_diffwrap: "app.toggle.diffwrap",
  app_toggle_paste_summary: "app.toggle.paste_summary",
  app_toggle_session_directory_filter: "app.toggle.session_directory_filter",
  command_list: "command.palette.show",
  help_show: "help.show",
  docs_open: "docs.open",
  diff_open: "diff.open",
  diff_close: "diff.close",
  diff_toggle: "diff.toggle",
  diff_expand: "diff.expand",
  diff_expand_all: "diff.expand_all",
  diff_collapse: "diff.collapse",
  diff_switch_focus: "diff.switch_focus",
  diff_next_hunk: "diff.next_hunk",
  diff_previous_hunk: "diff.previous_hunk",
  diff_next_file: "diff.next_file",
  diff_previous_file: "diff.previous_file",
  diff_toggle_file_tree: "diff.toggle_file_tree",
  diff_single_patch: "diff.single_patch",
  diff_switch_source: "diff.switch_source",
  diff_toggle_view: "diff.toggle_view",
  diff_help: "diff.help",
  editor_open: "prompt.editor",
  theme_list: "theme.switch",
  theme_switch_mode: "theme.switch_mode",
  theme_mode_lock: "theme.mode.lock",
  sidebar_toggle: "session.sidebar.toggle",
  scrollbar_toggle: "session.toggle.scrollbar",
  status_view: "opencode.status",
  debug_view: "opencode.debug",
  session_export: "session.export",
  session_copy: "session.copy",
  session_move: "session.move",
  session_new: "session.new",
  session_list: "session.list",
  session_timeline: "session.timeline",
  session_fork: "session.fork",
  session_rename: "session.rename",
  session_delete: "session.delete",
  session_share: "session.share",
  session_unshare: "session.unshare",
  session_interrupt: "session.interrupt",
  session_background: "session.background",
  session_compact: "session.compact",
  session_toggle_timestamps: "session.toggle.timestamps",
  session_toggle_generic_tool_output: "session.toggle.generic_tool_output",
  session_queued_prompts: "session.queued_prompts",
  session_child_first: "session.child.first",
  session_child_cycle: "session.child.next",
  session_child_cycle_reverse: "session.child.previous",
  session_parent: "session.parent",
  session_pin_toggle: "session.pin.toggle",
  session_quick_switch_1: "session.quick_switch.1",
  session_quick_switch_2: "session.quick_switch.2",
  session_quick_switch_3: "session.quick_switch.3",
  session_quick_switch_4: "session.quick_switch.4",
  session_quick_switch_5: "session.quick_switch.5",
  session_quick_switch_6: "session.quick_switch.6",
  session_quick_switch_7: "session.quick_switch.7",
  session_quick_switch_8: "session.quick_switch.8",
  session_quick_switch_9: "session.quick_switch.9",
  stash_delete: "stash.delete",
  model_provider_list: "model.dialog.provider",
  model_favorite_toggle: "model.dialog.favorite",
  model_list: "model.list",
  model_cycle_recent: "model.cycle_recent",
  model_cycle_recent_reverse: "model.cycle_recent_reverse",
  model_cycle_favorite: "model.cycle_favorite",
  model_cycle_favorite_reverse: "model.cycle_favorite_reverse",
  mcp_list: "mcp.list",
  provider_connect: "provider.connect",
  console_org_switch: "console.org.switch",
  agent_list: "agent.list",
  agent_cycle: "agent.cycle",
  agent_cycle_reverse: "agent.cycle.reverse",
  variant_cycle: "variant.cycle",
  variant_list: "variant.list",
  messages_page_up: "session.page.up",
  messages_page_down: "session.page.down",
  messages_line_up: "session.line.up",
  messages_line_down: "session.line.down",
  messages_half_page_up: "session.half.page.up",
  messages_half_page_down: "session.half.page.down",
  messages_first: "session.first",
  messages_last: "session.last",
  messages_next: "session.message.next",
  messages_previous: "session.message.previous",
  messages_last_user: "session.messages_last_user",
  messages_copy: "messages.copy",
  messages_undo: "session.undo",
  messages_redo: "session.redo",
  messages_toggle_conceal: "session.toggle.conceal",
  tool_details: "session.toggle.actions",
  display_thinking: "session.toggle.thinking",
  prompt_submit: "prompt.submit",
  prompt_editor_context_clear: "prompt.editor_context.clear",
  prompt_skills: "prompt.skills",
  prompt_stash: "prompt.stash",
  prompt_stash_pop: "prompt.stash.pop",
  prompt_stash_list: "prompt.stash.list",
  workspace_set: "workspace.set",
  input_clear: "prompt.clear",
  input_paste: "prompt.paste",
  input_submit: "input.submit",
  input_newline: "input.newline",
  input_move_left: "input.move.left",
  input_move_right: "input.move.right",
  input_move_up: "input.move.up",
  input_move_down: "input.move.down",
  input_select_left: "input.select.left",
  input_select_right: "input.select.right",
  input_select_up: "input.select.up",
  input_select_down: "input.select.down",
  input_line_home: "input.line.home",
  input_line_end: "input.line.end",
  input_select_line_home: "input.select.line.home",
  input_select_line_end: "input.select.line.end",
  input_visual_line_home: "input.visual.line.home",
  input_visual_line_end: "input.visual.line.end",
  input_select_visual_line_home: "input.select.visual.line.home",
  input_select_visual_line_end: "input.select.visual.line.end",
  input_buffer_home: "input.buffer.home",
  input_buffer_end: "input.buffer.end",
  input_select_buffer_home: "input.select.buffer.home",
  input_select_buffer_end: "input.select.buffer.end",
  input_delete_line: "input.delete.line",
  input_delete_to_line_end: "input.delete.to.line.end",
  input_delete_to_line_start: "input.delete.to.line.start",
  input_backspace: "input.backspace",
  input_delete: "input.delete",
  input_undo: "input.undo",
  input_redo: "input.redo",
  input_word_forward: "input.word.forward",
  input_word_backward: "input.word.backward",
  input_select_word_forward: "input.select.word.forward",
  input_select_word_backward: "input.select.word.backward",
  input_delete_word_forward: "input.delete.word.forward",
  input_delete_word_backward: "input.delete.word.backward",
  input_select_all: "input.select.all",
  history_previous: "prompt.history.previous",
  history_next: "prompt.history.next",
  terminal_suspend: "terminal.suspend",
  terminal_title_toggle: "terminal.title.toggle",
  tips_toggle: "tips.toggle",
  plugin_manager: "plugins.list",
  plugin_install: "plugins.install",
  which_key_toggle: "which-key.toggle",
  which_key_layout_toggle: "which-key.layout.toggle",
  which_key_pending_toggle: "which-key.pending.toggle",
  which_key_group_previous: "which-key.group.previous",
  which_key_group_next: "which-key.group.next",
  which_key_scroll_up: "which-key.scroll.up",
  which_key_scroll_down: "which-key.scroll.down",
  which_key_page_up: "which-key.page.up",
  which_key_page_down: "which-key.page.down",
  which_key_home: "which-key.home",
  which_key_end: "which-key.end",
} satisfies BindingCommandMap
const CommandDescriptions = Object.fromEntries(
  Object.entries(Definitions).map(([name, item]) => [
    CommandMap[name as keyof typeof CommandMap] ?? name,
    item.description,
  ]),
) as Record<string, string>

export type Keybinds = { [K in KeybindName]: BindingValueSchema }
export type KeybindOverrides = Partial<Keybinds>
export type BindingLookupView = {
  readonly bindings: readonly Binding<Renderable, KeyEvent>[]
  get(command: string): readonly Binding<Renderable, KeyEvent>[]
  has(command: string): boolean
  gather(name: string, commands: readonly string[]): readonly Binding<Renderable, KeyEvent>[]
  pick(name: string, commands: readonly string[]): Binding<Renderable, KeyEvent>[]
  omit(name: string, commands: readonly string[]): Binding<Renderable, KeyEvent>[]
}

export function toBindingConfig(keybinds: Keybinds): BindingConfig<Renderable, KeyEvent> {
  return Object.fromEntries(Object.entries(keybinds)) as BindingConfig<Renderable, KeyEvent>
}

const decodeBindingValue = Schema.decodeUnknownSync(BindingValueSchema)

export function defaultValue(name: KeybindName) {
  return Definitions[name].default
}

export function parse(keybinds: KeybindOverrides): Keybinds {
  const invalid = unknownKeys(keybinds)
  if (invalid.length) throw new Error(`Unrecognized keybind${invalid.length === 1 ? "" : "s"}: ${invalid.join(", ")}`)
  return Object.fromEntries(
    Object.entries(Definitions).map(([name, item]) => [
      name,
      decodeBindingValue(keybinds[name as KeybindName] ?? item.default),
    ]),
  ) as Keybinds
}

export const Keybinds = { parse }

export function unknownKeys(input: object) {
  return Object.keys(input).filter((key) => !KeybindNames.has(key))
}

export function bindingDefaults(): BindingDefaults<Renderable, KeyEvent> {
  return ({ command, binding }) => {
    if (binding.desc !== undefined) return
    return { desc: CommandDescriptions[command] }
  }
}
