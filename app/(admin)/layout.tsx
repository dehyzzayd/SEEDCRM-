import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { Providers } from "@/app/providers";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect("/admin-login");
  }

  return <Providers>{children}</Providers>;
}
