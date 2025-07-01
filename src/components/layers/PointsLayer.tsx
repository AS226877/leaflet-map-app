import { CircleMarker, Popup } from 'react-leaflet';

export type Point = {
    id: number;
    name: string;
    coordinates: [number, number];
};

interface PointsLayerProps {
    points: Point[];
    show: boolean;
}

export default function PointsLayer({ points, show }: PointsLayerProps) {
    if (!show) return null;
    return (
        <>
            {points.map((point, idx) => (
                <CircleMarker
                    key={idx}
                    center={point.coordinates}
                    radius={6}
                    pathOptions={{ color: 'blue', fillColor: 'skyblue', fillOpacity: 0.8 }}
                >
                    <Popup>{point.name}</Popup>
                </CircleMarker>
            ))}
        </>
    );
}
