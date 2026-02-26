import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  description?: string;
  className?: string;
}

export function PageHeader({ title, breadcrumbs, actions, description, className }: PageHeaderProps) {
  return (
    <div className={cn("px-6 pt-6 pb-4 border-b border-border-default", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-disabled text-xs">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="text-xs text-text-tertiary hover:text-text-secondary transition-fast">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-xs text-text-tertiary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
