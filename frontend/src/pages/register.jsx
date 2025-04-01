import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../libs/apiCall";
import useStore from "../store";

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

// Define validation schema
const RegisterSchema = z.object({
  licensePlate: z
    .string({ required_error: "License plate is required" })
    .max(20, "License plate cannot exceed 20 characters"),
  vehicleType: z
    .string({ required_error: "Vehicle type is required" })
    .min(3, "Vehicle type is required"),
  vehicleModel: z
    .string({ required_error: "Vehicle model is required" })
    .min(3, "Vehicle model is required"),
  vehicleColour: z
    .string({ required_error: "Vehicle colour is required" })
    .min(3, "Vehicle colour is required"),
  firstName: z
    .string({ required_error: "First name is required" })
    .min(3, "First name is required"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(3, "Last name is required"),
  phoneNumber: z
    .string({ required_error: "Phone number is required" })
    .max(15, "Phone number cannot exceed 15 characters"),
  address: z
    .string({ required_error: "Address is required" })
    .min(5, "Address is required"),
  district: z
    .string({ required_error: "District is required" })
    .min(3, "District is required"),
  nic: z
    .string({ required_error: "National Identity Card number is required" })
    .max(20, "NIC cannot exceed 20 characters"),
  chassisNumber: z
    .string({ required_error: "Chassis number is required" })
    .min(3, "Chassis number is required"),
  engineNumber: z
    .string({ required_error: "Engine number is required" })
    .min(3, "Engine number is required"),
});

export default function Register() {
  const { user } = useStore((state) => state);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (vehicleData) => {
    try {
      setLoading(true);
  
      const { data: res } = await api.post(
        "/vehicles/register",
        vehicleData
      );
      console.log(res);
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <Card className="w-[800px] mt-30">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-semibold">
            Register a vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* License Plate */}
              <div className="space-y-3">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  placeholder="ABC123"
                  {...register("licensePlate")}
                />
                {errors.licensePlate && (
                  <p className="text-red-500 text-sm">{errors.licensePlate.message}</p>
                )}
              </div>

              {/* Vehicle Type */}
              <div className="space-y-3">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  placeholder="Car, Bike, Truck"
                  {...register("vehicleType")}
                />
                {errors.vehicleType && (
                  <p className="text-red-500 text-sm">{errors.vehicleType.message}</p>
                )}
              </div>

              {/* Vehicle Model */}
              <div className="space-y-3">
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  placeholder="Toyota Corolla"
                  {...register("vehicleModel")}
                />
                {errors.vehicleModel && (
                  <p className="text-red-500 text-sm">{errors.vehicleModel.message}</p>
                )}
              </div>

              {/* Vehicle Colour */}
              <div className="space-y-3">
                <Label htmlFor="vehicleColour">Vehicle Colour</Label>
                <Input
                  id="vehicleColour"
                  placeholder="Red"
                  {...register("vehicleColour")}
                />
                {errors.vehicleColour && (
                  <p className="text-red-500 text-sm">{errors.vehicleColour.message}</p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="123-456-7890"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St."
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address.message}</p>
                )}
              </div>

              {/* District */}
              <div className="space-y-3">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Colombo"
                  {...register("district")}
                />
                {errors.district && (
                  <p className="text-red-500 text-sm">{errors.district.message}</p>
                )}
              </div>

              {/* NIC */}
              <div className="space-y-3">
                <Label htmlFor="nic">NIC</Label>
                <Input
                  id="nic"
                  placeholder="123456789V"
                  {...register("nic")}
                />
                {errors.nic && (
                  <p className="text-red-500 text-sm">{errors.nic.message}</p>
                )}
              </div>

              {/* Chassis Number */}
              <div className="space-y-3">
                <Label htmlFor="chassisNumber">Chassis Number</Label>
                <Input
                  id="chassisNumber"
                  placeholder="123456789"
                  {...register("chassisNumber")}
                />
                {errors.chassisNumber && (
                  <p className="text-red-500 text-sm">{errors.chassisNumber.message}</p>
                )}
              </div>

              {/* Engine Number */}
              <div className="space-y-3">
                <Label htmlFor="engineNumber">Engine Number</Label>
                <Input
                  id="engineNumber"
                  placeholder="ENG123456"
                  {...register("engineNumber")}
                />
                {errors.engineNumber && (
                  <p className="text-red-500 text-sm">{errors.engineNumber.message}</p>
                )}
              </div>
            </div>
            <CardFooter className="flex justify-between mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
