/** Form field definitions shared by every admin form, plus parsing of submitted values. */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'month'
  | 'monthOptional'
  | 'checkbox'
  | 'color'
  | 'lines'
  | 'list'
  | 'facts'
  | 'tags'
  | 'email'
  | 'url';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  step?: string;
  min?: number;
  max?: number;
  rows?: number;
  /** Half-width on desktop */
  half?: boolean;
}

export type Values = Record<string, unknown>;
export type Errors = Record<string, string>;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Convert a stored value into the string shown in the input. */
export function toInput(field: Field, value: unknown): string {
  if (value == null) return '';
  switch (field.type) {
    case 'lines':
      return (value as string[]).join('\n');
    case 'list':
      return (value as string[]).join(', ');
    case 'facts':
      return (value as { label: string; value: string }[]).map((f) => `${f.label}: ${f.value}`).join('\n');
    case 'tags':
      return (value as { label: string; strong: boolean }[]).map((t) => (t.strong ? `*${t.label}` : t.label)).join(', ');
    case 'checkbox':
      return value ? 'on' : '';
    default:
      return String(value);
  }
}

/** Parse + validate submitted form data for a list of fields. */
export function parseFields(fields: Field[], form: FormData): { values: Values; errors: Errors } {
  const values: Values = {};
  const errors: Errors = {};
  for (const f of fields) {
    const raw = form.get(f.name);
    const s = typeof raw === 'string' ? raw.trim() : '';
    if (f.required && f.type !== 'checkbox' && !s) {
      errors[f.name] = `${f.label} is required.`;
    }
    switch (f.type) {
      case 'number': {
        const n = Number(s);
        if (s && !Number.isFinite(n)) errors[f.name] = `${f.label} must be a number.`;
        else if (f.min != null && n < f.min) errors[f.name] = `${f.label} must be at least ${f.min}.`;
        else if (f.max != null && n > f.max) errors[f.name] = `${f.label} must be at most ${f.max}.`;
        values[f.name] = s ? n : 0;
        break;
      }
      case 'month':
      case 'monthOptional':
        if (s && !MONTH.test(s)) errors[f.name] = `${f.label} must be a month (YYYY-MM).`;
        values[f.name] = s || null;
        break;
      case 'checkbox':
        values[f.name] = raw === 'on';
        break;
      case 'select':
        if (f.options && s && !f.options.some((o) => o.value === s)) errors[f.name] = `Choose a valid ${f.label.toLowerCase()}.`;
        values[f.name] = s;
        break;
      case 'color':
        if (s && !/^#[0-9a-fA-F]{6}$/.test(s)) errors[f.name] = `${f.label} must be a hex color like #1D7AFC.`;
        values[f.name] = s.toUpperCase();
        break;
      case 'email':
        if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) errors[f.name] = 'Enter a valid email address.';
        values[f.name] = s;
        break;
      case 'url':
        if (s && !/^https?:\/\/\S+$/.test(s)) errors[f.name] = 'Enter a full URL starting with https://';
        values[f.name] = s;
        break;
      case 'lines':
        values[f.name] = s.split('\n').map((l) => l.trim()).filter(Boolean);
        break;
      case 'list':
        values[f.name] = s.split(/[,\n]/).map((l) => l.trim()).filter(Boolean);
        break;
      case 'facts': {
        const facts = s.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
          const i = l.indexOf(':');
          return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : null;
        });
        if (facts.some((x) => x === null)) errors[f.name] = 'Write each fact as "Label: Value", one per line.';
        values[f.name] = facts.filter(Boolean);
        break;
      }
      case 'tags':
        values[f.name] = s
          .split(/[,\n]/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => (t.startsWith('*') ? { label: t.slice(1).trim(), strong: true } : { label: t, strong: false }));
        break;
      default:
        values[f.name] = s;
    }
  }
  return { values, errors };
}
