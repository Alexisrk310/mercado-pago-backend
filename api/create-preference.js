// pages/api/create-preference.js
import mercadopago from "mercadopago";

// Configura tu token de acceso
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN, // Define ACCESS_TOKEN en Vercel como variable de entorno segura
});

export default async function handler(req, res) {
  // Configurar CORS para permitir solicitudes desde tu frontend
  res.setHeader("Access-Control-Allow-Origin", "https://landing-page-template-opal.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder preflight request (CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const itemsFromClient = req.body.items;

    // Validar formato
    if (!Array.isArray(itemsFromClient)) {
      return res.status(400).json({ error: "Formato de items inválido" });
    }

    // Transformar items al formato de Mercado Pago
    const items = itemsFromClient.map((item) => ({
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "COP",
    }));

    // Crear la preferencia de pago
    const preference = {
      items,
      back_urls: {
        success: "https://landing-page-template-opal.vercel.app/payment/success",
        failure: "https://landing-page-template-opal.vercel.app/payment/failure",
        pending: "https://landing-page-template-opal.vercel.app/payment/pending",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],      // Permitir todos los tipos de pago (tarjeta, efectivo, etc.)
        excluded_payment_methods: [],    // No excluir ningún método específico
      },
    };

    // Crear la preferencia usando Mercado Pago SDK
    const response = await mercadopago.preferences.create(preference);

    // Retornar la URL para redirigir al usuario al checkout
    return res.status(200).json({
      init_point: response.body.init_point, // Esta es la URL para redirigir al usuario
    });

  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error al crear preferencia" });
  }
}
