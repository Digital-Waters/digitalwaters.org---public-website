import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Named export for the GET method
export async function GET(request: Request, { params }: { params: { device_id: string } }) {
  const deviceID = params.device_id.split(',').map(id => id.trim()); // Split the query param by comma and trim spaces

  const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: process.env.PG_PASS,
    database: "waterways",
  });

  await client.connect();


  try {
    // Prepare a query with placeholders for each OGF_ID
    const placeholders = deviceID.map((_, index) => `$${index + 1}`).join(', '); // Create placeholders for parameterized query
    const query = `SELECT device_id, ST_AsText(wkb_geometry) AS geojson FROM devices WHERE device_id IN (${placeholders})`;

    const result = await client.query(query, deviceID); // Execute query with OGF_IDs

    // If no results found, return a not found response
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No data found for the given OGF_IDs' }, { status: 404 });
    }
    // Map the results to the desired format
    const coordinates = result.rows.map(row => ({
      deviceID: row.device_id,
      geometry: parseWKT(row.geojson), // Parse each WKT to lng-lat format
    }));

    return NextResponse.json(coordinates); // Send the coordinates to the frontend
  } catch (error) {
    console.error("Error during query execution:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await client.end();
  }
}

// Function to parse WKT LINESTRING to an array of objects with lng and lat
function parseWKT(wkt: string) {
  const coordsString = wkt.replace(/LINESTRING\(|\)/g, '');
  const coordsArray = coordsString.split(',');

  const coordinates = coordsArray.map(coord => {
    const [lng, lat] = coord.trim().split(' ').map(Number);
    return { lng, lat };
  });

  return coordinates;
}
