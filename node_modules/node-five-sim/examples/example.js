const { config } = require('dotenv');
const { FiveSim } = require('../dist/index');

config();

(async () => {

  const country = 'russia'
  const product = 'microsoft'

  const fiveSim = new FiveSim({ token: process.env.TOKEN })

  try {
    const { balance } = await fiveSim.getUserProfile()

    console.log(`My balance is ${balance}`)

    const cheapest = await fiveSim.getCheapestPriceByCountryAndProduct(country, product)
    if (cheapest.data.cost > 55) {
      console.log(`I can't buy ${cheapest.operator} because it's too expensive. Service cost: ${serviceData.cost}`)
      return;
    }

    console.log(`Buying ${cheapest.operator} for ${cheapest.data.cost}`)

    const order = await fiveSim.purchase(country, product, cheapest.operator)
    const expires = (new Date(order.expires) - new Date(order.created_at)) / (60 * 1000);

    console.log(`Bought the number ${order.phone} for ${order.price}P. Will expire in ${expires} minutes`)

    const sms = await fiveSim.waitForCode(order.id)
    console.log('Received the code: ' + sms.code)
    await fiveSim.finishOrder(order.id)

  } catch (e) {
    console.log('Failed to receive the code, reason: ' + e.message)
  }
})()
