import Image from "next/image"

type SiteLogoProps = {
  alt?: string
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
}

export function SiteLogo({
  alt = "Логотип организации Про Семью, Про Единство",
  className = "",
  priority = false,
  quality = 100,
  sizes = "64px",
}: SiteLogoProps) {
  return (
    <Image
      src="/images/image.png"
      alt={alt}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={["h-full w-full ", className].filter(Boolean).join(" ")}
    />
  )
}
