import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSiteTexts, siteTextDefaults, siteTextFields, type SiteTextKey } from "@/lib/siteTexts"

function normalizeValue(value: string) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim()
}

async function saveTexts(formData: FormData) {
  "use server"

  const siteTextModel = (prisma as any).siteText as { deleteMany?: unknown; upsert?: unknown } | undefined
  if (typeof siteTextModel?.deleteMany !== "function" || typeof siteTextModel?.upsert !== "function") {
    throw new Error('Prisma Client is not generated. Stop dev server and run "npx prisma generate".')
  }

  const keys = Object.keys(siteTextDefaults) as SiteTextKey[]

  const operations = keys.map((key) => {
    const value = normalizeValue(String(formData.get(key) ?? ""))
    const defaultValue = normalizeValue(siteTextDefaults[key])

    if (!value || value === defaultValue) {
      return (siteTextModel.deleteMany as any)({ where: { key } })
    }

    return (siteTextModel.upsert as any)({
      where: { key },
      update: { value },
      create: { key, value },
    })
  })

  await prisma.$transaction(operations)
  revalidatePath("/admin/texts")
  revalidatePath("/", "layout")
}

export default async function AdminTextsPage() {
  const values = await getSiteTexts()

  type Field = (typeof siteTextFields)[number]
  const groups = new Map<string, Field[]>()
  for (const field of siteTextFields) {
    const list = groups.get(field.group)
    if (list) list.push(field)
    else groups.set(field.group, [field])
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Тексты сайта</h1>
          <p className="mt-1 text-sm text-gray-600">
            Редактирование текста на главной странице и в футере. Пустое значение сбросит поле к значению по умолчанию.
          </p>
        </div>
      </div>

      <form action={saveTexts} className="mt-6 grid gap-6">
        {Array.from(groups.entries()).map(([group, fields]) => (
          <div key={group} className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
            <div className="text-base font-semibold text-gray-900">{group}</div>

            <div className="mt-5 grid gap-4 md:max-w-3xl">
              {fields.map((f) => (
                <label key={f.key} className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-900">{f.label}</div>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.key}
                      defaultValue={values[f.key]}
                      className="min-h-28 rounded-md border border-indigo-100 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-300"
                    />
                  ) : (
                    <input
                      name={f.key}
                      defaultValue={values[f.key]}
                      className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
