import type { Metadata } from "next"
import { Section } from "@/components/Section"
import {
  PERSONAL_DATA_OPERATOR_NAME,
  personalDataDisclosureNote,
  personalDataProcessingContext,
  personalDataPurposes,
  personalDataRegistryDetails,
  personalDataResponsibleContact,
  personalDataSecurityMeasures,
  personalDataSummary,
} from "@/lib/personalData"

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description:
    "Сведения об операторе персональных данных, целях обработки, мерах защиты и контактных данных ответственного лица.",
}

function DetailList({
  items,
  columns = 1,
}: {
  items: Array<{ label: string; value: string; href?: string }>
  columns?: 1 | 2
}) {
  return (
    <dl className={columns === 2 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-indigo-100 bg-white/80 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{item.label}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-gray-900">
            {item.href ? (
              <a href={item.href} className="text-indigo-700 hover:underline">
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 text-sm leading-relaxed text-gray-700">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-indigo-100 bg-white/70 px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function PersonalDataPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900">
      <Section>
        <div className="grid gap-6">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-rose-200/20 blur-3xl" />

            <div className="relative">
              <div className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                Официальная информация
              </div>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
                Политика обработки персональных данных
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-relaxed text-gray-700">{personalDataDisclosureNote}</p>
              <p className="mt-4 max-w-4xl text-sm leading-relaxed text-gray-700">{PERSONAL_DATA_OPERATOR_NAME}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {personalDataSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/60 p-4 shadow-sm"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="grid gap-6">
              <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
                <div className="text-xl font-semibold text-gray-900">Сведения об операторе</div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Публичные сведения сформированы на основании данных реестра операторов персональных данных и используются для информирования посетителей сайта.
                </p>
                <div className="mt-6">
                  <DetailList items={personalDataRegistryDetails} columns={2} />
                </div>
              </div>

              <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
                <div className="text-xl font-semibold text-gray-900">Цели обработки персональных данных</div>
                <div className="mt-6 grid gap-6">
                  {personalDataPurposes.map((purpose) => (
                    <article
                      key={purpose.title}
                      className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/60 p-6"
                    >
                      <h2 className="text-lg font-semibold text-gray-900">{purpose.title}</h2>

                      <div className="mt-5 grid gap-5">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">Категории персональных данных</div>
                          <div className="mt-3">
                            <BulletList items={purpose.categories} />
                          </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Категории субъектов</div>
                            <div className="mt-3">
                              <BulletList items={purpose.subjects} />
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-gray-900">Правовые основания</div>
                            <div className="mt-3">
                              <BulletList items={purpose.legalBasis} />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Перечень действий</div>
                            <div className="mt-3">
                              <BulletList items={purpose.actions} />
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-gray-900">Порядок обработки</div>
                            <div className="mt-3">
                              <BulletList items={purpose.processingModes} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/60 p-7 shadow-sm">
                <div className="text-xl font-semibold text-gray-900">Ответственный и контакты</div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  По вопросам обработки персональных данных можно обратиться по указанным ниже контактам.
                </p>
                <div className="mt-6">
                  <DetailList items={personalDataResponsibleContact} />
                </div>
              </div>

              <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
                <div className="text-xl font-semibold text-gray-900">Локализация и условия обработки</div>
                <div className="mt-6">
                  <DetailList items={personalDataProcessingContext} />
                </div>
              </div>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-7 shadow-sm">
                <div className="text-xl font-semibold text-gray-900">Меры по защите персональных данных</div>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Оператор реализует организационные и технические меры, предусмотренные статьями 18.1 и 19 Федерального закона № 152-ФЗ.
                </p>
                <div className="mt-6">
                  <BulletList items={personalDataSecurityMeasures} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
