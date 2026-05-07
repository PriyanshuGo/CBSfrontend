"use client";

import { useSelector } from "react-redux";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

export default function TeacherDashboardPage() {

    const { user } = useSelector(
        (state) => state.auth
    );

    return (
        <div className="p-6">

            <div className="max-w-4xl mx-auto">

                <h1 className="text-3xl font-bold mb-6">
                    Teacher Dashboard
                </h1>

                <Card>

                    <CardContent className="p-6 space-y-4">

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>

                            <h2 className="text-xl font-semibold">
                                {user?.name}
                            </h2>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <h2 className="text-lg">
                                {user?.email}
                            </h2>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Role
                            </p>

                            <h2 className="text-lg capitalize">
                                {user?.role?.name}
                            </h2>
                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>
    );
}