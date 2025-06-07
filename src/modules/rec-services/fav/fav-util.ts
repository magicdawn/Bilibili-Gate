/**
 * attr helpers
 * @see https://socialsisteryi.github.io/bilibili-API-collect/docs/fav/info.html
 */

// attr属性位二进制值表：
// 位	           内容	              备注
// 倒数第二位    是否为默认收藏夹	  0：默认收藏夹, 1：其他收藏夹
// 最后一位	     私有收藏夹	        0：公开        1：私有
// 其他有待补充...

export function isFavFolderDefault(attr: number) {
  return attr.toString(2).at(-2) === '0'
}

export function isFavFolderPrivate(attr: number) {
  return attr.toString(2).at(-1) === '1'
}
