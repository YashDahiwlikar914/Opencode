import { TextAttributes } from "@opentui/core"
import { createStore } from "solid-js/store"
import { For } from "solid-js"
import { useTheme } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { useBindings } from "../keymap"

export function DialogWorkspaceUnavailable(props: { onRestore?: () => boolean | void | Promise<boolean | void> }) {
  const dialog = useDialog()
  const { theme } = useTheme()
  const [store, setStore] = createStore({
    active: "restore" as "cancel" | "restore",
  })

  const options = ["cancel", "restore"] as const

  async function confirm() {
    if (store.active === "cancel") {
      dialog.clear()
      return
    }
    const result = await props.onRestore?.()
    if (result === false) return
  }

  useBindings(() => ({
    bindings: [
      { key: "return", desc: "Confirm Workspace Option", group: "Dialog", cmd: () => void confirm() },
      { key: "left", desc: "Cancel Workspace Restore", group: "Dialog", cmd: () => setStore("active", "cancel") },
      { key: "right", desc: "Restore Workspace", group: "Dialog", cmd: () => setStore("active", "restore") },
    ],
  }))

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Workspace Unavailable
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          Esc
        </text>
      </box>
      <text fg={theme.textMuted} wrapMode="word">
        This Session Is Attached To A Workspace That Is No Longer Available.
      </text>
      <text fg={theme.textMuted} wrapMode="word">
        Would You Like To Restore This Session Into A New Workspace?
      </text>
      <box flexDirection="row" justifyContent="flex-end" paddingBottom={1} gap={1}>
        <For each={options}>
          {(item) => (
            <box
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={item === store.active ? theme.primary : undefined}
              onMouseUp={() => {
                setStore("active", item)
                void confirm()
              }}
            >
              <text fg={item === store.active ? theme.selectedListItemText : theme.textMuted}>{item}</text>
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
