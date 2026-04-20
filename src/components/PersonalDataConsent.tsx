import Link from "next/link"
import { PERSONAL_DATA_PAGE_HREF } from "@/lib/personalData"

type PersonalDataConsentProps = {
  className?: string
  name?: string
  required?: boolean
}

export function PersonalDataConsent({
  className = "",
  name = "personalDataConsent",
  required = true,
}: PersonalDataConsentProps) {
  const rootClassName = [
    "personal-data-consent grid grid-cols-[auto_1fr] items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm leading-relaxed text-gray-700",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <label className={rootClassName}>
      <input
        type="checkbox"
        name={name}
        value="true"
        required={required}
        className="mt-0.5 h-4 w-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-200"
      />
      <span>
        Я даю согласие на обработку персональных данных и подтверждаю, что ознакомлен(а) с{" "}
        <Link href={PERSONAL_DATA_PAGE_HREF} className="font-semibold text-indigo-700 hover:underline">
          политикой обработки персональных данных
        </Link>
        .
      </span>
    </label>
  )
}
