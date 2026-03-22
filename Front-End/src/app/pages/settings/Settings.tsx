import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("access_token") ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiPatch(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─────────────────────────────────────────────────────────
// PASSWORD RULES
// ─────────────────────────────────────────────────────────
function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ];
  return (
    <ul className="mt-1 space-y-1">
      {rules.map((r) => (
        <li key={r.label} className={`text-xs flex items-center gap-1.5 ${r.ok ? "text-green-500" : "text-muted-foreground"}`}>
          <span>{r.ok ? "✓" : "○"}</span>{r.label}
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────
// PRESET SECURITY QUESTIONS
// ─────────────────────────────────────────────────────────
const PRESET_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was the make of your first car?",
  "What is the middle name of your oldest sibling?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
];

type Tab = "profile" | "password" | "security" | "account";

// ─────────────────────────────────────────────────────────
// MAIN SETTINGS PAGE
// ─────────────────────────────────────────────────────────
export function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Personal Info", icon: "👤" },
    { id: "password", label: "Change Password", icon: "🔒" },
    { id: "security", label: "Security Questions", icon: "🛡️" },
    { id: "account", label: "Account Status", icon: "ℹ️" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b pb-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profile" && <ProfileSection />}
      {tab === "password" && <PasswordSection />}
      {tab === "security" && <SecurityQuestionsSection />}
      {tab === "account" && <AccountStatusSection user={user} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 1: Personal Info
// ─────────────────────────────────────────────────────────
function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty.");
    setLoading(true);
    try {
      await apiPatch(`/users/${user?.id}`, { name: name.trim() });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your name and view your email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Avatar initial */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{user?.role?.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed. Contact an admin if needed.</p>
          </div>

          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 2: Change Password
// ─────────────────────────────────────────────────────────
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword) return toast.error("Please enter your current password.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      return toast.error("New password does not meet requirements.");
    }
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await apiPost("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password. You'll need your current password to confirm.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordRules password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 3: Security Questions
// ─────────────────────────────────────────────────────────
function SecurityQuestionsSection() {
  const [selected, setSelected] = useState(["", "", ""]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiGet("/security-questions/status")
      .then((data) => setHasExisting(data.hasQuestions))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  function availableFor(index: number) {
    return PRESET_QUESTIONS.filter(
      (q) => q === selected[index] || !selected.includes(q)
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.some((q) => !q)) return toast.error("Please select all 3 questions.");
    if (answers.some((a) => !a.trim())) return toast.error("Please answer all 3 questions.");
    if (new Set(selected).size < 3) return toast.error("Please choose 3 different questions.");

    setLoading(true);
    try {
      await apiPost("/security-questions/setup", {
        questions: selected.map((q, i) => ({ question: q, answer: answers[i] })),
      });
      toast.success(hasExisting ? "Security questions updated!" : "Security questions saved!");
      setHasExisting(true);
      setAnswers(["", "", ""]);
    } catch (err: any) {
      toast.error(err.message || "Failed to save questions.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Questions</CardTitle>
        <CardDescription>
          {hasExisting
            ? "Your security questions are set up. You can update them below."
            : "Set up 3 security questions to help recover your account if you forget your password."}
        </CardDescription>
        {hasExisting && (
          <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
            <span>✓</span> Security questions are active
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Label>Question {i + 1}</Label>
              <Select
                value={selected[i]}
                onValueChange={(val) => {
                  const arr = [...selected];
                  arr[i] = val;
                  setSelected(arr);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a question..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFor(i).map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers[i]}
                onChange={(e) => {
                  const arr = [...answers];
                  arr[i] = e.target.value;
                  setAnswers(arr);
                }}
                disabled={!selected[i]}
                required
              />
            </div>
          ))}

          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Saving..." : hasExisting ? "Update Questions" : "Save Questions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 4: Account Status
// ─────────────────────────────────────────────────────────
function AccountStatusSection({ user }: { user: any }) {
  const statusItems = [
    { label: "User ID", value: user?.id ?? "—" },
    { label: "Role", value: user?.role?.replace(/_/g, " ") ?? "—" },
    { label: "Business ID", value: user?.businessId ?? "No business linked" },
    {
      label: "Account Status",
      value: user?.lockedUntil && new Date(user.lockedUntil) > new Date()
        ? `🔒 Locked until ${new Date(user.lockedUntil).toLocaleTimeString()}`
        : "✅ Active",
    },
    {
      label: "Password Change Required",
      value: user?.mustChangePassword ? "⚠️ Yes" : "✅ No",
    },
    {
      label: "Member Since",
      value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
        <CardDescription>Read-only overview of your account details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {statusItems.map((item) => (
            <div key={item.label} className="flex justify-between py-3 text-sm">
              <span className="text-muted-foreground font-medium">{item.label}</span>
              <span className="text-right font-mono text-xs max-w-[60%] truncate">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
