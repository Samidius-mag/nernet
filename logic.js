const tf = require('@tensorflow/tfjs');
const fs = require('fs');

// Прочитайте данные из файла price.json и преобразуйте их в массив, который можно использовать для обучения нейросети TensorFlow.js.

const data = JSON.parse(fs.readFileSync('price.json', 'utf8'));

// Преобразуйте данные из строковых значений в числовые значения

const prices = data.map(candle => [parseFloat(candle[1]), parseFloat(candle[2])]);

// Создайте tensor из массива
const tensorData = tf.tensor2d(prices);



// Обучаем модель (2 слоя и 1 выходной результат)
const model = tf.sequential();
model.add(tf.layers.dense({units: 32, inputShape: [2],activation: 'relu'}));
model.add(tf.layers.dense({units: 1}));
model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
model.fit(tensorData, tensorData, {epochs: 10});

// Получаем предсказанные значения
const predictedValues = model.predict(tensorData);


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
