import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Store, 
  Search, 
  X, 
  Phone, 
  CheckCircle2, 
  Layers,
  Compass,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantService, type AdminRestaurant } from '@/core/api/restaurants';

// Strict helper function to parse exact numeric coordinates
function parseCoordinate(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num) || num === 0) return null;
  return num;
}

// Extract exact lat/lng without artificial offsets
function getExactCoords(obj: any): { lat: number; lng: number } | null {
  if (!obj) return null;

  const latRaw = obj.latitude ?? obj.lat ?? obj.location?.latitude ?? obj.address?.latitude ?? 
                 obj.currentLatitude ?? obj.deliveryLatitude ?? obj.pickupLatitude ?? obj.geoLatitude;

  const lngRaw = obj.longitude ?? obj.lng ?? obj.location?.longitude ?? obj.address?.longitude ?? 
                 obj.currentLongitude ?? obj.deliveryLongitude ?? obj.pickupLongitude ?? obj.geoLongitude;

  const lat = parseCoordinate(latRaw);
  const lng = parseCoordinate(lngRaw);

  if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng };
  }

  return null;
}

interface SelectedEntity {
  id: string;
  name: string;
  subTitle?: string;
  phone?: string;
  status?: string;
  lat: number;
  lng: number;
  extraData?: any;
}

