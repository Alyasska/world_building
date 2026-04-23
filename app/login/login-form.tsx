"use client";

import { useState } from 'react';
import type { FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { useUiText } from '@/lib/i18n/use-ui-text';

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const ui = useUiText();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl: nextPath,
    });

    if (result?.error) {
      setError(ui.auth.invalidCredentials);
      setIsSubmitting(false);
      return;
    }

    router.push(result?.url ?? nextPath);
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField
          label={ui.auth.username}
          name="username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          required
        />
        <FormField
          label={ui.auth.password}
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? ui.auth.signingIn : ui.auth.signIn}
          </button>
        </div>
      </div>
    </form>
  );
}
