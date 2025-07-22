import express from "express";
import { sql } from "../config/db.js";

const router = express.Router(); // Route: /api/orders
const dateToday = new Date();
// setting to a different date
// dateToday.setDate(dateToday.getDate() + 1);

// Route to get all orders of particular user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersPUser = await sql`
        SELECT orders.id, name, address, item, type,
            base_price, quantity, created_at FROM orders
            JOIN customers ON orders.customer_id = customers.id
            JOIN products ON orders.product_id = products.id
            WHERE orders.user_id = ${userId}
    `;

    console.log("Successfully fetched orders from userId: ", userId);
    res.status(200).json(ordersPUser); // reponse status
  } catch (error) {
    console.error("Error fetching orders for userId: ", userId, ". Error is: ", error);
    res.status(500).send("Internal server error");
  }
});

// Route to get the summary of orders of particular user
// summary restricted for today
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const dString = "deliver";
    const wString = "walk in";
    
    const revTotal = await sql`
      SELECT SUM((base_price + 
        CASE WHEN type = ${dString} 
          THEN 5 
          ELSE 0
        END) * quantity) AS rev
      FROM orders
        JOIN customers ON orders.customer_id = customers.id
        JOIN products ON orders.product_id = products.id
        WHERE orders.user_id = ${userId} AND created_at = ${dateToday}
    `;
    
    const deliverCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${dString} AND user_id = ${userId} AND created_at = ${dateToday}
    `;

    const walkinCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${wString} AND user_id = ${userId} AND created_at = ${dateToday}
    `;

    const trcQuery = await sql`
      SELECT name, address, quantity, item, ((base_price + 
        CASE WHEN type = ${dString} 
          THEN 5 
          ELSE 0
        END) * quantity) AS rev
      FROM orders
        JOIN customers ON orders.customer_id = customers.id
        JOIN products ON orders.product_id = products.id
        WHERE orders.user_id = ${userId} AND created_at = ${dateToday}
      ORDER by rev DESC
      LIMIT 1
    `;

    const trc = trcQuery[0] ?? [{
      name: '',
      address: '',
      item: '',
      quantity: 0,
      rev: 0,
    }];

    console.log("Successfully fetched summary of from userId: ", userId);
    res.status(200).json({
        revenue: revTotal,
        delivers: deliverCount,
        walkins: walkinCount,
        topRevContri: trc,
    }); // response status
  } catch (error) {
    console.error("Error fetching summary of orders for userId: ", userId, ". Error is: ", error);
    res.status(500).send("Internal server error");
  }
});

// Route to delete an order
router.delete("/:id", async(req, res) => {
  try {
    const { id } = req.params;

    // checker for non-integer IDs to avoid crashing
    if(isNaN(parseInt(id))) {
      return res.status(400).json({ message : "Invalid order ID"});
    }

    const result = await sql`
      DELETE FROM orders WHERE id = ${id} RETURNING *
    `;

    if(result.length === 0) {
      return res.status(404).json({ message: "Order not found"});
    }
    res.status(200).json({ message: "Order deleted successfully "});
  } catch(error) {
      console.error("Error deleting the order: ", error);
      res.status(500).json({ message : "Internal server error"});
  }
});

// Create orders for a particular user
router.post("/", async(req,res) => {
  try {
    const {userId, product_id, customer_id, quantity, type} = req.body;

    if(!userId || !product_id || !customer_id || quantity === undefined) {
      return res.status(400).json({ message : "All fields are required"});
    }

    const createNewOrder = await sql`
      INSERT INTO orders(user_id, product_id, customer_id, quantity, type)
        VALUES (${userId}, ${product_id}, ${customer_id}, ${quantity}, ${type})
        RETURNING *
    `;

    console.log(createNewOrder[0])
    res.status(201).json(createNewOrder[0]);
  } catch(error) {
    console.error("Error creating the order", error);
    res.status(500).json({ message: "Internal server error" });
  } 
});

export default router;