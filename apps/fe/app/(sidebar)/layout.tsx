import SidebarLayoutClient from "./SidebarLayoutClient";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayoutClient>{children}</SidebarLayoutClient>;
}
