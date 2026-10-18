export interface IEmptyResponse {
}
export interface IUserProfileResponse {
    id: number;
    email: string;
    balance: number;
    rating: number;
    default_country: {
        name: string;
        iso: string;
        prefix: string;
    };
    default_operator: {
        name: string;
    };
    frozen_balance: number;
    default_forwarding_number: string;
    vendor: string;
}
export interface IUserOrderParam {
    category: 'hosting' | 'activation';
    limit?: number;
    offset?: number;
    order?: string;
    reverse?: boolean;
}
export interface IOrder {
    id: number;
    phone: string;
    operator: string;
    product: string;
    price: number;
    status: string;
    expires: string;
    sms: any[];
    created_at: string;
    country: string;
}
export interface IUserOrderResponse {
    Data: IOrder[];
    ProductNames: string[];
    Statuses: string[];
    Total: number;
}
export interface IPaymentHistoryParam {
    limit?: number;
    offset?: number;
    order?: string;
    reverse?: boolean;
}
export interface IPayment {
    ID: number;
    TypeName: string;
    ProviderName: string;
    Amount: number;
    Balance: number;
    CreatedAt: string;
}
export interface IPaymentHistoryResponse {
    Data: IPayment[];
    PaymentProviders?: [{
        [key: string]: string;
    }];
    PaymentStatuses?: [{
        [key: string]: string;
    }];
    PaymentTypes?: [{
        [key: string]: string;
    }];
    Total: number;
}
export interface IProductsAndPricesRequest {
    country: string;
    operator: string;
}
export interface IProductsAndPricesResponse {
    [key: string]: {
        Category: string;
        Qty: number;
        Price: number;
    };
}
export interface IPhoneService {
    cost: number;
    count: number;
    rate: number;
}
export interface IPricesRequestResponse {
    [country: string]: {
        [service: string]: {
            [phone_service: string]: IPhoneService;
        };
    };
}
export interface IPricesByCountryRequest {
    country?: string;
    product?: string;
}
export interface IPurchaseParam {
    country: string;
    operator: string;
    product: string;
}
export interface IPurchaseOptionsParam {
    forwarding?: boolean;
    number?: string;
    reuse?: boolean;
    voice?: boolean;
    ref?: string;
}
export interface ISMS {
    created_at: string;
    date: string;
    sender: string;
    text: string;
    code: string;
}
export interface IPurchaseResponse {
    id: number;
    phone: string;
    operator?: string;
    product: string;
    price: number;
    status: string;
    expires: string;
    sms: ISMS[] | null;
    created_at: string;
    forwarding?: boolean;
    forwarding_number?: string;
    country?: string;
}
export interface IBuyHostingNumberParam {
    country: string;
    operator: string;
    product: string;
}
export interface IReBuyNumberParam {
    product: string;
    number: string;
}
export interface INotificationsResponse {
    text: string;
}
export interface IVendorResponse {
    id: number;
    email: string;
    balance: number;
    rating: number;
    default_country: {
        name: string;
        iso: string;
        prefix: string;
    };
    default_operator: {
        name: string;
    };
    frozen_balance: number;
    default_forwarding_number: string;
    vendor: string;
}
export interface IWalletsReserveResponse {
    fkwallet: number;
    payeer: number;
    unitpay: number;
}
export interface ICreatePayoutsParam {
    receiver: string;
    method: string;
    amount: string;
    fee: string;
}
export interface ICountriesListResponse {
    [country: string]: {
        name: string;
        iso?: {
            [key: string]: number;
        };
        prefix?: {
            [key: string]: number;
        };
        text_en: string;
        text_ru: string;
        [phone_service: string]: any;
    };
}
export declare enum OrderStatuses {
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    CANCELED = "CANCELED",
    TIMEOUT = "TIMEOUT",
    FINISHED = "FINISHED",
    BANNED = "BANNED"
}
export type HostingTypes = '3hours' | '1day' | '10days' | '1month';
export type Operators = any | '019' | 'activ' | 'altel' | 'beeline' | 'claro' | 'ee' | 'globe' | 'kcell' | 'lycamobile' | 'matrix' | 'megafon' | 'mts' | 'orange' | 'pildyk' | 'play' | 'redbullmobile' | 'rostelecom' | 'smart' | 'sun' | 'tele2' | 'three' | 'tigo' | 'tmobile' | 'tnt' | 'virginmobile' | 'virtual2' | 'virtual4' | 'virtual5' | 'virtual7' | 'virtual8' | 'virtual12' | 'virtual15' | 'virtual16' | 'virtual17' | 'virtual18' | 'virtual19' | 'virtual20' | 'virtual21' | 'virtual22' | 'virtual23' | 'virtual24' | 'virtual25' | 'virtual26' | 'virtual27' | 'virtual28' | 'vodafone' | 'yota' | 'zz';
