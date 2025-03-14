import { LayoutGrid, Menu, Search } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom"; // Use Link from react-router-dom for navigation

import { Button } from "@/components/ui/button";

export const navigationItems = [
  {
    title: "Register",
    href: "/register",
    items: [],
  },
  {
    title: "Fines",
    href: "/fines",
    items: [],
  },
];

export default function GlassmorphNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed left-1/2 top-0 z-50 mt-7 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col items-center rounded-full bg-white p-3 backdrop-blur-lg md:rounded-full"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
          </Link>

          <div className="hidden gap-4 md:flex">
            {navigationItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button variant="link">
                    {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:block mr-4">
          <Button type="submit">
            Sign out
          </Button>
        </div>

        <div className="md:hidden">
          <Button onClick={() => setIsOpen(!isOpen)}>
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-3 md:hidden">
          {navigationItems.map((item) => (
            <Link key={item.href} to={item.href}>
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
