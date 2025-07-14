// creating connection to database
import "dotenv/config";

import {neon} from "@neondatabase/serverless";

// creates a sql connection using DB_URL
export const sql = neon(process.env.DATABASE_URL);