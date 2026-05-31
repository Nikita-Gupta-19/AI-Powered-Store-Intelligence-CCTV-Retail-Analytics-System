'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Fix missing marker icons in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function densityColor(severity?: string) {
  if (severity === 'CRITICAL') return '#ef4444'; // Extreme density (red)
  if (severity === 'HIGH') return '#f97316'; // High density (orange)
  if (severity === 'MEDIUM') return '#eab308'; // Medium (yellow)
  return '#22c55e'; // Normal (green)
}

export default function StoreMapInner({ incidents = [], alerts = [], locations = [], hotspots = [], role }: any) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '12px', left: '60px', zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)', padding: '8px 14px', borderRadius: '8px',
        border: '1px solid rgba(6,182,212,0.2)', fontSize: '12px', color: '#cbd5e1',
        pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 600, color: '#22d3ee', marginBottom: '4px' }}>🏬 STORE FLOOR DENSITY HEATMAP</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>🔴 Spill/Congestion</span>
          <span>🟠 Active aisle</span>
          <span>🟢 Normal traffic</span>
        </div>
      </div>

      <MapContainer
        center={[28.6139, 77.209]}
        zoom={14}
        style={{ height: '520px', width: '100%', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.15)' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Aisle Traffic Density circles */}
        {hotspots.map((h: any) => (
          <Circle
            key={`hotspot-${h.id}`}
            center={[h.lat, h.lng]}
            radius={h.radius || 400}
            pathOptions={{ color: densityColor(h.severity), fillColor: densityColor(h.severity), fillOpacity: 0.28, weight: 2 }}
          >
            <Popup>
              <div style={{ minWidth: '170px', fontFamily: 'inherit' }}>
                <b style={{ color: densityColor(h.severity) }}>🔥 Active Traffic Zone</b><br />
                Section: {h.id.substring(0, 8) === '28.61,77' ? 'Cosmetics & Skincare' : 'Apparel'}<br />
                Total Passes: {h.count}<br />
                Activity Score: {h.score}<br />
                State: {h.severity === 'CRITICAL' ? 'CONGESTION WARNING' : 'HIGH FLOW'}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Monitored Store Layout zones */}
        {locations.map((l: any) => (
          <Circle
            key={`location-${l.id}`}
            center={[l.lat, l.lng]}
            radius={350}
            pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.09, weight: 1, dashArray: '5, 5' }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <b style={{ color: '#22d3ee' }}>📍 Store Department</b><br />
                <b>{l.name}</b><br />
                Aisle ID: {l.id.substring(0, 6)}<br />
                Optimal Dwell: {l.riskScore}s
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Active Customer Session Markers */}
        {incidents.map((i: any) => (
          <CircleMarker
            key={`incident-${i.id}`}
            center={[i.lat, i.lng]}
            radius={10}
            pathOptions={{ color: densityColor(i.severity), fillColor: densityColor(i.severity), fillOpacity: 0.95, weight: 1 }}
          >
            <Popup>
              <div style={{ minWidth: '170px' }}>
                <b style={{ color: densityColor(i.severity) }}>👤 {i.title}</b><br />
                Status: {i.isStaff ? 'Floor Staff Shift' : 'Customer Journey'}<br />
                Action: {i.category.replace(/_/g, ' ')}<br />
                Dwell Time: {i.dwellTimeSeconds}s<br />
                Purchase Completed: {i.hasPurchased ? 'Yes ✓' : 'No'}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Real-time Store Manager Alerts */}
        {alerts
          .filter((a: any) => a.lat != null && a.lng != null)
          .map((a: any) => (
            <Marker key={`alert-${a.id}`} position={[a.lat, a.lng]} icon={icon}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <b style={{ color: '#f59e0b' }}>🔔 Manager Alert: {a.title}</b><br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{a.message}</span><br />
                  Severity: <span style={{ color: densityColor(a.severity), fontWeight: 600 }}>{a.severity}</span>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
