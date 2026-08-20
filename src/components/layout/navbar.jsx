"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Radio } from "lucide-react";

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

  const currentUser = user || mountedUser;
  const initial = currentUser?.name?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">

      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-900 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            <Radio size={16} />
          </div>
          <span className="tracking-tight">CBS</span>
        </Link>

        {!(isAuthenticated || mountedUser) ? (

          <Link href="/login">
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 h-9 text-xs transition-colors">
              Login
            </Button>
          </Link>

        ) : (

          <DropdownMenu>

            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors focus:outline-none">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                {initial}
              </div>
              <span className="max-w-[120px] truncate">{currentUser?.name}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg border-slate-100 bg-white">
              
              <div className="px-2.5 py-2">
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{currentUser?.email}</p>
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 focus:text-red-700 rounded-lg cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        )}

      </div>

    </header>
  );
}