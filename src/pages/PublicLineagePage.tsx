import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, GitBranch, Leaf, Box } from "lucide-react";
import { useBatchLineage } from "../features/public-trace/public-trace.queries";

export function PublicLineagePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBatchLineage(id);
  const trace = data?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading lineage data...</div>;
  }

  if (isError || !trace) {
    return <div className="p-8 text-center text-red-500">Error or batch not found</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(`/trace/${id}`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Trace
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#2E7D32" }}>
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900" style={{ fontSize: 14 }}>AgriTrace</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 pb-12">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <h1 className="font-bold text-lg mb-1 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-green-700" />
            Batch Lineage
          </h1>
          <p className="text-sm text-gray-500">
            Showing family tree for batch <code className="bg-gray-100 px-1.5 py-0.5 rounded text-green-700">{id}</code>
          </p>
        </div>

        <div className="space-y-4 relative pl-4 border-l-2 border-green-200 ml-4">
          {trace.lineage.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute w-4 h-0.5 bg-green-200 -left-4 top-6" />
              <div className="absolute w-2 h-2 rounded-full bg-green-500 -left-[21px] top-[22px]" />
              <Link to={`/trace/${item.batchId}`} className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Box className="w-4 h-4 text-gray-400" />
                    {item.batchCode}
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 font-semibold">
                    {item.eventTypeCode}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Quantity: <span className="font-medium text-gray-800">{item.quantity} {item.unitCode || "kg"}</span>
                </div>
                {item.parentBatchId && (
                  <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-50 flex gap-1">
                    Parent: <code className="text-gray-500">{item.parentBatchId}</code>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
