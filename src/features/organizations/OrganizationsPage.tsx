import { useState, useEffect } from "react";
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, X, Building2, Filter, Eye, CheckCircle, AlertCircle, Users, Package } from "lucide-react";
import { organizationsApi } from "./organizations.api";
import type { Organization } from "./organizations.types";

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  FARM:        { bg: "#E8F5E9", color: "#1B5E20" },
  PROCESSOR:   { bg: "#E3F2FD", color: "#1565C0" },
  DISTRIBUTOR: { bg: "#F3E5F5", color: "#6A1B9A" },
  RETAILER:    { bg: "#E0F2F1", color: "#004D40" },
  INSPECTOR:   { bg: "#FFF9C4", color: "#F57F17" },
};

const ORG_TYPES = ["FARM", "PROCESSOR", "DISTRIBUTOR", "RETAILER", "INSPECTOR"];
const EMPTY_FORM = { name: "", type: "FARM", address: "" };

interface Alert { type: "success" | "error"; message: string; }

export function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [detail, setDetail] = useState<Organization | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (type: Alert["type"], message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await organizationsApi.getAll();
      setOrgs(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = orgs.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.address.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || o.type === typeFilter;
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (org: Organization) => {
    setEditing(org);
    setForm({ name: org.name, type: org.type, address: org.address });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) { setError("Vui lòng điền đầy đủ thông tin"); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await organizationsApi.update(editing.organizationId, form);
        setOrgs((prev) => prev.map((o) => o.organizationId === editing.organizationId ? { ...o, ...form } : o));
        showAlert("success", `Đã cập nhật "${form.name}" thành công`);
      } else {
        const res = await organizationsApi.create(form);
        setOrgs((prev) => [...prev, { organizationId: res.data.organizationId, status: "ACTIVE", ...form }]);
        showAlert("success", `Đã thêm "${form.name}" thành công`);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    const newStatus = org.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await organizationsApi.updateStatus(org.organizationId, { status: newStatus });
      setOrgs((prev) => prev.map((o) => o.organizationId === org.organizationId ? { ...o, status: newStatus } : o));
      if (detail?.organizationId === org.organizationId) setDetail({ ...detail, status: newStatus });
      showAlert(
        newStatus === "ACTIVE" ? "success" : "error",
        `"${org.name}" đã được ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"}`
      );
    } catch (e: any) {
      showAlert("error", e.message || "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="pb-8">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${alert.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {alert.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #66BB6A 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 h-full flex items-center px-8 justify-between">
          <div>
            <h1 className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>Organization Management</h1>
            <p className="text-green-100 text-sm mt-1">Manage organizations in the supply chain</p>
          </div>
          <div className="flex items-center gap-6">
            {["ACTIVE", "INACTIVE"].map((s) => (
              <div key={s} className="text-center">
                <div className="font-bold text-white" style={{ fontSize: 20 }}>{orgs.filter((o) => o.status === s).length}</div>
                <div className="text-green-200 text-xs">{s}</div>
              </div>
            ))}
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: 20 }}>{orgs.length}</div>
              <div className="text-green-200 text-xs">TOTAL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" style={{ background: "#F8FAF8" }} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                {["All", ...ORG_TYPES].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                {["All", "ACTIVE", "INACTIVE"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={openAdd} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "#2E7D32" }}>
              <Plus className="w-4 h-4" /> Add Organization
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="px-6 py-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">Showing <span className="font-medium text-gray-800">{filtered.length}</span> organizations</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF8" }}>
                    {["Organization", "Type", "Address", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((org) => {
                    const typeCfg = TYPE_COLORS[org.type] || { bg: "#F5F5F5", color: "#666" };
                    const isActive = org.status === "ACTIVE";
                    return (
                      <tr key={org.organizationId} className="hover:bg-green-50/20 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: typeCfg.bg }}>
                              <Building2 className="w-4 h-4" style={{ color: typeCfg.color }} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                              <div className="text-xs text-gray-400">ID: {org.organizationId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: typeCfg.bg, color: typeCfg.color }}>{org.type}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">{org.address}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4CAF50" : "#9E9E9E" }} />
                            <span className="text-sm" style={{ color: isActive ? "#2E7D32" : "#757575" }}>{org.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetail(org)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="View Detail">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(org)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleToggleStatus(org)} className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-500"}`} title={isActive ? "Deactivate" : "Activate"}>
                              {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Building2 className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No organizations found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">{editing ? "Edit Organization" : "Add Organization"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Organization Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Tên tổ chức" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-400">
                  {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" style={{ background: "#F8FAF8" }} placeholder="Địa chỉ" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: "#2E7D32" }}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Organization"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{detail.name}</h3>
                    <p className="text-green-200 text-xs">ID: {detail.organizationId}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: "Type", value: detail.type },
                { label: "Address", value: detail.address },
                { label: "Status", value: detail.status },
              ].map(({ label, value }) => {
                const isStatus = label === "Status";
                const isActive = value === "ACTIVE";
                const typeCfg = TYPE_COLORS[value] || null;
                return (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    {isStatus ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4CAF50" : "#9E9E9E" }} />
                        <span className="text-sm font-medium" style={{ color: isActive ? "#2E7D32" : "#757575" }}>{value}</span>
                      </div>
                    ) : typeCfg ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: typeCfg.bg, color: typeCfg.color }}>{value}</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{value}</span>
                    )}
                  </div>
                );
              })}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#F8FAF8" }}>
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Members</div>
                    <div className="text-sm font-semibold text-gray-800">—</div>
                  </div>
                </div>
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#F8FAF8" }}>
                  <Package className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Products</div>
                    <div className="text-sm font-semibold text-gray-800">—</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setDetail(null); openEdit(detail); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(detail)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${detail.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-white hover:opacity-90"}`}
                  style={detail.status !== "ACTIVE" ? { background: "#2E7D32" } : {}}
                >
                  {detail.status === "ACTIVE" ? <><ToggleRight className="w-3.5 h-3.5" /> Deactivate</> : <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
