import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN, // ⚠️ Asegúrate de tener esto en Vercel
});

export default async function handler(req, res) {
  // CORS config
  res.setHeader("Access-Control-Allow-Origin", "https://landing-page-template-opal.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const itemsFromClient = req.body.items;

    if (!Array.isArray(itemsFromClient) || itemsFromClient.length === 0) {
      return res.status(400).json({ error: "Debes enviar al menos un producto válido." });
    }

    const items = itemsFromClient.map((item) => ({
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "COP",
    }));

    const preference = {
      items,
      back_urls: {
        success: "https://landing-page-template-opal.vercel.app/payment/success",
        failure: "https://landing-page-template-opal.vercel.app/payment/failure",
        pending: "https://landing-page-template-opal.vercel.app/payment/pending",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" },         // ❌ Excluye pagos en efectivo (si lo deseas)
          { id: "bank_transfer" },  // ❌ Excluye transferencias (opcional)
        ],
      },
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      preferenceId: response.body.id,
    });
  } catch (error) {
    console.error("Error al crear preferencia:", error);

    const message =
      error?.response?.body?.message ||
      error?.message ||
      "Error desconocido al crear preferencia.";

    return res.status(500).json({ error: message });
  }
}
