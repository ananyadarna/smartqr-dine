"use client";

import { useEffect, useState } from "react";
import { getOrder } from "@/services/order.service";
import { socket } from "@/lib/socket";

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderPage({ params }: PageProps) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const loadOrder = async () => {
      const { orderId } = await params;
      const data = await getOrder(orderId);
      setOrder(data);
    };

    loadOrder();
  }, [params]);

  useEffect(() => {
    if (!order) return;

    const handleStatusUpdate = (data: any) => {
      console.log("Recieved:", data)
      if (data.orderId === order.id) {
        setOrder((prev: any) => ({
          ...prev,
          status: data.status,
          progress: {
            pending: true,
            accepted: ["accepted", "preparing", "ready", "served"].includes(data.status),
            preparing: ["preparing", "ready", "served"].includes(data.status),
            ready: ["ready", "served"].includes(data.status),
            served: data.status === "served",
          },
        }));
      }
    };

    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [order]);

  if (!order) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Order Tracking</h1>

      <div className="mt-4">
        <p><strong>Order:</strong> {order.orderNumber}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
      </div>

      <div className="mt-8 space-y-3">
        <div>{order.progress.pending ? "✅" : "⭕"} Pending</div>
        <div>{order.progress.accepted ? "✅" : "⭕"} Accepted</div>
        <div>{order.progress.preparing ? "✅" : "⭕"} Preparing</div>
        <div>{order.progress.ready ? "✅" : "⭕"} Ready</div>
        <div>{order.progress.served ? "✅" : "⭕"} Served</div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Items</h2>

        {order.items.map((item: any) => (
          <div key={item.foodId} className="border rounded p-3 mb-2">
            <p>{item.name}</p>
            <p>Qty: {item.quantity}</p>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}