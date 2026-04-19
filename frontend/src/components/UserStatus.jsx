import { cn } from "../lib/utils"
import { useAppSelector } from "../store/hooks"
import { selectPresenceByUserId } from "../store/presenceSlice"

const formatLastSeen = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate)
}

function UserStatus({
  userId,
  showLabel = false,
  className,
  indicatorClassName,
}) {
  const presence = useAppSelector((state) => selectPresenceByUserId(state, userId))
  const isOnline = presence.status === "online"
  const lastSeenLabel = formatLastSeen(presence.lastSeen)
  const tooltipLabel = isOnline
    ? "Online"
    : lastSeenLabel
      ? `Offline - Last seen ${lastSeenLabel}`
      : "Offline"

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={tooltipLabel}
      aria-label={tooltipLabel}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full border",
          isOnline ? "border-blue-500 bg-blue-500" : "border-blue-500 bg-slate-300",
          indicatorClassName
        )}
      />
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {isOnline ? "Online" : lastSeenLabel ? `Last seen ${lastSeenLabel}` : "Offline"}
        </span>
      )}
    </span>
  )
}

export default UserStatus
