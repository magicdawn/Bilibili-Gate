import { APP_NAMESPACE, OPERATION_FAIL_MSG } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import type { Reason } from '$components/ModalDislike'
import { delDislikeId } from '$components/ModalDislike'
import type { AppRecItemExtend, RecItemType } from '$define'
import { antMessage } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { IconForBlacklist, IconForReset } from '$modules/icon'
import { toastRequestFail } from '$utility/toast'
import { css } from '@emotion/react'
import { videoCardBorderRadiusValue } from '../../css-vars'
import type { VideoCardEmitter } from '../index.shared'
import { defaultEmitter } from '../index.shared'
import type { IVideoCardData } from '../process/normalize'
import { cancelDislike } from '../services'
import { skeletonActive as clsSkeletonActive } from './skeleton.module.scss'
import { VideoCardBottom } from './VideoCardBottom'

export const SkeletonCard = memo(function SkeletonCard({ loading }: { loading: boolean }) {
  return (
    <div
      className={clsx('bili-video-card__skeleton', {
        hide: !loading,
        [clsSkeletonActive]: loading,
      })}
    >
      <div
        className='bili-video-card__skeleton--cover'
        style={{ borderRadius: videoCardBorderRadiusValue }}
      />
      <div className='bili-video-card__skeleton--info px-5px'>
        <div className='bili-video-card__skeleton--avatar size-32px rounded-50%' />
        <div className='bili-video-card__skeleton--right flex-1 ml-10px'>
          <p className='bili-video-card__skeleton--text'></p>
          <p className='bili-video-card__skeleton--text short'></p>
          <p className='bili-video-card__skeleton--light'></p>
          <p className='bili-video-card__skeleton--text tiny'></p>
        </div>
      </div>
    </div>
  )
})

const blockedCardCss = {
  wrapper: css`
    /* grid align-items 默认为 stretch, 同 row 互相撑起高度 */
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `,

  cover: css`
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    aspect-ratio: 16 / 9;
    // padding-top: #{calc(9 / 16 * 100%)};
    position: relative;
  `,

  coverInner: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,

  dislikeReason: css`
    font-size: 20px;
    text-align: center;
  `,
  dislikeDesc: css`
    font-size: 16px;
    text-align: center;
  `,

  action: css`
    flex: 1;
    position: relative;
  `,
  actionInner: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* as separator */
    border-top: 1px solid var(--${APP_NAMESPACE}-separator-color);
    transition: border-top-color 0.3s;

    display: flex;
    align-items: center;
    justify-content: center;

    button {
      font-size: 16px;
      color: inherit;
      display: flex;
      align-items: center;
    }
  `,
}

export const DislikedCard = memo(function DislikedCard({
  item,
  cardData,
  dislikedReason,
  emitter = defaultEmitter,
}: {
  item: AppRecItemExtend
  cardData: IVideoCardData
  dislikedReason: Reason
  emitter?: VideoCardEmitter
}) {
  const onCancelDislike = useMemoizedFn(async () => {
    if (!dislikedReason?.id) return

    let success = false
    let message = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await cancelDislike(item, dislikedReason.id))
    } catch (e) {
      err = e as Error
    }
    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    if (success) {
      antMessage.success('已撤销')
      delDislikeId(item.param)
    } else {
      antMessage.error(message || OPERATION_FAIL_MSG)
    }
  })

  useMittOn(emitter, 'cancel-dislike', onCancelDislike)

  return (
    <div css={blockedCardCss.wrapper}>
      <div css={blockedCardCss.cover}>
        <div css={blockedCardCss.coverInner}>
          <IconParkOutlineDistraughtFace className='size-32px mb-5px' />
          <div css={blockedCardCss.dislikeReason}>{dislikedReason?.name}</div>
          <div css={blockedCardCss.dislikeDesc}>
            {dislikedReason?.toast || '将减少此类内容推荐'}
          </div>
        </div>
      </div>
      <__BottomRevertAction item={item} cardData={cardData} onClick={onCancelDislike} />
    </div>
  )
})

function __BottomRevertAction({
  item,
  cardData,
  onClick,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onClick: () => void
}) {
  return (
    <div css={blockedCardCss.action}>
      {/* 需要它撑起高度 */}
      <VideoCardBottom item={item} cardData={cardData} className='invisible' />
      <div css={blockedCardCss.actionInner}>
        <button onClick={onClick}>
          <IconForReset className='size-16px mr-4px mt--2px' />
          撤销
        </button>
      </div>
    </div>
  )
}

export const BlacklistCard = memo(function BlacklistCard({
  item,
  cardData,
}: {
  item: RecItemType
  cardData: IVideoCardData
}) {
  const { authorMid, authorName } = cardData

  const onCancel = useMemoizedFn(async () => {
    if (!authorMid) return
    const success = await UserBlacklistService.remove(authorMid)
    if (success) antMessage.success(`已移出黑名单: ${authorName}`)
  })

  return (
    <div css={blockedCardCss.wrapper}>
      <div css={blockedCardCss.cover}>
        <div css={blockedCardCss.coverInner}>
          <IconForBlacklist className='size-32px mb-5px' />
          <div css={blockedCardCss.dislikeReason}>已拉黑</div>
          <div css={blockedCardCss.dislikeDesc}>UP: {authorName}</div>
        </div>
      </div>
      <__BottomRevertAction item={item} cardData={cardData} onClick={onCancel} />
    </div>
  )
})
