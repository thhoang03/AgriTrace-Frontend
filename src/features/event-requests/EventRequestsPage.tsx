import { useState } from "react";
import { toast } from "sonner";
import {
  Clock, Plus, CheckCircle2, XCircle, AlertCircle, Search, Filter, Building2, User, MapPin, FileText, ChevronRight, Check, X, ShieldAlert, LocateFixed, Globe,
} from "lucide-react";
import { useEventRequests, useCreateEventRequest, useApproveEventRequest, useRejectEventRequest } from "./event-requests.queries";
import { useEventTypes, useRecentBatches } from "../supply-chain/supply-chain.queries";
import { useAuth } from "../auth/auth.store";
import type { EventRequestItem } from "./event-requests.api";
import { fetchDeviceLocation } from "../../utils/locationUtils";
import { MapPickerModal } from "../../components/common/MapPickerModal";

export function EventRequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mine" | "pending" | "all">("mine");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<EventRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [locatingDevice, setLocatingDevice] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Filters
  const [searchBatch, setSearchBatch] = useState("");

  // Queries & Mutations
  const { data: eventTypes = [] } = useEventTypes();
  const { data: recentBatches = [] } = useRecentBatches();

  const { data: requestsData, isLoading, refetch } = useEventRequests({
    onlyMine: activeTab === "mine",
    status: activeTab === "pending" ? 0 : undefined,
  });

  const createMutation = useCreateEventRequest();
  const approveMutation = useApproveEventRequest();
  const rejectMutation = useRejectEventRequest();

  // Create Form State
  const [form, setForm] = useState({
    batchId: "",
    eventTypeId: "",
    location: "",
    description: "",
  });

  const requestsList = requestsData?.items ?? [];

  const filteredRequests = requestsList.filter((item) => {
    if (!searchBatch) return true;
    const q = searchBatch.toLowerCase();
    return (
      item.batchCode?.toLowerCase().includes(q) ||
      item.batchId?.toLowerCase().includes(q) ||
      item.eventTypeCode?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  const handleGetDeviceLocation = async () => {
    setLocatingDevice(true);
    try {
      const res = await fetchDeviceLocation();
      setForm((prev) => ({ ...prev, location: res.locationString }));
      toast.success("Device location retrieved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to get device location");
    } finally {
      setLocatingDevice(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventTypeId) {
      toast.error("Please select an Event Type to expand");
      return;
    }
    const targetBatchId = form.batchId || (recentBatches.length > 0 ? recentBatches[0].id : "00000000-0000-0000-0000-000000000000");
    try {
      await createMutation.mutateAsync({
        batchId: targetBatchId,
        eventTypeId: form.eventTypeId,
        location: form.location,
        description: form.description,
      });
      toast.success("Event type expansion request created successfully! Awaiting admin review.");
      setShowCreateModal(false);
      setForm({ batchId: "", eventTypeId: "", location: "", description: "" });
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "An error occurred while creating request");
    }
  };

  const handleApprove = async (item: EventRequestItem) => {
    try {
      await approveMutation.mutateAsync(item.id);
      toast.success("Request approved successfully! Event signed and appended to Hash Chain.");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve request");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectingItem.id, reason: rejectReason });
      toast.success("Event request rejected.");
      setRejectingItem(null);
      setRejectReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject request");
    }
  };

  const getStatusBadge = (status: number | string) => {
    if (status === 0 || status === "Pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Pending
        </span>
      );
    }
    if (status === 1 || status === "Approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)" }}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-200 text-sm font-medium mb-1">
              <Clock className="w-4 h-4" /> AgriTrace Event Requests
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Event Logging Requests</h1>
            <p className="text-green-100 text-sm mt-1 max-w-xl">
              Submit supply chain event logging requests and review approvals before appending to the immutable Hash Chain ledger.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-white text-green-800 hover:bg-green-50 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all text-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {/* Control Bar & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "mine" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "pending" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending Approvals
            {requestsList.filter((r) => r.status === 0 || r.status === "Pending").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Requests
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by batch code, location..."
            value={searchBatch}
            onChange={(e) => setSearchBatch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Requests List Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading event requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 text-base">No Event Requests Found</h3>
          <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto">
            No event requests match your current filter. Click "+ New Request" to submit your first request.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {item.batchCode || item.batchId.slice(0, 8)}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-mono">
                      {item.eventTypeCode || "EVENT"}
                    </span>
                    <span className="truncate">{item.eventTypeName || item.eventTypeCode || "Supply Chain Event"}</span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl line-clamp-2 italic">
                      "{item.description}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.requestedByUserName || "User"}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString("en-US")}</span>
                  </div>
                  {item.organizationName && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Building2 className="w-3 h-3" /> {item.organizationName}
                    </div>
                  )}
                  {item.rejectionReason && (
                    <div className="mt-2 text-rose-600 bg-rose-50 p-2 rounded-lg font-medium">
                      Rejection Reason: {item.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Pending items */}
              {(item.status === 0 || item.status === "Pending") && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={approveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingItem(item)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Request */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" /> Request Event Type Expansion
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Submit a request to grant your organization authorization for a new event type</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Requested Event Type to Expand *</label>
                <select
                  value={form.eventTypeId}
                  onChange={(e) => setForm({ ...form, eventTypeId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-medium"
                >
                  <option value="">-- Select event type to expand --</option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.code} - {et.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Batch (Optional)</label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
                >
                  <option value="">-- General Organization Expansion (No specific batch) --</option>
                  {recentBatches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode || b.id} - {b.productName || "Produce"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">Facility / Branch Location (Optional)</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGetDeviceLocation}
                      disabled={locatingDevice}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                      title="Get Current Computer / Device GPS Location"
                    >
                      <LocateFixed className={`w-3 h-3 ${locatingDevice ? "animate-spin" : ""}`} />
                      {locatingDevice ? "Locating..." : "Device (GPS)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                      title="Select Location from Interactive Map"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" /> Map Picker
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Logistics Center - Branch A, Da Lat or select on map..."
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Justification / Expansion Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your organization expansion reason (e.g. Added new fleet license for transport services)..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit Expansion Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reject Request */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" /> Reject Event Request
              </h3>
              <button onClick={() => setRejectingItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-gray-600">
                Please enter the reason for rejecting event request for batch <span className="font-mono font-bold text-gray-800">{rejectingItem.batchCode || rejectingItem.batchId.slice(0, 8)}</span>:
              </p>
              <textarea
                rows={3}
                required
                placeholder="e.g. Missing transport documents, invalid location format..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelectLocation={(selectedLoc) => setForm((prev) => ({ ...prev, location: selectedLoc }))}
        initialLocation={form.location}
      />
    </div>
  );
}
