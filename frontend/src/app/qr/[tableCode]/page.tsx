import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    tableCode: string;
  }>;
}

export default async function QRPage({ params }: PageProps) {
  const { tableCode } = await params;

  redirect(`/menu/${tableCode}`);
}