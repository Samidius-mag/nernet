/*const tf = require('@tensorflow/tfjs');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('price.json'));

// Создаем массивы данных для обучения
const inputs = [];
const outputs = [];

for (let i = 0; i < data.length - 1; i++) {
  const currentCandle = data[i];
  const nextCandle = data[i + 1];

  const speed = nextCandle.close - currentCandle.close;
  const volume = nextCandle.volume;

  inputs.push([speed, volume]);

  if (speed > 0) {
    outputs.push([1, 0, 0]); // Восходящий тренд
  } else if (speed < 0) {
    outputs.push([0, 1, 0]); // Нисходящий тренд
  } else {
    outputs.push([0, 0, 1]); // Боковой тренд
  }
}

// Создаем модель нейросети
const model = tf.sequential();
model.add(tf.layers.dense({ units: 2, inputShape: [2] }));
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
model.compile({ optimizer: 'sgd', loss: 'categoricalCrossentropy' });

// Обучаем модель на данных
const xs = tf.tensor2d(inputs);
const ys = tf.tensor2d(outputs);
model.fit(xs, ys, { epochs: 54 })
  .then(() => {
    // Используем модель для предсказания тренда
    const lastCandle = data[data.length - 1];
    const currentSpeed = lastCandle.close - data[data.length - 2].close;
    const currentVolume = lastCandle.volume;
    const prediction = model.predict(tf.tensor2d([[currentSpeed, currentVolume]]));
    const trend = getTrend(prediction);

    // Определяем уровни поддержки и сопротивления
    const monthData = data.slice(-720); // 720 часов = 30 дней
    const weekData = data.slice(-168); // 168 часов = 7 дней
    const dayData = data.slice(-24); // 24 часа = 1 день
    const currentHourData = data.slice(-4); // 4 часа = текущий час

    const monthSupport = getSupport(monthData);
    const monthResistance = getResistance(monthData);
    const weekSupport = getSupport(weekData);
    const weekResistance = getResistance(weekData);
    const daySupport = getSupport(dayData);
    const dayResistance = getResistance(dayData);
    const currentHourSupport = getSupport(currentHourData);
    const currentHourResistance = getResistance(currentHourData);

    // Определяем тренды
    const monthTrend = getTrend(getPrediction(monthData, 0));
    const dayTrend = getTrend(getPrediction(dayData, 0));
    const currentTrend = getTrend(prediction);

    // Получаем предсказание тренда на 1, 4, 12 и 24 часа
    const prediction1h = getPrediction(data.slice(-24), 0);
    const prediction4h = getPrediction(data.slice(-96), 0);
    const prediction12h = getPrediction(data.slice(-288), 0);
    const prediction24h = getPrediction(data.slice(-576), 0);

    console.log('Тренд:', trend);
    console.log('Месячный уровень поддержки:', monthSupport);
    console.log('Месячный уровень сопротивления:', monthResistance);
    console.log('Недельный уровень поддержки:', weekSupport);
    console.log('Недельный уровень сопротивления:', weekResistance);
    console.log('Дневной уровень поддержки:', daySupport);
    console.log('Дневной уровень сопротивления:', dayResistance);
    console.log('Текущий четырехчасовой уровень поддержки:', currentHourSupport);
    console.log('Текущий четырехчасовой уровень сопротивления:', currentHourResistance);
    console.log('Месячный тренд:', monthTrend);
    console.log('Дневной тренд:', dayTrend);
    console.log('Текущий тренд:', currentTrend);
    console.log('Тренд на 1 час:', getTrend(prediction1h));
    console.log('Тренд на 4 часа:', getTrend(prediction4h));
    console.log('Тренд на 12 часов:', getTrend(prediction12h));
    console.log('Тренд на 24 часа:', getTrend(prediction24h));
  })
  .catch(error => {
    console.error(error);
  });

// Функция для определения тренда на основе предсказания нейросети
function getTrend(prediction) {
  const values = prediction.dataSync();
  const maxIndex = values.indexOf(Math.max(...values));
  if (maxIndex === 0) {
    return 'Восходящий';
  } else if (maxIndex === 1) {
    return 'Нисходящий';
  } else {
    return 'Боковой';
  }
}

// Функция для определения уровня поддержки на основе минимального значения цены
function getSupport(data) {
  const prices = data.map(candle => candle.low);
  const minPrice = Math.min(...prices);
  return minPrice;
}

// Функция для определения уровня сопротивления на основе максимального значения цены
function getResistance(data) {
  const prices = data.map(candle => candle.high);
  const maxPrice = Math.max(...prices);
  return maxPrice;
}

// Функция для получения предсказания нейросети на основе массива данных и временного интервала
function getPrediction(data, interval) {
  const inputs = data.map((candle, index) => {
    if (index === data.length - 1) {
      return null;
    }
    const currentCandle = candle;
    const nextCandle = data[index + 1 + interval];
    if (!nextCandle) {
      return null;
    }
    const speed = nextCandle.close - currentCandle.close;
    const volume = nextCandle.volume;
    return [speed, volume];
  }).filter(input => input !== null);

  const xs = tf.tensor2d(inputs);
  const prediction = model.predict(xs);
  return prediction;
}
*/
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
model.fit(inputTensor, outputTensor, { epochs: 54 })
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
