export interface LocationResult {
  locationString: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

/**
 * 1. Get location from 3rd Party IP Geolocation API (ipwho.is / bigdatacloud)
 */
export async function fetch3rdPartyIpLocation(): Promise<LocationResult> {
  try {
    const response = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(6000) });
    const data = await response.json();

    if (data && data.success) {
      const city = data.city || data.region || "";
      const country = data.country || "";
      const placeName = [city, country].filter(Boolean).join(", ");
      const coords = data.latitude && data.longitude ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}` : "";
      const displayString = placeName && coords ? `${placeName} (${coords})` : placeName || coords;

      return {
        locationString: displayString,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
      };
    }
  } catch (err) {
    console.warn("3rd-party ipwho.is failed, trying fallback...", err);
  }

  // Fallback to BigDataCloud IP Reverse Geocode
  const fallbackRes = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client", { signal: AbortSignal.timeout(6000) });
  const fallbackData = await fallbackRes.json();
  const city = fallbackData.locality || fallbackData.city || fallbackData.principalSubdivision || "";
  const country = fallbackData.countryName || "";
  const placeName = [city, country].filter(Boolean).join(", ");
  const coords = fallbackData.latitude && fallbackData.longitude ? `${fallbackData.latitude.toFixed(4)}, ${fallbackData.longitude.toFixed(4)}` : "";
  const displayString = placeName && coords ? `${placeName} (${coords})` : placeName || coords || "Unknown Location";

  return {
    locationString: displayString,
    latitude: fallbackData.latitude,
    longitude: fallbackData.longitude,
    city,
    country,
  };
}

/**
 * 2. Get current device / computer location using Browser Geolocation API (HTML5 GPS)
 */
export async function fetchDeviceLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          // Attempt reverse geocoding via 3rd party API for human readable address
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { signal: AbortSignal.timeout(5000) }
          );
          const data = await res.json();
          const city = data.locality || data.city || data.principalSubdivision || "";
          const country = data.countryName || "";
          const placeName = [city, country].filter(Boolean).join(", ");
          const displayString = placeName ? `${placeName} (${coordsStr})` : coordsStr;

          resolve({
            locationString: displayString,
            latitude,
            longitude,
            city,
            country,
          });
        } catch {
          resolve({
            locationString: coordsStr,
            latitude,
            longitude,
          });
        }
      },
      (error) => {
        let msg = "Unable to retrieve device location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
