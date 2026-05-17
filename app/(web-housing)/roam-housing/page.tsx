"use client";

import { useMemo, useState } from "react";
import { HOUSING_PROPERTIES, UNIVERSITIES } from "../data";

type Coordinates = {
    lat: number;
    lon: number;
};

function parsePointWkt(value: string): Coordinates | null {
    const match = value.match(/^SRID=4326;POINT\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/);
    if (!match) return null;

    return {
        lon: Number(match[1]),
        lat: Number(match[2]),
    };
}

function haversineKm(a: Coordinates, b: Coordinates): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);

    const h =
        sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

    return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export default function WebHousingPage() {
    const [query, setQuery] = useState("");

    const normalizedQuery = query.trim().toLowerCase();

    const matchedUniversities = useMemo(() => {
        if (!normalizedQuery) return UNIVERSITIES;

        return UNIVERSITIES.filter((university) =>
            university.name.toLowerCase().includes(normalizedQuery)
        );
    }, [normalizedQuery]);

    return (
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
            <h1>University Housing Search</h1>
            <p>
                Search a university (example: Columbia University) to see nearby
                linked housing with distance and property details.
            </p>

            <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search university..."
                style={{
                    width: "100%",
                    marginTop: 12,
                    marginBottom: 20,
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                }}
            />

            <p>
                Universities found: {matchedUniversities.length} of{" "}
                {UNIVERSITIES.length}
            </p>

            {matchedUniversities.map((university) => {
                const universityCoordinates = parsePointWkt(university.geography.wkt);

                const housingForUniversity = HOUSING_PROPERTIES.filter(
                    (property) => property.universityId === university.id
                )
                    .map((property) => {
                        const propertyCoordinates = parsePointWkt(property.geography.wkt);
                        const distanceKm =
                            universityCoordinates && propertyCoordinates
                                ? haversineKm(universityCoordinates, propertyCoordinates)
                                : null;

                        return { property, distanceKm };
                    })
                    .sort((a, b) => {
                        if (a.distanceKm === null) return 1;
                        if (b.distanceKm === null) return -1;
                        return a.distanceKm - b.distanceKm;
                    });

                return (
                    <section
                        key={university.id}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: 14,
                            marginBottom: 14,
                        }}
                    >
                        <h2 style={{ margin: "0 0 8px 0" }}>{university.name}</h2>
                        <p style={{ margin: "0 0 12px 0" }}>
                            City: {university.city} | Geography:{" "}
                            {university.geography.wkt}
                        </p>

                        {housingForUniversity.length === 0 ? (
                            <p>No housing linked to this university.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th align="left">Title</th>
                                        <th align="left">Rent (USD)</th>
                                        <th align="left">Bedrooms</th>
                                        <th align="left">Distance (km)</th>
                                        <th align="left">Geography</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {housingForUniversity.map(({ property, distanceKm }) => (
                                        <tr key={property.id}>
                                            <td>{property.title}</td>
                                            <td>{property.rentUsd}</td>
                                            <td>{property.bedrooms}</td>
                                            <td>
                                                {distanceKm === null
                                                    ? "N/A"
                                                    : distanceKm.toFixed(2)}
                                            </td>
                                            <td>{property.geography.wkt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                );
            })}

            {normalizedQuery && matchedUniversities.length === 0 ? (
                <p>No university matched "{query}".</p>
            ) : null}
        </main>
    );
}
