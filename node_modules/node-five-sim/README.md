# Five Sim API for NodeJs - 5sim.net

A complete API wrapper for 5sim.net

## Installation

```bash
npm i @learxd/node-five-sim
```
or
```bash
npm i https://github.com/LearXD/five-sim
```

## Usage (complex)

```js
const { FiveSim } = require('node-five-sim');

const youAsyncFunction = async (country, product) => {
  const fiveSim = new FiveSim({ token: 'YOUR_TOKEN' })
  const services = await fiveSim.getPricesByCountryAndProduct()

  // random price services  
  const [operator, data] = Object.entries(services[country][product])[0]

  // buy number
  const order = await fiveSim.purchase(country, product, operator)

  // wait code
  const sms = await fiveSim.waitForCode(order.id)
  console.log('Received the code: ' + sms.code)

  // finish order
  fiveSim.finishOrder(order.id)
}

youAsyncFunction('russia', 'microsoft')
```

## Usage (simple)
  
```js
const { FiveSim } = require('node-five-sim');

const youAsyncFunction = async (country, product) => {
  const fiveSim = new FiveSim({ token: 'YOUR_TOKEN' })

  // auto select cheapest and purchase
  const order = await fiveSim.purchaseCheapest(country, product)

  // wait code
  const sms = await fiveSim.waitForCode(order.id)
  console.log('Received the code: ' + sms.code)

  // finish order
  await fiveSim.finishOrder(order.id)
}

youAsyncFunction('russia', 'microsoft')
```

## Credits
- Based on [5sim official API](https://5sim.net/docs/).

## Contributing
- Feel free to open issues and pull requests.

