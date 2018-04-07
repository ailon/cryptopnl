export class ProfitLogItem {
    constructor(timestamp: Date, crypto: string, buyPrice: number, sellPrice: number, volume: number, profit: number) {
        this.timestamp = timestamp;
        this.crypto = crypto;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.volume = volume;
        this.profit = profit;
    }
    public timestamp: Date;
    public crypto: string;
    public buyPrice: number;
    public sellPrice: number;
    public volume: number;
    public profit: number;
}