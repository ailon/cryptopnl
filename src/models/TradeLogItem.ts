export class TradeLogItem {
    constructor(platform: string, 
                transactionId: string, 
                timestamp: Date, 
                crypto: string, 
                operation: string, 
                price: number, 
                volume: number, 
                profit?: number) {
        this.platform = platform;
        this.transactionId = transactionId;
        this.timestamp = timestamp;
        this.crypto = crypto;
        this.operation = operation;
        this.price = price;
        this.volume = volume;
    }
    public platform: string;
    public transactionId: string;
    public timestamp: Date;
    public crypto: string;
    public operation: string;
    public price: number;
    public volume: number;
}