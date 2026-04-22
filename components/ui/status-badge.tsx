type BadgeValue = 'draft' | 'active' | 'archived' | 'canonical' | 'alternate' | 'uncertain' | 'noncanonical';

type StatusBadgeProps = {
  value: BadgeValue;
  label?: string;
};

export function StatusBadge({ value, label }: StatusBadgeProps) {
  const normalized = value.toLowerCase();
  const canonValues: BadgeValue[] = ['canonical', 'alternate', 'uncertain', 'noncanonical'];
  const isCanon = canonValues.includes(value);
  const className = isCanon ? `badge badge--canon-${normalized}` : `badge badge--status-${normalized}`;

  return <span className={className}>{label ?? value}</span>;
}
