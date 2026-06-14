import Link from "next/link";
import { getMenu } from "@/services/menu.service";
import AddToCartButton from "@/components/ui/AddToCartButton";

interface PageProps {
  params: Promise<{
    tableCode: string;
  }>;
}

export default async function MenuPage({
  params,
}: PageProps) {
  const { tableCode } = await params;

  const menu = await getMenu(
    tableCode
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {menu.restaurant.name}
      </h1>

      <p className="mt-2 text-gray-500">
        Table {menu.table.tableNumber}
      </p>

      <div className="mt-8 space-y-8">
        {menu.categories.map(
          (category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-semibold mb-4">
                {category.name}
              </h2>

              <div className="grid gap-4">
                {category.items.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4"
                    >
                      <h3 className="font-medium">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>

                      <p className="font-bold mt-2">
                        ₹{item.price}
                      </p>

                      <AddToCartButton id={item.id} name={item.name} price={item.price} />
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}

        <Link
            href="/cart"
            className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-3 rounded-full"
            >
            Cart
        </Link>
      </div>
    </div>
  );
}