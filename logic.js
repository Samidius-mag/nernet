const fs = require('fs');
const theano = require('theano');
const _ = require('lodash');

// Загрузка данных из файла price.json
const rawData = fs.readFileSync('price.json');
const data = JSON.parse(rawData);

// Преобразование данных в формат, который можно использовать для обучения нейросети
const input = [];
const output = [];

for (let i = 0; i < data.length - 1; i++) {
  const currentCandle = data[i];
  const nextCandle = data[i + 1];

  const speed = (nextCandle.close - currentCandle.close) / currentCandle.close;
  const volume = currentCandle.volume;

  input.push([speed, volume]);

  if (speed > 0) {
    output.push([1, 0, 0]); // Восходящий тренд
  } else if (speed < 0) {
    output.push([0, 1, 0]); // Нисходящий тренд
  } else {
    output.push([0, 0, 1]); // Боковой тренд
  }
}

// Создание и обучение нейросети
const X = theano.tensor.matrix('X');
const y = theano.tensor.matrix('y');

const numInputs = 2;
const numHidden = 5;
const numOutputs = 3;

const W1 = theano.shared(_.random(-1, 1, [numInputs, numHidden]));
const b1 = theano.shared(_.random(-1, 1, [numHidden]));
const W2 = theano.shared(_.random(-1, 1, [numHidden, numOutputs]));
const b2 = theano.shared(_.random(-1, 1, [numOutputs]));

const hidden = theano.tensor.nnet.sigmoid(theano.tensor.dot(X, W1) + b1);
const output = theano.tensor.nnet.softmax(theano.tensor.dot(hidden, W2) + b2);

const cost = theano.tensor.nnet.categorical_crossentropy(output, y).mean();
const params = [W1, b1, W2, b2];
const gradients = theano.tensor.grad(cost, params);
const updates = _.zipObject(params, _.map(gradients, gradient => gradient * 0.1));

const train = theano.function([X, y], cost, { updates });

for (let i = 0; i < 1000; i++) {
  const cost = train(input, output);
  console.log(`Эпоха ${i + 1}, стоимость ${cost}`);
}

// Определение движения тренда и уровней поддержки и сопротивления
const lastCandle = data[data.length - 1];
const speed = (lastCandle.close - data[data.length - 2].close) / data[data.length - 2].close;
const volume = lastCandle.volume;

const prediction = theano.function([X], output);
const result = prediction([[speed, volume]]);

if (result[0][0] > result[0][1] && result[0][0] > result[0][2]) {
  console.log('Восходящий тренд');
} else if (result[0][1] > result[0][0] && result[0][1] > result[0][2]) {
  console.log('Нисходящий тренд');
} else {
  console.log('Боковой тренд');
}

const monthlyHigh = _.maxBy(data, 'high').high;
const monthlyLow = _.minBy(data, 'low').low;
const dailyHigh = _.maxBy(data.slice(data.length - 24), 'high').high;
const dailyLow = _.minBy(data.slice(data.length - 24), 'low').low;

const resistance = Math.max(monthlyHigh, dailyHigh);
const support = Math.min(monthlyLow, dailyLow);

console.log(`Уровень сопротивления: ${resistance}`);
console.log(`Уровень поддержки: ${support}`);
