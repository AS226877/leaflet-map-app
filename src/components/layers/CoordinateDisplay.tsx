import { useMap, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

interface CoordinateDisplayProps {
    showGrid?: boolean;
    gridSize?: number;
}

const CoordinateDisplay = ({ showGrid, gridSize }: CoordinateDisplayProps) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useMapEvents({
        mousemove: (e) => {
            setPosition(e.latlng);
        },
    });

    if (!position) return null;

    let gridInfo = null;
    if (showGrid && gridSize) {
        const lat = position.lat;
        const lng = position.lng;
        const lngGridSize = gridSize / Math.cos(lat * Math.PI / 180);
        const gridX = Math.floor(lng / lngGridSize);
        const gridY = Math.floor(lat / gridSize);
        gridInfo = `Grid: ${gridX},${gridY}`;
    }

    return (
        <div style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            zIndex: 1000,
        }}>
            {gridInfo && <div>{gridInfo}</div>}
            <div>Lat: {position.lat.toFixed(6)}°</div>
            <div>Lng: {position.lng.toFixed(6)}°</div>
        </div>
    );
};

export default CoordinateDisplay;