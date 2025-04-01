import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../../store";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../../libs/apiCall";
import {
    createUserWithEmailAndPassword, updateProfile,
  } from "firebase/auth";
import { auth } from "../../libs/firebaseConfig";

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
import { SocialAuth } from "../../components/social-auth-sign-up";

// Define validation schema
const RegisterSchema = z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    firstName: z
      .string({ required_error: "Firstname is required" })
      .min(3, "Firstname is required"),
    lastName: z
      .string({ required_error: "Lastname is required" })
      .min(3, "Lastname is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  });

export default function SignupPage() {
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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
  
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      const fullName = `${data.firstName} ${data.lastName}`;
      await updateProfile(user, {
        displayName: fullName
      });
      const updatedUser = auth.currentUser;
      const token = await updatedUser.getIdToken();
      const userData = {
        displayName: updatedUser.displayName, 
        email: updatedUser.email,
        provider: "email", 
        firebaseUID: updatedUser.uid,
      };
      const { data: res } = await api.post(
        "/auth/sign-up",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res?.user) {
        toast.success(res?.message);
        setTimeout(() => {
          navigate("/sign-in");
        }, 1500);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    user && navigate("/");
  }, [user]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-semibold">
            Create an account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-4">
                <SocialAuth isLoading={loading} setLoading={setLoading} />
                <Label htmlFor="firstname">Firstname</Label>
                <Input
                  id="firstname"
                  type="firstname"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
                <Label htmlFor="lastname">Lastname</Label>
                <Input
                  id="lastname"
                  type="lastname"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@gmail.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}

                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
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
