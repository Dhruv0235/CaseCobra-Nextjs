"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from "@prisma/client";

import razorpay from "razorpay";
export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });
  const event = razorpay;
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

  //   try {
  //     const orderId: string = await createOrderId(price);
  //     const options = {
  //       key: process.env.key_id,
  //       amount: price * 100,
  //       currency: "INR",
  //       name: "CaseCobra",
  //       description:
  //         "An amazing platform to create high quality custom cases for your mobile phones",
  //       order_id: orderId,
  //       handler: async function (response: any) {
  //         const data = {
  //           orderCreationId: orderId,
  //           razorpayPaymentId: response.razorpay_payment_id,
  //           razorpayOrderId: response.razorpay_order_id,
  //           razorpaySignature: response.razorpay_signature,
  //         };

  //         const result = await fetch("/api/verify", {
  //           method: "POST",
  //           body: JSON.stringify(data),
  //           headers: { "Content-Type": "application/json" },
  //         });
  //         const res = await result.json();
  //         //At Payment Success
  //         if (res.isOk) alert("payment succeed");
  //         else {
  //           alert(res.message);
  //         }
  //       },
  //       theme: {
  //         color: "green",
  //       },
  //     };
  //     const paymentObject = new window.Razorpay(options);
  //     paymentObject.on("payment.failed", function (response: any) {
  //       alert(response.error.description);
  //     });
  //     paymentObject.open();
  //   } catch (error) {
  //     console.log(error);
  //   }
};

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
    const response = await fetch("http://localhost:3000/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: "" + price,
        currency: "INR",
      }),
    });
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
