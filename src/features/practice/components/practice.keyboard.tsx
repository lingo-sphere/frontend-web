'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { practiceKeyAction } from '../lib/practice-keyboard'

type Feature =
  'answers' | 'navigate' | 'check' | 'save' | 'submit' | 'record' | 'audio'
const preference = 'practice-keyboard-characters'
const letterPreference = 'practice-keyboard-letters'
let letterOverride: boolean | undefined
const readLetters = () => {
  try {
    return letterOverride ?? localStorage.getItem(letterPreference) === 'on'
  } catch {
    return letterOverride ?? false
  }
}
const changed = 'practice-keyboard-preference'
let characterOverride: boolean | undefined
const readPreference = () => {
  try {
    return characterOverride ?? localStorage.getItem(preference) !== 'off'
  } catch {
    return characterOverride ?? true
  }
}
const subscribe = (listener: () => void) => {
  const external = () => {
    characterOverride = undefined
    letterOverride = undefined
    listener()
  }
  window.addEventListener('storage', external)
  window.addEventListener(changed, listener)
  return () => {
    window.removeEventListener('storage', external)
    window.removeEventListener(changed, listener)
  }
}
const visible = (node: HTMLElement) =>
  !node.closest('[hidden],[inert],[aria-hidden="true"]') &&
  node.getClientRects().length > 0
const available = (node: HTMLElement) =>
  visible(node) &&
  !node.matches(':disabled,[aria-disabled="true"]') &&
  !node.closest('fieldset:disabled')
const editable = (node: Element) =>
  !!node.closest(
    'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="combobox"],[role="slider"],[role="spinbutton"]',
  )

