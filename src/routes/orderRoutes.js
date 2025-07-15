import express from "express";
import { sql } from "../config/db.js";

const router = express.Router(); // Route: /api/orders

// Able to fetch orders by user id
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersPUser = await sql`
        SELECT customers.name, customers.address, products.item, products.type, 
            products.base_price, products.quantity, orders.created_at FROM orders

            JOIN customers ON orders.customer_id = customers.id
            JOIN products ON orders.product_id = products.id
            WHERE orders.user_id = ${userId}
    `;

    console.log("Successfully fetched orders from userId: ", userId);
    res.status(200).json(orders); // reponse status
  } catch (error) {
    console.error("Error fetching orders for userId: ", userId, ". Error is: ", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const dString = "deliver";
    const wString = "walk in";

    const deliverCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${dString} AND created_at = CURRENT_DATE
    `;

    const walkinCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${wString} AND created_at = CURRENT_DATE
    `;

    console.log("Successfully fetched summary of from userId: ", userId);
    res.status(200).json({
        revenue: 100.00,
        deliver: deliverCount[0].type,
        walkins: walkinCount[0].type,
    }); // response status
  } catch (error) {
    console.error("Error fetching summary of orders for userId: ", userId, ". Error is: ", error);
    res.status(500).send("Internal server error");
  }
});

export default router;