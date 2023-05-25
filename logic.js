const tf = require('@tensorflow/tfjs');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('price.json', 'utf8'));

// Отдельно извлекаем входные и выходные данные
const [input, output] = data.reduce(([inputs, outputs], [date, open, high, low, close]) => {
  return [
    [...inputs, [open, high, low, close]],
    [...outputs, [close]],
  ];
}, [[], []]);

// Создайте tensor из массивов
const inputs = tf.tensor2d(input);
const outputs = tf.tensor2d(output);

// Создаем модель и компилируем ее
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, inputShape: [4], activation: 'relu' }));
model.add(tf.layers.dense({ units: 1 }));
model.compile({ optimizer: 'adam', loss: tf.losses.meanSquaredError });

// Обучаем модель
async function train() {
  const history = await model.fit(inputs, outputs, { epochs: 100, batchSize: 32 });
  console.log(history);
}
train();


// Определение движения тренда, уровней поддержки и сопротивления и текущего тренда

// Получаем предсказанные значения
const predictedValuesData = Array.from(predictedValues.dataSync());
const candles = data.map((candle, index) => {
    const [openPrice, closePrice] = candle;
    return {
        openPrice,
        closePrice,
        predictedPrice: predictedValuesData[index],
    };
});

// Определяем движение тренда
const closePrices = data.map(candle => candle[4]);
const currentPrice = closePrices[closePrices.length - 1];
const currentPredictedPrice = predictedValuesData[predictedValuesData.length - 1];
const trend = currentPredictedPrice > currentPrice ? 'восходящий' : 'нисходящий';

// Определение уровней поддержки и сопротивления
const maxPrice = Math.max(...closePrices);
const minPrice = Math.min(...closePrices);
const resistanceLevel = maxPrice * 1.1;
const supportLevel = minPrice * 0.9;

// Определение месячного, дневного и текущего тренда
const monthAgoClosePrices = closePrices.slice(0, 720);
const monthAgoPredictedPrices = predictedValuesData.slice(0, 720);
const monthAgoTrend = getTrend(monthAgoClosePrices, monthAgoPredictedPrices);
const dayAgoClosePrices = closePrices.slice(-24);
const dayAgoPredictedPrices = predictedValuesData.slice(-24);
const dayAgoTrend = getTrend(dayAgoClosePrices, dayAgoPredictedPrices);
const currentTrend = trend;

// Функция для определения движения тренда
function getTrend(closePrices, predictedPrices) {
    const currentPrice = closePrices[closePrices.length - 1];
    const currentPredictedPrice = predictedPrices[predictedPrices.length - 1];
    return currentPredictedPrice > currentPrice ? 'восходящий' : 'нисходящий';
}

console.log('Движение тренда:', trend);
console.log('Уровень поддержки:', supportLevel);
console.log('Уровень сопротивления:', resistanceLevel);
console.log('Месячный тренд:', monthAgoTrend);
console.log('Дневной тренд:', dayAgoTrend);
console.log('Текущий тренд:', currentTrend);
