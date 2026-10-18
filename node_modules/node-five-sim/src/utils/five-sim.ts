import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  IBuyHostingNumberParam,
  ICreatePayoutsParam,
  IEmptyResponse,
  INotificationsResponse,
  IPaymentHistoryParam,
  IPaymentHistoryResponse,
  IPricesByCountryRequest,
  IPricesRequestResponse,
  IProductsAndPricesRequest,
  IProductsAndPricesResponse,
  IPurchaseOptionsParam,
  IPurchaseResponse,
  IReBuyNumberParam,
  ISMS,
  IUserOrderParam,
  IUserOrderResponse,
  IUserProfileResponse,
  IVendorResponse,
  IWalletsReserveResponse,
  OrderStatuses
} from '../interfaces/five-sim';

export interface IFiveSim {
  token: string;
  version?: string;
  url?: string;
}

export default class FiveSim {

  private axiosInstance: AxiosInstance

  private token: string;

  constructor(readonly config: IFiveSim) {
    this.token = config.token;
    this.axiosInstance = axios.create({
      baseURL: (config.url || 'https://5sim.net/') + `v${config.version || '1'}`,
      validateStatus: () => true,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });
  }

  public async getUserProfile() {
    return this.request<IUserProfileResponse>({ url: '/user/profile' });
  }

  public async getUserOrders(params: IUserOrderParam) {
    return this.request<IUserOrderResponse>({ url: 'user/orders', params });
  }

  public async getUserPayments(params?: IPaymentHistoryParam) {
    return this.request<IPaymentHistoryResponse>({ url: 'user/payments', params });
  }

  public async getProductsAndPrices(params?: IProductsAndPricesRequest) {
    return this.request<IProductsAndPricesResponse>({
      url: `guest/products/${params.country}/${params.operator}`
    });
  }

  public async getPricesRequest(params?: IPricesByCountryRequest) {
    return this.request<IPricesRequestResponse>({
      url: `guest/prices`, params
    });
  }

  public async getPricesByCountry(country: string) {
    return this.getPricesRequest({ country })
  }

  public async getPricesByProduct(product: string) {
    return this.getPricesRequest({ product })
  }

  public async getPricesByCountryAndProduct(country: string, product: string) {
    return this.getPricesRequest({ product, country })
  }

  public async purchase(
    country: string,
    product: string,
    operator: string,
    options?: IPurchaseOptionsParam
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/buy/activation/${country}/${operator}/${product}`,
      params: options
    });
  }

  public async purchaseCheapest(
    country: string,
    product: string,
    options?: IPurchaseOptionsParam
  ) {
    const { operator } = await this.getCheapestPriceByCountryAndProduct(country, product);
    return await this.purchase(country, product, operator, options);
  }

  public async getCheapestPriceByCountryAndProduct(country: string, product: string) {
    const services = await this.getPricesByCountryAndProduct(country, product);
    const [operator, data] = Object.entries(services[country][product])
      .reduce(
        (prev, current) => prev ? (((current[1].cost < prev[1].cost && current[1].count) || !prev[1].count) ? current : prev) : current
      );

    return { operator, data }
  }

  public async waitForCode(
    order_id: number,
    checkTime: number = 5000,
    timeout: number = 60 * 1000 * 5 // 5 minutes
  ): Promise<ISMS> {

    if (checkTime < 5000) {
      console.warn('Check time below 5000ms is not recommended, but the rate limit is 100req/seconds')
    }

    return new Promise((resolve, reject) => {
      const check = async () => {
        const order = await this.getOrderManagement(order_id);

        if (order.status === OrderStatuses.TIMEOUT) {
          reject(new Error('Server side Timeout'))
          return;
        }

        if (order.status === OrderStatuses.FINISHED) {
          reject(new Error('Finished Order'));
          return;
        }

        if (order.status === OrderStatuses.CANCELED) {
          reject(new Error('Canceled Order'))
          return;
        }

        if (order.status === OrderStatuses.BANNED) {
          reject(new Error('Banned Number'));
          return;
        }


        if (!order.sms || order.sms.length == 0) {
          setTimeout(check, checkTime)
          return;
        }

        resolve(order.sms[0])
      }

      setTimeout(check, checkTime)
      setTimeout(() => reject(new Error('Client-Side Timeout')), timeout)
    })
  }

  public async buyHostingNumber(
    params: IBuyHostingNumberParam
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/buy/hosting/${params.country}/${params.operator}/${params.product}`
    });
  }

  public async reBuyNumber(
    params: IReBuyNumberParam
  ) {
    return this.request<IEmptyResponse>({
      url: `user/reuse/${params.product}/${params.number}`
    });
  }

  public async getOrderManagement(
    order_id: number
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/check/${order_id}`
    });
  }

  public async finishOrder(
    order_id: number
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/finish/${order_id}`
    });
  }

  public async cancelOrder(
    order_id: number
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/cancel/${order_id}`
    });
  }

  public async banOrder(
    order_id: number
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/ban/${order_id}`
    });
  }

  public async getSMSInboxList(
    order_id: number
  ) {
    return this.request<IPurchaseResponse>({
      url: `user/sms/inbox/${order_id}`
    });
  }

  public async getNotifications(
    lang: string
  ) {
    return this.request<INotificationsResponse>({
      url: `guest/flash/${lang}`
    });
  }

  public async getVendors() {
    return this.request<IVendorResponse>({
      url: `user/vendor`
    });
  }

  public async getWalletsReserve() {
    return this.request<IWalletsReserveResponse>({
      url: `vendor/wallets`
    });
  }

  public async getVendorOrdersHistory(params: IUserOrderParam) {
    return this.request<IUserOrderResponse>({
      url: `vendor/orders`
    });
  }

  public async getVendorPaymentsHistory(params: IUserOrderParam) {
    return this.request<IPaymentHistoryResponse>({
      url: `vendor/payments`
    });
  }

  public async createPayouts(data: ICreatePayoutsParam) {
    return this.request<IEmptyResponse>({
      url: `vendor/withdraw`,
      method: 'POST',
      data
    });
  }

  public async getCountriesList() {
    return this.request<IUserProfileResponse>({
      url: `guest/countries`
    });
  }


  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const request = await this.axiosInstance(config);
      if (request.status >= 400 || (typeof request.data === 'string' && request.data.length > 0)) {
        throw new Error(request.data || ('Unknown Error with status code ' + request.status + ''))
      }
      return request.data
    } catch (error) {
      throw error
    }
  }

}