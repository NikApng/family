import Image from "next/image"

type SiteLogoProps = {
  alt?: string
  className?: string
  fill?: boolean
  fit?: "contain" | "cover"
  priority?: boolean
  quality?: number
  sizes?: string
}

export function SiteLogo({
  alt = "Логотип организации Про Семью, Про Единство",
  className = "",
  fill = false,
  fit = "contain",
  priority = false,
  quality = 100,
  sizes = "64px",
}: SiteLogoProps) {
  const imageClassName = [fit === "cover" ? "object-cover" : "object-contain", className].filter(Boolean).join(" ")

  if (fill) {
    return (
      <Image
        src="/images/image.png"
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={imageClassName}
      />
    )
  }

  return (
    <Image
      src="/images/image.png"
      alt={alt}
      width={1080}
      height={1099}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={imageClassName}
    />
  )
}
