const { FiveSim } = require('../dist/index');

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