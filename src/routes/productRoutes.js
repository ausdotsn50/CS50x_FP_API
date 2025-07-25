import express from "express";
import { sql } from "../config/db.js";

const router = express.Router(); // Route: api/products

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

// Route to delete a product
router.delete("/:id", async(req, res) => {
  try {
    const { id } = req.params;

    // checker for non-integer IDs to avoid crashing
    if(isNaN(parseInt(id))) {
      return res.status(400).json({ message : "Invalid product ID"});
    }

    const result = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING *
    `;

    if(result.length === 0) {
      return res.status(404).json({ message: "Product not found"});
    }
    res.status(200).json({ message: "Product deleted successfully"});
  } catch(error) {
      console.error("Error deleting the product: ", error);
      res.status(500).json({ message : "Internal server error"});
  }
});

// Route to create a new product for a particular user
router.post("/", async(req,res) => {
  try {
    const {userId, item, base_price} = req.body;

    if(!userId || !item || !base_price) { // undefined === has not been given a value
      return res.status(400).json({ message : "All fields are required"});
    }

    const createNewProduct = await sql`
      INSERT INTO products(user_id, item, base_price)
        VALUES (${userId}, ${item}, ${base_price})
        RETURNING *
    `;

    console.log(createNewProduct[0])
    res.status(201).json(createNewProduct[0]);
  } catch(error) {  
    console.error("Error creating the product", error);
    res.status(500).json({ message: "Internal server error"});
  }
});

router.put("/", async(req,res) => {
  try {
    // add all fields required message
    
  } catch(error) {
    console.error("Error updating the product");
    res.status(500).json({ message: "Internal server error "});
  }
});

export default router;