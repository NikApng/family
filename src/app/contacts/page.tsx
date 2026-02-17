import { Section } from "@/components/Section"
import Link from "next/link"

const CONTACT_PHONE = "+7 920 253-17-77"
const CONTACT_PHONE_TEL = "+79202531777"
const CONTACT_EMAIL = "nn977@yandex.ru"
const LEGAL_ADDRESS = "Кима 272"

export default function ContactsPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Section
        title="Контакты"
        subtitle="Мы на связи. Вы можете обратиться так, как вам удобнее."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                📞
              </div>
              <div className="text-sm text-gray-600">Телефон горячей линии</div>
            </div>
            <div className="mt-3 text-lg font-semibold text-gray-900">
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:underline">
                {CONTACT_PHONE}
              </a>
            </div>
            <div className="mt-1 text-xs text-gray-500">Можно звонить анонимно</div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                ✉️
              </div>
              <div className="text-sm text-gray-600">Email</div>
            </div>
            <div className="mt-3 text-lg font-semibold text-indigo-700">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Отвечаем бережно и без формальностей
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                🕒
              </div>
              <div className="text-sm text-gray-600">Часы работы</div>
            </div>
            <div className="mt-3 text-lg font-semibold text-gray-900">Пн–Пт 10:00–19:00</div>
            <div className="mt-1 text-xs text-gray-500">Онлайн-заявки - круглосуточно</div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                🏢
              </div>
              <div className="text-sm text-gray-600">Юридический адрес</div>
            </div>
            <div className="mt-3 text-lg font-semibold text-gray-900">{LEGAL_ADDRESS}</div>
            <div className="mt-1 text-xs text-gray-500">Для договоров и документов</div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 text-sm leading-relaxed text-gray-700">
            <div className="text-base font-semibold text-gray-900">Если говорить трудно</div>
            <p className="mt-2">
              Вы можете написать нам на почту или оставить короткое сообщение. Необязательно
              подробно описывать ситуацию - мы аккуратно уточним всё сами.
            </p>
            <p className="mt-3 text-xs text-gray-600">
              Мы не передаём ваши данные третьим лицам.
            </p>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-gray-900">Как быстро мы отвечаем</div>
            <div className="mt-4 grid gap-3">
              {[
                { t: "Телефон", d: "Сразу или в течение рабочего дня" },
                { t: "Email", d: "Обычно в течение 24 часов" },
                { t: "Форма на сайте", d: "Свяжемся удобным для вас способом" },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"
                >
                  <div className="text-sm font-semibold text-gray-900">{x.t}</div>
                  <div className="mt-1 text-xs text-gray-700">{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between ">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-gray-900">
              Нужна поддержка прямо сейчас?
            </div>
            <div className="mt-2 max-w-xl  text-sm leading-relaxed text-gray-600">
              Вы можете оставить заявку - мы свяжемся с вами и предложим подходящий
              формат помощи.
            </div>
          </div>

          <div className="mt-6 md:mt-0">
            <Link
              href="/#book"
              className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
            >
              Обратиться за поддержкой
            </Link>
          </div>
        </div>
      </Section>
    </div>
  )
}
