export const GEOGRAPHY_POINT_4326_SQL_TYPE = "geography(POINT, 4326)" as const;

export type GeographyPoint4326 = {
    sqlType: typeof GEOGRAPHY_POINT_4326_SQL_TYPE;
    wkt: string;
};

export type University = {
    id: string;
    name: string;
    city: string;
    geography: GeographyPoint4326;
};

export type HousingProperty = {
    id: string;
    title: string;
    rentUsd: number;
    bedrooms: number;
    universityId: string;
    geography: GeographyPoint4326;
};

const geog = (wkt: string): GeographyPoint4326 => ({
    sqlType: GEOGRAPHY_POINT_4326_SQL_TYPE,
    wkt,
});

export const UNIVERSITIES: University[] = [
    { id: "u1", name: "Columbia University", city: "New York", geography: geog("SRID=4326;POINT(-73.9626 40.8075)") },
    { id: "u2", name: "UCLA", city: "Los Angeles", geography: geog("SRID=4326;POINT(-118.4452 34.0689)") },
    { id: "u3", name: "UT Austin", city: "Austin", geography: geog("SRID=4326;POINT(-97.7341 30.2849)") },
    { id: "u4", name: "University of Washington", city: "Seattle", geography: geog("SRID=4326;POINT(-122.3035 47.6553)") },
    { id: "u5", name: "University of Chicago", city: "Chicago", geography: geog("SRID=4326;POINT(-87.5987 41.7886)") },
    { id: "u6", name: "Georgia Tech", city: "Atlanta", geography: geog("SRID=4326;POINT(-84.3963 33.7756)") },
    { id: "u7", name: "Arizona State University", city: "Tempe", geography: geog("SRID=4326;POINT(-111.9331 33.4242)") },
    { id: "u8", name: "Northeastern University", city: "Boston", geography: geog("SRID=4326;POINT(-71.0892 42.3398)") },
    { id: "u9", name: "University of Florida", city: "Gainesville", geography: geog("SRID=4326;POINT(-82.3479 29.6436)") },
    { id: "u10", name: "University of Colorado Boulder", city: "Boulder", geography: geog("SRID=4326;POINT(-105.2705 40.0076)") },
];

export const HOUSING_PROPERTIES: HousingProperty[] = [
    { id: "h1", title: "Morningside Studio", rentUsd: 2450, bedrooms: 1, universityId: "u1", geography: geog("SRID=4326;POINT(-73.9599 40.8092)") },
    { id: "h2", title: "Harlem Shared Loft", rentUsd: 1850, bedrooms: 2, universityId: "u1", geography: geog("SRID=4326;POINT(-73.9548 40.8137)") },
    { id: "h3", title: "Westwood Walk-Up", rentUsd: 2650, bedrooms: 1, universityId: "u2", geography: geog("SRID=4326;POINT(-118.4426 34.0711)") },
    { id: "h4", title: "Santa Monica Blvd Flat", rentUsd: 3050, bedrooms: 2, universityId: "u2", geography: geog("SRID=4326;POINT(-118.4512 34.0644)") },
    { id: "h5", title: "Guadalupe Street Condo", rentUsd: 2100, bedrooms: 1, universityId: "u3", geography: geog("SRID=4326;POINT(-97.7398 30.2894)") },
    { id: "h6", title: "Riverside Duplex", rentUsd: 2600, bedrooms: 3, universityId: "u3", geography: geog("SRID=4326;POINT(-97.7242 30.2717)") },
    { id: "h7", title: "University District Micro", rentUsd: 1750, bedrooms: 1, universityId: "u4", geography: geog("SRID=4326;POINT(-122.3072 47.6593)") },
    { id: "h8", title: "Lake City Apartment", rentUsd: 2200, bedrooms: 2, universityId: "u4", geography: geog("SRID=4326;POINT(-122.2986 47.6624)") },
    { id: "h9", title: "Hyde Park Brick Home", rentUsd: 2350, bedrooms: 2, universityId: "u5", geography: geog("SRID=4326;POINT(-87.6011 41.7921)") },
    { id: "h10", title: "South Side Townhouse", rentUsd: 2850, bedrooms: 3, universityId: "u5", geography: geog("SRID=4326;POINT(-87.5936 41.7868)") },
    { id: "h11", title: "Midtown Tech Suite", rentUsd: 2400, bedrooms: 1, universityId: "u6", geography: geog("SRID=4326;POINT(-84.3927 33.7791)") },
    { id: "h12", title: "Peachtree Family Unit", rentUsd: 2950, bedrooms: 3, universityId: "u6", geography: geog("SRID=4326;POINT(-84.4014 33.7718)") },
    { id: "h13", title: "Tempe Garden Flat", rentUsd: 1650, bedrooms: 1, universityId: "u7", geography: geog("SRID=4326;POINT(-111.9294 33.4281)") },
    { id: "h14", title: "Mill Avenue House", rentUsd: 2550, bedrooms: 3, universityId: "u7", geography: geog("SRID=4326;POINT(-111.9368 33.4212)") },
    { id: "h15", title: "Fenway Compact Studio", rentUsd: 2550, bedrooms: 1, universityId: "u8", geography: geog("SRID=4326;POINT(-71.0927 42.3414)") },
    { id: "h16", title: "Back Bay Shared Unit", rentUsd: 3150, bedrooms: 2, universityId: "u8", geography: geog("SRID=4326;POINT(-71.0838 42.3387)") },
    { id: "h17", title: "Gator Corner Apartment", rentUsd: 1500, bedrooms: 1, universityId: "u9", geography: geog("SRID=4326;POINT(-82.3501 29.6483)") },
    { id: "h18", title: "Archer Road Villa", rentUsd: 2300, bedrooms: 3, universityId: "u9", geography: geog("SRID=4326;POINT(-82.3422 29.6402)") },
    { id: "h19", title: "Pearl Street Loft", rentUsd: 2050, bedrooms: 1, universityId: "u10", geography: geog("SRID=4326;POINT(-105.2753 40.0192)") },
    { id: "h20", title: "Boulder Creek Home", rentUsd: 2950, bedrooms: 3, universityId: "u10", geography: geog("SRID=4326;POINT(-105.2658 40.0124)") },
];
