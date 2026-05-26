"use client";

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
            <div className="p-10">
                No content available
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">

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

                <div>
                 teacher login  cred
  "email": "rahul@yopmail.com",
  "password": "123456"

                    
 principal login cred
  "email": "golu@yopmail.com",
  "password": "123456"


                </div>

            </div>

        </div>
    );
}
