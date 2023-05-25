const axios = require('axios');
const fs = require('fs');

const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5000';

axios.get(url)
  .then(response => {
    const data = response.data.map(candle => ({
     
      open: candle[0],
      high: candle[1],
      low: candle[2],
      close: candle[3],
      volume: candle[4],
      
      
    }));

    fs.writeFile('price.json', JSON.stringify(data), err => {
      if (err) throw err;
      console.log('Записано');
    });
  })
  .catch(error => {
    console.error(error);
  });
