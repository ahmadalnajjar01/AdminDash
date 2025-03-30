import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import {
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import AddProducts from "./addProducts";

export function Home() {
  const [userCount, setUserCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [loading, setLoading] = useState({
    users: true,
    products: true,
    orders: true,
  });
  const [error, setError] = useState({
    users: null,
    products: null,
    orders: null,
  });

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/customers/count"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user count");
        }
        const data = await response.json();
        setUserCount(data.count);
      } catch (err) {
        setError((prev) => ({ ...prev, users: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    const fetchProductCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/count-products"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product count");
        }
        const data = await response.json();
        setProductCount(data.count);
      } catch (err) {
        setError((prev) => ({ ...prev, products: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    const fetchOrderCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/count" // Make sure this matches your backend route
        );
        if (!response.ok) {
          throw new Error("Failed to fetch order count");
        }
        const data = await response.json();
        setOrderCount(data.count);
      } catch (err) {
        setError((prev) => ({ ...prev, orders: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, orders: false }));
      }
    };

    fetchUserCount();
    fetchProductCount();
    fetchOrderCount();
  }, []);

  // Stats data for the cards
  const statsData = [
    {
      title: "Total Users",
      value: loading.users
        ? "Loading..."
        : error.users
        ? "Error"
        : userCount?.toLocaleString() || "0",
      icon: UsersIcon,
      color: "bg-blue-500",
      loading: loading.users,
      error: error.users,
    },
    {
      title: "Total Products",
      value: loading.products
        ? "Loading..."
        : error.products
        ? "Error"
        : productCount?.toLocaleString() || "0",
      icon: CubeIcon,
      color: "bg-orange-500",
      loading: loading.products,
      error: error.products,
    },
    {
      title: "Total Orders",
      value: loading.orders
        ? "Loading..."
        : error.orders
        ? "Error"
        : orderCount?.toLocaleString() || "0",
      icon: ShoppingBagIcon,
      color: "bg-green-500",
      loading: loading.orders,
      error: error.orders,
    },
  ];

  return (
    <>
      <div className="mt-12">
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
          {statsData.map(
            ({
              icon: Icon,
              title,
              value,
              color,
              change,
              loading: cardLoading,
              error: cardError,
            }) => (
              <Card
                key={title}
                className="border border-blue-gray-100 shadow-sm"
              >
                <CardHeader
                  floated={false}
                  shadow={false}
                  className={`rounded-t-lg p-4 ${color}`}
                >
                  <div className="flex justify-between items-center">
                    <Typography
                      variant="h6"
                      color="white"
                      className="font-medium"
                    >
                      {title}
                    </Typography>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="flex flex-col gap-2">
                    <Typography variant="h3" color="blue-gray">
                      {cardLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : cardError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        value
                      )}
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-500">
                      {change}
                    </Typography>
                    {cardError && (
                      <Typography variant="small" className="text-red-500">
                        {cardError}
                      </Typography>
                    )}
                  </div>
                </CardBody>
              </Card>
            )
          )}
        </div>
      </div>
      <AddProducts />
    </>
  );
}

export default Home;
