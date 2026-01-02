import { APP_CLS_ROOT, OPERATION_FAIL_MSG, REQUEST_FAIL_MSG } from '$common'
import { clsZToast } from '$components/fragments'

const ToastClassNames = {
  default: clsx(
    'fixed left-50% top-50% max-w-450px min-w-200px w-[max-content] translate-x--50% translate-y--50% whitespace-pre-wrap rounded-6px bg-gate-primary px-24px py-12px text-14px text-white',
    clsZToast,
  ),
  singleLine: 'text-center',
}

export default function toast(msg: string, duration = 2000, container = document.body) {
  const div = document.createElement('div')
  div.textContent = msg

  const isSingleLine = !msg.includes('\n') && !msg.includes('<br')
  div.className = clsx(APP_CLS_ROOT, ToastClassNames.default, isSingleLine && ToastClassNames.singleLine)

  container.appendChild(div)
  setTimeout(() => div.remove(), duration)
}

export function toastRequestFail() {
  return toast(REQUEST_FAIL_MSG)
}

export function toastOperationFail() {
  return toast(OPERATION_FAIL_MSG)
}
