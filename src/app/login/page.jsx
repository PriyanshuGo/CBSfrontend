"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { useLoginMutation } from "@/services/auth/authApi";

import { setCredentials } from "@/features/auth/authSlice";

import { setAccessToken } from "@/utils/token";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function LoginPage() {

    const router = useRouter();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handlePaste = async (e) => {
  e.preventDefault();

  try {
    const text = e.clipboardData.getData("text");
    const data = JSON.parse(text);

    setFormData({
      email: data.email || "",
      password: data.password || "",
    });
  } catch (error) {
    console.log("Invalid clipboard data");
  }
};

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {

            const response = await login(formData).unwrap();

            const {
                accessToken,
                user,
            } = response;

            setAccessToken(accessToken);
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            dispatch(
                setCredentials({
                    user,
                    accessToken,
                })
            );

            if (user.role.name === "principal") {
                router.push("/principal/dashboard");
            }

            if (user.role.name === "teacher") {
                router.push("/teacher/dashboard");
            }

        } catch (error) {

            setError(
                error?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

            <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardContent className="p-8 space-y-6">

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-1.5 text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Login
                            </h1>
                            <p className="text-sm text-gray-500">
                                Content Broadcast System
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Email
                            </label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                onPaste={handlePaste}
                                className="rounded-xl border-gray-200 focus:border-blue-400 h-11 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onPaste={handlePaste}
                                    className="rounded-xl border-gray-200 focus:border-blue-400 h-11 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </Button>

                    </form>

                </CardContent>
            </Card>

        </div>
    );
}
