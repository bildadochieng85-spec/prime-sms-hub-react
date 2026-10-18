"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatuses = void 0;
var OrderStatuses;
(function (OrderStatuses) {
    OrderStatuses["PENDING"] = "PENDING";
    OrderStatuses["RECEIVED"] = "RECEIVED";
    OrderStatuses["CANCELED"] = "CANCELED";
    OrderStatuses["TIMEOUT"] = "TIMEOUT";
    OrderStatuses["FINISHED"] = "FINISHED";
    OrderStatuses["BANNED"] = "BANNED";
})(OrderStatuses || (exports.OrderStatuses = OrderStatuses = {}));
