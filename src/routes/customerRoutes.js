import express from "express";
import { sql } from "../config/db.js";

const router = express.Router(); // Router: api/customers

// Retrieves all the customers a particular user has
router.get("/:userId", async(req,res) => {
    try {
        const { userId } = req.params;
        const customers = await sql`
            SELECT id, name, address FROM customers
            WHERE user_id = ${userId};
        `;

        console.log("Successfully fetched customers of userId: ", userId);
        res.status(200).json(customers); // reponse status
    } catch(error) {
        console.error("Error fetching customers of userId: ", userId, ". Error is: ", error);
        res.status(500).send("Internal server error");
    }
});

// Route to add/create a new customer for a user
router.post("/", async(req,res) => {
  try{
    const { userId, name, address} = req.body;

    if(!userId || !name || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const addCustomer = await sql `
      INSERT INTO customers(user_id, name, address)
            VALUES (${userId}, ${name}, ${address})
            RETURNING *
    `;

    console.log("Successfully added a customer for userId: ", userId);
    res.status(200).json(addCustomer);
  } catch(error) {
    console.error("Error adding a customer for userId: ", userId, ". Error is: ", error);
    res.status(500).send("Internal server error");
  }
});

router.delete("/:id", async(req, res) => {
  try {
    const { id } = req.params;

    // checker for non-integer IDs to avoid crashing
    if(isNaN(parseInt(id))) {
      return res.status(400).json({ message : "Invalid customer ID"});
    }

    const result = await sql`
      DELETE FROM customers WHERE id = ${id} RETURNING *
    `;

    if(result.length === 0) {
      return res.status(404).json({ message: "Customer not found"});
    }
    res.status(200).json({ message: "Customer deleted successfully "});
  } catch(error) {
      console.error("Error deleting the customer: ", error);
      res.status(500).json({ message : "Internal server error"});
  }
});

export default router;