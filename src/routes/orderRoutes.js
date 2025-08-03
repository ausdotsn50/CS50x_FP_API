import express from "express";
import { sql } from "../config/db.js";

const router = express.Router(); // Route: /api/orders

// Route to get all orders of particular user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersPUser = await sql`
        SELECT orders.id, name, address, item, type,
            total_price, created_at FROM orders
            JOIN customers ON orders.customer_id = customers.id
            JOIN products ON orders.product_id = products.id
            WHERE orders.user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 50
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
      SELECT SUM(total_price) AS rev
      FROM orders
        WHERE orders.user_id = ${userId} AND created_at::date = CURRENT_DATE
    `;
    
    const deliverCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${dString} AND user_id = ${userId} AND created_at::date = CURRENT_DATE
    `;

    const walkinCount = await sql`
        SELECT COUNT(*) FROM orders WHERE type = ${wString} AND user_id = ${userId} AND created_at::date = CURRENT_DATE
    `;

    const trcQuery = await sql`
      SELECT name, address, quantity, item, total_price AS rev
      FROM orders
        JOIN customers ON orders.customer_id = customers.id
        JOIN products ON orders.product_id = products.id
        WHERE orders.user_id = ${userId} AND created_at::date = CURRENT_DATE
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
    res.status(204).json({ message: "Order deleted successfully"});
  } catch(error) {
      console.error("Error deleting the order: ", error);
      res.status(500).json({ message : "Internal server error"});
  }
});

// Create orders for a particular user
router.post("/", async(req,res) => {
  try {
    const {userId, product_id, customer_id, quantity, type} = req.body;
    let total_price;

    if(!userId || !product_id || !customer_id || quantity === undefined || !type) {
      return res.status(400).json({ message : "All fields are required"});
    }

    const prodPrice = await sql`
      SELECT base_price FROM products WHERE id=${product_id}
    `;

    const price = parseFloat(prodPrice[0].base_price);

    if(type === "deliver") {
      total_price = (price + 5.00) * quantity;
    }
    else {
      total_price = price * quantity;
    }

    const createNewOrder = await sql`
      INSERT INTO orders(user_id, product_id, customer_id, quantity, type, total_price)
        VALUES (${userId}, ${product_id}, ${customer_id}, ${quantity}, ${type}, ${total_price})
        RETURNING *
    `;

    console.log(total_price);
    // console.log(createNewOrder[0])
    res.status(201).json(createNewOrder[0]);
  } catch(error) {
    console.error("Error creating the order", error);
    res.status(500).json({ message: "Internal server error" });
  } 
});

export default router;