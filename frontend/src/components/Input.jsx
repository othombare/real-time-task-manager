import { cn } from "../lib/utils";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  className,
  inputClassName,
  hint,
  icon,
  multiline = false,
  rows = 4,
  ...props
}) => {
  const sharedClasses = cn(
    "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
    icon && !multiline ? "pl-11" : "",
    error ? "border-red-500 focus:ring-red-400" : "",
    inputClassName
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-semibold mb-1">{label}</label>}
      <div className="relative">
        {icon && !multiline && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}

        {multiline ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={sharedClasses}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={sharedClasses}
            {...props}
          />
        )}
      </div>

      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
