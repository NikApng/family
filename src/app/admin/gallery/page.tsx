import { Section } from "@/components/Section"
import AdminGalleryClient from "./ui/AdminGalleryClient"

export default function AdminGalleryPage() {
  return (
    <Section title="Фотоотчёты" subtitle="Добавление, редактирование и удаление фотоотчётов.">
      <AdminGalleryClient />
    </Section>
  )
}
