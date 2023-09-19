import express from "express";
import axios from "axios";
const app = express();
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.use(cors());

app.get("/insertIntoDB", async (req, res) => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const data = response.data;

    const top10Tickers = Object.values(data).map((ticker) => {
      return {
        name: ticker.name,
        last: parseFloat(ticker.last),
        buy: parseFloat(ticker.buy),
        sell: parseFloat(ticker.sell),
        volume: parseFloat(ticker.volume),
        base_unit: ticker.base_unit,
      };
    });

    // Sort the top 10 by buy value in descending order
    const sortedTop10Tickers = top10Tickers
      .sort((a, b) => b.buy - a.buy)
      .slice(0, 10);

    const client = await pool.connect();
    await client.query("DELETE FROM crypto");
    for (const ticker of sortedTop10Tickers) {
      const { name, last, buy, sell, volume, base_unit } = ticker;

      await client.query(
        "INSERT INTO crypto (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, last, buy, sell, volume, base_unit]
      );
    }
    client.release();
    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while inserting data into PostgreSQL.");
  }
});

// Define a route to fetch and process data
app.get("/fetchData", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM crypto");
    const data = result.rows;
    client.release();
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while fetching data from PostgreSQL.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
