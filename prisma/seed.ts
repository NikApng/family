import { prisma } from "../src/lib/prisma"

async function main() {
  await prisma.specialist.create({
    data: {
      slug: "anna-p",
      name: "Анна П.",
      role: "Психолог-консультант",
      badge: "Опыт кризисной помощи",
      badgeTone: "indigo",
      excerpt:
        "Кризисная помощь, работа с тревогой, утратой и шоковыми состояниями.",
      bio:
        "Анна работает с людьми в острых жизненных ситуациях, помогает восстановить чувство опоры и безопасности.",
      isPublished: true,
      sortOrder: 1,
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
