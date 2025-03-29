## match & include

https://github.com/Tampermonkey/tampermonkey/issues/1560

- ViolentMonkey 对于 @match query 不参与匹配
- TamperMonkey 对于 @match query 参与匹配

所以得写成, `?*` 是为了 TamperMonkey 支持

```txt
@match '*://www.bilibili.com/',
@match 'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png',
@match '*://www.bilibili.com/?*',
@match 'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
```

或者干脆用 Include

```
include: [
  'https://www.bilibili.com',
  'https://www.bilibili.com/',
  'https://www.bilibili.com?*',
  'https://www.bilibili.com/?*',
  'https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png?*',
],
```
