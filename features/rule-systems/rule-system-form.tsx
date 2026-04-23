"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';

const ui = getUiText();

type RuleSystemFormValues = {
  title: string;
  slug: string;
  summary: string;
  systemKind: string;
  versionLabel: string;
  appliesTo: string;
  content: string;
  status: string;
  canonState: string;
};

type RuleSystemFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: string;
  initialValues?: Partial<RuleSystemFormValues>;
};

const statusOptions = [
  { label: ui.status.draft, value: 'draft' },
  { label: ui.status.active, value: 'active' },
  { label: ui.status.archived, value: 'archived' },
];

const canonOptions = [
  { label: ui.status.canonical, value: 'canonical' },
  { label: ui.status.alternate, value: 'alternate' },
  { label: ui.status.uncertain, value: 'uncertain' },
  { label: ui.status.noncanonical, value: 'noncanonical' },
];

export function RuleSystemForm({ mode, endpoint, redirectTo, initialValues }: RuleSystemFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<RuleSystemFormValues>({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    systemKind: initialValues?.systemKind ?? '',
    versionLabel: initialValues?.versionLabel ?? '',
    appliesTo: initialValues?.appliesTo ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalizedTitle = normalizeText(form.title);
    if (!normalizedTitle) { setError(ui.ruleSystems.form.titleRequired); return; }

    const normalizedSlug = normalizeText(form.slug);
    const payloadBody: Record<string, unknown> = {
      title: normalizedTitle,
      summary: normalizeText(form.summary),
      systemKind: normalizeText(form.systemKind),
      versionLabel: normalizeText(form.versionLabel),
      appliesTo: normalizeText(form.appliesTo),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
    };
    if (normalizedSlug) payloadBody.slug = normalizedSlug;

    setIsSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.ruleSystems.form.saveFailed);
      const itemId = payload?.data?.id;
      if (typeof itemId !== 'string' || itemId.length === 0) throw new Error(ui.ruleSystems.form.invalidResponse);
      router.push(`${redirectTo}/${itemId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.ruleSystems.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  const set = (key: keyof RuleSystemFormValues) => (v: string) => setForm((c) => ({ ...c, [key]: v }));

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.ruleSystems.form.title} name="title" value={form.title} onChange={set('title')} required autoComplete="off" />
        <FormField label={ui.ruleSystems.form.slug} name="slug" value={form.slug} onChange={set('slug')} hint={ui.ruleSystems.form.slugHint} />
        <TextareaField label={ui.ruleSystems.form.summary} name="summary" value={form.summary} onChange={set('summary')} rows={3} />
        <FormField label={ui.ruleSystems.form.systemKind} name="systemKind" value={form.systemKind} onChange={set('systemKind')} hint={ui.ruleSystems.form.systemKindHint} />
        <FormField label={ui.ruleSystems.form.versionLabel} name="versionLabel" value={form.versionLabel} onChange={set('versionLabel')} hint={ui.ruleSystems.form.versionLabelHint} />
        <FormField label={ui.ruleSystems.form.appliesTo} name="appliesTo" value={form.appliesTo} onChange={set('appliesTo')} hint={ui.ruleSystems.form.appliesToHint} />
        <TextareaField label={ui.ruleSystems.form.content} name="content" value={toTextareaValue(form.content)} onChange={set('content')} hint={ui.ruleSystems.form.contentHint} />
        <SelectField label={ui.ruleSystems.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={set('status')} />
        <SelectField label={ui.ruleSystems.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={set('canonState')} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.ruleSystems.form.saveCreate : ui.ruleSystems.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
