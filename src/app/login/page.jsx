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
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">

            <Card className="w-full max-w-md">
                <CardContent className="pt-6">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div className="space-y-1 text-center">
                            <h1 className="text-2xl font-bold">
                                Login
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Content Broadcast System
                            </p>
                        </div>

                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading
                                ? "Logging in..."
                                : "Login"}
                        </Button>

                    </form>

                </CardContent>
            </Card>

        </div>
    );
}