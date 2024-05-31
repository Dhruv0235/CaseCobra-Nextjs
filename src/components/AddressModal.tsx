"use client";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Image from "next/image";
import { Input } from "./ui/input";
import { Label } from "./ui/Label";
import Cookies from "js-cookie";

export default function AddressModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [initialValues, setInitialValues] = useState({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    state: "",
    phone: "",
    country: "",
  });

  useEffect(() => {
    const cookieValue = Cookies.get("address");
    if (cookieValue) {
      try {
        const parsedValue = JSON.parse(cookieValue);
        setInitialValues(parsedValue);
      } catch (error) {
        console.error("Error parsing cookie value:", error);
      }
    }
  }, []);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="absolute z-[9999999]">
        <DialogHeader>
          <div className="relative mx-auto w-24 h-24 mb-2">
            <Image
              fill
              src="/snake-1.png"
              alt="snake image"
              className="object-contain"
            />
          </div>
          <DialogTitle className="text-3xl text-center font-bold tracking-tight text-gray-900">
            Enter Your Shipping Address
          </DialogTitle>

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validate={(values) => {
              const errors: any = {};
              if (!values.name) {
                errors.name = "Required";
              }
              if (!values.street) {
                errors.street = "Required";
              }
              if (!values.city) {
                errors.city = "Required";
              }
              if (!values.postalCode) {
                errors.postalCode = "Required";
              }
              if (!values.country) {
                errors.country = "Required";
              }
              if (!values.state) {
                errors.state = "Required";
              }
              if (!values.phone) {
                errors.phone = "Required";
              } else if (values.phone.length !== 10) {
                errors.phone = "Invalid Phone Number";
              }
              return errors;
            }}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              Cookies.set("address", JSON.stringify(values), {
                expires: 7,
                path: "/",
              });

              setIsOpen(false);
              resetForm();
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <DialogDescription className="text-base py-2 grid grid-cols-10 gap-3">
                  <div className="col-span-10">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter Name"
                      id="name"
                      name="name"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="street">Street</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter Street"
                      id="street"
                      name="street"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="street"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="city">City</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter City"
                      id="city"
                      name="city"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Field
                      type="number"
                      as={Input}
                      placeholder="Enter Postal Code"
                      id="postalCode"
                      name="postalCode"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="postalCode"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="state">State</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter State"
                      id="state"
                      name="state"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="state"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="country">Country</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter Country"
                      id="country"
                      name="country"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="country"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Field
                      type="text"
                      as={Input}
                      placeholder="Enter Phone Number"
                      id="phone"
                      name="phone"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                  <div className="col-span-5 w-full"></div>
                  <div className="col-span-10">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-primary-foreground shadow hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary w-full"
                    >
                      Save
                    </button>
                  </div>
                </DialogDescription>
              </Form>
            )}
          </Formik>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
