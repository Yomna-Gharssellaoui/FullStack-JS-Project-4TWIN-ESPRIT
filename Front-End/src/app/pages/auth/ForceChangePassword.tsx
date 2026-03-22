import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

import { AuthApi } from "@/shared/lib/services/auth";

function isValidPassword(p: string) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);
}

export default function ForceChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPassword(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase and 1 number."
      );
      return;
    }

    try {
      setLoading(true);
      await AuthApi.changePasswordFirst(newPassword);
      toast.success("Password updated!");
      // ── Redirect to security questions setup ──
      navigate("/auth/setup-security-questions", { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Error";
      if (String(msg).toLowerCase().includes("not required")) {
        toast.info("Password already updated. Continuing...");
        navigate("/auth/setup-security-questions", { replace: true });
        return;
      }
      toast.error("Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}