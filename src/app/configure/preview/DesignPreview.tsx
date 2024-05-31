"use client";
import Phone from "@/components/Phone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { cn, formatPrice } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Configuration } from "@prisma/client";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import { createOrderId, verifyOrder } from "./actions";

import AddressModal from "@/components/AddressModal";
import LoginModal from "@/components/LoginModal";
import Cookies from "js-cookie";
import LoadingStateDisplay from "@/components/LoadingStateDisplay";

export default function DesignPreview({
  configuration,
}: {
  configuration: Configuration;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useKindeBrowserClient();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [addressEntered, setAddressEntered] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [cookieValue, setCookieValue] = useState<any>();
  const [toggleCookie, setToggleCookie] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  function toggle() {
    setToggleCookie(!toggleCookie);
    router.refresh();
  }

  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    const cookieValue = Cookies.get("address");
    if (cookieValue !== undefined) {
      try {
        const parsedValue = JSON.parse(cookieValue);

        setCookieValue(parsedValue);
        console.log(parsedValue);

        if (parsedValue) {
          setAddressEntered(true);
        }
      } catch (error) {
        console.error("Error parsing cookie value:", error);
      }
    }
  }, [toggleCookie]);

  const { color, model, finish, material } = configuration;
  const tw = COLORS.find(
    (supportedcolor) => supportedcolor.value === color
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  let totalPrice = BASE_PRICE;
  if (material === "polycarbonate") {
    totalPrice += PRODUCT_PRICES.material.polycarbonate;
  }
  if (finish === "textured") {
    totalPrice += PRODUCT_PRICES.finish.textured;
  }

  const processPayment = async ({ configId }: { configId: string }) => {
    try {
      const orderId = await createOrderId(configId);
      const options = {
        key: process.env.key_id,
        amount: orderId.price * 100,
        currency: "INR",
        name: "Case Cobra",
        description: "Best Quality Custom phone cases",
        order_id: orderId.orderId,

        handler: async function (response: any) {
          const data = {
            orderCreationId: orderId.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            orderIdDB: orderId.orderIdDB,
            cookieValue,
          };
          console.log("Data is", data);

          const res = await verifyOrder(data);

          if (res.isOk) {
            setLoadingState(true);
            setTimeout(() => {
              router.push(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${orderId.orderIdDB}`
              );
            }, 3000);

            toast({
              title: "Payment Successful",
              description: "Your order has been placed successfully",
              variant: "default",
            });
          } else {
            router.push(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`
            );
          }
        },
        theme: {
          color: "#16A34A",
        },
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast({
          title: "Payment Failed",
          description: "There was an issue on our side. Please try again",
          variant: "destructive",
        });
      });
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment Failed",
        description: "There was an issue on our side. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = () => {
    if (addressEntered) {
      if (user) {
        processPayment({ configId: configuration.id });
      } else {
        localStorage.setItem("configurationId", configuration.id);
        setIsLoginModalOpen(true);
      }
    } else {
      setIsAddressModalOpen(true);
    }
  };

  //-----------------------------------------------------------------------------------------------------//

  return (
    <div>
      {loadingState ? (
        <LoadingStateDisplay
          title="Payment was successful"
          message="Redirecting to the summary page."
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
          >
            <Confetti
              active={showConfetti}
              config={{ elementCount: 200, spread: 90 }}
            />
          </div>

          <LoginModal
            isOpen={isLoginModalOpen}
            setIsOpen={setIsLoginModalOpen}
          />
          <AddressModal
            isOpen={isAddressModalOpen}
            setIsOpen={setIsAddressModalOpen}
            toggle={toggle}
          />

          <div className="mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
            <div className="md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2">
              <Phone
                className={cn("max-w-[150px] md:max-w-full", `bg-${tw}`)}
                imgSrc={configuration.croppedImageUrl!}
              />
            </div>
            <div className="mt-6 sm:col-span-9 sm:mt-0 md:row-end-1 ">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                Your {modelLabel} Case
              </h3>
              <div className="mt-3 flex items-center gap-1.5 text-base">
                <Check className="h-4 w-4 text-green-500" />
                In stock and ready to ship
              </div>
            </div>
            <div className="sm:col-span-12 md:col-span-9 text-base">
              <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
                <div>
                  <p className="font-medium text-zinc-950">Highlights</p>
                  <ol className="mt-3 text-zinc-700 list-disc list-inside">
                    <li>Wireless Charging compatible</li>
                    <li>TPU shock absorption</li>
                    <li>Packaging made from recycled materials</li>
                    <li>5 year print warranty</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-zinc-950">Materials</p>
                  <ol className="mt-3 text-zinc-700 list-disc list-inside">
                    <li>High Quality, durable material</li>
                    <li>Scratch and fingerprint resistant coating</li>
                  </ol>
                </div>
              </div>
              <div className="mt-8 ">
                <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
                  <div className="flow-root text-sm">
                    <div className="flex items-center justify-between py-1 mt-2">
                      <p className="text-gray-600">Base Price</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(BASE_PRICE / 100)}
                      </p>
                    </div>

                    {finish === "textured" ? (
                      <div className="flex items-center justify-between py-1 mt-2">
                        <p className="text-gray-600">Textured Finish</p>
                        <p className="font-medium text-gray-900">
                          {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                        </p>
                      </div>
                    ) : null}

                    {material === "polycarbonate" ? (
                      <div className="flex items-center justify-between py-1 mt-2">
                        <p className="text-gray-600">
                          Soft polycarbonate material
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatPrice(
                            PRODUCT_PRICES.material.polycarbonate / 100
                          )}
                        </p>
                      </div>
                    ) : null}
                    <div className="my-2 h-px bg-gray-200" />

                    <div className="flex items-center justify-between py-2">
                      <p className="font-semibold text-gray-900">Order total</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(totalPrice / 100)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end pb-12 gap-4">
                  {addressEntered ? (
                    <Button
                      className="px-4 sm:px-6 lg:px-8 bg-zinc-700"
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      Edit Delivery Address
                    </Button>
                  ) : (
                    <Button
                      className="px-4 sm:px-6 lg:px-8 bg-zinc-700"
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      Add Delivery Address
                    </Button>
                  )}

                  <Button
                    className="px-4 sm:px-6 lg:px-8"
                    onClick={() => handleCheckOut()}
                  >
                    Check out <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
