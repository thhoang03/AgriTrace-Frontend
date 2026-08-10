import { useState, useRef, useEffect } from "react";
import {
  Camera, Lock, Moon, Save, CheckCircle, AlertCircle,
  Eye, EyeOff, Globe, UserCheck, RefreshCw, Building2, Layers,
} from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { authApi } from "../auth/auth.api";
import { useProfile, useUpdateProfile } from "./users.queries";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { data: dbProfile, isLoading: isProfileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Avatar Default
  const defaultAvatar = (user?.name || dbProfile?.fullName)
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(dbProfile?.fullName || user?.name || "User")}&background=2E7D32&color=fff&rounded=true&size=160`
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80";

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || defaultAvatar);

  // Editable Form Fields
  const [fullName, setFullName] = useState(dbProfile?.fullName || user?.name || "");
  const [phone, setPhone] = useState(dbProfile?.phone || user?.phone || "");
  const [bio, setBio] = useState(() => localStorage.getItem("agritrace_user_bio") || "");

  // Read-Only Fields from DB or Auth Context
  const email = dbProfile?.email || user?.email || "";
  const organizationName = dbProfile?.organization || user?.organizationName || "";
  const organizationType = dbProfile?.organizationType || user?.organizationType || "";
  const userId = dbProfile?.id || user?.id || "";

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when dbProfile or user updates
  useEffect(() => {
    if (dbProfile) {
      if (dbProfile.fullName) setFullName(dbProfile.fullName);
      if (dbProfile.phone) setPhone(dbProfile.phone);
      if (dbProfile.avatar) setAvatarUrl(dbProfile.avatar);
    } else if (user) {
      if (user.name) setFullName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.avatar) setAvatarUrl(user.avatar);
    }
  }, [dbProfile, user]);

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

  // Save Profile Handler
  const handleSave = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      if (bio !== undefined) {
        localStorage.setItem("agritrace_user_bio", bio);
      }

      await updateProfileMutation.mutateAsync({
        fullName,
        phone,
      });

      updateUser({
        name: fullName,
        phone,
        avatar: avatarUrl,
      });

      setSaved(true);
      triggerToast(
        lang === "vi"
          ? "Đã lưu thay đổi thông tin cá nhân thành công! 🎉"
          : "Profile updated successfully!"
      );
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || (lang === "vi" ? "Lưu thông tin thất bại" : "Failed to save profile changes");
      setSaveError(msg);
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
      const errDetail = e?.response?.data?.message || e?.message || (lang === "vi" ? "Mật khẩu hiện tại không chính xác." : "Current password is incorrect.");
      setPwdError(errDetail);
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

  const userRole = dbProfile?.role || user?.role || "STAFF";
  const roleDisplay = userRole === "STAFF" && organizationType
    ? `${userRole} — ${organizationType}`
    : userRole;

  if (isProfileLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        {lang === "vi" ? "Đang tải hồ sơ cá nhân..." : "Loading profile data..."}
      </div>
    );
  }

  return (
    <div className="pb-16">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 bg-card p-6 rounded-3xl shadow-sm border border-border transition-colors">
          <div className="flex items-center gap-5">
            {/* Avatar Photo with Camera Upload Trigger */}
            <div className="relative group flex-shrink-0">
              <img
                src={avatarUrl}
                alt={fullName}
                onError={() => setAvatarUrl(defaultAvatar)}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-card shadow-lg bg-muted"
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
                <h1 className="text-foreground font-extrabold text-2xl tracking-tight">{fullName || (lang === "vi" ? "Người dùng" : "User Profile")}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10"
                  style={{ color: "#2E7D32" }}
                >
                  {roleDisplay}
                </span>
                {organizationType && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {organizationType}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2 flex-wrap">
                <span>{email}</span>
                {organizationName && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-green-700 dark:text-green-400 font-semibold">{organizationName}</span>
                  </>
                )}
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
              <span className="text-xs text-destructive flex items-center gap-1 font-medium">
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
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-foreground text-base tracking-tight flex items-center gap-2">
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
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Họ và tên" : "Full Name"} <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === "vi" ? "Nhập họ và tên" : "Enter full name"}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background"
                  />
                </div>

                {/* Phone Number (EDITABLE) */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Số điện thoại" : "Phone Number"} <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={lang === "vi" ? "Nhập số điện thoại" : "Enter phone number"}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background"
                  />
                </div>

                {/* Email Address (READ-ONLY) */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Địa chỉ Email" : "Email Address"} <Lock className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground outline-none cursor-not-allowed bg-muted"
                  />
                </div>

                {/* Organization Name (READ-ONLY) */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Cơ quan / Đơn vị" : "Organization"} <Lock className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organizationName || (lang === "vi" ? "Chưa thuộc đơn vị nào" : "No Organization")}
                      disabled
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground outline-none cursor-not-allowed bg-muted"
                    />
                    <Building2 className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Organization Type (READ-ONLY) */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider flex items-center gap-1">
                    {lang === "vi" ? "Phân loại đơn vị" : "Organization Type"} <Lock className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organizationType ? `${organizationType}` : (lang === "vi" ? "Hệ thống" : "System")}
                      disabled
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground outline-none cursor-not-allowed bg-muted"
                    />
                    <Layers className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mô tả / Tiểu sử" : "Bio / Description"}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={lang === "vi" ? "Giới thiệu bản thân..." : "Tell us about yourself..."}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <form onSubmit={handleChangePassword} className="bg-card rounded-3xl p-6 border border-border shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/40">
                  <Lock className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    {lang === "vi" ? "Đổi Mật Khẩu" : "Change Password"}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {lang === "vi" ? "Cập nhật mật khẩu để tăng cường bảo mật tài khoản" : "Update your security password for account protection"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mật khẩu hiện tại" : "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Mật khẩu mới" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {newPwd && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
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
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    {lang === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-primary/20 bg-input-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pwdError && (
                  <p className="text-xs text-destructive font-semibold flex items-center gap-1.5">
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
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm transition-colors">
              <h4 className="font-extrabold text-foreground mb-4 text-sm tracking-tight">
                {lang === "vi" ? "Chi Tiết Tài Khoản" : "Account Details"}
              </h4>
              <div className="divide-y divide-border">
                {[
                  { label: lang === "vi" ? "Vai trò" : "Role", value: roleDisplay },
                  { label: lang === "vi" ? "Loại đơn vị" : "Org Type", value: organizationType || "N/A" },
                  { label: "User ID", value: userId || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-bold text-foreground font-mono truncate max-w-[160px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance Theme Selector (WORKING LIGHT / DARK / SYSTEM MODES) */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-foreground text-sm tracking-tight">
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
                      const newTheme = key as typeof theme;
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
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                    style={theme === key ? { background: "#2E7D32" } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-700 dark:text-green-400" />
                <h4 className="font-extrabold text-foreground text-sm tracking-tight">
                  {lang === "vi" ? "Ngôn Ngữ Hiển Thị" : "Language Preferences"}
                </h4>
              </div>
              <select
                value={lang}
                onChange={(e) => {
                  const selected = e.target.value as "vi" | "en";
                  setLang(selected);
                  triggerToast(selected === "vi" ? "Đã chuyển sang Tiếng Việt 🇻🇳" : "Language set to English 🇬🇧");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs font-semibold outline-none bg-input-background text-foreground cursor-pointer"
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
