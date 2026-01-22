import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypeOpus {
  type: DynamicFeedEnums.MajorType.Opus
  opus: Opus
}

export interface Opus {
  fold_action: string[]
  jump_url: string
  pics: Pic[]
  summary: Summary
  title: string
}

export interface Pic {
  aigc: null
  height: number
  live_url: null
  size: number
  url: string
  width: number
}

export interface Summary {
  has_more: boolean
  paragraphs: Paragraph[]
  rich_text_nodes: RichTextNode[]
  text: string
}

export interface Paragraph {
  align: number
  format: Format
  para_type: number
  text: Text
}

export interface Format {
  align: number
  indent: null
}

export interface Text {
  nodes: Node[]
}

export interface Node {
  type: string
  word: Word
}

export interface Word {
  bg_style: BgStyle
  color: null
  font_level: string
  style: Style
  words: string
}

export interface BgStyle {
  color: Style
}

export interface Style {}

export interface RichTextNode {
  orig_text: string
  text: string
  type: string
}
