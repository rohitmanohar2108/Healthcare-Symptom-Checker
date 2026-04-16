import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import SymptomChecker from "@/pages/SymptomChecker";
import History from "@/pages/History";
import Trends from "@/pages/Trends";
import { Activity, Clock, TrendingUp } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Symptom Checker", icon: Activity },
    { path: "/history", label: "History", icon: Clock },
    { path: "/trends", label: "Trends", icon: TrendingUp },
  ];
  
  return (
    <nav className="bg-[#F9F8F6] border-b border-[#E3E8E4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-[#3E5C4E]" strokeWidth={1.5} />
            <h1 className="text-xl font-medium text-[#1C352D]">HealthCheck</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`nav-link px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                    isActive
                      ? "bg-[#E3E8E4] text-[#3E5C4E] active"
                      : "text-[#6B7C75] hover:bg-[#F0EAE1]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<SymptomChecker />} />
          <Route path="/history" element={<History />} />
          <Route path="/trends" element={<Trends />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;