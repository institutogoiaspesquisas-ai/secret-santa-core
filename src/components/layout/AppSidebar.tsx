import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Gift,
    LayoutDashboard,
    Plus,
    Users,
    LogOut,
    ChevronLeft,
    Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";

interface AppSidebarProps {
    className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast({
                title: "Até logo! 👋",
                description: "Você saiu da sua conta.",
            });
            // Force full page reload to clear all state
            window.location.href = "/";
        } catch {
            toast({
                title: "Erro ao sair",
                description: "Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            href: "/dashboard",
            label: "Meus Grupos",
            icon: LayoutDashboard,
        },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border border-border"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Overlay for mobile */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
                    isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64",
                    className
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                        {!isCollapsed && (
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <Gift className="h-6 w-6 text-primary" />
                                <span className="font-display font-bold text-lg">Quem Sou Eu IA</span>
                            </Link>
                        )}
                        {isCollapsed && (
                            <Link to="/dashboard" className="mx-auto">
                                <Gift className="h-6 w-6 text-primary" />
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex h-8 w-8"
                        >
                            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    isActive(item.href)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                            </Link>
                        ))}

                        <div className="pt-4 space-y-2">
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start gap-3 btn-hover-scale",
                                    isCollapsed && "justify-center px-0"
                                )}
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span>Criar Grupo</span>}
                            </Button>

                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start gap-3 btn-hover-scale",
                                    isCollapsed && "justify-center px-0"
                                )}
                                onClick={() => setIsJoinModalOpen(true)}
                            >
                                <Users className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span>Entrar com Código</span>}
                            </Button>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
                                isCollapsed && "justify-center px-0"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>Sair</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Modals */}
            <CreateGroupModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
            <JoinGroupModal
                open={isJoinModalOpen}
                onOpenChange={setIsJoinModalOpen}
            />
        </>
    );
}
