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
      width={1080}
      height={1099}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={["h-auto w-full object-contain", className].filter(Boolean).join(" ")}
    />
  )
}
