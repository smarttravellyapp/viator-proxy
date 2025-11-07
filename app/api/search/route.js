export default async function handler(req, res) {
  const { q } = req.query;
  const apiKey = "99628d91-0d10-47c0-9ac9-3444c5961757"; // 🔑 API key thật của bạn

  try {
    const response = await fetch(
      `https://api.viator.com/partner/v1/search/products?text=${encodeURIComponent(q)}&currency=USD&locale=en`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json;version=2.0",
          "X-EXP-API-KEY": apiKey,
        },
      }
    );

    // Nếu Viator trả lỗi
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "Viator API error",
        details: text,
      });
    }

    // Trả dữ liệu JSON
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Internal proxy error",
      details: error.message,
    });
  }
}
