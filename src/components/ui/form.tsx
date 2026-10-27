import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-lg border border-navy/30 bg-surface px-3 py-2 text-sm text-navy placeholder:text-muted aria-[invalid=true]:border-danger-ink";

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  className?: string;
};

function FieldShell({ label, name, errors, hint, required, className, children }: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-navy">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !errors?.length && (
        <p id={`${name}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-xs font-medium text-danger-ink">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, errors?: string[], hint?: string) {
  if (errors?.length) return `${name}-error`;
  return hint ? `${name}-hint` : undefined;
}

export function TextField({
  label,
  name,
  errors,
  hint,
  required,
  className,
  ...input
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <FieldShell {...{ label, name, errors, hint, required, className }}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, errors, hint)}
        className={control}
        {...input}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  name,
  errors,
  hint,
  required,
  className,
  ...input
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <FieldShell {...{ label, name, errors, hint, required, className }}>
      <textarea
        id={name}
        name={name}
        rows={3}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, errors, hint)}
        className={control}
        {...input}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  errors,
  hint,
  required,
  className,
  options,
  placeholder,
  ...select
}: FieldProps & {
  options: { value: string; label: string }[];
  placeholder?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  return (
    <FieldShell {...{ label, name, errors, hint, required, className }}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, errors, hint)}
        className={control}
        {...select}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
