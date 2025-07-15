import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Router: api/customers
router.post("/", async(req,res) => {
    try {
        
        const { user_id, name, address} = req.body; // add something for error handling

        const customer = await sql`
            INSERT INTO customers(user_id, name, address)
            VALUES (${user_id}, ${name}, ${address})
            RETURNING *
        `;
        console.log("Customer added successfully");
    } catch(error) {
        console.error("Post method for customers error");
    }
});

export default router;