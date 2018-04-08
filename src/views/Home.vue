<template>
  <div class="home container">
    <form>
      <div class="row">
        <div class="col-12">
          <h1>Crypto P&L</h1>
        </div>

        <div class="col-12">
          <div class="form-group">
            <label for="logFileInput">Select exchange log file (.csv)</label>
            <input type="file" class="form-control-file" id="logFileInput" @change="setLogFile($event.target.files[0])">
          </div>          
        </div>
        <div class="col-12">
          <button type="button" class="btn btn-primary mr-1" @click="parseKrakenLog">Parse as Kraken log</button>
          <button type="button" class="btn btn-primary" @click="parseBitstampLog">Parse as Bitstamp log</button>
        </div>
        
      </div>

      <div class="row">
        <div class="col-12" style="max-height: 400px; overflow: scroll;">

        <table class="table table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Date</th>
              <th scope="col">Operation</th>
              <th scope="col">Crypto</th>
              <th scope="col">Volume</th>
              <th scope="col">Price</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in tradeLog"
              :key="index"
            >
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ formatDate(trade.timestamp) }}</td>
              <td>{{ trade.operation }}</td>
              <td>{{ trade.crypto }}</td>
              <td>{{ trade.volume }}</td>
              <td>{{ trade.price }}</td>
              <td>{{ trade.volume * trade.price }}</td>
            </tr>
          </tbody>
        </table>

        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <button type="button" class="btn btn-danger" @click="calculatePnL">Calculate Profit/Loss</button>
        </div>
      </div>

      <div class="row" v-show="errors.length > 0">
        <div class="col-12">
          <ul class="text-danger">
            <li v-for="(error, index) in errors" :key="index">{{error}}</li>
          </ul>
        </div>
      </div>

      <div class="row">
        <div class="col-12" style="max-height: 400px; overflow: scroll;"
          v-for="(cryptoProfitLog, cryptoIndex) in profitLog"
          :key="cryptoIndex"
        >

        <h2>{{ cryptoIndex }}: {{getCryptoProfit(cryptoProfitLog)}}</h2>

        <table class="table table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Date</th>
              <th scope="col">Volume</th>
              <th scope="col">Buy Price</th>
              <th scope="col">Sell Price</th>
              <th scope="col">Total</th>
              <th scope="col">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in cryptoProfitLog"
              :key="index"
            >
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ formatDate(trade.timestamp) }}</td>
              <td>{{ trade.volume }}</td>
              <td>{{ trade.buyPrice }}</td>
              <td>{{ trade.sellPrice }}</td>
              <td>{{ trade.volume * trade.sellPrice }}</td>
              <td>{{ trade.profit }}</td>
            </tr>
          </tbody>
        </table>

        </div>

        <h1>Total profit/loss: {{ getTotalProfit() }}</h1>
        <div class="col-12">
          <div class="form-group">
            <label for="profitLogCsv">Profit log CSV</label>
            <textarea class="form-control" id="profitLogCsv" rows="8" v-model="profitLogCsv"></textarea>
          </div>
        </div>

      </div>
      
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Papa from 'papaparse';
import moment from 'moment';
import { TradeLogItem } from '@/models/TradeLogItem.ts';
import { ProfitLogItem } from '@/models/ProfitLogItem.ts';
import { KrakenLogItem } from '@/models/KrakenLogItem.ts';
import { BitstampLogItem } from '@/models/BitstampLogItem.ts';
import { CryptoProfitLog } from '@/models/CryptoProfitLog.ts';
//import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

let logFile: File;

