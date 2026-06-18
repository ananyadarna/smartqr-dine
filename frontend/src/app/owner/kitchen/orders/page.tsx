"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";
import {
  getOrdersByRestaurant,
  updateOrderStatus,
} from "@/services/order.service";

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const restaurantId = "6a2cf4ef79599d73f316c229";

  const loadOrders = async () => {
    const data = await getOrdersByRestaurant(
      restaurantId
    );

    setOrders(data);
  };

  useEffect(() => {
    loadOrders();

    const joinRoom = () => {
      console.log("Kitchen orders page rejoining restaurant socket room:", restaurantId);
      socket.emit("join_restaurant", restaurantId);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    socket.on("new_order", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on(
      "order_status_updated",
      (data) => {
        setOrders((prev) =>
          prev.map((order) =>
            order.id || order.orderId === data.orderId
              ? {
                  ...order,
                  status: data.status,
                }
              : order
          )
        );
      }
    );

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_order");
      socket.off(
        "order_status_updated"
      );
    };
  }, []);

  const pending = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "pending"
      ),
    [orders]
  );

  const preparing = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "accepted" ||
          o.status === "preparing"
      ),
    [orders]
  );

  const ready = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "ready"
      ),
    [orders]
  );

  const updateStatus = async (
    orderId: string,
    status: string
    ) => {
    console.log(
        "Updating:",
        orderId,
        status
    );

    await updateOrderStatus(
        orderId,
        status
    );
  };

  const Column = ({
    title,
    items,
  }: {
    title: string;
    items: any[];
  }) => (
    <div className="border rounded p-4">
      <h2 className="text-xl font-bold mb-4">
        {title}
      </h2>

      <div className="space-y-3">
        {items.map((order) => (
          <div
            key={order.id || order.orderId}
            className="border rounded p-3"
          >
            <p className="font-bold">
              {order.orderNumber}
            </p>

            <p>
              Table{" "}
              {order.tableNumber}
            </p>

            <p>
              ₹{order.totalAmount}
            </p>

            {order.status ===
              "pending" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id || order.orderId,
                    "accepted"
                  )
                }
                className="mt-2 border px-3 py-1 rounded cursor-pointer"
              >
                Accept
              </button>
            )}

            {(order.status ===
              "accepted" ||
              order.status ===
                "preparing") && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id || order.orderId,
                    "ready"
                  )
                }
                className="mt-2 border px-3 py-1 rounded cursor-pointer"
              >
                Ready
              </button>
            )}

            {order.status ===
              "ready" && (
              <button
                onClick={() =>
                  updateStatus(
                    order.id || order.orderId,
                    "served"
                  )
                }
                className="mt-2 border px-3 py-1 rounded cursor-pointer"
              >
                Served
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Kitchen Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Column
          title="Pending"
          items={pending}
        />

        <Column
          title="Preparing"
          items={preparing}
        />

        <Column
          title="Ready"
          items={ready}
        />
      </div>
    </div>
  );
}