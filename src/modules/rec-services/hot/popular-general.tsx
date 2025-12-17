import { delay } from 'es-toolkit'
import { REQUEST_FAIL_MSG } from '$common'
import { CheckboxSettingItem, SwitchSettingItem } from '$components/ModalSettings/setting-item'

import { useOnRefresh } from '$components/Recommends/rec.shared'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import type { PopularGeneralItemExtend } from '$define'
import type { PopularGeneralJson } from '$define/popular-general'
import type { IService } from '../_base'

export class PopularGeneralRecService implements IService {
  hasMore = true
  page = 1
  tabbarView = (<PopularGeneralTabbarView />)

  constructor(private anonymous: boolean) {}

  async loadMore() {
    if (!this.hasMore) return

    const res = await request.get('/x/web-interface/popular', {
      params: {
        ps: 20,
        pn: this.page,
      },
      withCredentials: !this.anonymous,
    })
    const json = res.data as PopularGeneralJson
    if (!isWebApiSuccess(json)) {
      return (toast(json.message || REQUEST_FAIL_MSG), undefined)
    }

    this.page++
    this.hasMore = !json.data.no_more

    const items = (json.data.list || []).map((item) => {
      return {
        ...item,
        api: EApiType.PopularGeneral,
        uniqId: `${EApiType.PopularGeneral}-${item.bvid}`,
      } satisfies PopularGeneralItemExtend
    })
    return items
  }
}

function PopularGeneralTabbarView() {
  const onRefresh = useOnRefresh()

  const tooltip = <>✅ 匿名访问: 使用游客身份访问</>
  const extraAction = async () => {
    await delay(100)
    onRefresh()
  }

  const _switch = (
    <SwitchSettingItem
      configPath={'popularGeneralUseAnonymous'}
      checkedChildren='匿名访问: 开'
      unCheckedChildren='匿名访问: 关'
      tooltip={tooltip}
      extraAction={extraAction}
    />
  )

  const checkbox = (
    <CheckboxSettingItem
      configPath={'popularGeneralUseAnonymous'}
      tooltip={tooltip}
      label='匿名访问'
      extraAction={extraAction}
    />
  )

  return checkbox
}
