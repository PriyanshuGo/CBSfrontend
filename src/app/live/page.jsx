"use client";
import { Copy, Check, Wifi, AlertCircle, BookOpen, User, GraduationCap, PlayCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

/* ── Reusable credential card (UI only, no logic change) ── */
function CredentialCard({ item, copiedRole, onCopy }) {
  const isCopied = copiedRole === item.role;
  const isTeacher = item.role === "Teacher";

  return (
    <div
      className={`relative rounded-2xl border p-5 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${isTeacher
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100"
        }`}
    >
      {/* Decorative blob */}
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 `}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${isTeacher
              ? "bg-blue-100 text-blue-600"
              : "bg-purple-100 text-purple-600"
              }`}
          >
            {isTeacher ? <User size={15} /> : <GraduationCap size={15} />}
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {item.role} Login
          </h3>
        </div>

        <button
          onClick={() => onCopy(item)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${isCopied
            ? "bg-green-100 text-green-700 border border-green-200"
            : isTeacher
              ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
              : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
            }`}
        >
          {isCopied ? <Check size={13} /> : <Copy size={13} />}
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">Email</span>
          <span className="text-xs text-gray-800 truncate">{item.email}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">Password</span>
          <span className="text-xs text-gray-800">{item.password}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable App Usage Guide (UI only) ── */
function AppUsageGuide() {
  return (
    <section id="usage-guide" className="border-t border-gray-200/60 pt-8 mt-10 space-y-8">
      {/* Teacher Flow */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📖</span>
          <h2 className="text-lg font-bold text-gray-900">Teacher Flow</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1: Teacher */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              <h3 className="text-sm font-semibold text-gray-800">Teacher Draft</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>Copy <span className="font-medium text-blue-650 text-blue-600">Teacher Login</span> credentials and sign in.</li>
              <li>Go to <span className="font-medium text-gray-700">Create Content</span> and save a draft draft.</li>
              <li>Default start time is auto-set to local time.</li>
            </ul>
          </div>

          {/* Step 2: Approval */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">2</span>
              <h3 className="text-sm font-semibold text-gray-800">Request Review</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>On the draft card, click <span className="font-medium text-blue-600">Send for Approval</span>.</li>
              <li>Submit a note explaining the content to the Principal.</li>
              <li>Status turns to <span className="text-amber-600 font-semibold">Pending</span>.</li>
            </ul>
          </div>

          {/* Step 3: Principal & Live */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold shrink-0">3</span>
              <h3 className="text-sm font-semibold text-gray-800">Approve & Publish</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>Sign in as <span className="font-medium text-purple-700">Principal</span>, find pending contents, click <span className="font-medium text-green-600">Approve</span>.</li>
              <li>Approved contents broadcast automatically.</li>
              <li>If rejected, review reasons and edit/resubmit.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Principal Flow */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🛡️</span>
          <h2 className="text-lg font-bold text-gray-900">Principal Flow</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1: Principal Sign In */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold shrink-0">1</span>
              <h3 className="text-sm font-semibold text-gray-800">Principal Sign In</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>Copy <span className="font-medium text-purple-700">Principal Login</span> credentials from above.</li>
              <li>Sign out of any active teacher session and log in at the `/login` screen.</li>
              <li>Redirects directly to the Principal moderation panel.</li>
            </ul>
          </div>

          {/* Step 2: Content Moderation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">2</span>
              <h3 className="text-sm font-semibold text-gray-800">Manage Submissions</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>Review the broadcast details, teacher request note, and attachments.</li>
              <li>Filter entries using chips at the top to focus on <span className="font-semibold text-amber-600">Pending</span> review cards.</li>
            </ul>
          </div>

          {/* Step 3: Approve / Reject */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold shrink-0">3</span>
              <h3 className="text-sm font-semibold text-gray-800">Approve or Reject</h3>
            </div>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed list-disc list-inside pl-1">
              <li>Click <span className="font-semibold text-green-600">✓ Approve</span> to confirm and schedule content for broadcasting.</li>
              <li>Click <span className="font-semibold text-red-600">✗ Reject</span> to open feedback dialog and request modifications.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LivePage() {

  const [copiedRole, setCopiedRole] = useState("");
  const {
    data,
    isLoading,
    isError,
  } = useGetLiveContentQuery(TEACHER_ID);

  const liveContent = data?.data || [];

  const handleCopy = async (item) => {
    const data = JSON.stringify({
      email: item.email,
      password: item.password,
    });

    await navigator.clipboard.writeText(data);

    setCopiedRole(item.role);

    setTimeout(() => {
      setCopiedRole("");
    }, 2000);
  };

  /* ── Main view ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Cold start wake-up banner */}
        {isLoading && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm animate-pulse">
            <span className="text-xl shrink-0">⏳</span>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-800">Server is warming up (Cold Start)</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                The backend is hosted on a free instance and takes about 30 seconds to wake up on first visit. You can copy the credentials below to log in and start using the dashboards while it loads!
              </p>
            </div>
          </div>
        )}

        {/* Credentials section */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Test Credentials
            </p>
            <a
              href="#usage-guide"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              📖 User Guide
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((item) => (
              <CredentialCard
                key={item.role}
                item={item}
                copiedRole={copiedRole}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </section>

        {/* Live content section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="relative flex h-3 w-3">
              {isLoading ? (
                <span className="animate-spin inline-flex h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent shrink-0" />
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </>
              )}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLoading ? "Fetching Live Sessions..." : "Live Content"}
            </h1>
            {!isLoading && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2.5 py-1 rounded-full">
                {liveContent.length}{" "}
                {liveContent.length === 1 ? "Session" : "Sessions"}
              </span>
            )}
          </div>

          <div className="space-y-5">
            {isLoading ? (
              // Skeletons while loading
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white shadow-sm animate-pulse overflow-hidden mb-5"
                >
                  <div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-full bg-gray-100 rounded" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded" />
                    <div className="h-56 w-full bg-gray-100 rounded-xl mt-4" />
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-sm text-red-500">Failed to load content.</p>
              </div>
            ) : liveContent.length === 0 ? (
              // Empty state
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="text-blue-400" size={28} />
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  No Live Content Available
                </h2>
                <p className="text-sm text-gray-400">
                  There are no live sessions scheduled right now. Check back later.
                </p>
              </div>
            ) : (
              // Live cards list
              liveContent.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl"
                >
                  <CardContent className="p-0">

                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {item.title}
                          </h2>
                          {item.subject?.name && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <BookOpen size={13} className="text-blue-200" />
                              <span className="text-sm text-blue-200">
                                {item.subject.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 shrink-0">
                          <Wifi size={13} className="text-white" />
                          <span className="text-xs text-white font-medium">Live</span>
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6 space-y-4 bg-white">
                      {item.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.files?.[0]?.url && (
                        <div className="relative w-full h-[500px] rounded-xl overflow-hidden ring-1 ring-gray-100">
                          <Image
                            src={item.files[0].url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <AppUsageGuide />

      </div>
    </div>
  );
}
