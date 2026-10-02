import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import MessageManager from "@/components/admin/MessageManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "پیام‌های تماس",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminMessagesPage(props: PageProps<"/admin/messages">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  await connectToDatabase();

  const totalCount = await ContactMessageModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const messages = await ContactMessageModel.find()
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const initialMessages = messages.map((message) => ({
    id: String(message._id),
    name: message.name,
    email: message.email,
    message: message.message,
    ip: message.ip ?? "—",
    createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : null,
  }));

  function hrefForPage(page: number) {
    return page === 1 ? "/admin/messages" : `/admin/messages?page=${page}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold">پیام‌های تماس</h2>
      <MessageManager initialMessages={initialMessages} />
      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
