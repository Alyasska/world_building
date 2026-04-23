"use client";

import { useUiText } from '@/lib/i18n/use-ui-text';

type TextareaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  rows?: number;
};

export function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  hint,
  error,
  rows = 8,
}: TextareaFieldProps) {
  const ui = useUiText();

  return (
    <label className="field" htmlFor={name}>
      <span className="field__label">
        {label}
        {required ? <span className="muted">{ui.common.required}</span> : null}
      </span>
      <textarea
        id={name}
        className="textarea"
        name={name}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
