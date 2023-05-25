const tf = require('@tensorflow/tfjs');
const fs = require('fs');

// Загрузка данных из файла price.json
const rawData = fs.readFileSync('price.json');
const data = JSON.parse(rawData).map(candle => ({
  open: parseFloat(candle.open),
  high: parseFloat(candle.high),
  low: parseFloat(candle.low),
  close: parseFloat(candle.close),
  volume: parseFloat(candle.volume),
}));

// Проверка, что массив данных не пустой
if (data.length === 0) {
  console.error('Data is empty');
  process.exit(1);
}

// Преобразование данных в тензоры
const inputTensor = tf.tensor(data.map(candle => [
  candle.open,
  candle.high,
  candle.low,
  candle.close,
  candle.volume,
]));
const outputTensor = tf.tensor(data.map(candle => [
  candle.close,
]));

// Создание модели нейросети
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, inputShape: [5], activation: 'relu' }));
model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

// Обучение модели на данных
model.fit(inputTensor, outputTensor, {
  epochs: 100,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      const percent = ((epoch + 1) / 100) * 100;
      console.log(`Epoch ${epoch + 1} completed (${percent.toFixed(2)}%)`);
    },
  },
})
  .then(() => {
    // Получение предсказаний для текущего часа
    const currentCandle = data[data.length - 1];
    const currentInput = tf.tensor([[
      currentCandle.open,
      currentCandle.high,
      currentCandle.low,
      currentCandle.close,
      currentCandle.volume,
    ]]);
    const currentPrediction = model.predict(currentInput).dataSync()[0];

    // Получение предсказаний для следующих 1, 4, 12 и 24 часов
    const nextPredictions = [];
    for (let i = 1; i <= 24; i++) {
      if (data.length - 1 + i >= data.length) {
        break;
      }
      const nextCandle = data[data.length - 1 + i];
      const nextInput = tf.tensor([[
        nextCandle.open,
        nextCandle.high,
        nextCandle.low,
        nextCandle.close,
        nextCandle.volume,
      ]]);
      const nextPrediction = model.predict(nextInput).dataSync()[0];
      nextPredictions.push(nextPrediction);
    }

    // Определение движения тренда относительно всех данных, данных 24, 12, 4 и текущего часа
    const trend = {
      all: currentPrediction > data[0].close ? 'up' : 'down',
      24: currentPrediction > data[data.length - 25].close ? 'up' : 'down',
      12: currentPrediction > data[data.length - 13].close ? 'up' : 'down',
      4: currentPrediction > data[data.length - 5].close ? 'up' : 'down',
      current: currentPrediction > currentCandle.close ? 'up' : 'down',
    };

    // Определение уровней поддержки и сопротивления для текущего направления движения
    const support = trend.current === 'up' ? currentCandle.low : currentCandle.high;
    const resistance = trend.current === 'up' ? currentCandle.high : currentCandle.low;

    // Определение уровней отскоков цен для текущего направления движения
    const bounce1 = trend.current === 'up' ? currentCandle.close * 0.98 : currentCandle.close * 1.02;
    const bounce2 = trend.current === 'up' ? currentCandle.close * 0.96 : currentCandle.close * 1.04;

    // Создание предсказания будущего движения для последующих 1, 4, 12, 24 часов с ценами
    const predictions = nextPredictions.map((prediction, index) => ({
      hours: (index + 1),
      price: prediction,
    }));

    console.log('Trend:', trend);
    console.log('Support:', support);
    console.log('Resistance:', resistance);
    console.log('Bounce levels:', bounce1, bounce2);
    console.log('Predictions:', predictions);
  })
  .catch(error => {
    console.error(error);
  });
