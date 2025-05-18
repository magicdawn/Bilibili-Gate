import { useRequest } from 'ahooks'
import { Button, Popconfirm, Space } from 'antd'
import { deleteAccessKey, getAccessKey } from '$modules/access-key'
import { useSettingsSnapshot } from '$modules/settings'

const btnAccessKeyHelpLink = (
  <Button
    target='_blank'
    href='https://github.com/indefined/UserScripts/tree/master/bilibiliHome#%E6%8E%88%E6%9D%83%E8%AF%B4%E6%98%8E'
  >
    access_key 说明
  </Button>
)

export function AccessKeyManage({ style, className }: { style?: CSSProperties; className?: string }) {
  const { runAsync, loading } = useRequest(getAccessKey, { manual: true })
  const { accessKey } = useSettingsSnapshot()
  const onDeleteAccessKey = deleteAccessKey

  return (
    <Space size='small' style={style} className={className}>
      {!accessKey ? (
        <>
          <Button onClick={runAsync} loading={loading}>
            获取 access_key
          </Button>
          {btnAccessKeyHelpLink}
        </>
      ) : (
        <>
          <Button onClick={runAsync} loading={loading}>
            重新获取 access_key
          </Button>
          <Popconfirm onConfirm={onDeleteAccessKey} title='确定删除 access_key?'>
            <Button>删除 access_key</Button>
          </Popconfirm>
          {btnAccessKeyHelpLink}
        </>
      )}
    </Space>
  )
}
