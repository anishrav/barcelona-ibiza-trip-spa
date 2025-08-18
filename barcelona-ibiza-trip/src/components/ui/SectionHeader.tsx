import React from "react";

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-2xl bg-gradient-to-r from-[#da1212]/15 via-[#f1c40f]/15 to-[#a855f7]/15">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Badge({ area }: { area: "Barcelona" | "Ibiza" }) {
  const cls =
    area === "Barcelona"
      ? "bg-gradient-to-r from-[#da1212]/20 to-[#f1c40f]/20 text-foreground"
      : "bg-gradient-to-r from-[#00d0ff]/20 to-[#a855f7]/20 text-foreground";
  return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{area}</span>;
}
