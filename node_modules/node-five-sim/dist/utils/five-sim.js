"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const five_sim_1 = require("../interfaces/five-sim");
class FiveSim {
    config;
    axiosInstance;
    token;
    constructor(config) {
        this.config = config;
        this.token = config.token;
        this.axiosInstance = axios_1.default.create({
            baseURL: (config.url || 'https://5sim.net/') + `v${config.version || '1'}`,
            validateStatus: () => true,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json'
            }
        });
    }
    async getUserProfile() {
        return this.request({ url: '/user/profile' });
    }
    async getUserOrders(params) {
        return this.request({ url: 'user/orders', params });
    }
    async getUserPayments(params) {
        return this.request({ url: 'user/payments', params });
    }
    async getProductsAndPrices(params) {
        return this.request({
            url: `guest/products/${params.country}/${params.operator}`
        });
    }
    async getPricesRequest(params) {
        return this.request({
            url: `guest/prices`, params
        });
    }
    async getPricesByCountry(country) {
        return this.getPricesRequest({ country });
    }
    async getPricesByProduct(product) {
        return this.getPricesRequest({ product });
    }
    async getPricesByCountryAndProduct(country, product) {
        return this.getPricesRequest({ product, country });
    }
    async purchase(country, product, operator, options) {
        return this.request({
            url: `user/buy/activation/${country}/${operator}/${product}`,
            params: options
        });
    }
    async purchaseCheapest(country, product, options) {
        const { operator } = await this.getCheapestPriceByCountryAndProduct(country, product);
        return await this.purchase(country, product, operator, options);
    }
    async getCheapestPriceByCountryAndProduct(country, product) {
        const services = await this.getPricesByCountryAndProduct(country, product);
        const [operator, data] = Object.entries(services[country][product])
            .reduce((prev, current) => prev ? (((current[1].cost < prev[1].cost && current[1].count) || !prev[1].count) ? current : prev) : current);
        return { operator, data };
    }
    async waitForCode(order_id, checkTime = 5000, timeout = 60 * 1000 * 5 // 5 minutes
    ) {
        if (checkTime < 5000) {
            console.warn('Check time below 5000ms is not recommended, but the rate limit is 100req/seconds');
        }
        return new Promise((resolve, reject) => {
            const check = async () => {
                const order = await this.getOrderManagement(order_id);
                if (order.status === five_sim_1.OrderStatuses.TIMEOUT) {
                    reject(new Error('Server side Timeout'));
                    return;
                }
                if (order.status === five_sim_1.OrderStatuses.FINISHED) {
                    reject(new Error('Finished Order'));
                    return;
                }
                if (order.status === five_sim_1.OrderStatuses.CANCELED) {
                    reject(new Error('Canceled Order'));
                    return;
                }
                if (order.status === five_sim_1.OrderStatuses.BANNED) {
                    reject(new Error('Banned Number'));
                    return;
                }
                if (!order.sms || order.sms.length == 0) {
                    setTimeout(check, checkTime);
                    return;
                }
                resolve(order.sms[0]);
            };
            setTimeout(check, checkTime);
            setTimeout(() => reject(new Error('Client-Side Timeout')), timeout);
        });
    }
    async buyHostingNumber(params) {
        return this.request({
            url: `user/buy/hosting/${params.country}/${params.operator}/${params.product}`
        });
    }
    async reBuyNumber(params) {
        return this.request({
            url: `user/reuse/${params.product}/${params.number}`
        });
    }
    async getOrderManagement(order_id) {
        return this.request({
            url: `user/check/${order_id}`
        });
    }
    async finishOrder(order_id) {
        return this.request({
            url: `user/finish/${order_id}`
        });
    }
    async cancelOrder(order_id) {
        return this.request({
            url: `user/cancel/${order_id}`
        });
    }
    async banOrder(order_id) {
        return this.request({
            url: `user/ban/${order_id}`
        });
    }
    async getSMSInboxList(order_id) {
        return this.request({
            url: `user/sms/inbox/${order_id}`
        });
    }
    async getNotifications(lang) {
        return this.request({
            url: `guest/flash/${lang}`
        });
    }
    async getVendors() {
        return this.request({
            url: `user/vendor`
        });
    }
    async getWalletsReserve() {
        return this.request({
            url: `vendor/wallets`
        });
    }
    async getVendorOrdersHistory(params) {
        return this.request({
            url: `vendor/orders`
        });
    }
    async getVendorPaymentsHistory(params) {
        return this.request({
            url: `vendor/payments`
        });
    }
    async createPayouts(data) {
        return this.request({
            url: `vendor/withdraw`,
            method: 'POST',
            data
        });
    }
    async getCountriesList() {
        return this.request({
            url: `guest/countries`
        });
    }
    async request(config) {
        try {
            const request = await this.axiosInstance(config);
            if (request.status >= 400 || (typeof request.data === 'string' && request.data.length > 0)) {
                throw new Error(request.data || ('Unknown Error with status code ' + request.status + ''));
            }
            return request.data;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = FiveSim;
