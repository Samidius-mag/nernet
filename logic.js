const tf = require('@tensorflow/tfjs');
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
model.fit(xs, ys, { epochs: 10 })
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
    const monthTrend = getTrend(getPrediction(monthData));
    const dayTrend = getTrend(getPrediction(dayData));
    const currentTrend = getTrend(prediction);

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

// Функция для получения предсказания нейросети на основе массива данных
function getPrediction(data) {
  const inputs = data.map((candle, index) => {
    if (index === data.length - 1) {
      return null;
    }
    const currentCandle = candle;
    const nextCandle = data[index + 1];
    const speed = nextCandle.close - currentCandle.close;
    const volume = nextCandle.volume;
    return [speed, volume];
  }).filter(input => input !== null);

  const xs = tf.tensor2d(inputs);
  const prediction = model.predict(xs);
  return prediction;
}
