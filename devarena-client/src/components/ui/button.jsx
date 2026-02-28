import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Moon, Sun, LogOut } from "lucide-react"  // ✅ added LogOut
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

// ── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onToggle()}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 64,
        height: 32,
        padding: 4,
        borderRadius: 9999,
        cursor: 'pointer',
        transition: 'background 0.3s, border-color 0.3s',
        background: isDark ? '#09090b' : '#ffffff',
        border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: isDark ? '#3f3f46' : '#e4e4e7',
        transform: isDark ? 'translateX(0)' : 'translateX(32px)',
        transition: 'transform 0.3s, background 0.3s',
        flexShrink: 0,
      }}>
        {isDark
          ? <Moon size={14} color="#ffffff" strokeWidth={1.5} />
          : <Sun size={14} color="#374151" strokeWidth={1.5} />
        }
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        marginLeft: 'auto',
        transform: isDark ? 'translateX(0)' : 'translateX(-32px)',
        transition: 'transform 0.3s',
        flexShrink: 0,
      }}>
        {isDark
          ? <Sun size={14} color="#71717a" strokeWidth={1.5} />
          : <Moon size={14} color="#000000" strokeWidth={1.5} />
        }
      </div>
    </div>
  )
}

// ── Logout Button ─────────────────────────────────────────────────────────────
function LogoutButton({ onClick, className }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 8,
        border: '1px solid',
        borderColor: hovered ? '#ef4444' : '#fca5a5',
        background: hovered ? '#ef4444' : 'transparent',
        color: hovered ? '#ffffff' : '#ef4444',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <LogOut
        size={14}
        strokeWidth={2}
        style={{
          transition: 'transform 0.2s ease',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
        }}
      />
      Logout
    </button>
  )
}

export { Button, buttonVariants, ThemeToggle, LogoutButton }