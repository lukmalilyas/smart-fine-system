import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../../store";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../../libs/apiCall";
import { signInWithEmailAndPassword } from "firebase/auth";
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
import { SocialAuth } from "../../components/social-auth-sign-in";

// Define validation schema
const SignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export default function SignInPage() {
  const { user, setCredentails } = useStore((state) => state); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const userData = {
        email: user.email,
        firebaseUID: user.uid,
      };

      const { data: res } = await api.post(
        "/auth/sign-in",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res?.user) {
        toast.success(res?.message);
        const userInfo = { ...res?.user, token: res?.token };
        localStorage.setItem("user", JSON.stringify(userInfo));

        setCredentails(userInfo);

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-semibold">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-4">
                <SocialAuth isLoading={loading} setLoading={setLoading} />
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
