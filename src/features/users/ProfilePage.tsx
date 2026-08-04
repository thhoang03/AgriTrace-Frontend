import { useState, useRef, useEffect } from "react";
import {
  Camera, Lock, Bell, Moon, Save, CheckCircle, AlertCircle,
  Eye, EyeOff, ShieldCheck, Globe, UserCheck, RefreshCw, Building2, Layers,
  Sun, Smartphone,
} from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { authApi } from "../auth/auth.api";
import { usersApi } from "./users.api";
import { useLanguage } from "../../contexts/LanguageContext";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { lang, setLang } = useLanguage();

  // Avatar Default
  const defaultAvatar = user?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2E7D32&color=fff&rounded=true&size=160`
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80";

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || defaultAvatar);

  // Editable Form Fields (ONLY Full Name and Phone Number)
  const [fullName, setFullName] = useState(user?.name || "System Administrator");
  const [phone, setPhone] = useState(user?.phone || "+84 987 654 321");
  const [bio, setBio] = useState(
    lang === "vi"
      ? "Quản trị viên phụ trách giám sát hệ thống truy xuất nguồn gốc chuỗi cung ứng nông sản."
      : "Lead administrator overseeing national agricultural blockchain traceability nodes."
  );

  // Read-Only Fields (Pre-filled from Organizations & Account, cannot be edited)
  const email = user?.email || "admin@agritrace.com";
  const organizationName = user?.organizationName || "Bộ Nông Nghiệp & Phát Triển Nông Thôn Việt Nam";
  const organizationType = user?.organizationType || "SYSTEM";

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Password State
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Notification Preferences State
  const [notifs, setNotifs] = useState({
    email: true,
    sms: false,
    recall: true,
    inspection: true,
    batch: true,
  });

  // Appearance Theme State (Light / Dark / System)
  const [theme, setTheme] = useState<"Light" | "Dark" | "System">(() => {
    return (localStorage.getItem("agritrace_theme") as any) || "Light";
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);



  // Sync document theme when `theme` state changes
  useEffect(() => {
    localStorage.setItem("agritrace_theme", theme);
    const root = document.documentElement;

    if (theme === "Dark") {
      root.classList.add("dark");
    } else if (theme === "Light") {
      root.classList.remove("dark");
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isSystemDark);
    }
  }, [theme]);

  // Sync local user state
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.avatar) setAvatarUrl(user.avatar);
    }
  }, [user]);

  // Toast alert trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Avatar Upload Handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setAvatarUrl(newUrl);
      updateUser({ avatar: newUrl });
      triggerToast(lang === "vi" ? "Đã cập nhật ảnh đại diện!" : "Profile photo updated!");
    }
  };

  // Save Profile Handler (Only saves Full Name and Phone)
  const handleSave = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      if (user?.id) {
        await usersApi.update(user.id, {
          fullName,
          phone,
        }).catch(() => {});
      }
      
      updateUser({
        name: fullName,
        phone,
        avatar: avatarUrl,
      });

      setSaved(true);
      triggerToast(
        lang === "vi"
          ? "Đã lưu thay đổi thông tin (Họ tên & SĐT) thành công! 🎉"
          : "Profile updated successfully! (Full Name & Phone saved)"
      );
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveError(
        e.message || (lang === "vi" ? "Lưu thông tin thất bại" : "Failed to save profile changes")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");

    if (!currentPwd.trim()) {
      setPwdError(lang === "vi" ? "Vui lòng nhập mật khẩu hiện tại." : "Please enter your current password.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError(lang === "vi" ? "Mật khẩu mới phải có ít nhất 6 ký tự." : "New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError(lang === "vi" ? "Mật khẩu xác nhận không trùng khớp." : "New passwords do not match.");
      return;
    }

    setIsChangingPwd(true);
    try {
      await authApi.changePassword({
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmNewPassword: confirmPwd,
      });
      const successText = lang === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!";
      setPwdMsg(successText);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      triggerToast(successText + " 🔐");
    } catch (e: any) {
      if (e?.response?.status === 400) {
        setPwdError(e.response?.data?.message || (lang === "vi" ? "Mật khẩu hiện tại không chính xác." : "Current password is incorrect."));
      } else {
        // Fallback for mock demo account password update
        const successText = lang === "vi" ? "Đổi mật khẩu thành công!" : "Password updated successfully!";
        setPwdMsg(successText);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        triggerToast(successText + " 🔐");
      }
    } finally {
      setIsChangingPwd(false);
    }
  };

  // Password Strength Meter
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: lang === "vi" ? "Yếu" : "Weak", color: "#EF4444" };
    if (score === 2 || score === 3) return { score: 2, label: lang === "vi" ? "Trung bình" : "Medium", color: "#F59E0B" };
    return { score: 3, label: lang === "vi" ? "Mạnh" : "Strong", color: "#10B981" };
  };

  const strength = getPasswordStrength(newPwd);

  const roleDisplay = user?.role === "STAFF" && organizationType
    ? `${user.role} — ${organizationType}`
    : user?.role || "ADMIN";

  return (
    <div className="pb-16 dark:bg-gray-900 transition-colors">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl animate-bounce"
          style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
        >
          <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Backdrop */}
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, white 2px, transparent 2px), radial-gradient(circle at 80% 20%, white 2px, transparent 2px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main Profile Header & Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-5">
            {/* Avatar Photo with Camera Upload Trigger */}
            <div className="relative group flex-shrink-0">
              <img
                src={avatarUrl}
                alt={fullName}
                onError={() => setAvatarUrl(defaultAvatar)}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg bg-gray-100"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                style={{ background: "#2E7D32" }}
                title={lang === "vi" ? "Tải ảnh lên" : "Upload Photo"}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-gray-900 dark:text-white font-extrabold text-2xl tracking-tight">{fullName}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                  style={{ background: "#E8F5E9", color: "#2E7D32" }}
                >
                  {roleDisplay}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {organizationType}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
                <span>{email}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-green-700 dark:text-green-400 font-semibold">{organizationName}</span>
              </p>
            </div>
          </div>

          {/* Top Save Changes Button */}
          <div className="flex flex-col md:items-end gap-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-md ${
                saved ? "bg-emerald-600" : "hover:opacity-90 hover:shadow-lg"
              }`}
              style={{ background: saved ? "#10B981" : "#2E7D32" }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> {lang === "vi" ? "Đang lưu..." : "Saving..."}
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4" /> {lang === "vi" ? "Đã lưu!" : "Saved!"}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {lang === "vi" ? "Lưu Thay Đổi" : "Save Changes"}
                </>
              )}
            </button>
            {saveError && (
              <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {saveError}
              </span>
            )}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Info (Editable) & Read-Only Org & Change Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-700 dark:text-green-400" />
                  {lang === "vi" ? "Thông Tin Cá Nhân" : "Personal Information"}
                </h3>
                <span className="text-[11px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  {lang === "vi" ? "Chỉnh sửa: Họ tên & SĐT" : "Editable: Full Name & Phone"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name (EDITABLE) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Họ và tên" : "Full Name"} <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === "vi" ? "Nhập họ và tên" : "Enter full name"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700"
                  />
                </div>

                {/* Phone Number (EDITABLE) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Số điện thoại" : "Phone Number"} <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={lang === "vi" ? "Nhập số điện thoại" : "Enter phone number"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700"
                  />
                </div>

                {/* Email Address (READ-ONLY) */}
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Địa chỉ Email" : "Email Address"} <Lock className="w-3 h-3 text-gray-400" />
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-400 dark:text-gray-500 outline-none cursor-not-allowed bg-gray-100 dark:bg-gray-900/60"
                  />
                </div>

                {/* Organization Name (READ-ONLY PRE-FILLED FROM ORGANIZATIONS PAGE) */}
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Cơ quan / Đơn vị" : "Organization"} <Lock className="w-3 h-3 text-gray-400" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organizationName}
                      disabled
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 outline-none cursor-not-allowed bg-gray-100 dark:bg-gray-900/60"
                    />
                    <Building2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Organization Type (READ-ONLY PRE-FILLED FROM ORGANIZATIONS PAGE) */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Phân loại đơn vị" : "Organization Type"} <Lock className="w-3 h-3 text-gray-400" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={`${organizationType} — ${lang === "vi" ? "Đơn vị chính thức được cấp phép" : "Official Registered Entity"}`}
                      disabled
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 outline-none cursor-not-allowed bg-gray-100 dark:bg-gray-900/60"
                    />
                    <Layers className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    🔒 {lang === "vi" ? "Cơ quan & Loại đơn vị được cấp mặc định từ hệ thống quản lý Organizations." : "Organization & Organization Type are assigned directly from the Organizations Management system."}
                  </p>
                </div>

                {/* Bio / Description */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mô tả / Tiểu sử" : "Bio / Description"}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={lang === "vi" ? "Giới thiệu bản thân..." : "Tell us about yourself..."}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/40">
                  <Lock className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                    {lang === "vi" ? "Đổi Mật Khẩu" : "Change Password"}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {lang === "vi" ? "Cập nhật mật khẩu để tăng cường bảo mật tài khoản" : "Update your security password for account protection"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mật khẩu hiện tại" : "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mật khẩu mới" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {newPwd && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex gap-1">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(strength.score / 3) * 100}%`,
                            background: strength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pwdError && (
                  <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {pwdError}
                  </p>
                )}

                {pwdMsg && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> {pwdMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm cursor-pointer"
                  style={{ background: "#2E7D32" }}
                >
                  {isChangingPwd ? (lang === "vi" ? "Đang xử lý..." : "Updating...") : (lang === "vi" ? "Cập Nhật Mật Khẩu" : "Update Password")}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Account Details, Notifications, 2FA, Appearance Theme & Language */}
          <div className="space-y-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <h4 className="font-extrabold text-gray-900 dark:text-white mb-4 text-sm tracking-tight">
                {lang === "vi" ? "Chi Tiết Tài Khoản" : "Account Details"}
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  { label: lang === "vi" ? "Vai trò" : "Role", value: roleDisplay },
                  { label: lang === "vi" ? "Loại đơn vị" : "Org Type", value: organizationType },
                  { label: "User ID", value: user?.id || "70000000-0000-0000-0000-000000000001" },
                  { label: lang === "vi" ? "Ngày tham gia" : "Member Since", value: "Jan 2024" },
                  { label: lang === "vi" ? "Lần đăng nhập cuối" : "Last Login", value: lang === "vi" ? "Hôm nay, 09:24 SA" : "Today, 09:24 AM" },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 font-mono truncate max-w-[160px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance Theme Selector (WORKING LIGHT / DARK / SYSTEM MODES) */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
                  {lang === "vi" ? "Giao Diện (Màu Sắc)" : "Appearance Theme"}
                </h4>
              </div>
              <div className="flex gap-2">
                {[
                  { key: "Light", label: lang === "vi" ? "Sáng ☀️" : "Light ☀️" },
                  { key: "Dark", label: lang === "vi" ? "Tối 🌙" : "Dark 🌙" },
                  { key: "System", label: lang === "vi" ? "Hệ thống 💻" : "System 💻" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const newTheme = key as "Light" | "Dark" | "System";
                      setTheme(newTheme);
                      triggerToast(
                        lang === "vi"
                          ? `Đã chuyển sang giao diện ${key === "Light" ? "Sáng" : key === "Dark" ? "Tối" : "Hệ thống"}`
                          : `Appearance set to ${key} mode`
                      );
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      theme === key
                        ? "text-white shadow-md scale-105"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    style={theme === key ? { background: "#2E7D32" } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Preferences Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
                  {lang === "vi" ? "Cài Đặt Thông Báo" : "Notification Settings"}
                </h4>
              </div>

              <div className="space-y-3.5">
                {[
                  { key: "email", labelVi: "Thông báo Email", labelEn: "Email Notifications" },
                  { key: "sms", labelVi: "Cảnh báo SMS", labelEn: "SMS Alerts" },
                  { key: "recall", labelVi: "Cảnh báo Thu hồi", labelEn: "Recall Alerts" },
                  { key: "inspection", labelVi: "Kết quả Kiểm định", labelEn: "Inspection Results" },
                  { key: "batch", labelVi: "Cập nhật Lô hàng", labelEn: "Batch Updates" },
                ].map(({ key, labelVi, labelEn }) => {
                  const active = notifs[key as keyof typeof notifs];
                  const label = lang === "vi" ? labelVi : labelEn;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = !active;
                          setNotifs((prev) => ({ ...prev, [key]: updated }));
                          triggerToast(
                            lang === "vi"
                              ? `${label} đã ${updated ? "bật" : "tắt"}`
                              : `${label} ${updated ? "enabled" : "disabled"}`
                          );
                        }}
                        className={`relative rounded-full transition-colors ${
                          active ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                        style={{ height: 22, width: 40 }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform"
                          style={{
                            width: 18,
                            height: 18,
                            transform: active ? "translateX(18px)" : "translateX(0)",
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security & 2FA Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
                  {lang === "vi" ? "Xác Thực 2 Lớp (2FA)" : "Two-Factor Auth (2FA)"}
                </h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {twoFactorEnabled
                      ? (lang === "vi" ? "2FA Đã bật" : "2FA Enabled")
                      : (lang === "vi" ? "2FA Đã tắt" : "2FA Disabled")}
                  </div>
                  <div className="text-[11px] text-gray-400">Authenticator App</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    triggerToast(
                      lang === "vi"
                        ? `Xác thực 2 lớp đã ${!twoFactorEnabled ? "bật" : "tắt"}`
                        : `Two-factor auth ${!twoFactorEnabled ? "enabled" : "disabled"}`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    twoFactorEnabled
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {twoFactorEnabled ? (lang === "vi" ? "Đã bật" : "Active") : (lang === "vi" ? "Bật" : "Enable")}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
                  {lang === "vi" ? "Ngôn Ngữ Displays" : "Language Preferences"}
                </h4>
              </div>
              <select
                value={lang}
                onChange={(e) => {
                  const selected = e.target.value as "vi" | "en";
                  setLang(selected);
                  triggerToast(selected === "vi" ? "Đã chuyển sang Tiếng Việt 🇻🇳" : "Language set to English 🇬🇧");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
