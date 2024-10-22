import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Named export for the PUT method
export async function PUT(request: Request) {
  try {
    const body = await request.json(); // Parse JSON body
    const { deviceID, lng, lat } = body;

    // Validate the request body
    if (!deviceID || lng === undefined || lat === undefined) {
      return NextResponse.json({ error: 'Missing required fields: deviceID, lng, lat' }, { status: 400 });
    }

    const client = new Client({
      host: "localhost",
      user: "postgres",
      port: 5432,
      password: process.env.PG_PASS,
      database: "waterways",
    });

    await client.connect();

    // Step 1: Find the nearest water feature
    const nearestWaterFeatureQuery = `
      SELECT ogf_id, ST_AsText(wkb_geometry) AS geometry
      FROM watercourse_table
      ORDER BY wkb_geometry <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
      LIMIT 1;
    `;

    const nearestWaterFeatureResult = await client.query(nearestWaterFeatureQuery, [lng, lat]);

    // Check if any water feature is found
    if (nearestWaterFeatureResult.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'No water feature found for the given coordinates' }, { status: 404 });
    }

    const nearestFeature = nearestWaterFeatureResult.rows[0];
    const ogf_id = nearestFeature.ogf_id;

    console.log(`Nearest water feature ID: ${ogf_id}`);

    // Step 2: Filter individual points within 100 meters of the given lat/lng using ST_Distance
    const nearbyPointsQuery = `
                WITH points AS (
            SELECT (ST_DumpPoints(wkb_geometry)).geom AS point
            FROM watercourse_table
            WHERE ogf_id = $1
          )
          SELECT 
            ST_AsText(point) AS point, 
            ST_Distance(
              ST_Transform(point, 3857),  -- Transform dumped points to Web Mercator (for meters)
              ST_Transform(ST_SetSRID(ST_MakePoint($2, $3), 4326), 3857)  -- Transform your given point to Web Mercator
            ) AS distance
          FROM points
          WHERE ST_DWithin(
            ST_Transform(point, 3857),  -- Again, transform to 3857 for distance calculation
            ST_Transform(ST_SetSRID(ST_MakePoint($2, $3), 4326), 3857),  -- Transform your given point for comparison
            100  -- 100 meters
          );
    `;

    const nearbyPointsResult = await client.query(nearbyPointsQuery, [ogf_id, lng, lat]);


    // Step 3: Check if there are any nearby points
    if (nearbyPointsResult.rows.length === 0) {
      return NextResponse.json({ error: 'No points within 100 meters of the given lat and lng' }, { status: 404 });
    }

    const lineString = 'LINESTRING(' + nearbyPointsResult.rows.map(pointObj => pointObj.point.replace('POINT(', '').replace(')', '')).join(', ') + ')';
  
    const registerDeviceWaterway = `INSERT INTO devices (device_id, wkb_geometry, ogf_id) VALUES ($1, ST_SetSRID(ST_GeomFromText($2), 4326), $3)`;

    const deviceWaterwayResult = await client.query(registerDeviceWaterway, [deviceID, lineString, ogf_id]);

    console.log('deviceWaterwayResult: ', deviceWaterwayResult );

    await client.end();

    // Return success response with the filtered nearby points
    return NextResponse.json({ message: 'Nearby points found within 100 meters', lineString }, { status: 200 });
  } catch (error) {
    console.error('Error fetching nearby points:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby points', details: error.message }, { status: 500 });
  }
}

function parseWKT(wkt: string) {
  const coordsString = wkt.replace(/POINT\(|\)/g, '');
  const [lng, lat] = coordsString.split(' ').map(Number);
  return [lng, lat];
}



function getAlphaForLongitude(meters: number, latitude: number): number {
  const metersPerDegreeLat = 111000; // Approximate meters per degree of latitude
  
  // Convert latitude to radians
  const latRadians = (Math.PI / 180) * latitude;
  
  // Calculate the degree change for longitude based on the latitude
  const degreeChangeLongitude = meters / (metersPerDegreeLat * Math.cos(latRadians));
  
  return degreeChangeLongitude; // Return the degree difference for the given meters and latitude
}
