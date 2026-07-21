import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Eye, EyeOff, Shield, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "./auth.hooks";

const BG_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1200&q=80";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/app/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F7FA" }}>
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(27,94,32,0.9) 0%, rgba(46,125,50,0.8) 100%)" }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold" style={{ fontSize: 18 }}>AgriTrace Vietnam</div>
              <div className="text-green-200 text-xs">Government Platform</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-start justify-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white mb-4" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2 }}>
              Secure Access to
              <br />
              <span style={{ color: "#A5D6A7" }}>Agricultural Data</span>
            </h1>
            <p className="text-green-200 leading-relaxed" style={{ fontSize: 16 }}>
              The national platform for agricultural supply chain traceability, powered by blockchain technology and verified by the Vietnamese government.
            </p>

            <div className="mt-10 space-y-4">
              {["Real-time supply chain visibility", "Blockchain-secured records", "Government-verified certificates", "QR code product authentication"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#66BB6A" }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-100 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-green-300 text-xs">
            Ministry of Agriculture and Rural Development of Vietnam
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-md mx-auto lg:mx-0 lg:w-[440px] p-8 justify-center">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-8 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-gray-900" style={{ fontSize: 26, fontWeight: 700 }}>Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your AgriTrace account</p>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white"
          >
            <option value="vi">🇻🇳 VI</option>
            <option value="en">🇬🇧 EN</option>
          </select>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500"
                style={{ background: "#F8FAF8" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500"
                style={{ background: "#F8FAF8" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#2E7D32" }}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button type="button" className="text-sm font-medium" style={{ color: "#2E7D32" }}>
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)", boxShadow: "0 4px 16px rgba(46,125,50,0.35)" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Ministry of Agriculture and Rural Development · Vietnam
        </p>
      </div>
    </div>
  );
}
