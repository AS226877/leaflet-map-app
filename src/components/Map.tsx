'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import GridLayer from './layers/GridLayer';
import PointsLayer, { Point } from './layers/PointsLayer';
import GeometriesLayer, { Geometry } from './layers/GeometriesLayer';

export default function MapView() {
    const [geometries, setGeometries] = useState<Geometry[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [showPoints, setShowPoints] = useState(true);
    const [colorByDate, setColorByDate] = useState(true);
    const [showGrid, setShowGrid] = useState(false);

    useEffect(() => {
        // Simulate loading data from a "server"
        fetch('/data/geometries.json')
            .then(res => res.json())
            .then(setGeometries);
        fetch('/data/points.json')
            .then(res => res.json())
            .then(setPoints);
    }, []);

    return (
        <div>
            <button
                onClick={() => setShowPoints((p) => !p)}
                className="absolute top-4 right-4 z-[1000] px-4 py-2 w-28 rounded-lg bg-white text-black shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
                {showPoints ? 'Hide' : 'Show'} Points
            </button>
            <button
                onClick={() => setColorByDate((prev) => !prev)}
                className="absolute top-22 right-4 z-[1000] px-4 py-2 w-28 rounded-lg bg-white text-black shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
                Color by {colorByDate ? 'Accuracy' : 'Date'}
            </button>
            <button
                onClick={() => setShowGrid((prev) => !prev)}
                className="absolute top-40 right-4 z-[1000] px-4 py-2 w-28 rounded-lg bg-white text-black shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
                {showGrid ? 'Hide' : 'Show'} Grid
            </button>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GeometriesLayer
                    geometries={geometries}
                    show={true}
                    colorByDate={colorByDate}
                    showGrid={showGrid}
                />
                <PointsLayer points={points} show={showPoints} />
                {showGrid && <GridLayer geometries={geometries} />}
            </MapContainer>
        </div>
    );
}
