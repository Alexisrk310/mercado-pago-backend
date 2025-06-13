import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN,
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

    const items = itemsFromClient.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
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
      // 🔥 Agrega esta sección para aceptar todos los métodos y tipos de pago
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
      },
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
