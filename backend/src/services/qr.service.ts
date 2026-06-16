import QRCode from "qrcode";
import { Table } from "../models/Table";

export const generateTableQR = async (
  tableId: string
) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new Error("Table not found");
  }

  const menuUrl =
    `${process.env.PUBLIC_MENU_URL}/scan/${table.tableCode}`;

  const qrCodeUrl =
    await QRCode.toDataURL(menuUrl);

  table.qrCodeUrl = qrCodeUrl;

  await table.save();

  return {
    tableId: table._id.toString(),
    tableCode: table.tableCode,
    menuUrl,
    qrCodeUrl,
  };
};

export const regenerateAllTableQRs = async () => {
  try {
    const publicMenuUrl = process.env.PUBLIC_MENU_URL;
    if (!publicMenuUrl) {
      console.log("⚠️ PUBLIC_MENU_URL is not set. Skipping auto QR code regeneration.");
      return;
    }

    console.log(`🔄 Self-healing table QR codes with PUBLIC_MENU_URL: ${publicMenuUrl}...`);

    const tables = await Table.find({});
    let regeneratedCount = 0;

    for (const table of tables) {
      const menuUrl = `${publicMenuUrl}/scan/${table.tableCode}`;
      const qrCodeUrl = await QRCode.toDataURL(menuUrl);
      table.qrCodeUrl = qrCodeUrl;
      await table.save();
      regeneratedCount++;
    }

    console.log(`✅ Successfully regenerated QR codes for ${regeneratedCount} tables.`);
  } catch (error) {
    console.error("❌ Failed to auto-regenerate QR codes:", error);
  }
};