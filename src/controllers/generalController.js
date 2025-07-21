import { sql } from "../config/db.js";

export function deleteItemById(itemName) {
    return async function(req,res) {
        const capitalized = itemName.charAt(0).toUpperCase() + itemName.slice(1);
        const table = itemName + "s";

        const allowedTables = ['orders', 'customers', 'products'];
        if(!allowedTables.includes(table)) {
            return res.status(400).json({ message: "Invalid table" });
        }

        try {
            const { id } = req.params;

            // checker for non-integer IDs to avoid crashing
            if(isNaN(parseInt(id))) {
                return res.status(400).json({ message : `Invalid ${itemName} ID`});
            }

            const result = await sql.unsafe(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);

            if(result.length === 0) {
                return res.status(404).json({ message: `${capitalized} not found`});
            }
            res.status(200).json({ message: `${capitalized}  deleted successfully`});
        } catch(error) {
            console.error(`Error deleting the ${itemName} : `, error);
            res.status(500).json({ message : "Internal server error"});
        }
    }
}