export default function LiveFleetMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);

  // Raw API Data State
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selection & Search State
  const [selectedRestaurant, setSelectedRestaurant] = useState<SelectedEntity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load restaurant list data and enrich missing coordinates from GET /admins/restaurants/{id}
  const fetchLiveData = async () => {
    setIsLoading(true);
    try {
      const restRes = await restaurantService.getRestaurants({ pageSize: 100 });
      const rawList = restRes.restaurants || [];

      // Fetch detail endpoint GET /admins/restaurants/{id} for ALL stores to get exact GPS lat/lng
      const enrichedRestaurants = await Promise.all(
        rawList.map(async (r) => {
          try {
            const detail = await restaurantService.getRestaurantById(r.id);
            if (detail) {
              return { ...r, ...detail };
            }
          } catch {
            // Fall back to summary record if detail call fails
          }
          return r;
        })
      );

      setRestaurants(enrichedRestaurants);
      setLastRefreshed(new Date());
    } catch (err) {
      toast.error('Failed to update restaurant locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Leaflet Map Instance with Clean OpenStreetMap Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Pune Region (18.5204, 73.8567)
    const map = L.map(mapContainerRef.current, {
      center: [18.5204, 73.8567],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Standard OpenStreetMap Tiles (100% Free, NO watermarks)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw 5km Delivery Radius Circle ONLY when a restaurant is clicked/selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusLayerRef.current) {
      map.removeLayer(radiusLayerRef.current);
      radiusLayerRef.current = null;
    }

    if (selectedRestaurant) {
      const circle = L.circle([selectedRestaurant.lat, selectedRestaurant.lng], {
        radius: 5000, // 5 km delivery radius
        color: '#d72b1f',
        fillColor: '#d72b1f',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      radiusLayerRef.current = circle;
    }
  }, [selectedRestaurant]);

  // Render ALL Restaurant Pin Markers at their EXACT Coordinates with Premium Teardrop Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds: [number, number][] = [];

    const createStorePinIcon = (name: string, isSelected: boolean) => {
      const pinColor = isSelected ? '#b82318' : '#d72b1f';
      const scaleTransform = isSelected ? 'scale(1.2)' : 'scale(1)';
      const zIndexStyle = isSelected ? 'z-index: 1000 !important;' : '';

      return L.divIcon({
        className: 'hivago-store-pin-container',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); transform: ${scaleTransform}; transform-origin: 50% 100%; ${zIndexStyle}">
            ${isSelected ? `
              <div style="position: absolute; bottom: 0px; width: 44px; height: 44px; border-radius: 50%; background: rgba(215, 43, 31, 0.35); animation: hivago-pin-pulse 1.8s ease-out infinite; pointer-events: none;"></div>
            ` : ''}
            
            <!-- Store Name Label Badge above pin -->
            <div style="
              margin-bottom: 4px;
              padding: 3px 8px;
              background-color: ${isSelected ? '#111827' : 'rgba(255, 255, 255, 0.95)'};
              color: ${isSelected ? '#ffffff' : '#1f2937'};
              font-size: 11px;
              font-weight: 700;
              font-family: system-ui, -apple-system, sans-serif;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.18);
              border: 1px solid ${isSelected ? '#374151' : 'rgba(0,0,0,0.1)'};
              white-space: nowrap;
              pointer-events: none;
              letter-spacing: -0.2px;
            ">
              ${name}
            </div>

            <!-- Standard Map Teardrop Pin SVG -->
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
              <!-- Teardrop Pin Body -->
              <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 14 41.5 17.15 43.4C17.68 43.78 18.32 43.78 18.85 43.4C22 41.5 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" 
                    fill="${pinColor}" 
                    stroke="#ffffff" 
                    stroke-width="2.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" />
              <!-- Inner White Circle -->
              <circle cx="18" cy="17" r="10.5" fill="#ffffff" />
              <!-- Store Icon (Building Store Front) -->
              <g transform="translate(10.5, 9.5)" stroke="${pinColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6h11"/>
                <path d="M2 6v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6"/>
                <path d="M4 6V3.5A1.5 1.5 0 0 1 5.5 2h4A1.5 1.5 0 0 1 11 3.5V6"/>
                <path d="M6 10h3"/>
              </g>
            </svg>
          </div>
        `,
        iconSize: [120, 70],
        iconAnchor: [60, 70],
      });
    };

    restaurants.forEach((r) => {
      const coords = getExactCoords(r);
      if (!coords) return; // Skip stores that do not have valid GPS coordinates in DB

      if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      bounds.push([coords.lat, coords.lng]);

      const isSelected = selectedRestaurant?.id === r.id;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: createStorePinIcon(r.name, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.on('click', () => {
        setSelectedRestaurant({
          id: r.id,
          name: r.name,
          subTitle: r.operatingHoursSummary || 'Partner Store',
          phone: r.phone,
          status: r.isActive !== undefined ? (r.isActive ? 'Active Store' : 'Inactive') : 'Active Store',
          lat: coords.lat,
          lng: coords.lng,
          extraData: r,
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 1.2 });
        }
      });

      marker.addTo(layerGroup);
    });

    // Auto-fit map bounds around ALL real store pin locations if no store is currently selected
    if (bounds.length > 0 && map && !selectedRestaurant) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [restaurants, searchQuery, selectedRestaurant]);


  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-100">
      {/* Top Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        {/* Title & Search Bar */}
        <div className="flex items-center space-x-3 pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-200">
          <div className="p-2 bg-red-50 text-[#d72b1f] rounded-xl">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Restaurant Coverage Map</h1>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Showing {restaurants.filter(r => getExactCoords(r) !== null).length} Stores • Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center space-x-2 bg-gray-100/90 border border-gray-200 rounded-xl px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurant store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs focus:outline-none w-48 sm:w-64"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Refresh & Controls Bar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-200 flex items-center space-x-2 text-xs">
          {selectedRestaurant && (
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" /> Clear Radius
            </button>
          )}

          <button
            onClick={fetchLiveData}
            className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#d72b1f]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full z-10" 
      />

      {/* Prompt Overlay when NO restaurant is selected */}
      {!selectedRestaurant && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-gray-200 text-xs text-gray-700 font-semibold flex items-center gap-2 pointer-events-auto shadow-md">
          <Store className="h-4 w-4 text-[#d72b1f]" />
          <span>Click any store pin on the map to view its 5 km delivery radius circle</span>
        </div>
      )}

      {/* Slide-over Inspector Panel (When a restaurant is clicked) */}
      {selectedRestaurant && (
        <div className="absolute top-20 right-4 z-30 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl text-white bg-[#d72b1f]">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">{selectedRestaurant.name}</h3>
                <p className="text-xs text-gray-500">{selectedRestaurant.subTitle}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium">Status</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {selectedRestaurant.status}
              </span>
            </div>

            {selectedRestaurant.phone && (
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> Phone
                </span>
                <a href={`tel:${selectedRestaurant.phone}`} className="font-semibold text-blue-600 hover:underline">
                  {selectedRestaurant.phone}
                </a>
              </div>
            )}

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-mono space-y-1">
              <div className="flex items-center justify-between text-gray-600">
                <span>Latitude:</span>
                <span className="font-bold text-gray-900">{selectedRestaurant.lat.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Longitude:</span>
                <span className="font-bold text-gray-900">{selectedRestaurant.lng.toFixed(5)}</span>
              </div>
            </div>

            <div className="p-3 bg-red-50/80 rounded-xl border border-red-100 text-red-800 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-[#d72b1f]" /> 5 km Delivery Radius Circle Active
              </p>
              <p className="text-[11px] text-red-700/80">
                Displaying 5 km delivery zone overlay on map for {selectedRestaurant.name}.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([selectedRestaurant.lat, selectedRestaurant.lng], 16, { duration: 1.2 });
                }
              }}
              className="w-full py-2 text-xs font-bold text-white bg-[#d72b1f] hover:bg-[#b82318] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Center Map on Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
