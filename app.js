import express from 'express';
import axios from 'axios';
const app = express();
import cors from 'cors';
const PORT = process.env.PORT || 4000;

app.use(cors());

// Define a route to fetch and process data
app.get('/fetchData', async (req, res) => {
  try {
    // Fetch data using Axios
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    const top10Tickers = Object.values(data).map(ticker => {
        return {
          name: ticker.name,
          last: parseFloat(ticker.last),
          buy: parseFloat(ticker.buy),
          sell: parseFloat(ticker.sell),
          volume: parseFloat(ticker.volume),
          base_unit: ticker.base_unit
        };
      });
  
      // Sort the top 10 by buy value in descending order
      const sortedTop10Tickers = top10Tickers.sort((a, b) => b.buy - a.buy).slice(0, 10);

    res.json(sortedTop10Tickers);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching or processing data.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
