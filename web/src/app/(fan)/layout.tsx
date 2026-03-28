import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import FanSidebar from "@/components/layout/FanSidebar";
import MobileShell from "@/components/layout/MobileShell";

export default async function FanLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <MobileShell sidebar={<FanSidebar userId={user.id} />} label="Fan">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </MobileShell>
  );
}
