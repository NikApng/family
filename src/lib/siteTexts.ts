import { prisma } from "@/lib/prisma"

export const siteTextDefaults = {
  "home.hero.badge": "Про Семью, Про Единство",
  "home.hero.title": "Вы не одни.\nМы рядом, чтобы поддержать вас.",
  "home.hero.subtitle": "Психологическая поддержка для вас.",
  "home.hero.ctaPrimary": "Обратитесь к нам прямо сейчас",
  "home.hero.ctaSecondary": "Что мы делаем",

  "home.what.title": "Что мы делаем",
  "home.what.subtitle": "Основные направления поддержки — просто и по делу.",
  "home.what.card1.title": "Консультации психологов",
  "home.what.card1.description":
    "Индивидуальная поддержка онлайн или в другом удобном формате. Помогаем снизить тревогу, вернуть опору и ясность.",
  "home.what.card2.title": "Группы поддержки и терапии",
  "home.what.card2.description":
    "Встречи, где можно быть услышанным и не оставаться один на один с переживаниями. Тёплая среда и понятные правила.",
  "home.what.card3.title": "Информационные ресурсы и помощь близким",
  "home.what.card3.description":
    "Рекомендации для родных и друзей, ответы на частые вопросы, аккуратные материалы о том, как поддерживать и не выгорать.",

  "footer.about":
    "Психологическая поддержка гражданам и их семьям, пережившим тяжёлые события. Бережно, конфиденциально, рядом.",
  "footer.links.title": "Информация",
  "footer.help.label": "Помощь проекту",
  "footer.help.href": "/support",
  "footer.admin.label": "Админ",
  "footer.emergency":
    "Если вы чувствуете угрозу жизни или сильный кризис — пожалуйста, обратитесь в экстренные службы вашего региона.",
} as const

export type SiteTextKey = keyof typeof siteTextDefaults

export const siteTextFields = [
  { group: "Главная — первый экран", key: "home.hero.badge", label: "Бейдж над заголовком", type: "text" },
  { group: "Главная — первый экран", key: "home.hero.title", label: "Заголовок (можно перенос строки)", type: "textarea" },
  { group: "Главная — первый экран", key: "home.hero.subtitle", label: "Подзаголовок", type: "text" },
  { group: "Главная — первый экран", key: "home.hero.ctaPrimary", label: "Кнопка основная", type: "text" },
  { group: "Главная — первый экран", key: "home.hero.ctaSecondary", label: "Кнопка вторичная", type: "text" },

  { group: "Главная — «Что мы делаем»", key: "home.what.title", label: "Заголовок секции", type: "text" },
  { group: "Главная — «Что мы делаем»", key: "home.what.subtitle", label: "Подзаголовок секции", type: "text" },

  { group: "Главная — «Что мы делаем»", key: "home.what.card1.title", label: "Карточка 1: заголовок", type: "text" },
  { group: "Главная — «Что мы делаем»", key: "home.what.card1.description", label: "Карточка 1: описание", type: "textarea" },
  { group: "Главная — «Что мы делаем»", key: "home.what.card2.title", label: "Карточка 2: заголовок", type: "text" },
  { group: "Главная — «Что мы делаем»", key: "home.what.card2.description", label: "Карточка 2: описание", type: "textarea" },
  { group: "Главная — «Что мы делаем»", key: "home.what.card3.title", label: "Карточка 3: заголовок", type: "text" },
  { group: "Главная — «Что мы делаем»", key: "home.what.card3.description", label: "Карточка 3: описание", type: "textarea" },

  { group: "Футер", key: "footer.about", label: "Описание проекта", type: "textarea" },
  { group: "Футер", key: "footer.links.title", label: "Заголовок блока ссылок", type: "text" },
  { group: "Футер", key: "footer.help.label", label: "Ссылка «Помощь проекту»: текст", type: "text" },
  { group: "Футер", key: "footer.help.href", label: "Ссылка «Помощь проекту»: URL", type: "text" },
  { group: "Футер", key: "footer.admin.label", label: "Ссылка «Админ»: текст", type: "text" },
  { group: "Футер", key: "footer.emergency", label: "Текст предупреждения", type: "textarea" },
] as const satisfies ReadonlyArray<{
  group: string
  key: SiteTextKey
  label: string
  type: "text" | "textarea"
}>

export async function getSiteTexts(): Promise<Record<SiteTextKey, string>>
export async function getSiteTexts<K extends SiteTextKey>(keys: readonly K[]): Promise<Record<K, string>>
export async function getSiteTexts(keys?: readonly SiteTextKey[]) {
  const requested = (keys?.length ? keys : (Object.keys(siteTextDefaults) as SiteTextKey[])).slice()

  const out: Record<string, string> = {}
  for (const key of requested) out[key] = siteTextDefaults[key]

  const siteTextModel = (prisma as any).siteText as { findMany?: unknown } | undefined
  if (typeof siteTextModel?.findMany !== "function") return out

  try {
    const items = (await (siteTextModel.findMany as any)({
      where: { key: { in: requested } },
    })) as Array<{ key: string; value: string }>

    for (const item of items) out[item.key] = item.value
  } catch (err) {
    console.error("Failed to load SiteText records", err)
  }

  return out as Record<string, string>
}

