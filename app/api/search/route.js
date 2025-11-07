export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "Bangkok";
  const limit = searchParams.get("limit") || 5;

  // ✅ Production endpoint
  const endpoint = "https://api.viator.com/partner/v2/products/search";

  try {
    const res = await fetch(`${endpoint}?text=${encodeURIComponent(q)}&count=${limit}&currency=USD&locale=en`, {
      headers: {
        "Accept": "application/json;version=2.0",
        "X-EXP-API-KEY": process.env.VIATOR_API_KEY, // 👈 CHỈ dùng đúng header này (chữ hoa)
      },
      cache: "no-store",
    });

    // Rate limit / lỗi API
    if (res.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
        { status: 429 }
      );
    }

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({
        error: "Viator API error",
        status: res.status,
        details: text
      }), { status: res.status });
    }

    const data = await res.json();

    // Gắn affiliate link
    const affiliateId = "P00249983";
    const tours = data?.data?.products?.map((p) => ({
      id: p.code,
      title: p.title,
      rating: p.reviewsStats?.averageRating || 0,
      price: p.pricingInfo?.formattedPrice || "N/A",
      image: p.images?.[0]?.variants?.[0]?.url || "",
      link: `https://www.viator.com/tours/${p.destination?.slug}/${p.code}?pid=${affiliateId}`,
    })) || [];

    return new Response(JSON.stringify({ results: tours }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Network error",
      details: error.message,
    }), { status: 500 });
  }
}
