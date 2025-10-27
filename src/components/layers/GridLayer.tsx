import { useMap, useMapEvents } from 'react-leaflet';
import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { Geometry } from './GeometriesLayer';

const OLD_THRESHOLD = new Date('2020-01-01');

interface GridLayerProps {
    geometries: Geometry[];
    isLocked?: boolean;
}

function GridLayer({ geometries, isLocked = false }: GridLayerProps) {
    const map = useMap();
    const gridLayerRef = useRef<L.LayerGroup | null>(null);
    const [lockedGridSize, setLockedGridSize] = useState<number | null>(null);

    // Store current grid size when lock state changes
    useEffect(() => {
        if (isLocked && !lockedGridSize && map) {
            const zoom = map.getZoom();
            const baseSize = 0.00009;
            const zoomFactor = Math.pow(2, 19 - Math.min(Math.max(zoom, 0), 19));
            setLockedGridSize(baseSize * zoomFactor);
        }
        if (!isLocked) {
            setLockedGridSize(null);
        }
    }, [isLocked, map, lockedGridSize]);

    useMapEvents({
        zoomend: () => map && updateGrid(),
        moveend: () => map && updateGrid(),
    });

    const updateGrid = () => {
        if (!map || !map.getBounds || !map.getZoom || !map.layerPointToContainerPoint) return;

        if (gridLayerRef.current) {
            map.removeLayer(gridLayerRef.current);
        }

        const bounds = map.getBounds();
        const zoom = map.getZoom();
        
        // Use locked grid size or calculate based on zoom
        let gridSize;
        if (isLocked && lockedGridSize) {
            gridSize = lockedGridSize;
        } else {
            const baseSize = 0.00009; // ~10m at equator
            const zoomFactor = Math.pow(2, 19 - Math.min(Math.max(zoom, 0), 19));
            gridSize = baseSize * zoomFactor;
        }
        
        const newGridLayer = L.layerGroup();
        
        // Get the center latitude to calculate the longitude adjustment factor
        const centerLat = bounds.getCenter().lat;
        // Adjust longitude step to maintain square cells
        // cos(lat) gives the ratio between longitude and latitude degrees
        const lngGridSize = gridSize / Math.cos(centerLat * Math.PI / 180);

        // Align grid to WGS84 by snapping to grid size
        const startLat = Math.floor(bounds.getSouth() / gridSize) * gridSize;
        const startLng = Math.floor(bounds.getWest() / lngGridSize) * lngGridSize;

        for (let lat = startLat; lat < bounds.getNorth(); lat += gridSize) {
            for (let lng = startLng; lng < bounds.getEast(); lng += lngGridSize) {
                const cellBounds = [
                    [lat, lng],
                    [lat + gridSize, lng + lngGridSize],
                ];

                const cellPolygon = L.polygon([
                    [lat, lng],
                    [lat, lng + lngGridSize],
                    [lat + gridSize, lng + lngGridSize],
                    [lat + gridSize, lng],
                ]);

                const cellGeometries = geometries.filter((geom) => {
                    const geometryPolygon = L.polygon(geom.coordinates);
                    return geometryPolygon.getBounds().intersects(cellPolygon.getBounds());
                });

                const hasOld = cellGeometries.some((geom) => new Date(geom.date) < OLD_THRESHOLD);
                const hasNew = cellGeometries.some((geom) => new Date(geom.date) >= OLD_THRESHOLD);

                const cellColor = hasOld ? 'red' : hasNew ? 'green' : 'transparent';
                const cellInfo = cellGeometries.map((geom) => geom.name).join(', ') || 'No geometries';

                const rectangle = L.rectangle(cellBounds as L.LatLngBoundsLiteral, {
                    color: 'black',
                    weight: 1,
                    fillColor: cellColor,
                    fillOpacity: cellColor === 'transparent' ? 0 : 0.3,
                }).bindPopup(`Geometries: ${cellInfo}`);

                newGridLayer.addLayer(rectangle);
            }
        }

        newGridLayer.addTo(map);
        gridLayerRef.current = newGridLayer;
    };

    useEffect(() => {
        if (map) {
            updateGrid();
        }
        return () => {
            if (gridLayerRef.current) {
                map.removeLayer(gridLayerRef.current);
                gridLayerRef.current = null;
            }
        };
    }, [map, geometries, isLocked, lockedGridSize]);

    return null;
}

export default GridLayer;