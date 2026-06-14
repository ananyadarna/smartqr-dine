import { getMenu } from "@/services/menu.service";
import ClientMenu from "./ClientMenu";

interface PageProps {
  params: Promise<{
    tableCode: string;
  }>;
}

export default async function MenuPage({
  params,
}: PageProps) {
  const { tableCode } = await params;

  // Fetch initial menu details (SEO and fast initial paint)
  const menu = await getMenu(tableCode);

  return <ClientMenu menu={menu} tableCode={tableCode} />;
}