import { useState, useRef } from "react";
import { Camera, Lock, Bell, Moon, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../auth/auth.store";
import { authApi } from "../auth/auth.api";
import { usersApi } from "./users.api";

export function ProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [notifs, setNotifs] = useState({
    email: true, sms: false, recall: true, inspection: true, batch: true,
  });
  const nameRef = useRef<HTMLInputElement>(null);
  const currentPwdRef = useRef<HTMLInputElement>(null);
  const newPwdRef = useRef<HTMLInputElement>(null);
  const confirmPwdRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaveError("");
    try {
      if (user?.id && nameRef.current?.value) {
        await usersApi.update(user.id, { fullName: nameRef.current.value });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveError(e.message || "Lưu thất bại");
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg("");
    setPwdError("");
    try {
      await authApi.changePassword({
        currentPassword: currentPwdRef.current?.value || "",
        newPassword: newPwdRef.current?.value || "",
        confirmNewPassword: confirmPwdRef.current?.value || "",
      });
      setPwdMsg("Đổi mật khẩu thành công!");
      if (currentPwdRef.current) currentPwdRef.current.value = "";
      if (newPwdRef.current) newPwdRef.current.value = "";
      if (confirmPwdRef.current) confirmPwdRef.current.value = "";
    } catch (e: any) {
      setPwdError(e.message || "Đổi mật khẩu thất bại");
    }
  };

  const roleDisplay = user?.role === "STAFF" && user.organizationType
    ? `${user.role} — ${user.organizationType}`
    : user?.role;

  return (
    <div className="pb-8">
      <div className="relative h-44 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="px-6 -mt-14 relative z-10">
        <div className="flex items-end gap-5 mb-6">
          <div className="relative">
            <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />
            <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: "#2E7D32" }}>
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="pb-2">
            <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>{roleDisplay}</span>
              <span className="text-gray-400 text-sm">{user?.organizationName}</span>
            </div>
          </div>
          <div className="ml-auto pb-2 flex flex-col items-end gap-1">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${saved ? "opacity-80" : "hover:opacity-90"}`}
              style={{ background: saved ? "#66BB6A" : "#2E7D32" }}
            >
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            {saveError && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{saveError}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-gray-900 mb-5" style={{ fontSize: 15 }}>Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: user?.name, type: "text", ref: nameRef },
                  { label: "Email Address", value: user?.email, type: "email", ref: undefined },
                  { label: "Phone Number", value: user?.phone, type: "tel", ref: undefined },
                ].map(({ label, value, type, ref }: any) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">{label}</label>
                    <input
                      ref={ref}
                      type={type}
                      defaultValue={value || ""}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                      style={{ background: "#F8FAF8" }}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 mb-1.5 block">Organization</label>
                  <input defaultValue={user?.organizationName || ""} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400" style={{ background: "#F8FAF8" }} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 mb-1.5 block">Bio</label>
                  <textarea rows={3} placeholder="Tell us about yourself..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400 resize-none" style={{ background: "#F8FAF8" }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                  <Lock style={{ color: "#2E7D32", width: 16, height: 16 }} />
                </div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>Change Password</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Current Password", ref: currentPwdRef },
                  { label: "New Password", ref: newPwdRef },
                  { label: "Confirm New Password", ref: confirmPwdRef },
                ].map(({ label, ref }) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">{label}</label>
                    <input
                      ref={ref}
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-green-400"
                      style={{ background: "#F8FAF8" }}
                    />
                  </div>
                ))}
                <div className="p-3 rounded-xl text-sm" style={{ background: "#E8F5E9" }}>
                  <p className="text-green-700">Password must be at least 8 characters with uppercase, lowercase, and numbers.</p>
                </div>
                {pwdError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{pwdError}</p>}
                {pwdMsg && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />{pwdMsg}</p>}
                <button onClick={handleChangePassword} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Account Details</h4>
              {[
                { label: "Role", value: roleDisplay },
                { label: "User ID", value: user?.id },
                { label: "Member Since", value: "Jan 2024" },
                { label: "Last Login", value: "Today, 09:24 AM" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Bell style={{ color: "#2E7D32", width: 16, height: 16 }} />
                <h4 className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Notifications</h4>
              </div>
              <div className="space-y-3">
                {[
                  { key: "email", label: "Email Notifications" },
                  { key: "sms", label: "SMS Alerts" },
                  { key: "recall", label: "Recall Alerts" },
                  { key: "inspection", label: "Inspection Results" },
                  { key: "batch", label: "Batch Updates" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <button onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} className={`relative rounded-full transition-colors ${notifs[key as keyof typeof notifs] ? "bg-green-500" : "bg-gray-300"}`} style={{ height: 22, width: 40 }}>
                      <span className="absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform" style={{ width: 18, height: 18, transform: notifs[key as keyof typeof notifs] ? "translateX(18px)" : "translateX(0)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Moon style={{ color: "#2E7D32", width: 16, height: 16 }} />
                <h4 className="font-semibold text-gray-900" style={{ fontSize: 14 }}>Appearance</h4>
              </div>
              <div className="flex gap-2">
                {["Light", "Dark", "System"].map((t, i) => (
                  <button key={t} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${i === 0 ? "text-white" : "bg-gray-100 text-gray-600"}`} style={i === 0 ? { background: "#2E7D32" } : {}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: 14 }}>Language</h4>
              <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
