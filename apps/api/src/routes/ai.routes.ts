import { Router } from "express";

export const aiRoutes = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4100";

// Helper function to proxy requests to the Python service
async function proxyRequest(req: any, res: any, path: string, method: string = "GET", headers: any = {}) {
  try {
    const url = `${AI_SERVICE_URL}${path}`;
    
    // Set headers (forward content-type, auth etc.)
    const requestHeaders: Record<string, string> = {};
    if (req.headers["content-type"]) {
      requestHeaders["content-type"] = req.headers["content-type"];
    }
    if (req.headers["authorization"]) {
      requestHeaders["authorization"] = req.headers["authorization"];
    }
    
    // For POST/PATCH, forward the body.
    let requestBody: any = undefined;
    if (method === "POST" || method === "PATCH") {
      requestBody = JSON.stringify(req.body);
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: requestBody,
    };

    const response = await fetch(url, fetchOptions);
    const data = await response.json().catch(() => null);

    res.status(response.status).json(data || { error: "Failed to parse service response" });
  } catch (err: any) {
    console.error(`AI Proxy error for ${path}:`, err);
    res.status(500).json({ error: "AI microservice unreachable", details: err.message });
  }
}

// 1. Virtual Try-On
aiRoutes.post("/tryon", async (req, res) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    try {
      const url = `${AI_SERVICE_URL}/api/tryon`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": req.headers["content-type"] || "",
        },
        duplex: "half",
        body: req as any,
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: "Try-On proxy failure", details: err.message });
    }
  }
  await proxyRequest(req, res, "/api/tryon", "POST");
});

// 1a. Virtual Try-On Status
aiRoutes.get("/tryon/status/:jobId", async (req, res) => {
  await proxyRequest(req, res, `/api/tryon/status/${req.params.jobId}`, "GET");
});

// 1b. Virtual Try-On Result
aiRoutes.get("/tryon/result/:jobId", async (req, res) => {
  try {
    const url = `${AI_SERVICE_URL}/api/tryon/result/${req.params.jobId}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch result from AI service" });
    }
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).json({ error: "Result fetch error", details: err.message });
  }
});

// 2. Review & Fit Summarization
aiRoutes.get("/reviews/summary/:id", async (req, res) => {
  await proxyRequest(req, res, `/api/reviews/summary/${req.params.id}`, "GET");
});

// 3. Personalized Recommendations
aiRoutes.get("/recommendations/:id", async (req, res) => {
  await proxyRequest(req, res, `/api/recommendations/${req.params.id}`, "GET");
});

// 4. AI Shopping Assistant Chatbot
aiRoutes.post("/chat", async (req, res) => {
  await proxyRequest(req, res, "/api/chat", "POST");
});

// 5. Visual Search (handles file upload)
aiRoutes.post("/search/visual", async (req, res) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    try {
      const url = `${AI_SERVICE_URL}/api/search/visual`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": req.headers["content-type"] || "",
        },
        duplex: "half",
        body: req as any,
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: "Visual search proxy failure", details: err.message });
    }
  }
  await proxyRequest(req, res, "/api/search/visual", "POST");
});

// 6. Size & Fit Predictor
aiRoutes.post("/fit", async (req, res) => {
  await proxyRequest(req, res, "/api/fit", "POST");
});