/** A scoped keyboard layer: every action clicks the existing, enabled UI control. */
export function PracticeKeyboard({
  children,
  className,
  as: Tag = 'div',
  features = [],
  enterMode = false,
  withinGroup = false,
  ...props
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'main'
  features?: Feature[]
  enterMode?: boolean
  withinGroup?: boolean
  'data-speaking-workspace'?: boolean
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith('vi')
  const root = useRef<HTMLElement | null>(null),
    help = useRef<HTMLDetailsElement>(null),
    active = useRef<HTMLElement | null>(null)
  const beforeHelp = useRef<HTMLElement | null>(null),
    pending = useRef<HTMLElement | null>(null)
  const [navigationNote, setNavigationNote] = useState('')
  const [confirm, setConfirm] = useState(false)
  const characters = useSyncExternalStore(subscribe, readPreference, () => true)
  const letters = useSyncExternalStore(subscribe, readLetters, () => false)
  const actions = (scope: HTMLElement, action: string) =>
    Array.from(
      scope.querySelectorAll<HTMLElement>(`[data-practice-action="${action}"]`),
    ).find(available)
  useEffect(() => {
    const scope = root.current
    if (!scope) return
    const questions = () =>
      Array.from(
        scope.querySelectorAll<HTMLElement>('[data-practice-question]'),
      ).filter(visible)
    const activate = (node: HTMLElement | undefined, focus = false) => {
      if (!node) return
      for (const item of questions())
        item.toggleAttribute('data-keyboard-current', item === node)
      active.current = node
      if (focus) {
        node.focus({ preventScroll: true })
        node.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    }
    const refresh = () => {
      if (!active.current || !scope.contains(active.current))
        activate(questions()[0])
    }
    const track = (event: Event) => {
      if (event.target instanceof Element) {
        const question = event.target.closest<HTMLElement>(
          '[data-practice-question]',
        )
        if (question) {
          setNavigationNote('')
          activate(question)
        }
      }
    }
    refresh()
    const observer = new MutationObserver(() => {
      const changed = active.current && !scope.contains(active.current)
      refresh()
      if (changed) setNavigationNote('')
    })
    observer.observe(scope, { childList: true, subtree: true })
    const onKey = (event: KeyboardEvent) => {
      const target =
        event.target instanceof Element ? event.target : document.body
      if (
        !scope.contains(target) &&
        target !== document.body &&
        target !== document.documentElement
      )
        return
      if (event.defaultPrevented || event.repeat || event.isComposing) return
      const overlay = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[role="dialog"],[role="alertdialog"],[aria-modal="true"],[data-practice-modal]',
        ),
      )
        .filter(visible)
        .at(-1)
      if (overlay) {
        if (event.key === 'Escape' && scope.contains(overlay)) {
          const dismiss = overlay.querySelector<HTMLElement>(
            '[data-practice-dismiss]',
          )
          if (dismiss && available(dismiss)) {
            event.preventDefault()
            dismiss.click()
          }
        }
        return
      }
      // Help can be dismissed while its preference checkbox has focus.
      if (
        help.current?.open &&
        event.key === 'Escape' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault()
        help.current.open = false
        beforeHelp.current?.focus()
        return
      }
      const key = practiceKeyAction(
        event,
        editable(target),
        characters,
        letters,
      )
      if (!key) return
      if (help.current?.open) {
        if (key.action === 'help' || key.action === 'exit') {
          event.preventDefault()
          help.current.open = false
          beforeHelp.current?.focus()
        }
        return
      }
      if (key.action === 'help') {
        event.preventDefault()
        beforeHelp.current = document.activeElement as HTMLElement
        help.current!.open = true
        help.current!.querySelector('summary')?.focus()
        return
      }
      if (
        (key.action === 'enter' || key.action === 'play') &&
        !(
          key.action === 'enter' &&
          enterMode &&
          target.closest('[data-practice-option]')
        ) &&
        target.closest(
          'button,a,[role="button"],audio,video,summary,[role="radio"],[role="checkbox"],[role="menuitem"]',
        )
      )
        return
      if (
        target.closest(
          '[role="menu"],[role="listbox"],[role="radiogroup"],[role="tablist"]',
        )
      )
        return
      let control: HTMLElement | undefined
      if (key.action === 'answer') {
        refresh()
        const container = active.current || scope
        const options = Array.from(
          container.querySelectorAll<HTMLElement>('[data-practice-option]'),
        )
        control = /^\d$/.test(key.answer!)
          ? options[Number(key.answer) - 1]
          : options.find(
              (option) =>
                option.dataset.practiceOption?.toUpperCase() === key.answer,
            )
      } else if (key.action === 'enter') {
        if (!enterMode) return
        control = actions(scope, 'check') || actions(scope, 'next')
      } else if (key.action === 'play') {
        const media = target.closest<HTMLElement>('[data-practice-media]')
        if (!media) return
        control = actions(media, 'play')
      } else if (key.action === 'previous' || key.action === 'next') {
        refresh()
        const list = questions(),
          index = list.indexOf(active.current!)
        const adjacent = list[index + (key.action === 'next' ? 1 : -1)]
        if (withinGroup) {
          event.preventDefault()
          if (adjacent) {
            setNavigationNote('')
            activate(adjacent, true)
          } else {
            const next = key.action === 'next'
            const canChangeGroup = actions(
              scope,
              next ? 'next-group' : 'previous-group',
            )
            setNavigationNote(
              vi
                ? next
                  ? canChangeGroup
                    ? 'Đã đến câu cuối nhóm. Nhấn Shift + → để sang nhóm tiếp theo.'
                    : 'Đây là câu cuối của nhóm cuối cùng.'
                  : canChangeGroup
                    ? 'Đây là câu đầu nhóm. Nhấn Shift + ← để về nhóm trước.'
                    : 'Đây là câu đầu của nhóm đầu tiên.'
                : next
                  ? canChangeGroup
                    ? 'Last question in this group. Press Shift + → for the next group.'
                    : 'Last question in the final group.'
                  : canChangeGroup
                    ? 'First question in this group. Press Shift + ← for the previous group.'
                    : 'First question in the first group.',
            )
          }
          return
        }
        control = actions(scope, key.action)
      } else if (
        key.action === 'previous-group' ||
        key.action === 'next-group'
      ) {
        if (!withinGroup) return
        control = actions(scope, key.action)
      } else control = actions(scope, key.action)
      if (key.action === 'submit' && !control) {
        control = actions(scope, 'submit-review')
        if (control) {
          event.preventDefault()
          control.click()
        }
        return
      }
      if (!control || !available(control)) return
      event.preventDefault()
      if (key.action === 'submit') {
        pending.current = control
        setConfirm(true)
        return
      }
      setNavigationNote('')
      control.click()
      if (
        key.action === 'previous' ||
        key.action === 'next' ||
        key.action === 'previous-group' ||
        key.action === 'next-group' ||
        (key.action === 'enter' && control.dataset.practiceAction === 'next')
      )
        requestAnimationFrame(() => {
          if (root.current === scope) activate(questions()[0], true)
        })
      // Keep keyboard focus on the question rather than an unrelated toolbar.
      if (key.action === 'answer') {
        control.focus({ preventScroll: true })
        control.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    }
    scope.addEventListener('focusin', track)
    scope.addEventListener('pointerdown', track)
    document.addEventListener('keydown', onKey)
    return () => {
      observer.disconnect()
      scope.removeEventListener('focusin', track)
      scope.removeEventListener('pointerdown', track)
      document.removeEventListener('keydown', onKey)
    }
  }, [characters, letters, enterMode, withinGroup, vi])
  const rows: [string, string][] = [
    [
      'Tab / Shift+Tab',
      vi ? 'Di chuyển giữa các nút và ô nhập' : 'Move between controls',
    ],
    [
      'Esc',
      vi
        ? 'Đóng hộp thoại hoặc yêu cầu rời bài'
        : 'Close a dialog or request exit',
    ],
    ...(characters
      ? [
          ['?', vi ? 'Mở/đóng hướng dẫn' : 'Toggle shortcut help'] as [
            string,
            string,
          ],
        ]
      : []),
  ]
  if (features.includes('answers'))
    rows.push([
      '1, 2, 3…',
      vi
        ? 'Cách chính: chọn theo số ghi trên đáp án của câu đang thao tác'
        : 'Primary: choose the numbered option in the active question',
    ])
  if (features.includes('answers') && letters)
    rows.push([
      'A–I',
      vi
        ? 'Cách phụ: chọn theo chữ đáp án khi đã bật'
        : 'Optional: select by option letter when enabled',
    ])
  if (features.includes('navigate'))
    rows.push([
      '← / →',
      withinGroup
        ? vi
          ? 'Chỉ đổi câu trong nhóm hiện tại; không tự chuyển nhóm'
          : 'Questions in this group only; never changes groups'
        : vi
          ? 'Câu/đoạn trước hoặc tiếp theo'
          : 'Previous or next question/segment',
    ])
  if (features.includes('navigate') && withinGroup)
    rows.push([
      'Shift + ← / →',
      vi
        ? 'Chuyển nhóm bài nghe trước / tiếp theo'
        : 'Previous / next listening group',
    ])
  if (features.includes('check'))
    rows.push([
      'Enter',
      vi
        ? 'Kiểm tra; chuyển câu sau khi đã kiểm tra. Không tự nộp.'
        : 'Check; advance after checking. Never submits.',
    ])
  if (features.includes('save'))
    rows.push(['Ctrl/⌘ + S', vi ? 'Lưu bản nháp' : 'Save draft'])
  if (features.includes('submit'))
    rows.push([
      'Ctrl/⌘ + Enter',
      vi ? 'Mở xác nhận nộp bài' : 'Open submission confirmation',
    ])
  if (features.includes('record'))
    rows.push([
      'R',
      vi
        ? 'Thực hiện đúng thao tác trên nút đang có nhãn R'
        : 'Perform the action labeled R on the current button',
    ])
  if (features.includes('audio'))
    rows.push([
      'Space',
      vi
        ? 'Phát/tạm dừng khi focus ở trình phát'
        : 'Play/pause while focused on the audio player',
    ])
  return (
    <Tag
      ref={(node) => {
        root.current = node
      }}
      className={`${className || ''} [&_[data-practice-option]:focus-visible]:outline-2 [&_[data-practice-option]:focus-visible]:outline-primary [&_[data-practice-option]:focus-visible]:outline-offset-2`}
      {...props}
      data-practice-workspace
    >
      <details
        ref={help}
        className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary [&_summary]:focus-visible:outline-2 [&_summary]:focus-visible:outline-primary"
      >
        <summary className="cursor-pointer select-none font-medium">
          {vi ? 'Phím tắt bàn phím' : 'Keyboard shortcuts'}{' '}
          {characters && (
            <kbd className="ml-2 rounded border border-border px-1">?</kbd>
          )}
        </summary>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {rows.map(([keys, label]) => (
            <div key={keys} className="flex items-start gap-3">
              <dt>
                <kbd className="whitespace-nowrap rounded border border-border px-1.5 font-mono">
                  {keys}
                </kbd>
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <label className="mt-3 flex min-h-9 items-center gap-2">
          <input
            type="checkbox"
            checked={characters}
            onChange={(event) => {
              characterOverride = event.target.checked
              try {
                localStorage.setItem(
                  preference,
                  event.target.checked ? 'on' : 'off',
                )
              } catch {}
              window.dispatchEvent(new Event(changed))
            }}
          />
          {vi
            ? 'Bật phím chữ/số để chọn đáp án và ghi âm'
            : 'Enable single character answer/recording shortcuts'}
        </label>
        {features.includes('answers') && (
          <label className="flex min-h-9 items-center gap-2">
            <input
              type="checkbox"
              checked={letters}
              disabled={!characters}
              onChange={(event) => {
                letterOverride = event.target.checked
                try {
                  localStorage.setItem(
                    letterPreference,
                    event.target.checked ? 'on' : 'off',
                  )
                } catch {}
                window.dispatchEvent(new Event(changed))
              }}
            />
            {vi
              ? 'Dùng thêm phím chữ A–I (tùy chọn); mặc định chọn bằng số'
              : 'Also enable A–I letters (optional); numbers are the default'}
          </label>
        )}
        <p className="mt-1">
          {vi
            ? 'Phím chữ, số, mũi tên và dấu cách không can thiệp khi bạn đang nhập nội dung. Chỉ thao tác được với nút đang khả dụng.'
            : 'Typing is preserved in text fields. Shortcuts only activate available controls.'}
        </p>
      </details>
      {withinGroup && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-text-secondary"
        >
          {navigationNote}
        </p>
      )}
      {children}
      <Dialog.Root
        open={confirm}
        onOpenChange={(open) => {
          setConfirm(open)
          if (!open) pending.current = null
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[10000] bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[10001] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              {vi ? 'Nộp bài để chấm?' : 'Submit for grading?'}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-text-secondary">
              {vi
                ? 'Kiểm tra lại câu trả lời trước khi xác nhận. Phím tắt chưa gửi bài.'
                : 'Review your answers before confirming. The shortcut has not submitted your work.'}
            </Dialog.Description>
            <div className="mt-5 flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="outline">
                  {vi ? 'Tiếp tục làm' : 'Keep working'}
                </Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  const button = pending.current
                  pending.current = null
                  setConfirm(false)
                  requestAnimationFrame(() => {
                    if (
                      button &&
                      root.current?.contains(button) &&
                      available(button)
                    )
                      button.click()
                  })
                }}
              >
                {vi ? 'Xác nhận nộp bài' : 'Confirm submission'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Tag>
  )
}

export function PracticeOptionKey({ index }: { index: number }) {
  const enabled = useSyncExternalStore(subscribe, readPreference, () => true)
  return enabled && index < 9 ? (
    <kbd
      aria-hidden="true"
      className="ml-auto inline-flex shrink-0 rounded border border-current/25 px-1.5 py-0.5 font-mono text-[11px] opacity-70"
    >
      {index + 1}
    </kbd>
  ) : null
}

/** The action name remains the button text; show R only when it is enabled. */
export function PracticeRecordKey() {
  const enabled = useSyncExternalStore(subscribe, readPreference, () => true)
  return enabled ? (
    <kbd
      aria-hidden="true"
      className="ml-2 rounded border border-current/25 px-1.5 py-0.5 font-mono text-xs"
    >
      R
    </kbd>
  ) : null
}
