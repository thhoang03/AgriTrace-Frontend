import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Eye, EyeOff, Shield, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "./auth.store";
import { toast } from "sonner";

const BG_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1200&q=80";



export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const needChange = await login(form.email, form.password);
      toast.success(lang === "vi" ? "Đăng nhập thành công!" : "Login successful!");
      navigate(needChange ? "/app/change-password" : "/app/dashboard");
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Left Decorative Column */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(27,94,32,0.92) 0%, rgba(46,125,50,0.85) 100%)" }} />

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">AgriTrace Vietnam</div>
              <div className="text-green-200 text-xs">Cổng Nông Nghiệp Số Quốc Gia</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-start justify-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/15 backdrop-blur">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white mb-4 text-4xl font-extrabold leading-tight">
              {lang === "vi" ? "Đăng Nhập Nền Tảng" : "Secure Access to"}
              <br />
              <span className="text-green-300">
                {lang === "vi" ? "Dữ Liệu Nông Nghiệp Số" : "Agricultural Data"}
              </span>
            </h1>
            <p className="text-green-100 leading-relaxed text-sm">
              {lang === "vi"
                ? "Hệ thống quản lý truy xuất nguồn gốc nông sản từ Trang trại đến Bàn ăn, bảo chứng bởi Bộ Nông nghiệp & PTNT."
                : "The national platform for agricultural supply chain traceability, powered by blockchain technology and verified by the government."}
            </p>
          </div>

          <div className="text-green-300 text-xs font-semibold">
            © 2026 Ministry of Agriculture and Rural Development · Vietnam
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex flex-col w-full max-w-md mx-auto lg:mx-0 lg:w-[480px] p-8 justify-center min-h-screen">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-green-800 text-xs font-semibold mb-6 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "vi" ? "Về trang chủ" : "Back to home"}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 text-2xl font-extrabold">
              {lang === "vi" ? "Đăng Nhập Hàng" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              {lang === "vi" ? "Nhập thông tin tài khoản AgriTrace của bạn" : "Sign in to access your AgriTrace dashboard"}
            </p>
          </div>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none bg-white cursor-pointer"
          >
            <option value="en">🇬🇧 EN</option>
            <option value="vi">🇻🇳 VI</option>
          </select>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. farmer@agritrace.vn"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 bg-gray-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">{lang === "vi" ? "Mật khẩu" : "Password"}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 bg-gray-50/50"
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

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-xl text-center border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{lang === "vi" ? "Đang xác thực..." : "Authenticating..."}</span>
              </>
            ) : (
              <span>{lang === "vi" ? "Đăng Nhập Hàng" : "Sign In"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50/60 text-center space-y-2">
          <p className="text-xs text-gray-600">Don't have an account or want to register a new Organization?</p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full py-2.5 rounded-lg border border-green-700 text-green-800 font-semibold text-xs bg-white hover:bg-green-700 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            🌱 Register Account / New Organization
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Ministry of Agriculture and Rural Development · Vietnam
        </p>
      </div>
    </div>
  );
}
