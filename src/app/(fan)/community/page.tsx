import { getUser } from "@/lib/auth";
import FeedList from "@/components/feed/FeedList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage() {
  const user = await getUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Community Board</h1>
        <p className="text-gray-500 text-sm">All artist posts and announcements</p>
      </div>
      <FeedList userId={user?.id ?? null} />
    </div>
  );
}
