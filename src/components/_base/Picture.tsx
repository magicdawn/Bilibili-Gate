import { isSafari } from '$ua'
import type { ComponentProps } from 'react'

type IProps = {
  src: string
  avif?: boolean
  webp?: boolean
  imgProps?: ComponentProps<'img'>
} & ComponentProps<'picture'>

export function Picture({ src, avif, webp, imgProps, className, ...props }: IProps) {
  // safari avif 花屏
  avif ??= !isSafari
  webp ??= true

  return (
    <picture className={clsx('w-full h-full object-cover', className)} {...props}>
      {avif && <source srcSet={`${src}.avif`} type='image/avif' />}
      {webp && <source srcSet={`${src}.webp`} type='image/webp' />}
      <img src={src} loading='lazy' className='block h-full w-full' {...imgProps} />
    </picture>
  )
}
