import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import FanSidebar from "@/components/layout/FanSidebar";

export default async function FanLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <FanSidebar userId={user.id} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
