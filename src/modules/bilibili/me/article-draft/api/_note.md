Date: 2026-03-27

---

# API

## 搜索草稿

GET https://api.bilibili.com/x/article/creative/draft/list?pn=1&ps=10&keyword=Bilibili-Gate&web_location=0.0

## 新建/更新草稿流程

POST https://api.bilibili.com/x/dynamic/feed/article/draft/add?csrf=*&w_rid=*&wts=*
Content-Type: application/json

其他参数(仅自己可见), `不允许评论` 不知道是哪个参数控制的?

- 标题 `test-title`, 内容 `test-content` 发送的 Body

  ```json
  {
    "arg": {
      "type": 4,
      "template_id": 1,
      "category_id": 15,
      "title": "test-title",
      "private_pub": 1,
      "reprint": 1,
      "original": 0,
      "list_id": 0,
      "summary": "test-content",
      "opus": {
        "opus_source": 2,
        "title": "test-title",
        "content": {
          "paragraphs": [
            {
              "para_type": 1,
              "format": { "indent": { "first_line_indent": 0, "indent": 0 } },
              "text": {
                "nodes": [
                  {
                    "node_type": 1,
                    "word": {
                      "words": "test-content",
                      "font_size": 17,
                      "color": "",
                      "dark_color": "",
                      "style": {},
                      "font_level": "regular"
                    }
                  }
                ]
              }
            }
          ]
        },
        "pub_info": { "editor_version": "eva3-2.0.1" }
      }
    }
  }
  ```

- 单个代码块
  ```json
  {
    "arg": {
      "type": 4,
      "template_id": 1,
      "category_id": 15,
      "article_id": 348850,
      "title": "test-title",
      "private_pub": 1,
      "reprint": 1,
      "original": 0,
      "list_id": 0,
      "summary": "{\"hello\": \"world\"}",
      "opus": {
        "opus_source": 2,
        "title": "test-title",
        "content": {
          "paragraphs": [{ "para_type": 8, "code": { "lang": "json", "content": "{\"hello\": \"world\"}" } }]
        },
        "pub_info": { "editor_version": "eva3-2.0.1" }
      }
    }
  }
  ```

Response: add/update 都一样

```json
{
  "code": 0,
  "message": "OK",
  "ttl": 1,
  "data": {
    "article_id": 348850
  }
}
```

## 查看草稿内容

https://api.bilibili.com/x/article/creative/draft/view?aid=*&w_rid=&wts=

```json
{
  "code": 0,
  "message": "OK",
  "ttl": 1,
  "data": {
    "id": 348850,
    "title": "test-title",
    "content": "{&#34;hello&#34;: &#34;world&#34;}",
    "summary": "{\"hello\": \"world\"}",
    "banner_url": "",
    "reason": "",
    "template_id": 1,
    "state": 0,
    "reprint": 1,
    "image_urls": null,
    "origin_image_urls": null,
    "tags": [],
    "category": {
      "id": 15,
      "parent_id": 0,
      "name": ""
    },
    "author": {
      "mid": 38112129,
      "name": "",
      "face": "",
      "pendant": {
        "pid": 0,
        "name": "",
        "image": "",
        "expire": 0
      },
      "official_verify": {
        "type": 0,
        "desc": ""
      },
      "nameplate": {
        "nid": 0,
        "name": "",
        "image": "",
        "image_small": "",
        "level": "",
        "condition": ""
      },
      "vip": {
        "type": 0,
        "status": 0,
        "due_date": 0,
        "vip_pay_type": 0,
        "theme_type": 0,
        "label": null,
        "avatar_subscript": 0,
        "nickname_color": ""
      },
      "fans": 0,
      "level": 0
    },
    "stats": null,
    "publish_time": 0,
    "ctime": 0,
    "mtime": 1774588059,
    "view_url": "",
    "edit_url": "",
    "is_preview": 0,
    "dynamic_intro": "",
    "list": null,
    "media_id": 0,
    "spoiler": 0,
    "edit_times": 0,
    "pre_view_url": "",
    "original": 0,
    "top_video_info": null,
    "type": 4,
    "video_url": "",
    "dyn_id_str": "",
    "topic_info": null,
    "opus": {
      "opus_id": 348850,
      "opus_source": 2,
      "title": "test-title",
      "content": {
        "paragraphs": [
          {
            "para_type": 8,
            "code": {
              "lang": "json",
              "content": "{\"hello\": \"world\"}"
            }
          }
        ]
      },
      "pub_info": {
        "uid": 38112129,
        "editor_version": "eva3-2.0.1"
      }
    },
    "is_new_editor": 0,
    "private_pub": 1,
    "only_fans": 0,
    "editable": 0,
    "comment_selected": 0,
    "up_closed_reply": 0,
    "timer_pub_time": 0,
    "only_fans_level": 0,
    "only_fans_dnd": 0
  }
}
```
