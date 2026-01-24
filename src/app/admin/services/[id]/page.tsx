import AdminServiceEditClient from "../ui/AdminServiceEditClient"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

export default async function AdminServiceEditPage({ params }: { params: Params }) {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()
  return <AdminServiceEditClient id={id} />
}

