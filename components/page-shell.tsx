import { cn } from "@/lib/utils";

export function PageShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto min-h-screen w-full max-w-6xl px-4 py-6 md:px-8", className)}>
      <header className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h1 className="font-serif text-3xl tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  );
}
