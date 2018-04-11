export class ProfitLogItem {
    constructor(timestamp: Date, 
                crypto: string, 
                buyPlatfom: string,
                buyTransactionId: string,
                buyPrice: number, 
                sellPlatform: string,
                sellTransactionId: string,
                sellPrice: number, 
                volume: number, 
                profit: number) {
        this.timestamp = timestamp;
        this.crypto = crypto;
        this.buyPlatfom = buyPlatfom;
        this.buyTransactionId = buyTransactionId;
        this.buyPrice = buyPrice;
        this.sellPlatform = sellPlatform;
        this.sellTransactionId = sellTransactionId;
        this.sellPrice = sellPrice;
        this.volume = volume;
        this.profit = profit;
    }
    public timestamp: Date;
    public crypto: string;
    public buyPlatfom: string;
    public buyTransactionId: string;
    public buyPrice: number;
    public sellPlatform: string;
    public sellTransactionId: string;
    public sellPrice: number;
    public volume: number;
    public profit: number;
}