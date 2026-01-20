import { Section } from "@/components/Section"
import AdminGalleryEditClient from "./ui/AdminGalleryEditClient"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

export default async function AdminGalleryEditPage({ params }: { params: Params }) {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()

  return (
    <Section title="Редактировать фотоотчёт" subtitle="Обнови название и картинку.">
      <AdminGalleryEditClient id={id} />
    </Section>
  )
}
