type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  hint?: string;
};

export function SelectField({ label, name, value, options, onChange, hint }: SelectFieldProps) {
  return (
    <label className="field" htmlFor={name}>
      <span className="field__label">{label}</span>
      <select id={name} className="select" name={name} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
