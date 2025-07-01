import { useMap, useMapEvents } from 'react-leaflet';
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Geometry } from './GeometriesLayer';

const OLD_THRESHOLD = new Date('2020-01-01');

function GridLayer({ geometries }: { geometries: Geometry[] }) {
    const map = useMap();
    const gridLayerRef = useRef<L.LayerGroup | null>(null);

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
        const gridSize = zoom > 15 ? 0.001 : zoom > 12 ? 0.01 : 0.1;
        const newGridLayer = L.layerGroup();

        for (let lat = Math.floor(bounds.getSouth() / gridSize) * gridSize; lat < bounds.getNorth(); lat += gridSize) {
            for (let lng = Math.floor(bounds.getWest() / gridSize) * gridSize; lng < bounds.getEast(); lng += gridSize) {
                const cellBounds = [
                    [lat, lng],
                    [lat + gridSize, lng + gridSize],
                ];

                const cellPolygon = L.polygon([
                    [lat, lng],
                    [lat, lng + gridSize],
                    [lat + gridSize, lng + gridSize],
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
    }, [map, geometries]);

    return null;
}

export default GridLayer;