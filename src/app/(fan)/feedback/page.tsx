"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FEEDBACK_CATEGORIES } from "@/lib/constants";
import { Send, CheckCircle } from "lucide-react";

export default function FeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, category }),
    });

    if (res.ok) {
      setSubmitted(true);
      toast("Feedback submitted! Thank you.");
    } else {
      toast("Failed to submit feedback", "error");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cobalt mb-2">Thank You!</h2>
        <p className="text-gray-500 mb-6">
          Your feedback has been submitted. We appreciate hearing from you.
        </p>
        <Button onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }}>
          Send More Feedback
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cobalt">Feedback</h1>
        <p className="text-gray-500 text-sm">We&apos;d love to hear from you</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 max-w-lg">
        <Select
          id="category"
          label="Category"
          options={FEEDBACK_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          id="subject"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief subject"
        />
        <Textarea
          id="message"
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts, report a bug, or request a feature..."
          required
        />
        <Button type="submit" loading={loading}>
          <Send className="w-4 h-4 mr-2" />
          Submit Feedback
        </Button>
      </form>
    </div>
  );
}
