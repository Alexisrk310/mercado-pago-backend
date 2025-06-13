import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN,
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

      // ✅ Habilitar todos los métodos de pago (incluido PSE)
      payment_methods: {
        excluded_payment_types: [
          // No excluyas ninguno si quieres permitir PSE, tarjeta, QR, etc.
        ],
      },

      // ✅ Habilitar pago como invitado
      payer: {
        email: "guest@example.com", // Importante que NO sea una cuenta de Mercado Pago real
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
