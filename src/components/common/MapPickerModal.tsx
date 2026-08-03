import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check, X, LocateFixed, Loader2 } from "lucide-react";

// Fix default leaflet marker icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (locationString: string) => void;
  initialLocation?: string;
}

export function MapPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation = "",
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 11.9404, // Default: Da Lat, Lam Dong
    lng: 108.4583,
  });
  const [addressPreview, setAddressPreview] = useState<string>("Loading map location...");
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);

  // Helper to format administrative address components
  const formatVietnameseAddressData = (data: any, lat: number, lng: number): string => {
    if (data && data.address) {
      const addr = data.address;
      const hamlet = addr.hamlet || addr.suburb || addr.neighbourhood || addr.road || addr.quarter || addr.village_group || "";
      const village = addr.village || addr.town || addr.municipality || addr.city_district || "";
      const county = addr.county || addr.district || addr.state_district || "";
      const state = addr.state || addr.city || addr.province || "";
      const country = addr.country || "";

      const parts = [hamlet, village, county, state, country].filter(Boolean);
      if (parts.length > 0) {
        return `${parts.join(", ")} (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      }
    }

    if (data && data.display_name) {
      const parts = data.display_name.split(", ").slice(0, 5).join(", ");
      return `${parts} (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Reverse geocode lat/lng to human readable address
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setAddressPreview(`Fetching location details... (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

    try {
      // 1. Try Nominatim reverse geocode with Vietnamese priority
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "vi,en" }, signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data && (data.address || data.display_name)) {
        setAddressPreview(formatVietnameseAddressData(data, lat, lng));
        return;
      }
    } catch (e) {
      console.warn("Nominatim reverse geocode fallback to BigDataCloud:", e);
    }

    try {
      // 2. Fallback to BigDataCloud Reverse Geocode (Vietnamese administrative levels)
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      const locality = data.locality || data.city || "";
      const principalSubdivision = data.principalSubdivision || "";
      const country = data.countryName || "";

      const parts = [locality, principalSubdivision, country].filter(Boolean);
      const addrStr = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddressPreview(`${addrStr} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } catch {
      setAddressPreview(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = selectedCoords.lat;
    const defaultLng = selectedCoords.lng;

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Initial Marker
    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    updateAddressFromCoords(defaultLat, defaultLng);

    // Handle marker drag end
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      updateAddressFromCoords(pos.lat, pos.lng);
    });

    // Handle map click
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updateAddressFromCoords(lat, lng);
    });

    // Fix map resize render glitch in modal
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Search submit via Nominatim
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "vi,en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 14);
          markerRef.current.setLatLng([lat, lon]);
          setAddressPreview(formatVietnameseAddressData(item, lat, lon));
        }
      } else {
        setAddressPreview("Không tìm thấy địa điểm phù hợp với từ khóa.");
      }
    } catch {
      setAddressPreview("Lỗi khi tìm kiếm địa điểm.");
    } finally {
      setIsSearching(false);
    }
  };

  // Center on current user device GPS location
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
          updateAddressFromCoords(lat, lng);
        }
        setIsLocatingDevice(false);
      },
      () => setIsLocatingDevice(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation(addressPreview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Interactive 3rd-Party Map Picker</h3>
              <p className="text-xs text-gray-500">Click on the map, drag pin, or search to pick supply chain location</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hamlet, commune, district, province (e.g. Đại Lộc, Hậu Lộc, Thanh Hóa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-all"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingDevice}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold shrink-0 transition-colors"
            title="Pan to My Current GPS Location"
          >
            <LocateFixed className={`w-4 h-4 ${isLocatingDevice ? "animate-spin" : ""}`} />
            My Location
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-gray-200 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow border border-gray-200 text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            OpenStreetMap Interactive 3rd-Party Mapping
          </div>
        </div>

        {/* Selected Address Preview & Actions */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Selected Location</span>
              <p className="text-xs font-medium text-gray-800 truncate">{addressPreview}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
