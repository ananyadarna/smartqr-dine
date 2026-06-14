import { getDashboardStats, getRecentOrders } from "@/services/dashboard.service";

export default async function DashboardPage() {

  const restaurantId = "6a2cf4ef79599d73f316c229"
  const stats = await getDashboardStats(
    restaurantId
  );

  const recentOrders = await getRecentOrders(restaurantId)

  return (
   <>
        <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">
            Dashboard
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded p-4">
            <p>Total Orders</p>
            <p className="text-2xl font-bold">
                {stats.totalOrders}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Revenue</p>
            <p className="text-2xl font-bold">
                ₹{stats.totalRevenue}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Pending</p>
            <p className="text-2xl font-bold">
                {stats.pendingOrders}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Accepted</p>
            <p className="text-2xl font-bold">
                {stats.acceptedOrders}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Preparing</p>
            <p className="text-2xl font-bold">
                {stats.preparingOrders}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Ready</p>
            <p className="text-2xl font-bold">
                {stats.readyOrders}
            </p>
            </div>

            <div className="border rounded p-4">
            <p>Served</p>
            <p className="text-2xl font-bold">
                {stats.servedOrders}
            </p>
            </div>
        </div>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
            Recent Orders
            </h2>

            <div className="space-y-3">
            {recentOrders.map(
                (order: any) => (
                <div
                    key={order.id}
                    className="border rounded p-4"
                >
                    <p>
                    {order.orderNumber}
                    </p>

                    <p>
                    Table{" "}
                    {order.tableNumber}
                    </p>

                    <p>
                    ₹{order.totalAmount}
                    </p>

                    <p>
                    {order.status}
                    </p>
                </div>
                )
            )}
            </div>
        </div>
    </>
  );
}