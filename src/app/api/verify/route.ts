import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";

const generatedSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string
) => {
  const keySecret = process.env.key_secret;
  if (!keySecret) {
    throw new Error(
      "Razorpay key secret is not defined in environment variables."
    );
  }
  const sig = crypto
    .createHmac("sha256", keySecret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");
  return sig;
};

export async function POST(request: NextRequest) {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
      cookieValue,
      orderIdDB,
    } = await request.json();

    const signature = generatedSignature(orderCreationId, razorpayPaymentId);

    if (signature !== razorpaySignature) {
      return NextResponse.json(
        { message: "payment verification failed", isOk: false },
        { status: 400 }
      );
    }
    await db.order.update({
      where: {
        id: orderIdDB,
      },
      data: {
        isPaid: true,
        shippingAddress: {
          create: {
            name: cookieValue.name,
            city: cookieValue.city,
            postalCode: "" + cookieValue.postalCode,
            street: cookieValue.street,
            state: cookieValue.state,
            phoneNumber: cookieValue.phone,
            country: cookieValue.country,
          },
        },
        billingAddress: {
          create: {
            name: cookieValue.name,
            city: cookieValue.city,
            postalCode: "" + cookieValue.postalCode,
            street: cookieValue.street,
            state: cookieValue.state,
            phoneNumber: cookieValue.phone,
            country: cookieValue.country,
          },
        },
      },
    });
    return NextResponse.json(
      { message: "payment verified successfully", isOk: true },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "something went wrong", isOk: false },
      { status: 500 }
    );
  }
}
