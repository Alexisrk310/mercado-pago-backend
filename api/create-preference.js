import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const items = req.body.items;

    const preference = {
      items: items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "COP",
      })),
      back_urls: {
        success: "https://landing-page-template-opal.vercel.app/payment/success",
        failure: "https://landing-page-template-opal.vercel.app/payment/failure",
        pending: "https://landing-page-template-opal.vercel.app/payment/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error al crear preferencia" });
  }
}