export default Vue.extend({
  name: 'home',
  // components: {
  //   HelloWorld,
  // },
  data() {
    return {
      tradeLog: new Array<TradeLogItem>(),
      profitLog: <CryptoProfitLog>{},
      profitLogCsv: "",
      errors: new Array<string>()
    }
  },
  methods: {
    setLogFile: function(file: File) {
      logFile = file;
      // console.log(logFile);
      
    },

    parseKrakenLog: function() {
      //console.log(logFile);
      Papa.parse(logFile, {
          header: true,
          dynamicTyping: true,
          complete: (parsed) => {
            //console.log(parsed);

            if (parsed.errors && parsed.errors.length > 1) {
              alert(`Error processing file: ${parsed.errors[0].message} at row ${parsed.errors[0].row}`);
            }
            else if (parsed.errors &&
              parsed.errors[0].code == "TooFewFields" && parsed.errors[0].row == parsed.data.length - 1) // special case with empty string at the end
            {
              parsed.data.splice(parsed.data.length - 1);
              this.processKrakenLog(parsed.data);
            }
            else {
              this.processKrakenLog(parsed.data);
            }
          }
        }
      );
    },

    processKrakenLog(parsedLog: Array<KrakenLogItem>) {
      //console.log(parsedLog);

      parsedLog.forEach(item => {
        let operation = item.type.toUpperCase();

        if (operation == 'BUY' || operation == 'SELL') {
          let timestamp = moment(item.time).toDate();
          let crypto = item.pair.length == 8 ? item.pair.substr(1, 3) : item.pair.substr(0, 3);
          crypto = crypto == 'XBT' ? 'BTC' : crypto;
          let fiat = item.pair.length == 8 ?  item.pair.substr(5, 3) : item.pair.substr(3, 3);
          let volume = item.vol;
          let price = operation == 'BUY' ? (item.cost + item.fee) / volume : (item.cost - item.fee) / volume;

          if (['EUR', 'USD', 'GBP'].indexOf(fiat) > -1) {
            this.tradeLog.push(new TradeLogItem(
              timestamp,
              crypto,
              operation,
              price,
              volume
            ));
          }
          else {
            this.errors.push(`Pair not supported: ${crypto}/${fiat}, volume: ${volume} on ${timestamp}`);
          }
        }
      });

      //console.log(this.tradeLog);
    },

    parseBitstampLog: function() {
      // console.log(logFile);
      Papa.parse(logFile, {
          header: true,
          dynamicTyping: true,
          complete: (parsed) => {
            //console.log(parsed);

            if (parsed.errors && parsed.errors.length > 1) {
              alert(`Error processing file: ${parsed.errors[0].message} at row ${parsed.errors[0].row}`);
            }
            else if (parsed.errors &&
              parsed.errors[0].code == "TooFewFields" && parsed.errors[0].row == parsed.data.length - 1) // special case with empty string at the end
            {
              parsed.data.splice(parsed.data.length - 1);
              this.processBitstampLog(parsed.data);
            }
            else {
              this.processBitstampLog(parsed.data);
            }
          }
        }
      );
    },

    processBitstampLog(parsedLog: Array<BitstampLogItem>) {
      //console.log(parsedLog);

      parsedLog.forEach(item => {
        if (item.Type == 'Market') {
          let operation = item["Sub Type"].toUpperCase();

          if (operation == 'BUY' || operation == 'SELL') {
            let timestamp = moment(item.Datetime, 'MMM. DD, YYYY, hh:mm A').toDate();
            let crypto = item.Amount.substr(item.Amount.length - 3, 3);
            let volume = parseFloat(item.Amount.substr(0, item.Amount.length - 4));
            let fee = item.Fee.length > 4 ? parseFloat(item.Fee.substr(0, item.Fee.length - 4)) : 0;
            let value = parseFloat(item.Value.substr(0, item.Value.length - 4));
            let price = operation == 'BUY' ? (value + fee) / volume : (value - fee) / volume;

            this.tradeLog.push(new TradeLogItem(
              timestamp,
              crypto,
              operation,
              price,
              volume
            ));
          }
        }
      });

      //console.log(this.tradeLog);
    },



    calculatePnL: function() {
      this.tradeLog.sort((a, b) => { return (a.timestamp < b.timestamp ? -1 : 1) });

      // get all currencies
      let cryptos = new Array<string>();
      this.tradeLog.forEach(trade => {
        if (cryptos.indexOf(trade.crypto) === -1) {
          cryptos.push(trade.crypto);
        }
      });

      

      cryptos.forEach(crypto => {
        let cryptoBuyLog = this.tradeLog.filter((trade) => { return trade.crypto === crypto && trade.operation === 'BUY' });
        let cryptoSellLog = this.tradeLog.filter((trade) => { return trade.crypto === crypto && trade.operation === 'SELL' });
        
        this.profitLog[crypto] = new Array<ProfitLogItem>();

        cryptoSellLog.forEach(sale => {
          while (cryptoBuyLog[0] && sale.volume > cryptoBuyLog[0].volume) {
            this.profitLog[crypto].push(new ProfitLogItem(
              sale.timestamp,
              sale.crypto,
              cryptoBuyLog[0].price,
              sale.price,
              cryptoBuyLog[0].volume,
              (sale.price - cryptoBuyLog[0].price) * cryptoBuyLog[0].volume
            ));

            sale.volume -= cryptoBuyLog[0].volume;

            cryptoBuyLog.shift();
          }

          let lastPrice = 0;
          if (cryptoBuyLog[0]) {
            lastPrice = cryptoBuyLog[0].price;
          }
          else {
            this.errors.push(`Sell without buy: ${sale.crypto} on ${sale.timestamp}, unaccounted volume: ${sale.volume} at ${sale.price} logged as profit`);
          }
          this.profitLog[crypto].push(new ProfitLogItem(
              sale.timestamp,
              sale.crypto,
              lastPrice,
              sale.price,
              sale.volume,
              (sale.price - lastPrice) * sale.volume
          ));

          if (cryptoBuyLog[0]) {
            cryptoBuyLog[0].volume -= sale.volume;
            if (cryptoBuyLog[0].volume == 0) {
              cryptoBuyLog.shift();
            }
          }
        });

        // console.log(this.profitLog);
      });

      let flatProfitLog = new Array<ProfitLogItem>();
      for (let crypto in this.profitLog) {
        flatProfitLog = flatProfitLog.concat(this.profitLog[crypto]);
      }

      // console.log(flatProfitLog);

      this.profitLogCsv = Papa.unparse(flatProfitLog, { delimiter: '\t' });

    },

    getCryptoProfit: function(cryptoProfitLog: ProfitLogItem[]): number {
      let profit = 0;
      cryptoProfitLog.forEach(sale => {
        profit += sale.profit;
      });
      return profit;
    },

    getTotalProfit: function(): number {
      let profit = 0;
      for (let cryptoProfitLog in this.profitLog) {
        profit += this.getCryptoProfit(this.profitLog[cryptoProfitLog]);
      }
      return profit;
    },

    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD HH:mm');
    }
  }
});
</script>
