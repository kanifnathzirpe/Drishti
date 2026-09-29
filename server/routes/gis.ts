import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

export const gisRouter = Router();

// GET /api/gis/parcels
gisRouter.get('/parcels', (req: Request, res: Response) => {
  const { village, district, state, status } = req.query;
  let parcels = db.getGisParcels();

  if (state && state !== 'All') {
    parcels = parcels.filter((p) => p.state.toLowerCase() === String(state).toLowerCase());
  }
  if (district && district !== 'All') {
    parcels = parcels.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
  }
  if (village) {
    parcels = parcels.filter((p) => p.village.toLowerCase().includes(String(village).toLowerCase()));
  }
  if (status && status !== 'ALL') {
    parcels = parcels.filter((p) => p.status === status);
  }

  // Convert to GeoJSON FeatureCollection
  const geojson = {
    type: 'FeatureCollection',
    features: parcels.map((p) => ({
      type: 'Feature',
      id: p.id,
      properties: {
        id: p.id,
        surveyNumber: p.surveyNumber,
        khasraNumber: p.khasraNumber,
        khataNumber: p.khataNumber,
        village: p.village,
        tehsil: p.tehsil,
        district: p.district,
        state: p.state,
        ownerName: p.ownerName,
        plotAreaAcres: p.plotAreaAcres,
        landClassification: p.landClassification,
        status: p.status,
        confidence: p.confidence,
        documentId: p.documentId,
      },
      geometry: {
        type: 'Polygon',
        // Leaflet expects [lng, lat] in standard GeoJSON
        coordinates: [p.coordinates.map(([lat, lng]) => [lng, lat])],
      },
    })),
  };

  return res.json({
    success: true,
    total: parcels.length,
    geojson,
    parcels,
  });
});
