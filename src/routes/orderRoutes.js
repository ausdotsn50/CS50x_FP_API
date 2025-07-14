import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Route: /api/orders
router.get("/", async(req,res) => {
    try {
        const overview = await sql`
            SELECT customers.name, customers.address, products.item, products.base_price, products.quantity, products.type FROM orders
            JOIN customers ON orders.customer_id = customers.id
            JOIN products ON orders.product_id = products.id
        `;
        
        // Overview as a dict
        console.log(overview);
        console.log("Here are the orders made by our customer:", overview[0].name, "from address: ", overview[0].address);
        
        let total = 0;
        for (let i = 0; i < overview.length; i++) {
            console.log("Item #", i + 1, " ", overview[i].item);
            
            let actual_price;
            if (overview[i].type === "deliver") {
                actual_price = parseFloat(overview[i].base_price) + 5.00;
            }
            else {
                actual_price = overview[i].base_price;
            }

            let amt_to_pay = overview[i].quantity * actual_price;
            console.log("Amount to pay: ", amt_to_pay);
            total += amt_to_pay;
        }
        console.log("Total amount owed by ", overview[0].name, ":", total);


    } catch(error) {
        console.log("Error fetching all orders")
    }
});

// Able to fetch orders by user id
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await sql`
        SELECT * FROM orders WHERE user_id = ${userId}
        ORDER BY created_at DESC
    `;
    console.log("Successfully fetched orders from userId: ", userId);
    // adding response status
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders for userId:", error);
    res.status(500).send("Internal server error");
  }
});



router.post("/", async(req,res) => {
    // get the fields that user wants to send
    try {
        // id here is for sale.identification
        const { user_id, product_id, customer_id, quantity, type } = req.body;

        if(!user_id || !product_id || !customer_id || !quantity || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const order = await sql`
            INSERT INTO orders(user_id, product_id, customer_id, quantity, type)
            VALUES (${user_id}, ${product_id}, ${customer_id}, ${quantity}, ${type})
            RETURNING *
        `;
        console.log(order);
        res.status(201).json(order[0]);
    } catch(error) {
        // error posting a sale
        // server side error
        console.log("Error creating the order", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add fetching order via userId

export default router;