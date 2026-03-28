import { getUser } from "@/lib/auth";
import FeedList from "@/components/feed/FeedList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Feed" };

export default async function FeedPage() {
  const user = await getUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">My Feed</h1>
        <p className="text-gray-500 text-sm">Updates from artists you follow</p>
      </div>
      <FeedList userId={user?.id ?? null} filterFollowed />
    </div>
  );
}
