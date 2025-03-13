import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../libs/apiCall";
import { auth } from "../libs/firebaseConfig";
import useStore from "../store";
import { Button } from "./ui/button";

export const SocialAuth = ({ isLoading, setLoading }) => {
  const [user] = useAuthState(auth);
  const [selectedProvider, setSelectedProvider] = useState("google");
  const { setCredentails } = useStore((state) => state);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setSelectedProvider("google");
    try {
      const res = await signInWithPopup(auth, provider);
      // Set the authentication status after successful sign-in
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    setSelectedProvider("github");
    try {
      const res = await signInWithPopup(auth, provider);
      // Set the authentication status after successful sign-in
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error signing in with GitHub", error);
    }
  };

  useEffect(() => {
    const saveUserToDb = async () => {
      try {
        const token = await user.getIdToken();
        const userData = {
          email: user.email,
          firebaseUID: user.uid,
        };
        const {data: res} = await api.post(
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

    if (user && isAuthenticated) {
      saveUserToDb();
    }
  }, [user?.uid, isAuthenticated]); // Dependency on `isAuthenticated` ensures it runs after login

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={signInWithGoogle}
        disabled={isLoading}
        variant="outline"
        className="w-full text-sm font-normal dark:bg-transparent dark:border-gray-800 dark:text-gray-400"
        type="button"
      >
        <FcGoogle className="mr-2 size-5" />
        Continue with Google
      </Button>

      {/* GitHub sign-in button (commented out for now) */}
      {/* <Button
        onClick={signInWithGithub}
        disabled={isLoading}
        variant="outline"
        type="button"
        className="w-full text-sm font-normal dark:bg-transparent dark:border-gray-800 dark:text-gray-400"
      >
        <FaGithub className="mr-2 size-4" />
        Github
      </Button> */}
    </div>
  );
};
