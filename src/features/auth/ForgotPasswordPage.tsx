import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Leaf } from "lucide-react";
import { authApi } from "./auth.api";

const BG_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1200&q=80";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "An error occurred. Please try again."
      );
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
            <h1 className="text-white mb-4 text-4xl font-extrabold leading-tight">
              Reset Your<br />
              <span className="text-green-300">Password</span>
            </h1>
            <p className="text-green-100 leading-relaxed text-sm">
              Enter your registered email and we'll send you a link to reset your password securely.
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
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-500 hover:text-green-800 text-xs font-semibold mb-6 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="mb-6">
          <h2 className="text-gray-900 text-2xl font-extrabold">Forgot Password</h2>
          <p className="text-gray-500 text-xs mt-1">
            We'll send a reset link to your email address
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="font-bold text-green-800">Check Your Email</h3>
            <p className="text-sm text-gray-600">
              We've sent a reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <p className="text-xs text-gray-400 italic">Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@agritrace.vn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Ministry of Agriculture and Rural Development · Vietnam
        </p>
      </div>
    </div>
  );
}
