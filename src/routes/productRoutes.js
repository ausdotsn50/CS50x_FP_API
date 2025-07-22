import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Retrieves all products owned by a user
router.get("/:userId", async(req,res) => {
    try {
        const { userId } = req.params;

        const products = await sql`
            SELECT id, item, base_price FROM products
            WHERE user_id = ${userId}
        `;

        // Success message
        console.log("Successfully fetched products from userId: ", userId);
        res.status(200).json(products);
    } catch(error) {
        console.error("Error fetching products for userId: ", userId, ". Error is: ", error);
        res.status(500).send("Internal server error");
    }
});

export default router;