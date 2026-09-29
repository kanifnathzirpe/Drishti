import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GisMap } from '../components/gis/GisMap';
import { GisParcel } from '../types';
import { MapPin, RefreshCw, Layers } from 'lucide-react';

interface GisMapPageProps {
  onOpenDocument: (id: string) => void;
}

export const GisMapPage: React.FC<GisMapPageProps> = ({ onOpenDocument }) => {
  const [parcels, setParcels] = useState<GisParcel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParcels = async () => {
    try {
      setLoading(true);
      const res = await api.getParcels();
      if (res.success) {
        setParcels(res.parcels);
      }
    } catch (err) {
      console.error('Failed to load cadastral parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Cadastral GIS Map Layer</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive parcel polygon visualizer integrated with verified land revenue records
          </p>
        </div>
        <button
          onClick={loadParcels}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Map</span>
        </button>
      </div>

      {/* Main Map */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <GisMap parcels={parcels} onOpenDocument={onOpenDocument} />
      </div>
    </div>
  );
};
