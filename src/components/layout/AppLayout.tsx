import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
    children: ReactNode;
    className?: string;
    showSidebar?: boolean;
}

export function AppLayout({
    children,
    className,
    showSidebar = true
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {showSidebar && <AppSidebar />}

            <main
                className={cn(
                    "min-h-screen transition-all duration-300",
                    showSidebar && "lg:pl-64",
                    className
                )}
            >
                {children}
            </main>
        </div>
    );
}
