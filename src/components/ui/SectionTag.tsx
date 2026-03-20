type SectionTagProps = {
  children: string;
  className?: string;
}

export function SectionTag({ children, className = '' }: SectionTagProps) {
  return (
    <span
      className={`inline-block text-xs font-semibold uppercase tracking-widest text-sp-orange mb-3 ${className}`}
    >
      {children}
    </span>
  );
}
