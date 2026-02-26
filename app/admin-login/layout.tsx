import { Providers } from "@/app/providers";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
