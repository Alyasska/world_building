"use client";

import { TextareaField } from '@/components/ui/textarea-field';

type ContentFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function ContentField({ label, name, value, onChange, hint }: ContentFieldProps) {
  return <TextareaField label={label} name={name} value={value} onChange={onChange} hint={hint} />;
}
