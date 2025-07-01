import { Polygon, Popup } from 'react-leaflet';
import { getColorByDate, getColorByAccuracy } from '../../utils/mapUtils';

export type Geometry = {
    id: number;
    name: string;
    date: string;
    accuracy: string;
    coordinates: [number, number][];
};

interface GeometriesLayerProps {
    geometries: Geometry[];
    show: boolean;
    colorByDate: boolean;
    showGrid: boolean;
}

export default function GeometriesLayer({ geometries, show, colorByDate, showGrid }: GeometriesLayerProps) {
    if (!show || showGrid) return null;
    return (
        <>
            {geometries.map((geom) => (
                <Polygon
                    key={geom.id}
                    positions={geom.coordinates}
                    pathOptions={{
                        color: colorByDate
                            ? getColorByDate(geom.date)
                            : getColorByAccuracy(geom.accuracy),
                    }}
                >
                    <Popup>
                        <div>
                            <strong>{geom.name}</strong>
                            <br />
                            Date: {geom.date}
                            <br />
                            Accuracy: {geom.accuracy}
                        </div>
                    </Popup>
                </Polygon>
            ))}
        </>
    );
}
