'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default function IssueMap({ issues }) {
  const defaultCenter = [31.5204, 74.3587] // Karachi

  return (
    <MapContainer
      center={defaultCenter}
      zoom={14}
      scrollWheelZoom={true}
      className="h-[500px] w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map((issue) => (
        <Marker
          key={issue._id}
          position={[issue.latitude, issue.longitude]}
        >
          <Popup>
            <strong>{issue.title}</strong><br />
            Category: {issue.category}<br />
            Status: {issue.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
