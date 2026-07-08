import { useNavigate } from "react-router";
import { Leaf, Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F7FA" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "#E8F5E9" }}>
          <Leaf className="w-8 h-8" style={{ color: "#2E7D32" }} />
        </div>
        <h1 className="text-gray-900 font-bold mb-2" style={{ fontSize: 48 }}>404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "#2E7D32" }}
        >
          <Home className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </div>
  );
}
