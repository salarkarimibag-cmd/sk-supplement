import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";
import SubscriberManager from "@/components/admin/SubscriberManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "مشترکین خبرنامه",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminSubscribersPage(props: PageProps<"/admin/subscribers">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  await connectToDatabase();

  const totalCount = await SubscriberModel.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const subscribers = await SubscriberModel.find()
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const initialSubscribers = subscribers.map((subscriber) => ({
    id: String(subscriber._id),
    email: subscriber.email,
    ip: subscriber.ip ?? "—",
    createdAt: subscriber.createdAt ? new Date(subscriber.createdAt).toISOString() : null,
  }));

  function hrefForPage(page: number) {
    return page === 1 ? "/admin/subscribers" : `/admin/subscribers?page=${page}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold">مشترکین خبرنامه</h2>
      <SubscriberManager initialSubscribers={initialSubscribers} />
      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
