"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from "@prisma/client";

import razorpay from "razorpay";

export const createOrderId = async (configId: string) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("No such configuration found");
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You need to be logged in");
  }

  const { finish, material } = configuration;

  let price = BASE_PRICE;
  if (material === "polycarbonate") {
    price += PRODUCT_PRICES.material.polycarbonate;
  }
  if (finish === "textured") {
    price += PRODUCT_PRICES.finish.textured;
  }

  let order: Order | undefined = undefined;
  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  });
  console.log(user.id);

  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await db.order.create({
      data: {
        userId: user.id,
        configurationId: configuration.id,
        amount: price / 100,
      },
    });
  }
  console.log(order.id);

  try {
    const response = await fetch(
      `https://case-cobra-nextjs.vercel.app/api/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "" + price,
          currency: "INR",
        }),
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return { orderId: data.orderId, price: price, orderIdDB: order.id };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    throw new Error("There was a problem with your fetch operation");
  }
};

export const verifyOrder = async (data: any) => {
  const result = await fetch(
    `https://case-cobra-nextjs.vercel.app/api/verify`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  return result.json();
};
