import { IBuyHostingNumberParam, ICreatePayoutsParam, IEmptyResponse, INotificationsResponse, IPaymentHistoryParam, IPaymentHistoryResponse, IPricesByCountryRequest, IPricesRequestResponse, IProductsAndPricesRequest, IProductsAndPricesResponse, IPurchaseOptionsParam, IPurchaseResponse, IReBuyNumberParam, ISMS, IUserOrderParam, IUserOrderResponse, IUserProfileResponse, IVendorResponse, IWalletsReserveResponse } from '../interfaces/five-sim';
export interface IFiveSim {
    token: string;
    version?: string;
    url?: string;
}
export default class FiveSim {
    readonly config: IFiveSim;
    private axiosInstance;
    private token;
    constructor(config: IFiveSim);
    getUserProfile(): Promise<IUserProfileResponse>;
    getUserOrders(params: IUserOrderParam): Promise<IUserOrderResponse>;
    getUserPayments(params?: IPaymentHistoryParam): Promise<IPaymentHistoryResponse>;
    getProductsAndPrices(params?: IProductsAndPricesRequest): Promise<IProductsAndPricesResponse>;
    getPricesRequest(params?: IPricesByCountryRequest): Promise<IPricesRequestResponse>;
    getPricesByCountry(country: string): Promise<IPricesRequestResponse>;
    getPricesByProduct(product: string): Promise<IPricesRequestResponse>;
    getPricesByCountryAndProduct(country: string, product: string): Promise<IPricesRequestResponse>;
    purchase(country: string, product: string, operator: string, options?: IPurchaseOptionsParam): Promise<IPurchaseResponse>;
    purchaseCheapest(country: string, product: string, options?: IPurchaseOptionsParam): Promise<IPurchaseResponse>;
    getCheapestPriceByCountryAndProduct(country: string, product: string): Promise<{
        operator: string;
        data: import("../interfaces/five-sim").IPhoneService;
    }>;
    waitForCode(order_id: number, checkTime?: number, timeout?: number): Promise<ISMS>;
    buyHostingNumber(params: IBuyHostingNumberParam): Promise<IPurchaseResponse>;
    reBuyNumber(params: IReBuyNumberParam): Promise<IEmptyResponse>;
    getOrderManagement(order_id: number): Promise<IPurchaseResponse>;
    finishOrder(order_id: number): Promise<IPurchaseResponse>;
    cancelOrder(order_id: number): Promise<IPurchaseResponse>;
    banOrder(order_id: number): Promise<IPurchaseResponse>;
    getSMSInboxList(order_id: number): Promise<IPurchaseResponse>;
    getNotifications(lang: string): Promise<INotificationsResponse>;
    getVendors(): Promise<IVendorResponse>;
    getWalletsReserve(): Promise<IWalletsReserveResponse>;
    getVendorOrdersHistory(params: IUserOrderParam): Promise<IUserOrderResponse>;
    getVendorPaymentsHistory(params: IUserOrderParam): Promise<IPaymentHistoryResponse>;
    createPayouts(data: ICreatePayoutsParam): Promise<IEmptyResponse>;
    getCountriesList(): Promise<IUserProfileResponse>;
    private request;
}
