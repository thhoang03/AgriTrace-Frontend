import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, QrCode, CheckCircle, Leaf, Shield, Globe, Award,
  TrendingUp, Phone, Mail, MapPin, ChevronRight, ArrowRight
} from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?w=1920&q=80";

const features = [
  {
    icon: QrCode,
    title: "QR Verification",
    desc: "Instantly verify product origin and quality by scanning QR codes at any point in the supply chain.",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: TrendingUp,
    title: "Supply Chain",
    desc: "Real-time visibility across every stage from farm to table with immutable blockchain records.",
    color: "#1976D2",
    bg: "#E3F2FD",
  },
  {
    icon: Award,
    title: "Quality Certificate",
    desc: "Digital certificates verified by accredited labs ensuring compliance with VietGAP standards.",
    color: "#F57C00",
    bg: "#FFF3E0",
  },
  {
    icon: Shield,
    title: "Government Verified",
    desc: "Backed by the Ministry of Agriculture with official digital signatures and audit trails.",
    color: "#7B1FA2",
    bg: "#F3E5F5",
  },
];

const stats = [
  { label: "Products Registered", value: "48,291", suffix: "+" },
  { label: "Farms Connected", value: "12,847", suffix: "+" },
  { label: "Partner Companies", value: "3,204", suffix: "+" },
  { label: "Verified Batches", value: "284,910", suffix: "+" },
];

const partners = [
  "VinMart+", "Co.opmart", "Aeon", "Big C", "Lotte Mart", "Bach Hoa Xanh", "WinCommerce",
];

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) navigate(`/trace/${query.trim()}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#2E7D32" }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900" style={{ fontSize: 17 }}>AgriTrace Vietnam</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-green-700 transition-colors">Features</a>
            <a href="#stats" className="hover:text-green-700 transition-colors">Statistics</a>
            <a href="#partners" className="hover:text-green-700 transition-colors">Partners</a>
            <a href="#contact" className="hover:text-green-700 transition-colors">Contact</a>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white">
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#2E7D32" }}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(27,94,32,0.85) 0%, rgba(46,125,50,0.75) 50%, rgba(0,0,0,0.5) 100%)" }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", backdropFilter: "blur(8px)" }}>
            <Shield className="w-4 h-4" />
            <span>Official Government Agricultural Traceability System</span>
          </div>

          <h1 className="text-white mb-4" style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Vietnam Agricultural
            <br />
            <span style={{ color: "#A5D6A7" }}>Supply Chain Traceability</span>
          </h1>
          <p className="text-green-100 mb-10 max-w-xl mx-auto" style={{ fontSize: 18, lineHeight: 1.6 }}>
            Verify agricultural products from Farm to Table. Powered by blockchain, trusted by the government.
          </p>

          {/* Search box */}
          <div className="max-w-lg mx-auto">
            <div className="flex gap-2 p-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter QR Code or Batch ID (e.g. BTH-2024-001)"
                  className="w-full pl-9 pr-3 py-3 text-sm outline-none rounded-xl bg-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center gap-2"
                style={{ background: "#2E7D32", whiteSpace: "nowrap" }}
              >
                <Search className="w-4 h-4" /> Search
              </button>
              <button
                className="px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2"
                style={{ border: "1px solid #e0e0e0", color: "#444", whiteSpace: "nowrap" }}
              >
                <QrCode className="w-4 h-4" /> Scan QR
              </button>
            </div>
            <p className="text-green-200 text-xs mt-3">
              Try: BTH-2024-001 · BTH-2024-002 · BTH-2024-004
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
              Platform Features
            </span>
            <h2 className="mt-3 text-gray-900" style={{ fontSize: 32, fontWeight: 700 }}>
              End-to-End Transparency
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              From seed to shelf, every step of your agricultural product journey is recorded, verified, and accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white group hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                  <Icon style={{ color, width: 22, height: 22 }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: 15 }}>{title}</h3>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: 13 }}>{desc}</p>
                <div className="flex items-center gap-1 mt-4 font-medium" style={{ color, fontSize: 13 }}>
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white" style={{ fontSize: 30, fontWeight: 700 }}>
              Trusted Nationwide
            </h2>
            <p className="text-green-200 mt-2">Numbers that reflect our impact on Vietnam's agricultural sector</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, suffix }) => (
              <div key={label} className="text-center">
                <div className="text-white" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1 }}>
                  {value}<span style={{ color: "#A5D6A7" }}>{suffix}</span>
                </div>
                <div className="text-green-200 mt-2" style={{ fontSize: 14 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
              How It Works
            </span>
            <h2 className="mt-3 text-gray-900" style={{ fontSize: 32, fontWeight: 700 }}>Farm to Table in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Register & Create Batch", desc: "Farmers register on the platform and create a digital batch record with product details, GPS location, and harvest information.", emoji: "🌾" },
              { step: "02", title: "Track Supply Chain", desc: "Each stakeholder (processor, distributor, retailer) logs their events digitally, creating an immutable blockchain trail.", emoji: "🔗" },
              { step: "03", title: "Consumer Verification", desc: "Consumers scan the QR code on any product to instantly view its complete verified history from farm to shelf.", emoji: "📱" },
            ].map(({ step, title, desc, emoji }) => (
              <div key={step} className="relative">
                <div className="bg-white p-8 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="text-5xl mb-4">{emoji}</div>
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#2E7D32" }}>STEP {step}</div>
                  <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: 17 }}>{title}</h3>
                  <p className="text-gray-500 leading-relaxed" style={{ fontSize: 14 }}>{desc}</p>
                </div>
                {step !== "03" && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full items-center justify-center" style={{ background: "#2E7D32" }}>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-8">Trusted by Leading Retailers & Distributors</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {partners.map((p) => (
              <div
                key={p}
                className="px-6 py-3 rounded-xl bg-white font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)", fontSize: 14 }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6" style={{ background: "#1B5E20" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white" style={{ fontSize: 16 }}>AgriTrace Vietnam</span>
              </div>
              <p className="text-green-200 text-sm leading-relaxed max-w-xs">
                Official agricultural traceability platform by the Ministry of Agriculture and Rural Development of Vietnam.
              </p>
            </div>
            <div>
              <div className="font-semibold text-white mb-3 text-sm">Quick Links</div>
              {["Privacy Policy", "Terms of Service", "API Documentation", "Help Center"].map((l) => (
                <div key={l} className="text-green-300 text-sm py-1 hover:text-white cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
            <div>
              <div className="font-semibold text-white mb-3 text-sm">Contact</div>
              {[
                { icon: Phone, text: "+84 24 3722 1234" },
                { icon: Mail, text: "agritrace@mard.gov.vn" },
                { icon: Globe, text: "www.traceviet.gov.vn" },
                { icon: MapPin, text: "2 Ngọc Hà, Ba Đình, Hà Nội" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-green-300 text-sm py-1">
                  <Icon className="w-3.5 h-3.5" /> {text}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-green-300 text-sm">© 2024 Ministry of Agriculture and Rural Development of Vietnam. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
