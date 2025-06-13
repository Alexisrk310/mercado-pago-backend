import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN, // Asegúrate de tener tu token configurado en Vercel
});

export default async function handler(req, res) {
  // Configurar CORS para permitir solicitudes desde tu frontend
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
    const items = req.body.items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "COP", // Puedes cambiar a "USD" si aplica
    }));

    const amount = items.reduce((total, item) => total + item.unit_price * item.quantity, 0);

    const preference = {
      items,
      back_urls: {
        success: "https://landing-page-template-opal.vercel.app/cart",
        failure: "https://landing-page-template-opal.vercel.app/cart",
        pending: "https://landing-page-template-opal.vercel.app/cart",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      init_point: response.body.init_point,
      preference_id: response.body.id,
      amount,
    });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error al crear preferencia" });
  }
}
