const axios = require('axios');
const fs = require('fs');

axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5000')
  .then(response => {
    const data = response.data;
    fs.writeFileSync('price.json', JSON.stringify(data));
    console.log('Записано в файл price.json');
  })
  .catch(error => {
    console.log(error);
  });
