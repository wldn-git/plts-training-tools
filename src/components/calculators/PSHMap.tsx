import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { pshData } from '../../lib/data/pshData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sun, Info, Navigation } from 'lucide-react';

// Fix leaflet default icon issue in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom hook to change map view
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function PSHMap() {
  const [selectedProvince, setSelectedProvince] = useState<string>('Jawa Barat');
  
  const currentData = pshData.find(p => p.province === selectedProvince);
  const center: [number, number] = currentData ? [currentData.lat, currentData.lng] : [-2.5489, 118.0149]; // Center of Indonesia
  const zoom = selectedProvince === 'Jakarta' ? 11 : 8;

  const getPshColor = (psh: number) => {
    if (psh >= 5.5) return 'bg-red-500';
    if (psh >= 5.0) return 'bg-orange-500';
    if (psh >= 4.5) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Peta PSH & Lokasi</h2>
        <p className="text-gray-600 mt-1">
          Cek nilai Peak Sun Hours (PSH) berdasarkan lokasi di Indonesia untuk optimasi sistem PLTS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-gray-200/60 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg">Filter & Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Provinsi / Wilayah</Label>
              <Select 
                value={selectedProvince}
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger className="h-11 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pshData.map(p => (
                    <SelectItem key={p.province} value={p.province}>
                      {p.province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/50 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                <Sun className="h-20 w-20 text-orange-600" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-orange-100">
                  <Sun className="h-8 w-8 text-orange-500 fill-orange-500/10" />
                </div>
                <div>
                  <div className="text-[10px] text-orange-600 uppercase font-bold tracking-widest mb-1">Rata-rata PSH</div>
                  <div className="text-3xl font-black text-orange-950">{currentData?.avgPsh} Jam</div>
                </div>
              </div>
              <p className="text-[11px] text-orange-800/80 leading-relaxed mt-4 italic font-medium">
                "Menerima radiasi matahari setara intensitas penuh (1000W/m²) selama ±{currentData?.avgPsh} jam/hari."
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail Kota / Titik</div>
                <div className="px-2 py-0.5 bg-gray-100 rounded-full text-[9px] font-bold text-gray-500 uppercase">Manual Update</div>
              </div>
              <div className="grid gap-2">
                {currentData?.cities.map(city => (
                  <div key={city.name} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                      <span className="text-sm font-medium text-gray-700">{city.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-orange-600 font-mono">{city.psh}h</span>
                      <Navigation className="h-3 w-3 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full min-h-[500px] flex flex-col shadow-sm border-gray-200/60 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-100 z-10">
              <div className="flex flex-col">
                <CardTitle className="text-lg">Visualisasi Radiasi Matahari</CardTitle>
                <span className="text-[10px] text-gray-400 italic">Interaktif Map dengan Real-time Layer</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-100"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Ekstrim ({">"}5.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-orange-100"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Tinggi ({">"}5.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-yellow-100"></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Sedang (4.5)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-0 relative">
              <div className="absolute inset-0 z-0">
                <MapContainer 
                  center={center} 
                  zoom={zoom} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <ChangeView center={center} zoom={zoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {pshData.map(prov => {
                    const psh = prov.avgPsh;
                    const circleColor = psh >= 5.5 ? '#ef4444' : psh >= 5.0 ? '#f97316' : psh >= 4.5 ? '#facc15' : '#60a5fa';
                    
                    return (
                      <div key={prov.province}>
                        {/* Glow effect for radiation feel */}
                        <CircleMarker
                          center={[prov.lat, prov.lng]}
                          pathOptions={{ 
                            fillColor: circleColor, 
                            color: circleColor, 
                            fillOpacity: 0.2,
                            weight: 0
                          }}
                          radius={30 + (psh - 4) * 15}
                        />
                        {/* Core marker */}
                        <CircleMarker
                          center={[prov.lat, prov.lng]}
                          pathOptions={{ 
                            fillColor: circleColor, 
                            color: 'white', 
                            fillOpacity: 0.8,
                            weight: 2
                          }}
                          radius={8}
                          eventHandlers={{
                            click: () => setSelectedProvince(prov.province)
                          }}
                        >
                          <Popup>
                            <div className="text-center p-1">
                              <h4 className="font-bold text-gray-900 border-b pb-1 mb-1">{prov.province}</h4>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400">Radiasi Harian:</span>
                                <span className="text-lg font-black text-orange-600">{psh} kWh/m²</span>
                              </div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      </div>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Functional Regions Overlay */}
              <div className="absolute bottom-6 left-6 z-[400] flex flex-wrap gap-2 pointer-events-auto">
                {['Jakarta', 'Jawa Barat', 'Jawa Timur', 'Bali', 'Nusa Tenggara Timur', 'Sulawesi Selatan'].map(reg => (
                  <button
                    key={reg}
                    onClick={() => setSelectedProvince(reg)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border-2 ${
                      selectedProvince === reg 
                        ? 'bg-orange-500 text-white border-orange-600 translate-y-[-2px]' 
                        : 'bg-white/90 backdrop-blur-md text-gray-600 border-white/50 hover:bg-white hover:text-orange-500'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="absolute top-6 left-6 z-[400] flex flex-col gap-2">
                <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-mono font-bold text-gray-700 tracking-tighter">GIS ENGINE ACTIVE: {zoom}x</span>
                </div>
              </div>
            </CardContent>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                <span className="font-bold text-gray-700 uppercase">Data Disclosure:</span> Estimasi berdasarkan agrerasi NASA SSE. Untuk desain sistem kritis, gunakan data TMY (Typical Meteorological Year) terbaru. Nilai di atas adalah rata-rata tahunan (Annual Average).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
