import * as React from "react";
import { Lock, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusVariant = "complete" | "incomplete" | "pending" | "hints" | "default";

interface StatusBadgeProps {
    variant?: StatusVariant;
    children?: React.ReactNode;
    className?: string;
    showIcon?: boolean;
}

const statusConfig: Record<StatusVariant, {
    icon: React.ElementType;
    className: string;
    defaultLabel: string;
}> = {
    complete: {
        icon: CheckCircle,
        className: "badge-complete",
        defaultLabel: "Completo",
    },
    incomplete: {
        icon: AlertCircle,
        className: "badge-incomplete",
        defaultLabel: "Incompleto",
    },
    pending: {
        icon: Clock,
        className: "badge-pending",
        defaultLabel: "Pendente",
    },
    hints: {
        icon: Lock,
        className: "badge-hints",
        defaultLabel: "Dicas geradas",
    },
    default: {
        icon: CheckCircle,
        className: "bg-secondary text-secondary-foreground",
        defaultLabel: "",
    },
};

export function StatusBadge({
    variant = "default",
    children,
    className,
    showIcon = true,
}: StatusBadgeProps) {
    const config = statusConfig[variant];
    const Icon = config.icon;
    const label = children || config.defaultLabel;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                config.className,
                className
            )}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            {label}
        </span>
    );
}
