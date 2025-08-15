import { cloneDeep } from 'es-toolkit'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { useLinkTarget } from '$components/VideoCard/use/useOpenRelated'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForOpenExternalLink } from '$modules/icon'
import { hotStore } from '$modules/rec-services/hot'
import type { AxiosError } from 'axios'
import type { ReactNode } from 'react'

function isAxiosError(err: any): err is AxiosError {
  return err instanceof Error && err.name === 'AxiosError'
}

function wrapWithParagraph(node: ReactNode) {
  if (!node) return node
  return <p className='mt-10px'>{node}</p>
}

function inspectErrDetail(err: any): ReactNode {
  if (!(err instanceof Error)) {
    return wrapWithParagraph(JSON.stringify(err))
  }

  // errors
  let errSelf: ReactNode
  let errCause: ReactNode
  let errAxiosErrorDetail: ReactNode

  // display stack, fallback to message
  if (err.stack) {
    errSelf = (
      <>
        Error Stack: <br />
        {err.stack}
      </>
    )
  } else {
    errSelf = <>Error Message: {err.message}</>
  }

  // add error cause
  if (err.cause) {
    errCause = <>Error Cause: {inspectErrDetail(err.cause)}</>
  }

  // if it's axios error
  if (isAxiosError(err)) {
    const _err = cloneDeep(err)
    // hide sensitive access_key
    if (_err.config?.params?.access_key) {
      _err.config.params.access_key = '*'.repeat(_err.config.params.access_key.length)
    }
    errAxiosErrorDetail = <>axios config: {JSON.stringify(_err.config, null, 2)}</>
  }

  return (
    <>
      {wrapWithParagraph(errSelf)}
      {wrapWithParagraph(errCause)}
      {wrapWithParagraph(errAxiosErrorDetail)}
    </>
  )
}

function getErrLabel(err: any): ReactNode {
  if (err && err instanceof ShowMessageError && err.message) return err.message
  return '出错了, 请刷新重试!'
}

export class ShowMessageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShowMessageError'
  }
}

export function ErrorDetail({ err, tab }: { err: any; tab: ETab }) {
  const target = useLinkTarget()
  const errLabel = useMemo(() => getErrLabel(err), [err])
  const errDetail = useMemo(() => inspectErrDetail(err), [err])
  return (
    <div className='p-20px text-center text-size-20px'>
      <AntdTooltip
        title={
          <div className='py-10px'>
            <h3>错误详情</h3>
            <div className='max-h-50vh overflow-hidden overflow-y-auto whitespace-pre-wrap break-normal'>
              {errDetail}
            </div>
          </div>
        }
      >
        <p className='flex cursor-pointer items-center justify-center'>
          <IconTablerFaceIdError className='mr-4px' />
          {errLabel}
        </p>
      </AntdTooltip>

      {tab === ETab.Hot && hotStore.subtab === EHotSubTab.PopularWeekly && (
        <p className='mt-8px flex items-center justify-center'>
          可能需手动输入验证码
          <IconForOpenExternalLink className='ml-12px' />
          <a href='https://www.bilibili.com/v/popular/weekly' target={target} className='ml-2px'>
            每周必看
          </a>
        </p>
      )}
    </div>
  )
}
