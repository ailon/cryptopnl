export class TradeLogItem {
    constructor(timestamp: Date, crypto: string, operation: string, price: number, volume: number, profit?: number) {
        this.timestamp = timestamp;
        this.crypto = crypto;
        this.operation = operation;
        this.price = price;
        this.volume = volume;
        if (profit != undefined) {
            this.profit = profit;
        }
    }
    public timestamp: Date;
    public crypto: string;
    public operation: string;
    public price: number;
    public volume: number;
    public profit?: number;
}