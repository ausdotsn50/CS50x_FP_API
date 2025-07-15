import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

router.post("/", async(req,res) => {
    try {
        const { user_id, item, base_price } = req.body; // add something for error handling
        
        const product = await sql`
            INSERT INTO products(user_id, item, base_price)
            VALUES (${user_id}, ${item}, ${base_price})
            RETURNING *
        `;
        console.log(product);
        console.log("Product added successfully");
    } catch(error) {    
        console.error("Post method for products error");
    }
});

export default router;