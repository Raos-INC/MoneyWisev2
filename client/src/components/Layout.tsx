import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import logo from "../assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "react-responsive";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChartLine,
  ArrowRightLeft,
  PiggyBank,
  Calculator,
  FileText,
  Brain,
  Lightbulb,
  Settings as SettingsIcon,
  Plus,
  Bell,
} from "lucide-react";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Savings from "./Savings";
import TaxCalculator from "./TaxCalculator";
import Reports from "./Reports";
import Settings from "./Settings";
import SmartPurchaseDecision from "./SmartPurchaseDecision";
import FinancialInsights from "./FinancialInsights";
import AddTransactionModal from "./AddTransactionModal";

type Section =
  | "dashboard"
  | "transactions"
  | "savings"
  | "tax"
  | "reports"
  | "smart-purchase"
  | "insights"
  | "settings";

interface LayoutProps {
  initialSection?: string;
}

export default function Layout({ initialSection }: LayoutProps) {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>(() => {
    // Parse URL to determine initial section
    const path = initialSection || location || "/";
    const section = path.replace("/", "") || "dashboard";
    return section as Section;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // Update active section when URL changes
  useEffect(() => {
    const path = location.replace("/", "") || "dashboard";
    setActiveSection(path as Section);
  }, [location]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close sidebar on mobile after selection
    navigate(`/${section}`);
  };

  const sectionTitles: Record<Section, string> = {
    dashboard: "Dashboard",
    transactions: "Transaksi",
    savings: "Target Menabung",
    tax: "Kalkulator Pajak",
    reports: "Laporan",
    "smart-purchase": "Smart Purchase Decision",
    insights: "AI Financial Insights",
    settings: "Pengaturan",
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "savings":
        return <Savings />;
      case "tax":
        return <TaxCalculator />;
      case "reports":
        return <Reports />;
      case "smart-purchase":
        return <SmartPurchaseDecision />;
      case "insights":
        return <FinancialInsights />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? "w-16" : "w-64"} bg-card shadow-lg transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.appendChild(
                    Object.assign(document.createElement("div"), {
                      innerHTML:
                        '<svg class="h-10 w-10 text-[#8BD3E6]" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path></svg>',
                    }),
                  );
                }}
              />
              {!sidebarCollapsed && (
                <span className="ml-3 text-xl font-bold text-foreground">
                  MoneyWise
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex h-8 w-8 p-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={toggleSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => handleSectionChange("dashboard")}
              className={`nav-item w-full ${activeSection === "dashboard" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Dashboard" : ""}
            >
              <ChartLine className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
            </button>
            <button
              onClick={() => handleSectionChange("transactions")}
              className={`nav-item w-full ${activeSection === "transactions" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Transaksi" : ""}
            >
              <ArrowRightLeft className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Transaksi</span>}
            </button>
            <button
              onClick={() => handleSectionChange("savings")}
              className={`nav-item w-full ${activeSection === "savings" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Target Menabung" : ""}
            >
              <PiggyBank className="h-5 w-5" />
              {!sidebarCollapsed && (
                <span className="ml-3">Target Menabung</span>
              )}
            </button>
            <button
              onClick={() => handleSectionChange("tax")}
              className={`nav-item w-full ${activeSection === "tax" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Kalkulator Pajak" : ""}
            >
              <Calculator className="h-5 w-5" />
              {!sidebarCollapsed && (
                <span className="ml-3">Kalkulator Pajak</span>
              )}
            </button>
            <button
              onClick={() => handleSectionChange("reports")}
              className={`nav-item w-full ${activeSection === "reports" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Laporan" : ""}
            >
              <FileText className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Laporan</span>}
            </button>
            <button
              onClick={() => handleSectionChange("smart-purchase")}
              className={`nav-item w-full ${activeSection === "smart-purchase" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Smart Purchase" : ""}
            >
              <Brain className="h-5 w-5" />
              {!sidebarCollapsed && (
                <span className="ml-3">Smart Purchase</span>
              )}
            </button>
            <button
              onClick={() => handleSectionChange("insights")}
              className={`nav-item w-full ${activeSection === "insights" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "AI Insights" : ""}
            >
              <Lightbulb className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">AI Insights</span>}
            </button>
            <button
              onClick={() => handleSectionChange("settings")}
              className={`nav-item w-full ${activeSection === "settings" ? "active" : ""} ${sidebarCollapsed ? "justify-center px-2" : "justify-start px-3"}`}
              title={sidebarCollapsed ? "Pengaturan" : ""}
            >
              <SettingsIcon className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Pengaturan</span>}
            </button>
          </nav>

          {/* User Profile */}
          <div className="px-2 py-4 border-t border-border">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={(user as any)?.profileImageUrl || ""}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  title={(user as any)?.name || (user as any)?.email || "User"}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={async () => {
                    try {
                      await fetch("/api/logout", {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      });
                    } catch (error) {
                      console.error("Logout error:", error);
                    } finally {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }
                  }}
                  title="Logout"
                >
                  <ArrowRightLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center px-2">
                <img
                  src={(user as any)?.profileImageUrl || ""}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    {(user as any)?.firstName && (user as any)?.lastName
                      ? `${(user as any).firstName} ${(user as any).lastName}`
                      : (user as any)?.email || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(user as any)?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={async () => {
                    try {
                      await fetch("/api/logout", {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      });
                    } catch (error) {
                      console.error("Logout error:", error);
                    } finally {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2 h-9 w-9 p-0"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {sectionTitles[activeSection]}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Quick Add Transaction */}
              <Button
                onClick={() => setShowAddModal(true)}
                size="sm"
                className="bg-[#8BD3E6] hover:bg-[#7BC5D8] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`${isMobile ? "p-4" : "p-6"} ${isTablet ? "p-5" : ""}`}
        >
          {renderActiveSection()}
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
