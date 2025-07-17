import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Router: api/customers

// customer route temp ok
// To do: finish search/filter functionality
router.get("/:userId", async(req,res) => {
    try {
        const { userId } = req.params;
        const customers = await sql`
            SELECT name, address FROM customers
            WHERE user_id = ${userId};
        `;

        console.log("Successfully fetched customers of userId: ", userId);
        res.status(200).json(customers); // reponse status
    } catch(error) {
        console.error("Error fetching customers of userId: ", userId, ". Error is: ", error);
        res.status(500).send("Internal server error");
    }
});

export default router;