import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

function Panel({ title, subtitle, action, className, children }: PanelProps) {
  return (
    <section className={`panel ${className ?? ""}`.trim()}>
      {(title || action) && (
        <div className="panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default Panel;
