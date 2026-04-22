import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers,
    });
  }

  const { password, data } = body;

  // Validate password
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers }
    );
  }

  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }

  if (!data || typeof data !== "object") {
    return new Response(
      JSON.stringify({ error: "Invalid data payload" }),
      { status: 400, headers }
    );
  }

  try {
    const store = getStore("portfolio-data");
    await store.setJSON("site-content", data);

    return new Response(
      JSON.stringify({ success: true, message: "Data saved successfully" }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error writing to Netlify Blobs:", err);
    return new Response(
      JSON.stringify({ error: "Failed to save data" }),
      { status: 500, headers }
    );
  }
};
