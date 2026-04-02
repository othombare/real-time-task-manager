import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function StatCard({ title, value, icon: Icon, trend, trendType = "up" }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-2.5 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded-full",
            trendType === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
          )}>
            {trendType === "up" ? "+" : "-"}{trend}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
      
      {/* Decorative background element */}
      <div className="absolute -bottom-6 -right-6 p-10 bg-primary/2 rounded-full blur-2xl group-hover:bg-primary/5 transition-colors" />
    </motion.div>
  )
}
