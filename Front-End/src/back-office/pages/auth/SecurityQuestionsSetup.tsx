import { useState } from "react";
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
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

interface Props {
  token: string;         // JWT from login
  onComplete: () => void; // redirect to dashboard after setup
}

export function SecurityQuestionsSetup({ token, onComplete }: Props) {
  const [selected, setSelected] = useState(["", "", ""]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);

  function availableFor(index: number) {
    // Filter out questions already chosen in other slots
    return PRESET_QUESTIONS.filter(
      (q) => q === selected[index] || !selected.includes(q)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selected.some((q) => !q)) return toast.error("Please select all 3 questions.");
    if (answers.some((a) => !a.trim())) return toast.error("Please answer all 3 questions.");
    if (new Set(selected).size < 3) return toast.error("Please choose 3 different questions.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/security-questions/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questions: selected.map((q, i) => ({ question: q, answer: answers[i] })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save questions");

      toast.success("Security questions saved!");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Security Questions</CardTitle>
        <CardDescription>
          Choose 3 security questions and answers. These will be used to recover your account if you forget your password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Label>Question {i + 1}</Label>
              <Select
                value={selected[i]}
                onValueChange={(val) => {
                  const updated = [...selected];
                  updated[i] = val;
                  setSelected(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a question..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFor(i).map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Your answer"
                value={answers[i]}
                onChange={(e) => {
                  const updated = [...answers];
                  updated[i] = e.target.value;
                  setAnswers(updated);
                }}
                disabled={!selected[i]}
                required
              />
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
            {loading ? "Saving..." : "Save Security Questions →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
