"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { useLogoutMutation } from "@/services/auth/authApi";

import { logout } from "@/features/auth/authSlice";

import { removeAccessToken } from "@/utils/token";

export default function Navbar() {

  const dispatch = useDispatch();

  const { user, isAuthenticated } =
    useSelector((state) => state.auth);

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {

    try {

      await logoutApi().unwrap();

    } catch (error) {
      console.log(error);
    }

    removeAccessToken();
    localStorage.removeItem("user");
    setMountedUser(null);

    dispatch(logout());

    window.location.href = "/live";
  };
  const [mountedUser, setMountedUser] =
    useState(null);

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setMountedUser(
        JSON.parse(storedUser)
      );
    }

  }, []);

  return (
    <header className="border-b bg-white">

      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">

        <Link
          href="/"
          className="font-bold text-xl"
        >
          CBS
        </Link>

        {!(isAuthenticated || mountedUser) ? (

          <Link href="/login">
            <Button>
              Login
            </Button>
          </Link>

        ) : (

          <DropdownMenu>

            <DropdownMenuTrigger className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
              {user?.name || mountedUser?.name}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem>
                {user?.email || mountedUser?.email}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500"
              >
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        )}

      </div>

    </header>
  );
}