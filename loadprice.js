const axios = require('axios');
const fs = require('fs');

const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5000';

axios.get(url)
  .then(response => {
    const data = response.data.map(candle => ({
     
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
      
      
    }));

    fs.writeFile('price.json', JSON.stringify(data), err => {
      if (err) throw err;
      console.log('Записано');
    });
  })
  .catch(error => {
    console.error(error);
  });
