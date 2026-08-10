import { useNavigate } from "react-router";
import { Leaf, Home, ArrowLeft, Search, QrCode } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #F0FDF4 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "#A5D6A7", transform: "translate(-50%, -50%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "#66BB6A", transform: "translate(50%, 50%)" }}
      />

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
        >
          <Leaf className="w-10 h-10 text-white" />
        </div>

        {/* 404 Number */}
        <h1
          className="font-black mb-3 leading-none"
          style={{
            fontSize: "clamp(80px, 18vw, 160px)",
            color: "#1B5E20",
            opacity: 0.08,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          404
        </h1>

        {/* Overlay text on top of giant 404 */}
        <div style={{ marginTop: "-80px" }}>
          <h2 className="text-gray-900 font-extrabold text-2xl mb-2">Page Not Found</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or may have been moved.
            Try searching for a batch code or return to the homepage.
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick search */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Quick Links
          </p>
          <div className="flex flex-col gap-2">
            {[
              { icon: QrCode, label: "Trace RICE-20260112-001", action: () => navigate("/trace/RICE-20260112-001") },
              { icon: Search, label: "Search Products on Home", action: () => navigate("/#features") },
              { icon: Leaf, label: "Go to Dashboard", action: () => navigate("/app/dashboard") },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 transition-all text-left"
              >
                <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
