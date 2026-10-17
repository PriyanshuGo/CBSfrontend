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

/* ── Robust Cross-Device Clipboard Copy Engine ── */
async function copyTextToClipboard(text) {
  if (!text) return false;

  // Method 1: Synchronous execCommand immediately within user gesture
  // Critical for mobile Safari/Chrome, HTTP local network testing, and in-app browsers
  let syncSuccess = false;
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Prevent iOS zoom and viewport shift
    textArea.style.fontSize = "16px";
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0.01";
    textArea.style.zIndex = "99999";
    // Avoid readonly on iOS WebKit
    textArea.contentEditable = "true";
    textArea.readOnly = false;

    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    syncSuccess = document.execCommand("copy");
    document.body.removeChild(textArea);
  } catch {
    syncSuccess = false;
  }

  if (syncSuccess) return true;

  // Method 2: Modern Async Clipboard API (for secure HTTPS contexts)
  if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to Method 3
    }
  }

  // Method 3: DOM Range selection fallback for strict WebKit contexts
  try {
    const span = document.createElement("span");
    span.textContent = text;
    span.style.fontSize = "16px";
    span.style.position = "fixed";
    span.style.top = "0";
    span.style.left = "0";
    span.style.opacity = "0.01";
    document.body.appendChild(span);

    const range = document.createRange();
    range.selectNode(span);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const rangeSuccess = document.execCommand("copy");
    selection.removeAllRanges();
    document.body.removeChild(span);
    if (rangeSuccess) return true;
  } catch {
    // All methods attempted
  }

  return false;
}

/* ── Reusable credential card (Fully responsive across all screen sizes) ── */
function CredentialCard({ item, copiedField, onCopy }) {
  const isTeacher = item.role === "Teacher";
  const isEmailCopied = copiedField === `${item.role}-email`;
  const isPasswordCopied = copiedField === `${item.role}-password`;

  return (
    <div
      className={`relative rounded-2xl border p-4 sm:p-5 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${isTeacher
        ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-100"
        : "bg-gradient-to-br from-violet-50/90 to-purple-50/90 border-violet-100"
        }`}
    >
      {/* Decorative background blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
      />

      {/* Header with Title and Primary Copy Button */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 ${isTeacher
              ? "bg-blue-100 text-blue-600"
              : "bg-purple-100 text-purple-600"
              }`}
          >
            {isTeacher ? <User size={16} /> : <GraduationCap size={16} />}
          </div>
          <h3 className="text-sm font-bold text-gray-800 truncate">
            {item.role} Login
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onCopy(item.email, `${item.role}-email`, `${item.role} Email`)}
          style={{ touchAction: "manipulation" }}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shrink-0 min-h-[42px] transition-all duration-200 active:scale-95 cursor-pointer shadow-xs ${isEmailCopied
            ? "bg-green-600 text-white border border-green-600 shadow-green-200"
            : isTeacher
              ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 active:bg-blue-100"
              : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 active:bg-purple-100"
            }`}
        >
          {isEmailCopied ? <Check size={14} className="stroke-[2.5]" /> : <Copy size={14} />}
          <span>{isEmailCopied ? "Copied!" : "Copy Email"}</span>
        </button>
      </div>

      {/* Interactive Credentials List (Click any row to copy) */}
      <div className="relative z-10 space-y-2">
        {/* Email Row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onCopy(item.email, `${item.role}-email`, `${item.role} Email`)}
          title="Click to copy email"
          className="flex items-center justify-between gap-2 bg-white/80 hover:bg-white active:bg-blue-50/70 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer border border-black/5 hover:border-black/10 shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 w-16 shrink-0">Email</span>
            <span className="text-xs text-gray-800 font-medium truncate select-all">{item.email}</span>
          </div>
          <div className="shrink-0 pl-1">
            {isEmailCopied ? (
              <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                <Check size={12} className="stroke-[3]" /> Copied
              </span>
            ) : (
              <Copy size={13} className="text-gray-400 hover:text-blue-600" />
            )}
          </div>
        </div>

        {/* Password Row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onCopy(item.password, `${item.role}-password`, `${item.role} Password`)}
          title="Click to copy password"
          className="flex items-center justify-between gap-2 bg-white/80 hover:bg-white active:bg-blue-50/70 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer border border-black/5 hover:border-black/10 shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 w-16 shrink-0">Password</span>
            <span className="text-xs text-gray-800 font-mono font-medium truncate select-all">{item.password}</span>
          </div>
          <div className="shrink-0 pl-1">
            {isPasswordCopied ? (
              <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
                <Check size={12} className="stroke-[3]" /> Copied
              </span>
            ) : (
              <Copy size={13} className="text-gray-400 hover:text-blue-600" />
            )}
          </div>
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

  const [copiedField, setCopiedField] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const {
    data,
    isLoading,
    isError,
  } = useGetLiveContentQuery(TEACHER_ID);

  const liveContent = data?.data || [];

  const handleCopy = async (textToCopy, fieldKey, label) => {
    // Run cross-platform copy
    await copyTextToClipboard(textToCopy);

    // Provide visual state feedback
    setCopiedField(fieldKey);
    setToastMessage(`Copied ${label}: ${textToCopy}`);

    // Auto-dismiss after 2.5 seconds
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldKey ? "" : curr));
      setToastMessage((curr) => (curr.includes(textToCopy) ? "" : curr));
    }, 2500);
  };

  /* ── Main view ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 sm:p-6 relative">
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
                copiedField={copiedField}
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

      {/* Floating Toast Notification across all screen sizes */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-gray-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-medium border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none max-w-[90vw] truncate">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 shrink-0">
            <Check size={12} className="stroke-[3]" />
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
