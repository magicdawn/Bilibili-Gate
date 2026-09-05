## 投稿中合集只展示单个卡片

code: https://s1.hdslb.com/bfs/static/shanks/fresh-space/assets/index-5a0f1eb8.js
date: 2026-09-05

组件名称: home-video / search

```js
// search
const K = !!(B.meta && B.is_avoided)
, J = !!(B.meta && B.is_lesson_video)
, ue = K || J;
ue
  ? use item.meta
  : use item
```

```js
// home-video
const { aid: E, bvid: O } = x,
  L = !!(x.meta && x.is_avoided),
  I = !!(x.meta && x.is_lesson_video),
  Q = L || I,
  z = lt(Q ? x.meta.title : x.title),
  M = Q ? x.meta.cover : x.pic,
  U = Q ? x.meta.ptime : x.created,
  X = Q ? nt(x.meta.stat.vt) : x.vt_display,
  B = Q ? x.meta.stat.view : x == null ? void 0 : x.play,
  K = Q ? x.meta.stat.danmaku : x.video_review,
  J = Zx(x),
  ue = x.jump_url
    ? ys(
        Hl(x.jump_url, {
          ...(x.is_lesson_video
            ? {
                csource: 'private_space_tougao_null',
              }
            : {}),
        }),
      )
    : '//www.bilibili.com/video/'.concat(x.bvid, '/'),
  we = hy(J),
  Be = my(J)
let ze = 'ugc'
J.indexOf(mt.PUGV) !== -1 && (ze = 'pugv')

const Ue = {
  aid: E,
  bvid: O,
  cid: 0,
  title: z,
  cover: M,
  subtitle: x.is_self_view
    ? x.view_self_type === Pl.BYREVIEW
      ? {
          text: '退回仅自见 · '.concat(Zn(U * 1e3)),
          icon: 'BDC/warning_report_circle_line/2',
        }
      : {
          text: '仅自己可见 · '.concat(Zn(U * 1e3)),
          icon: 'BDC/lock_locked_line/1',
        }
    : {
        text: Zn(U * 1e3),
      },
  progress: x.playback_position || 0,
  stats: [
    {
      icon: x.enable_vt ? 'BDC/playtime_square_line/1' : 'BDC/playdata_square_line/1',
      text: x.enable_vt ? X : nt(B),
    },
    {
      icon: 'BDC/danmu_square_line/1',
      text: String(nt(K)),
    },
    Q
      ? {
          icon: L || x.is_lesson_finished ? 'BDC/video_archive_line/3' : '',
          text: I ? x.lesson_update_info : ''.concat(x.meta.ep_count),
        }
      : {
          text: jo('(hh:)?mm:ss', $x(x.length) * 1e3),
        },
  ],
  tags: us(J, {
    pubdate: U * 1e3,
    tagMap: {
      [mt.CHARGE]: {
        tag: {
          text: x.elec_arc_badge,
        },
      },
    },
  }),
  isSelf: x.is_self_view,
}

us = (e, t) => {
  const { pubdate: n, tagMap: r } = t || {},
    o = PT(u_)
  r &&
    Object.keys(r).forEach((a) => {
      var l, u
      const s = (l = r[a]) == null ? void 0 : l.priority,
        c = {
          ...(((u = r[a]) == null ? void 0 : u.tag) || {}),
        }
      ;(c &&
        Object.keys(c).forEach((d) => {
          c[d] || delete c[d]
        }),
        (o[a] = {
          priority: s != null ? s : o[a].priority,
          tag: {
            ...o[a].tag,
            ...c,
          },
        }))
    })
  const i = e.map((a) => o[a])
  return (
    n && EM(n) && i.unshift(u_.NEW),
    i
      .sort((a, s) => a.priority - s.priority)
      .map((a) => a.tag)
      .slice(0, 2)
  )
}
```

搜素时还带了参数

```txt
order_avoided: "true",
platform: "web"
```

## tags

```js
// 最新
Date.now() - e < 24 * 3600 * 1e3
```

```js
u_ = {
  NEW: {
    priority: 0,
    tag: {
      text: '最新',
      class: 'new-tag',
      style: '',
    },
  },
  [mt.SNEAK]: {
    priority: 1,
    tag: {
      text: '抢先看',
      class: 'sneak-tag',
      icon: 'BDC/battery_charge_simple_fill/3',
      style: '',
    },
  },
  [mt.CHARGE]: {
    priority: 2,
    tag: {
      text: '充电专属',
      class: 'charge-tag',
      icon: 'BDC/battery_charge_simple_fill/3',
      style: '',
    },
  },
  [mt.PUGV]: {
    priority: 3,
    tag: {
      text: '课堂',
      class: 'pugv-tag',
      style: '',
    },
  },
  [mt.INTERACTIVE]: {
    priority: 4,
    tag: {
      text: '互动',
      class: 'interactive-tag',
      style: '',
    },
  },
  [mt.UNION]: {
    priority: 5,
    tag: {
      text: '合作',
      class: 'union-tag',
      style: '',
    },
  },
  [mt.LIVE_PLAYBACK]: {
    priority: 6,
    tag: {
      text: '直播回放',
      class: 'live-tag',
      style: '',
    },
  },
}
```
