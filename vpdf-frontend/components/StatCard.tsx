import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "green" | "blue" | "purple" | "orange";
}

const colors = {
  green:  { bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-100" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100"},
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100"},
};

export default function StatCard({ title, value, subtitle, icon: Icon, color }: Props) {
  const c = colors[color];
  return (
    <div className={`stat-card border ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}