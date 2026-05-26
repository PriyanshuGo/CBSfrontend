"use client";
import { Copy } from "lucide-react";
import Image from "next/image";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    useGetLiveContentQuery,
} from "@/services/live/liveApi";

const TEACHER_ID =
    "69fa23bca2cdf16d2a3b7c0c";

const credentials = [
  {
    role: "Teacher",
    email: "rahul@yopmail.com",
    password: "123456",
  },
  {
    role: "Principal",
    email: "golu@yopmail.com",
    password: "123456",
  },
];

export default function LivePage() {

    const {
        data,
        isLoading,
        isError,
    } = useGetLiveContentQuery(TEACHER_ID);

    const liveContent = data?.data || [];

    if (isLoading) {
        return (
            <div className="p-10">
                Loading live content...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-10 text-red-500">
                Failed to load content
            </div>
        );
    }

    if (!liveContent.length) {
        return (
            <div className="p-10 flex flex-col ">
              <h1>  No content available </h1>

                
                         <div className="grid gap-4 md:grid-cols-2">
      {credentials.map((item) => (
        <div
          key={item.role}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {item.role} Login
            </h3>

            <button
              onClick={() => handleCopy(item)}
              className="flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {item.email}
            </p>

            <p>
              <span className="font-medium">Password:</span>{" "}
              {item.password}
            </p>
          </div>
        </div>
      ))}
    </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">

                         <div className="grid gap-4 md:grid-cols-2">
      {credentials.map((item) => (
        <div
          key={item.role}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {item.role} Login
            </h3>

            <button
              onClick={() => handleCopy(item)}
              className="flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {item.email}
            </p>

            <p>
              <span className="font-medium">Password:</span>{" "}
              {item.password}
            </p>
          </div>
        </div>
      ))}
    </div>

            <div className="max-w-5xl mx-auto space-y-6">

                <h1 className="text-3xl font-bold">
                    Live Content
                </h1>

                {liveContent.map((item) => (

                    <Card key={item._id}>

                        <CardContent className="p-6 space-y-5">

                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {item.title}
                                </h2>

                                <p className="text-muted-foreground">
                                    {item.subject?.name}
                                </p>
                            </div>

                            <p>
                                {item.description}
                            </p>

                            {item.files?.[0]?.url && (
                                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">

                                    <Image
                                        src={item.files[0].url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />

                                </div>
                            )}

                        </CardContent>

                    </Card>

                ))}
            </div>

        </div>
    );
}
