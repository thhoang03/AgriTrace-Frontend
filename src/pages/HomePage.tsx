import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search, QrCode, CheckCircle, Leaf, Shield, Globe, Award,
  TrendingUp, Phone, Mail, MapPin, ChevronRight, ArrowRight,
  Layers, Zap, X, User, Play, ChevronDown, ChevronUp, Lock, Check, Loader2
} from "lucide-react";
import { useAuth } from "../features/auth/auth.store";
import { QRScannerModal } from "../components/common/QRScannerModal";
import { FeatureModal } from "../components/home/FeatureModal";
import { InfoPolicyModal } from "../components/home/InfoPolicyModal";
import { QRGeneratorWidget } from "../components/home/QRGeneratorWidget";
import { PartnerModal } from "../components/home/PartnerModal";
import { DistributorLogosSection } from "../components/home/DistributorLogosSection";
import { NationalStandardsSection } from "../components/home/NationalStandardsSection";
import { publicTraceApi } from "../features/public-trace/public-trace.api";

const HERO_IMG = "https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?w=1920&q=80";

/** Scroll Reveal Component using IntersectionObserver for dynamic scroll animations */
const RevealOnScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "fade" | "scale" | "left" | "right";
}> = ({ children, className = "", delayMs = 0, direction = "up" }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return "opacity-100 translate-y-0 translate-x-0 scale-100";
    switch (direction) {
      case "fade":
        return "opacity-0 translate-y-0 scale-100";
      case "scale":
        return "opacity-0 translate-y-4 scale-95";
      case "left":
        return "opacity-0 -translate-x-12 translate-y-0 scale-100";
      case "right":
        return "opacity-0 translate-x-12 translate-y-0 scale-100";
      case "up":
      default:
        return "opacity-0 translate-y-12 scale-95";
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ease-out transform ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};

export function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  // Language State: 'en' (English) or 'vi' (Tiếng Việt)
  const [lang, setLang] = useState<"vi" | "en">("en");

  // Search State
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // Click-outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce the query before hitting the real trace-by-code lookup
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Live preview: looks up the real batch record for the typed code (min 3 chars, no partial-match search API exists)
  const previewCode = debouncedQuery.length >= 3 ? debouncedQuery : "";
  const { data: previewData, isLoading: isPreviewLoading, isError: isPreviewError } = useQuery({
    queryKey: ["homeSearchPreview", previewCode],
    queryFn: () => publicTraceApi.getTrace(previewCode),
    enabled: !!previewCode && showSuggestions,
    retry: false,
    staleTime: 30_000,
  });
  const previewBatch = previewData?.data;

  // Modal States
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string | null>(null);
  const [selectedPolicyModal, setSelectedPolicyModal] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Interactive How-It-Works Active Step
  const [activeStepTab, setActiveStepTab] = useState<number>(0);

  // Animated Counter Effect for Stats
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targetCounts = [48291, 12847, 3204, 284910];

  useEffect(() => {
    // Smooth counter animation
    let animationFrameId: number;
    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setCounts(targetCounts.map((target) => Math.floor(progress * target)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Smart Search logic
  const handleSearch = (overrideQuery?: string) => {
    let searchText = (overrideQuery ?? query).trim();
    if (!searchText) return;
    if (searchText.length > 200) {
      searchText = searchText.substring(0, 200);
    }

    // Check if input is a full URL like http://.../trace/RICE-20260112-001
    if (searchText.includes("/trace/")) {
      const parts = searchText.split("/trace/");
      const extractedId = parts[parts.length - 1];
      navigate(`/trace/${extractedId}`);
    } else {
      navigate(`/trace/${searchText}`);
    }
  };

  // QR scan handler — parses URL or raw code
  const handleQrScan = (text: string) => {
    try {
      const url = new URL(text);
      if (url.pathname.includes("/trace/")) {
        const parts = url.pathname.split("/trace/");
        const id = parts[parts.length - 1].replace(/\/$/, "");
        if (id) { navigate(`/trace/${id}`); return; }
      }
    } catch {}
    navigate(`/trace/${text.trim()}`);
  };


  // Scroll tracking state for scroll effects
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      
      setIsScrolled(currentScroll > 40);
      setShowScrollTop(currentScroll > 300);
      
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, (currentScroll / totalHeight) * 100));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-[#F5F7FA] overflow-x-hidden relative">
      {/* 0. Top Scroll Progress Indicator Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-800 via-emerald-500 to-amber-400 z-50 transition-all duration-150 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 1. Header Navigation Bar (Dynamic Shrink & Elevation on Scroll) */}
      <nav className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
        isScrolled ? "shadow-md py-1" : "shadow-xs py-0"
      }`}>
        <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between gap-6 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 leading-tight text-base tracking-tight">AgriTrace Vietnam</span>
              <span className="text-[10px] text-green-700 font-semibold tracking-wider uppercase">Cổng Nông Nghiệp Số</span>
            </div>
          </div>

          {/* Center Navigation Links (Smooth Scroll) */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-green-700 transition-colors">{lang === "vi" ? "Tính năng" : "Features"}</a>
            <a href="#how-it-works" className="hover:text-green-700 transition-colors">{lang === "vi" ? "Quy trình" : "How It Works"}</a>
            <a href="#stats" className="hover:text-green-700 transition-colors">{lang === "vi" ? "Thống kê" : "Statistics"}</a>
            <a href="#generator" className="hover:text-green-700 transition-colors">{lang === "vi" ? "Tạo QR" : "QR Generator"}</a>
            <a href="#contact" className="hover:text-green-700 transition-colors">{lang === "vi" ? "Liên hệ" : "Contact"}</a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "vi" | "en")}
                className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 outline-none bg-gray-50 hover:bg-white transition-colors appearance-none pr-7 cursor-pointer"
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Login / Dashboard / Register Buttons */}
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/app/dashboard")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-90 flex items-center gap-1.5"
                style={{ background: "#2E7D32" }}
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === "vi" ? "Trang Quản Lý" : "Dashboard"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                >
                  {lang === "vi" ? "Đăng Nhập" : "Sign In"}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:shadow-lg hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
                >
                  {lang === "vi" ? "Đăng Ký" : "Sign Up"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Background Shimmer & Smart Search */}
      <section className="relative min-h-[640px] flex items-center justify-center z-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(27,94,32,0.90) 0%, rgba(46,125,50,0.80) 50%, rgba(0,0,0,0.65) 100%)" }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
          {/* Government Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 shadow-lg border border-white/20" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", backdropFilter: "blur(12px)" }}>
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>{lang === "vi" ? "Cổng Thông Tin Truy Xuất Nông Sản Quốc Gia Việt Nam" : "Official Government Agricultural Traceability System"}</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-white mb-5" style={{ fontSize: "clamp(30px, 5.5vw, 56px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {lang === "vi" ? "Truy Xuất Nguồn Gốc Nông Sản" : "Vietnam Agricultural"}
            <br />
            <span style={{ color: "#A5D6A7" }}>
              {lang === "vi" ? "Tốt Nhất & Minh Bạch Từ Nông Trại" : "Supply Chain Traceability"}
            </span>
          </h1>
          
          <p className="text-green-100 mb-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {lang === "vi"
              ? "Xác thực nông sản Việt Nam từ Trang trại đến Bàn ăn. Bảo chứng dữ liệu bất biến bằng công nghệ Blockchain."
              : "Verify agricultural products from Farm to Table. Powered by blockchain, trusted by the government."}
          </p>

          {/* Smart Search Bar */}
          <div className="max-w-2xl mx-auto relative z-30">
            <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/40">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  maxLength={200}
                  value={query}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSuggestions(false);
                      handleSearch();
                    }
                  }}
                  placeholder={lang === "vi" ? "Nhập Mã QR hoặc Mã Lô (VD: RICE-20260112-001)... [Nhấn / để tìm]" : "Enter QR Code or Batch ID (e.g. RICE-20260112-001)..."}
                  className="w-full pl-10 pr-9 py-3 text-sm outline-none rounded-xl bg-transparent text-gray-900 placeholder-gray-400 font-medium"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    handleSearch();
                  }}
                  className="px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)", whiteSpace: "nowrap" }}
                >
                  <Search className="w-4 h-4" /> {lang === "vi" ? "Tra cứu" : "Search"}
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-5 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all hover:bg-gray-100 bg-gray-50 text-gray-800"
                  style={{ border: "1px solid #e0e0e0", whiteSpace: "nowrap" }}
                >
                  <QrCode className="w-4 h-4 text-green-700" /> {lang === "vi" ? "Quét QR" : "Scan QR"}
                </button>
              </div>
            </div>

              {/* Live Real-Data Preview / Direct Search Hint */}
              {showSuggestions && query.trim() && (
                <>
                  <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {previewCode && isPreviewLoading ? (
                      <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {lang === "vi" ? "Đang tra cứu dữ liệu thật..." : "Looking up real data..."}
                      </div>
                    ) : previewCode && previewBatch ? (
                      <div
                        onClick={() => {
                          setShowSuggestions(false);
                          handleSearch(previewCode);
                        }}
                        className="p-3.5 hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-xs">
                            <Leaf className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs truncate">{previewBatch.productName || previewBatch.batchCode}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {previewBatch.currentOrganizationName || (lang === "vi" ? "Chưa cập nhật đơn vị" : "No organization on record")}
                              {" • "}
                              {previewBatch.status === 7 ? (
                                <span className="text-red-600 font-semibold">{lang === "vi" ? "Đã thu hồi" : "Recalled"}</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">{lang === "vi" ? "Đã xác thực" : "Verified"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <code className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-lg border border-emerald-200/60 flex-shrink-0">
                          {previewBatch.batchCode}
                        </code>
                      </div>
                    ) : previewCode && isPreviewError ? (
                      <div className="p-4 text-xs text-center text-gray-500 font-medium">
                        {lang === "vi" ? `Không tìm thấy lô hàng với mã "${query}"` : `No batch found for "${query}"`}
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setShowSuggestions(false);
                          handleSearch();
                        }}
                        className="p-4 text-xs text-center text-gray-600 hover:bg-emerald-50/50 cursor-pointer font-medium"
                      >
                        {lang === "vi" ? `Tra cứu trực tiếp mã "${query}" →` : `Search directly for "${query}" →`}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
        </div>
      </section>

      {/* 3. Platform Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll direction="up" delayMs={0}>
            <div className="text-center mb-14">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                {lang === "vi" ? "Tính Năng Nổi Bật" : "Platform Features"}
              </span>
              <h2 className="mt-3 text-gray-900 text-3xl font-extrabold tracking-tight">
                {lang === "vi" ? "Minh Bạch Toàn Diện Chuỗi Nông Sản" : "End-to-End Transparency"}
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
                {lang === "vi"
                  ? "Từ hạt giống đến bàn ăn, từng giai đoạn sản xuất được số hóa và bảo chứng."
                  : "From seed to shelf, every step of your agricultural product journey is recorded, verified, and accessible."}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                key: "QR Verification",
                icon: QrCode,
                title: lang === "vi" ? "Xác Thực QR" : "QR Verification",
                desc: lang === "vi" ? "Xác thực nguồn gốc và chất lượng nông sản tức thì qua quét mã QR chuẩn ISO/IEC." : "Instantly verify product origin and quality by scanning QR codes at any point in the supply chain.",
                color: "#2E7D32",
                bg: "#E8F5E9",
                delay: 0,
              },
              {
                key: "Supply Chain",
                icon: TrendingUp,
                title: lang === "vi" ? "Chuỗi Cung Ứng" : "Supply Chain",
                desc: lang === "vi" ? "Giám sát thời gian thực mọi mắt xích từ trang trại đến siêu thị trên sổ cái Blockchain." : "Real-time visibility across every stage from farm to table with immutable blockchain records.",
                color: "#1976D2",
                bg: "#E3F2FD",
                delay: 100,
              },
              {
                key: "Quality Certificate",
                icon: Award,
                title: lang === "vi" ? "Chứng Nhận Chất Lượng" : "Quality Certificate",
                desc: lang === "vi" ? "Chứng thư số VietGAP, GlobalGAP & kết quả phòng thử nghiệm đạt chuẩn." : "Digital certificates verified by accredited labs ensuring compliance with VietGAP standards.",
                color: "#F57C00",
                bg: "#FFF3E0",
                delay: 200,
              },
              {
                key: "Government Verified",
                icon: Shield,
                title: lang === "vi" ? "Bảo Chứng Chính Phủ" : "Government Verified",
                desc: lang === "vi" ? "Bộ Nông nghiệp & PTNT bảo chứng dữ liệu với chữ ký số chuyên dùng." : "Backed by the Ministry of Agriculture with official digital signatures and audit trails.",
                color: "#7B1FA2",
                bg: "#F3E5F5",
                delay: 300,
              },
            ].map(({ key, icon: Icon, title, desc, color, bg, delay }) => (
              <RevealOnScroll key={key} direction="up" delayMs={delay}>
                <div
                  onClick={() => setSelectedFeatureKey(key)}
                  className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                      <Icon style={{ color, width: 24, height: 24 }} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base group-hover:text-green-700 transition-colors">{title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-5 font-bold text-xs group-hover:translate-x-1 transition-transform" style={{ color }}>
                    <span>{lang === "vi" ? "Xem chi tiết" : "Learn more"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* National Standards & Legal Protection Section */}
      <RevealOnScroll direction="up" delayMs={0}>
        <NationalStandardsSection lang={lang} />
      </RevealOnScroll>

      {/* 5. Statistics Section with Animated Counters */}
      <section id="stats" className="py-16 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <RevealOnScroll direction="up" delayMs={0}>
            <div className="text-center mb-12">
              <h2 className="text-white text-3xl font-extrabold">{lang === "vi" ? "Được Tin Dùng Trên Toàn Quốc" : "Trusted Nationwide"}</h2>
              <p className="text-green-200 mt-2 text-sm">{lang === "vi" ? "Những con số khẳng định uy tín và tác động tích cực tới nông nghiệp Việt Nam" : "Numbers that reflect our impact on Vietnam's agricultural sector"}</p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { labelVi: "Sản Phẩm Đăng Ký", labelEn: "Products Registered", count: counts[0], delay: 0 },
              { labelVi: "Nông Trại Đã Kết Nối", labelEn: "Farms Connected", count: counts[1], delay: 100 },
              { labelVi: "Doanh Nghiệp Đối Tác", labelEn: "Partner Companies", count: counts[2], delay: 200 },
              { labelVi: "Lô Nông Sản Xác Thực", labelEn: "Verified Batches", count: counts[3], delay: 300 },
            ].map(({ labelVi, labelEn, count, delay }) => (
              <RevealOnScroll key={labelEn} direction="scale" delayMs={delay}>
                <div className="text-center bg-white/10 p-6 rounded-2xl backdrop-blur border border-white/15 hover:bg-white/20 transition-all">
                  <div className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                    {count.toLocaleString()}<span style={{ color: "#A5D6A7" }}>+</span>
                  </div>
                  <div className="text-green-200 mt-2 text-xs font-semibold uppercase tracking-wider">{lang === "vi" ? labelVi : labelEn}</div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works Section with Interactive Tab Stages */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll direction="up" delayMs={0}>
            <div className="text-center mb-14">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                {lang === "vi" ? "Quy Trình 3 Bước" : "How It Works"}
              </span>
              <h2 className="mt-3 text-gray-900 text-3xl font-extrabold">
                {lang === "vi" ? "Từ Trang Trại Đến Bàn Ăn Chỉ Trong 3 Bước" : "Farm to Table in 3 Steps"}
              </h2>
            </div>
          </RevealOnScroll>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                titleVi: "Đăng Ký & Khởi Tạo Lô Hàng",
                titleEn: "Register & Create Batch",
                descVi: "Trang trại (FARM) nhập dữ liệu canh tác, tọa độ GPS vùng trồng và thông tin thu hoạch để tạo lô hàng chuẩn quốc gia.",
                descEn: "Farmers register on the platform and create a digital batch record with product details, GPS location, and harvest information.",
                emoji: "🌾",
                badgeVi: "Dành cho Trang trại / Hợp tác xã",
                badgeEn: "For Farmers & Cooperatives",
                delay: 0,
              },
              {
                step: "02",
                titleVi: "Ghi Nhật Ký Chuỗi Cung Ứng",
                titleEn: "Track Supply Chain",
                descVi: "Nhà chế biến, đơn vị vận chuyển & đại lý siêu thị ghi nhận sự kiện (EVENT) số hóa lên sổ cái Blockchain.",
                descEn: "Each stakeholder (processor, distributor, retailer) logs their events digitally, creating an immutable blockchain trail.",
                emoji: "🔗",
                badgeVi: "Dành cho Doanh nghiệp Logistics",
                badgeEn: "For Logistics & Exporters",
                delay: 150,
              },
              {
                step: "03",
                titleVi: "Người Tiêu Dùng Xác Thực",
                titleEn: "Consumer Verification",
                descVi: "Khách hàng dùng camera quét mã QR để tra cứu tức thì toàn bộ chứng nhận VietGAP, phòng thử nghiệm & mã băm SHA-256.",
                descEn: "Consumers scan the QR code on any product to instantly view its complete verified history from farm to shelf.",
                emoji: "📱",
                badgeVi: "Dành cho Người tiêu dùng",
                badgeEn: "For End Consumers",
                delay: 300,
              },
            ].map(({ step, titleVi, titleEn, descVi, descEn, emoji, badgeVi, badgeEn, delay }, index) => (
              <RevealOnScroll key={step} direction="up" delayMs={delay}>
                <div
                  onClick={() => setActiveStepTab(index)}
                  className={`bg-white p-8 rounded-3xl border transition-all duration-300 cursor-pointer relative h-full flex flex-col justify-between ${
                    activeStepTab === index
                      ? "border-green-600 shadow-xl ring-2 ring-green-600/20 -translate-y-1"
                      : "border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{emoji}</div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
                        STEP {step}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {lang === "vi" ? titleVi : titleEn}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {lang === "vi" ? descVi : descEn}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg self-start">
                    {lang === "vi" ? badgeVi : badgeEn}
                  </span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Interactive QR Code Generator Tool Widget */}
      <div id="generator">
        <RevealOnScroll direction="up" delayMs={0}>
          <QRGeneratorWidget lang={lang} />
        </RevealOnScroll>
      </div>

      {/* 8. Partners & Distributors Network Section */}
      <RevealOnScroll direction="up" delayMs={0}>
        <DistributorLogosSection
          onSelectPartner={(partnerName) => setSelectedPartner(partnerName)}
          lang={lang}
        />
      </RevealOnScroll>

      {/* 9. Official Footer Section */}
      <footer id="contact" className="py-14 px-6 text-white" style={{ background: "#1B5E20" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/10">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-white text-lg">AgriTrace Vietnam</span>
              </div>
              <p className="text-green-200 text-xs leading-relaxed max-w-sm">
                {lang === "vi"
                  ? "Nền tảng truy xuất nguồn gốc nông sản quốc gia thuộc Bộ Nông nghiệp và Phát triển Nông thôn Việt Nam."
                  : "Official agricultural traceability platform by the Ministry of Agriculture and Rural Development of Vietnam."}
              </p>
            </div>

            <div>
              <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{lang === "vi" ? "Thông Tin Về Nền Tảng" : "Quick Links"}</div>
              <div className="space-y-2 text-xs">
                {["Privacy Policy", "Terms of Service", "API Documentation", "Help Center"].map((l) => (
                  <div
                    key={l}
                    onClick={() => setSelectedPolicyModal(l)}
                    className="text-green-200 hover:text-white cursor-pointer transition-colors hover:underline py-0.5"
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{lang === "vi" ? "Liên Hệ Cơ Quan" : "Contact Information"}</div>
              <div className="space-y-2.5 text-xs text-green-200">
                <a href="tel:+842437221234" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +84 999 898 989
                </a>
                <a href="mailto:lengocsonnn9605@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" /> lengocsonnn9605@gmail.com
                </a>
                <a href="https://agritracevn.onrender.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" /> agritracevn.onrender.com
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> 2 Ngọc Hà, Ba Đình, Hà Nội
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-green-300">
            <p>© 2026 Ministry of Agriculture and Rural Development of Vietnam. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>ISO 27001 & ISO/IEC 18004 Certified System</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        lang={lang}
      />


      <FeatureModal
        featureKey={selectedFeatureKey}
        onClose={() => setSelectedFeatureKey(null)}
        lang={lang}
      />

      <InfoPolicyModal
        modalType={selectedPolicyModal}
        onClose={() => setSelectedPolicyModal(null)}
        lang={lang}
      />

      <PartnerModal
        partnerName={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        lang={lang}
      />

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl bg-gradient-to-br from-green-800 to-emerald-700 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-in fade-in duration-300 border border-white/20"
          title={lang === "vi" ? "Cuộn lên đầu trang" : "Scroll to Top"}
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
