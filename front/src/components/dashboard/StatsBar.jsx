import { Bot, FileText, Zap, ZapOff } from "lucide-react";

export default function StatsBar({ chatbots, documentsCount = 0 }) {
  const totalBots = chatbots.length;
  const activeBots = chatbots.filter(b => b.status === "active").length;
  const inactiveBots = totalBots - activeBots;
  const totalDocs = documentsCount;

  const stats = [
    { label: "Total de Chatbots", value: totalBots, icon: Bot, color: "text-primary bg-accent" },
    { label: "Ativos", value: activeBots, icon: Zap, color: "text-emerald-600 bg-emerald-50" },
    { label: "Inativos", value: inactiveBots, icon: ZapOff, color: "text-slate-500 bg-slate-100" },
    { label: "Documentos", value: totalDocs, icon: FileText, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}