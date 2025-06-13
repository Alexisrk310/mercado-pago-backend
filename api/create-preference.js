import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN, // Tu Access Token (privado)
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://landing-page-template-opal.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const itemsFromClient = req.body.items;

    if (!Array.isArray(itemsFromClient)) {
      return res.status(400).json({ error: "Formato de items inválido" });
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
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      preferenceId: response.body.id,
    });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error al crear preferencia" });
  }
}
