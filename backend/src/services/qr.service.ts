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