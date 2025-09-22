const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * - Local (development): usa la cadena de conexión sin SSL.
 * - Producción (Render): requiere SSL con rejectUnauthorized: false.
 * *************** */
let pool

if (process.env.NODE_ENV === "development") {

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
} else {
  // Connection in production (Render or other cloud services)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

/* ***************
 * Export query helper
 * *************** */
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
}
