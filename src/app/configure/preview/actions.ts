"use server";

import OrderReceivedEmail from "@/components/emails/OrderReceivedEmail";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order, ShippingAddress } from "@prisma/client";
// import { Resend } from "Resend";
import nodemailer from "nodemailer";
import razorpay from "razorpay";

// const resend = new Resend(process.env.RESEND_API_KEY);

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
      },
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
    },
  );

  return result.json();
};

export const SendMail = async (orderId: string) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.email) {
    throw new Error("You need to be logged in");
  }

  try {
    const orderWithShippingAddress = await db.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
      },
    });

    console.log(orderWithShippingAddress);

    if (!orderWithShippingAddress) {
      throw new Error("Address Not Found!");
    }

    if (!orderWithShippingAddress.shippingAddress) {
      throw new Error("Address Not Found!");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Thanks for your order!",
      html: generateOrderReceivedEmailHtml(
        orderWithShippingAddress.shippingAddress,
        orderId,
        new Date().toLocaleDateString(),
      ),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    throw new Error("Address Not Found!");
  }
};

function generateOrderReceivedEmailHtml(
  shippingAddress: ShippingAddress,
  orderId: string,
  orderDate: string,
) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Received Email</title>
      <style>
        body {
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        }
        .container {
          margin: 10px auto;
          width: 600px;
          max-width: 100%;
          border: 1px solid #E5E5E5;
        }
        .message {
          padding: 40px 74px;
          text-align: center;
        }
        .heading {
          font-size: 32px;
          line-height: 1.3;
          font-weight: 700;
          text-align: center;
          letter-spacing: -1px;
        }
        .text {
          margin: 0;
          line-height: 2;
          color: #747474;
          font-weight: 500;
        }
        .hr {
          border-color: #E5E5E5;
          margin: 0;
        }
        .default-padding {
          padding-left: 40px;
          padding-right: 40px;
          padding-top: 22px;
          padding-bottom: 22px;
        }
        .paragraph-with-bold {
          margin: 0;
          line-height: 2;
          font-weight: bold;
        }
        .address-title {
          margin: 0;
          line-height: 2;
          font-size: 15px;
          font-weight: bold;
        }
        .footer-text {
          margin: 0;
          color: #AFAFAF;
          font-size: 13px;
          text-align: center;
        }
        .track-number {
          margin: 12px 0 0 0;
          font-weight: 500;
          line-height: 1.4;
          color: #6F6F6F;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <section class="message">
          <img src="https://case-cobra-nextjs.vercel.app/snake-3.png" width="65" height="73" alt="delivery snake" style="margin: auto;">
          <h1 class="heading">Thank you for your order!</h1>
          <p class="text">We're preparing everything for delivery and will notify you once your package has been shipped. Delivery usually takes 3 days.</p>
          <p class="text" style="margin-top: 24px;">If you have any questions regarding your order, please feel free to contact us with your order number and we're here to help.</p>
        </section>
        <hr class="hr">
        <section class="default-padding">
          <p class="address-title">Shipping to: ${shippingAddress.name}</p>
          <p class="text">${shippingAddress.street}, ${shippingAddress.city}-${shippingAddress.postalCode}, ${shippingAddress.state}, ${shippingAddress.country}</p>
        </section>
        <hr class="hr">
        <section class="default-padding">
          <div style="display: inline-flex; gap: 16px; margin-bottom: 40px;">
            <div style="width: 170px;">
              <p class="paragraph-with-bold">Order Number</p>
              <p class="track-number">${orderId}</p>
            </div>
            <div style="margin-left: 20px;">
              <p class="paragraph-with-bold">Order Date</p>
              <p class="track-number">${orderDate}</p>
            </div>
          </div>
        </section>
        <hr class="hr">
        <section style="padding-top: 22px; padding-bottom: 22px;">
          <div>
            <p style="padding-top: 30px; padding-bottom: 30px;" class="footer-text">Please contact us if you have any questions. (If you reply to this email, we won't be able to see it.)</p>
          </div>
          <div>
            <p class="footer-text">© CaseCobra, Inc. All Rights Reserved.</p>
          </div>
        </section>
      </div>
    </body>
    </html>
  `;
}
