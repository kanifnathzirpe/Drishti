import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GisParcel } from '../../types';
import { Layers, MapPin, Eye, Info } from 'lucide-react';

interface GisMapProps {
  parcels: GisParcel[];
  onSelectParcel?: (parcel: GisParcel) => void;
  onOpenDocument?: (docId: string) => void;
}

export const GisMap: React.FC<GisMapProps> = ({ parcels, onSelectParcel, onOpenDocument }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<GisParcel | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.58, 73.985], // Wagholi / Haveli, Pune center
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | MoRD Cadastral Layer',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update polygon layers whenever parcels or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const filtered = filterStatus === 'ALL' ? parcels : parcels.filter((p) => p.status === filterStatus);

    filtered.forEach((parcel) => {
      const isSynced = parcel.status === 'SYNCED';
      const isPending = parcel.status === 'PENDING_VERIFICATION';
      const color = isSynced ? '#10b981' : isPending ? '#f59e0b' : '#3b82f6';

      // Create polygon
      const poly = L.polygon(parcel.coordinates as any, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.35,
      });

      // Hover effect
      poly.on('mouseover', () => {
        poly.setStyle({ fillOpacity: 0.7, weight: 3 });
      });
      poly.on('mouseout', () => {
        poly.setStyle({ fillOpacity: 0.35, weight: 2 });
      });

      // Click handler
      poly.on('click', () => {
        setSelectedParcel(parcel);
        if (onSelectParcel) onSelectParcel(parcel);
      });

      // Marker at centroid
      const marker = L.circleMarker(parcel.centroid as any, {
        radius: 4,
        color: '#1e293b',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 1.5,
      });

      marker.bindTooltip(`Survey #${parcel.surveyNumber}<br>${parcel.ownerName}`, {
        direction: 'top',
        className: 'text-xs font-semibold',
      });

      layerGroup.addLayer(poly);
      layerGroup.addLayer(marker);
    });

    if (filtered.length > 0 && mapInstanceRef.current) {
      // Fit bounds to first few parcels if available
      try {
        const bounds = L.latLngBounds(filtered.map((p) => p.centroid as any));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        // ignore bounds calculation error
      }
    }
  }, [parcels, filterStatus]);

  return (
    <div className="relative w-full h-[620px] rounded-lg border border-slate-300 overflow-hidden shadow-xs">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Filter Bar */}
      <div className="absolute top-3 left-12 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-md border border-slate-200 flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Cadastral Parcels</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses ({parcels.length})</option>
          <option value="DIGITIZED">Digitized</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="SYNCED">DILRMP Synced</option>
        </select>
        <div className="flex items-center space-x-2 text-[11px] pl-2 border-l border-slate-200">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Synced
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> In Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Digitized
          </span>
        </div>
      </div>

      {/* Demonstration Notice Watermark */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-md text-[11px] flex items-center space-x-2 border border-slate-700">
        <Info className="w-3.5 h-3.5 text-amber-400" />
        <span>Demonstration GIS Data (Simulated Cadastral GeoJSON Boundaries)</span>
      </div>

      {/* Selected Parcel Drawer / Card */}
      {selectedParcel && (
        <div className="absolute top-3 right-3 z-10 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-sm">
                Survey #{selectedParcel.surveyNumber}
              </span>
            </div>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Registered Owner</span>
              <span className="font-bold text-slate-900 text-sm">{selectedParcel.ownerName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Area (Acres)</span>
                <span className="font-bold text-slate-800">{selectedParcel.plotAreaAcres} Acre</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Khasra / Khata</span>
                <span className="font-bold text-slate-800">{selectedParcel.khasraNumber}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Village &amp; District</span>
              <span className="font-medium text-slate-800">
                {selectedParcel.village}, {selectedParcel.tehsil}, {selectedParcel.district}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 text-[11px]">AI Confidence:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {selectedParcel.confidence}%
              </span>
            </div>

            {selectedParcel.documentId && onOpenDocument && (
              <button
                onClick={() => onOpenDocument(selectedParcel.documentId!)}
                className="w-full mt-2 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Source Document</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
