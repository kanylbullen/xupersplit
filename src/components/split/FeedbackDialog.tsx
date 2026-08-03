"use client";

import { useState, useTransition } from "react";
import { submitFeedbackAction } from "@/app/k/[key]/actions";
import { Button, Dialog, Input, Label, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { FEEDBACK_KINDS, type FeedbackContext, type FeedbackKind } from "@/lib/feedback";

/**
 * What makes an in-app report better than an email isn't where it's filed —
 * it's the context attached to it. The reporter shouldn't have to describe
 * their locale, their browser or how big the split is.
 */
export function FeedbackDialog({
  open,
  onClose,
  context,
  splitKey,
}: {
  open: boolean;
  onClose: () => void;
  context: Omit<FeedbackContext, "locale" | "userAgent">;
  splitKey: string;
}) {
  const { dict, te, locale } = useI18n();
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function close() {
    setSent(false);
    setMessage("");
    setReplyEmail("");
    setError(null);
    onClose();
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitFeedbackAction(splitKey, {
        kind,
        message,
        replyEmail,
        context: {
          ...context,
          locale,
          userAgent:
            typeof navigator === "undefined" ? undefined : navigator.userAgent.slice(0, 300),
        },
      });
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  return (
    <Dialog open={open} onClose={close} title={dict.feedback.title}>
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            {replyEmail.trim() ? dict.feedback.sentWithEmail : dict.feedback.sent}
          </p>
          <Button onClick={close} className="w-full">
            {dict.common.close}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">{dict.feedback.intro}</p>

          <div>
            <Label htmlFor="feedback-kind">{dict.feedback.kindLabel}</Label>
            <Select
              id="feedback-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as FeedbackKind)}
            >
              {FEEDBACK_KINDS.map((k) => (
                <option key={k} value={k}>
                  {dict.feedback.kinds[k]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback-message">{dict.feedback.messageLabel}</Label>
            <textarea
              id="feedback-message"
              rows={5}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.feedback.messagePlaceholder}
              className="w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <Label htmlFor="feedback-email">{dict.feedback.emailLabel}</Label>
            <Input
              id="feedback-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={replyEmail}
              onChange={(e) => setReplyEmail(e.target.value)}
              placeholder={dict.feedback.emailPlaceholder}
            />
            <p className="mt-1.5 text-xs text-stone-400">{dict.feedback.emailHint}</p>
          </div>

          <p className="text-xs text-stone-400">{dict.feedback.privacyNote}</p>

          {error && <p className="text-sm text-negative">{te(error)}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={close} className="flex-1">
              {dict.common.cancel}
            </Button>
            <Button
              onClick={submit}
              disabled={pending || message.trim().length < 5}
              className="flex-1"
            >
              {pending ? dict.feedback.sending : dict.feedback.send}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
