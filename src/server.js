// Default imports
import express from "express";
import dotenv from "dotenv";

// Specific imports from a module
import { sql } from "./config/db.js";

// Route imports
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";


dotenv.config();

const app = express(); // Initializing an ExpressJS app
app.use(express.json()); // A built-in middleware

const PORT = process.env.PORT || 5001; // Default port: 5001

// Initializing the database
async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            item VARCHAR(255) NOT NULL,
            base_price DECIMAL(10,2) NOT NULL
        )`;

        await sql`CREATE TABLE IF NOT EXISTS customers(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            address TEXT NOT NULL
        )`;

        await sql `CREATE TABLE IF NOT EXISTS orders(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            quantity INT NOT NULL,
            type VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
        
        // await sql`ALTER TABLE products RENAME COLUMN name TO item`;
        console.log("Database initialized succesfully");
    } catch(error) {
        console.log("Error initializing database", error);
        process.exit(1);
    }
}

// Connection with created routes
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);

// Calling the initialize database function
initDB().then(() => {
    // port listen only after initializing database
    app.listen(PORT, () =>  {
        console.log("Server is up and running on PORT: ", PORT);
    });
});
