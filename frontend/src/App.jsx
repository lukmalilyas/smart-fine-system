import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { setAuthToken } from "./libs/apiCall";
import useStore from "./store";
import SignupPage from "./pages/auth/sign-up";
import SigninPage from "./pages/auth/sign-in";
import GlassmorphNavbar from "./components/navbar";
import { Register, Fines } from "./pages";

const RootLayout = () => {
  const { user } = useStore((state) => state);

  setAuthToken(user?.token || "");

  return !user ? (
    <Navigate to={"/sign-in"} replace={true} />
  ) : (
    <>
      <GlassmorphNavbar />
      <div className="min-h-[cal(h-screen-100px)]">
        <Outlet />
      </div>
    </>
  );
};

const App = () => {

  return (
    <main>
      <div className="w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Navigate to={"/register"} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fines" element={<Fines />} />
          </Route>

          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/sign-in" element={<SigninPage />} />
        </Routes>
      </div>

      <Toaster richColors position="top-center" />
    </main>
  );
};

export default App;
