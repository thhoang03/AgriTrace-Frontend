import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Leaf } from "lucide-react";
import { authApi } from "./auth.api";

const BG_IMG = "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1200&q=80";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(form.token, form.newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
              Create New<br />
              <span className="text-green-300">Password</span>
            </h1>
            <p className="text-green-100 leading-relaxed text-sm">
              Enter the reset code from your email and set a new secure password for your account.
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
          <h2 className="text-gray-900 text-2xl font-extrabold">Reset Password</h2>
          <p className="text-gray-500 text-xs mt-1">
            Enter the code you received via email and your new password
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="font-bold text-green-800">Password Reset Successful!</h3>
            <p className="text-sm text-gray-600">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <p className="text-xs text-gray-400 italic">Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reset Code */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Reset Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                  placeholder="Enter the code from your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 bg-gray-50/50 tracking-widest"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-600 bg-gray-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              disabled={loading || !form.token || !form.newPassword || !form.confirmPassword}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
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
