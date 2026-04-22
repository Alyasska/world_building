type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
};

export function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  hint,
  error,
  autoComplete,
}: FormFieldProps) {
  return (
    <label className="field" htmlFor={name}>
      <span className="field__label">
        {label}
        {required ? <span className="muted">Required</span> : null}
      </span>
      <input
        id={name}
        className="input"
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
