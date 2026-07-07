https://developer.mozilla.org/en-US/play

```html
<div class="pane">
  <div class="container">
    <video controls autoplay loop class="video">
      <source src="/shared-assets/videos/flower.webm" type="video/webm" />
      <source src="/shared-assets/videos/flower.mp4" type="video/mp4" />
    </video>
  </div>
</div>
```

```css
.pane {
  position: fixed;
  z-index: 10000;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid red;
  padding: 1em;
}
.container {
  backdrop-filter: blur(10px);
  overflow: hidden;
  border-radius: 20px;
}
.video {
  display: block;
  width: 100%;
  height: 100%;
}
```
