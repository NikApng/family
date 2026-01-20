import Link from "next/link"
import Image from "next/image"


export function SiteFooter() {
    return (
        <footer
            className="relative overflow-hidden border-t border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-white">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-rose-200/20 blur-3xl"/>
                <div className="absolute -right-48 -top-20 h-[600px] w-[600px] rounded-full bg-indigo-300/20 blur-3xl"/>
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 py-12">
                <div className="grid gap-10 md:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-3">
              <span className="relative h-6 w-8 overflow-hidden rounded-sm border border-indigo-100">
                <Image
                    src="/images/img.png"
                    alt="Флаг"
                    fill
                    className="object-cover"
                />
              </span>
                            <div className="font-semibold tracking-tight text-gray-900">
                                Про Семью, Про Единство
                            </div>
                        </div>

                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
                            Психологическая поддержка гражданам и их семьям, пережившим тяжёлые
                            события. Бережно, конфиденциально, рядом.
                        </p>
                    </div>


                    <div>
                        <div className="text-sm font-semibold text-gray-900">
                            Информация
                        </div>
                        <ul className="mt-4 grid gap-2 text-sm">
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-gray-600 hover:text-indigo-700"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help"
                                    className="text-gray-600 hover:text-indigo-700"
                                >
                                    Помощь проекту
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin"
                                    className="text-gray-600 hover:text-indigo-700"
                                >
                                    Админ
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-indigo-100 pt-6 text-xs text-gray-500 md:flex-row md:items-center">
                    <div>
                        © {new Date().getFullYear()} "АНО" Про Семью, Про Единство
                    </div>

                    <div className="max-w-md leading-relaxed">
                        Если вы чувствуете угрозу жизни или сильный кризис — пожалуйста,
                        обратитесь в экстренные службы вашего региона.
                    </div>
                </div>
            </div>
        </footer>
    )
}
