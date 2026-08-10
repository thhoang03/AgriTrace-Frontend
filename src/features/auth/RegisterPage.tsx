import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Leaf,
  Eye,
  EyeOff,
  Shield,
  Lock,
  User,
  Mail,
  Building2,
  MapPin,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "./auth.store";
import { get } from "../../lib/api";
import { authApi } from "./auth.api";
import { useLanguage } from "../../contexts/LanguageContext";
const BG_IMG =
  "https://images.unsplash.com/photo-1777058019293-73d54d4c4cae?w=1200&q=80";

interface OrganizationTypeOption {
  id: string;
  code: string;
  name: string;
}

const DEFAULT_ORG_TYPES: OrganizationTypeOption[] = [
  { id: "FARM", code: "FARM", name: "Farm" },
  { id: "PROCESSOR", code: "PROCESSOR", name: "Processor" },
  { id: "DISTRIBUTOR", code: "DISTRIBUTOR", name: "Distributor" },
  { id: "RETAILER", code: "RETAILER", name: "Retailer" },
  { id: "INSPECTION", code: "INSPECTION", name: "Inspection" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Manager",
    organizationName: "",
    organizationTypeId: DEFAULT_ORG_TYPES[0].id,
    organizationAddress: "",
  });

  const [orgTypes, setOrgTypes] =
    useState<OrganizationTypeOption[]>(DEFAULT_ORG_TYPES);
  const [loadingOrgTypes, setLoadingOrgTypes] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    async function fetchOrgTypes() {
      setLoadingOrgTypes(true);
      try {
        const res = await get<any>("/organization-types");
        let rawList: any[] = [];
        if (Array.isArray(res)) rawList = res;
        else if (Array.isArray(res?.data)) rawList = res.data;
        else if (Array.isArray(res?.items)) rawList = res.items;

        if (rawList.length > 0) {
          const parsed = rawList.map((item: any) => ({
            id: String(item.id || item.value || item.code || ""),
            code: String(item.code || item.value || item.id || ""),
            name: String(item.name || item.label || item.code || ""),
          }));
          setOrgTypes(parsed);
          setForm((prev) => ({ ...prev, organizationTypeId: parsed[0].id }));
        }
      } catch (err) {
        console.error("Using default organization types fallback", err);
      } finally {
        setLoadingOrgTypes(false);
      }
    }
    fetchOrgTypes();
  }, []);

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(lang === "vi" ? "Mật khẩu xác nhận không trùng khớp." : "Confirm password does not match.");
      return;
    }

    if (form.password.length < 6) {
      setError(lang === "vi" ? "Mật khẩu phải có ít nhất 6 ký tự." : "Password must be at least 6 characters long.");
      return;
    }

    if (!form.organizationName.trim()) {
      setError(lang === "vi" ? "Vui lòng nhập tên tổ chức." : "Please enter the organization name.");
      return;
    }
    if (!form.organizationTypeId) {
      setError(lang === "vi" ? "Vui lòng chọn loại hình tổ chức." : "Please select an organization type.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedType = orgTypes.find(
        (t) => t.id === form.organizationTypeId,
      );
      const isGuid =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          form.organizationTypeId,
        );

      await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        organizationName: form.organizationName,
        organizationTypeId: isGuid ? form.organizationTypeId : undefined,
        organizationTypeCode: selectedType?.code || form.organizationTypeId,
        organizationAddress: form.organizationAddress,
      });

      setSuccess(true);
    } catch (err: any) {
      let apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        (lang === "vi" ? "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin." : "Registration failed. Please check your information.");
      try {
        const parsed = JSON.parse(apiMsg);
        if (parsed[lang]) {
          apiMsg = parsed[lang];
        } else if (parsed["en"]) {
          apiMsg = parsed["en"];
        }
      } catch (e) {
        // Not a JSON string
      }
      setError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const FEATURES_EN = [
    "Transparent business & farm identification",
    "Product batch & event log management",
    "Digital quality inspection certificates",
    "Direct consumer connection via QR Code",
  ];
  const FEATURES_VI = [
    "Định danh minh bạch doanh nghiệp & trang trại",
    "Quản lý lô hàng & nhật ký sự kiện sản phẩm",
    "Chứng nhận kiểm định chất lượng điện tử",
    "Kết nối trực tiếp người tiêu dùng qua mã QR",
  ];
  const FEATURES = lang === "vi" ? FEATURES_VI : FEATURES_EN;

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F7FA" }}>
      {/* ===== Banner Left ===== */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMG})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(27,94,32,0.93) 0%, rgba(46,125,50,0.86) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold" style={{ fontSize: 18 }}>
                AgriTrace Vietnam
              </div>
              <div className="text-green-200 text-xs">
                {lang === "vi" ? "Mạng Lưới Truy Xuất Nguồn Gốc Quốc Gia" : "National Traceability Network"}
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-white mb-4"
              style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2 }}
            >
              {lang === "vi" ? "Gia Nhập Hệ Sinh Thái" : "Join the National"}
              <br />
              <span style={{ color: "#A5D6A7" }}>{lang === "vi" ? "Nông Nghiệp Quốc Gia" : "Agricultural Ecosystem"}</span>
            </h1>
            <p className="text-green-200 leading-relaxed text-sm mb-8">
              {lang === "vi"
                ? "Đăng ký tài khoản để kết nối doanh nghiệp, trang trại hoặc cơ sở của bạn với nền tảng truy xuất nguồn gốc chuỗi cung ứng nông sản quốc gia."
                : "Register an account to connect your business, farm, or facility to the national agricultural supply chain traceability platform."}
            </p>

            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#66BB6A" }}
                  />
                  <span className="text-green-100 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-green-300 text-xs">
            Ministry of Agriculture and Rural Development of Vietnam © 2026
          </div>
        </div>
      </div>

      {/* ===== Register Form ===== */}
      <div className="flex flex-col flex-1 lg:max-w-2xl xl:max-w-3xl justify-center overflow-y-auto px-6 py-10 sm:px-12 lg:px-16">
        {success ? (
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto w-full">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {lang === "vi"
                ? "Đăng ký thành công!"
                : "Registration Successful!"}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {lang === "vi"
                ? "Tài khoản và tổ chức của bạn đã được đăng ký thành công. Hệ thống đang chờ quản trị viên phê duyệt trước khi bạn có thể đăng nhập. Vui lòng quay lại sau hoặc liên hệ quản trị viên."
                : "Your account and organization have been successfully registered. The system is waiting for administrator approval before you can log in. Please check back later or contact the administrator."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
              }}
            >
              {lang === "vi" ? "Quay lại trang Đăng nhập" : "Back to Login"}
            </button>
          </div>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" /> {lang === "vi" ? "Về trang Đăng nhập" : "Back to Sign In"}
            </button>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="text-gray-900"
                  style={{ fontSize: 28, fontWeight: 700 }}
                >
                  {lang === "vi"
                    ? "Đăng ký Tổ chức"
                    : "Register Organization Account"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {lang === "vi"
                    ? "Đăng ký tham gia hệ thống truy xuất nguồn gốc AgriTrace"
                    : "Register your organization for access to the AgriTrace supply chain network"}
                </p>
              </div>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "vi" | "en")}
                className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none bg-white cursor-pointer mt-1"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="vi">🇻🇳 VI</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {lang === "vi" ? "Họ và Tên *" : "Full Name *"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {lang === "vi" ? "Email Liên Hệ *" : "Contact Email *"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="example@agritrace.vn"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {lang === "vi" ? "Mật khẩu *" : "Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {lang === "vi" ? "Xác Nhận Mật Khẩu *" : "Confirm Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization section */}
              <div className="p-5 rounded-xl border border-green-100 bg-green-50/40 space-y-4">
                <div className="text-xs font-semibold text-green-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-green-700" /> {lang === "vi" ? "Thông Tin Tổ Chức" : "Organization Information"}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {lang === "vi" ? "Tên Tổ Chức / Doanh Nghiệp *" : "Organization / Business Name *"}
                  </label>
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) =>
                      setForm({ ...form, organizationName: e.target.value })
                    }
                    placeholder="e.g. Moc Chau Green Produce Farm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      {lang === "vi" ? "Loại Hình Tổ Chức *" : "Organization Type *"}
                    </label>
                    <select
                      value={form.organizationTypeId}
                      onChange={(e) =>
                        setForm({ ...form, organizationTypeId: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white cursor-pointer"
                      required
                      disabled={loadingOrgTypes}
                    >
                      {orgTypes.map((ot) => {
                        const cleanName = (ot.name || ot.code || "")
                          .replace(/\s*\([^)]+\)$/, "")
                          .trim();
                        return (
                          <option key={ot.id} value={ot.id}>
                            {cleanName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      {lang === "vi" ? "Địa Chỉ Đăng Ký" : "Registered Address"}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.organizationAddress}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            organizationAddress: e.target.value,
                          })
                        }
                        placeholder="Headquarters / Farm address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-green-700">
                  {lang === "vi" ? (
                    <>Tài khoản của bạn sẽ tự động được cấp vai trò <strong>Manager</strong> cho tổ chức này.</>
                  ) : (
                    <>Your account will automatically be granted the{" "}
                    <strong>Manager</strong> role for this organization.</>
                  )}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
                  boxShadow: "0 4px 18px rgba(46,125,50,0.35)",
                }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {lang === "vi" ? "Đang xử lý đăng ký..." : "Processing Registration..."}
                  </>
                ) : (
                  lang === "vi" ? "Đăng Ký Tổ Chức & Tài Khoản" : "Register Organization & Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-600">
              {lang === "vi" ? "Đã có tài khoản?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-green-700 hover:underline"
              >
                {lang === "vi" ? "Đăng Nhập Ngay" : "Sign In Now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
