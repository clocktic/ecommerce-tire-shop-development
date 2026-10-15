import { isAdmin } from "@/lib/admin-auth"
import { ChatInbox } from "@/components/admin/chat-inbox"

export default async function AdminChatPage() {
  if (!(await isAdmin())) return null
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">Живой чат</h1>
      <ChatInbox />
    </div>
  )
}
