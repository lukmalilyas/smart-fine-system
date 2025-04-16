import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../libs/apiCall";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define Zod schema for restaurant registration
const RegisterRestaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  ownerFirstName: z.string().min(1, "Owner first name is required"),
  ownerLastName: z.string().min(1, "Owner last name is required"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?\d{10,15}$/.test(val),
      "Invalid phone number"
    ),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  nic: z.string().optional().refine(val => !val || val.length >= 10, {
    message: "NIC must be at least 10 characters"
  }),
  registrationNumber: z.string().optional().refine(val => !val || val.length >= 5, {
    message: "Registration number must be at least 5 characters"
  }),
  licenseNumber: z.string().optional().refine(val => !val || val.length >= 5, {
    message: "License number must be at least 5 characters"
  }),
});

export default function RegisterRestaurant() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterRestaurantSchema),
  });

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.post("/restaurant/register", formData);
      toast.success("Restaurant registered successfully!");
      console.log(data);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <Card className="w-[800px] mt-10">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Register a Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "restaurantName", label: "Restaurant Name", placeholder: "Tasty Meals" },
                { id: "ownerFirstName", label: "Owner First Name", placeholder: "John" },
                { id: "ownerLastName", label: "Owner Last Name", placeholder: "Doe" },
                { id: "phoneNumber", label: "Phone Number", placeholder: "+94771234567" },
                { id: "address", label: "Address", placeholder: "123 Main Street" },
                { id: "district", label: "District", placeholder: "Colombo" },
                { id: "nic", label: "NIC", placeholder: "123456789V" },
                { id: "registrationNumber", label: "Registration Number", placeholder: "REG12345" },
                { id: "licenseNumber", label: "License Number", placeholder: "LIC45678" },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className="space-y-3">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} placeholder={placeholder} {...register(id)} />
                  {errors[id] && (
                    <p className="text-red-500 text-sm">
                      {errors[id]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <CardFooter className="flex justify-between mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register Restaurant"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
