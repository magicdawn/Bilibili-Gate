```ts
if (device === EAppApiDevice.android) {
  platformParams = { mobi_app: 'android' }
}

// has avatar, date, etc. see BewlyBewly's usage
if (device === EAppApiDevice.ipad) {
  platformParams = { mobi_app: 'iphone', device: 'pad' }
}
```
