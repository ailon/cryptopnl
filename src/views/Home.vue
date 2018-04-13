<template>
  <div class="home container">
    <header>
      <div class="row">
        <div class="col-12 text-center">
          <h1 class="display-2">Crypto P&L</h1>
          <p class="lead">Calculate your crypto trading profit/loss in accounting(-ish) way.<sup>*</sup></p>
        </div>
      </div>
    </header>

    <form>

      <div class="card" v-show="step == 'intro'">
        <h2 class="card-header">Important</h2>
        <div class="card-body">
          <h5 class="card-title">Please read carefully before proceeding...</h5>
          <p>This tool can help you calculate profits/losses from your cryptocurrency trading logs according to 
            <a href="https://en.wikipedia.org/wiki/FIFO_and_LIFO_accounting">FIFO accounting method</a>. 
            It is limited in scope and currently supports logs from Kraken and Bitstamp exchanges only.
          </p>
          <p><b>THE GOOD</b></p>
          <ul>
            <li>Crypto P&amp;L is 100% client-side &mdash; none of your data is sent to any servers.</li>
            <li>It calculates your profit/losses according to FIFO accounting method as most tax authorities would like you to do it.</li>
            <li><a href="https://github.com/ailon/cryptopnl">It's open-source</a> &mdash; you can add missing functionality (see below).</li>
          </ul>
          <p><b>THE BAD</b> (known issues and limitations)</p>
          <ul>
            <li>I made this for myself so it only does what I need it to do and nothing else.</li>
            <li>Crypto P&amp;L supports logs from Kraken and Bitstamp exchanges only.</li>
            <li>It only works with crypto-fiat transactions. All crypto-crypto transactions will be discarded (with a warning).</li>
            <li>It assumes all transactions use the same fiat currency.</li>
            <li>It assumes all purchases of cryptocurrencies happened on supported platforms and are represented in the source logs. 
              Sales exceeding purchases will be counted as profit. You can probably amend your logs with "fake" initial transactions to mitigate this.</li>
            <li>It doesn't check that sales happen after purchases. So, if not all purchases are accounted for it will not calculate correctly.</li>
            <li>I've only tested it with logs from 2 people, so there could be issues unaccounted for due to limited sample size.</li>
            <li>Crypto P&amp;L is open-source but it was quickly hacked together as a one-off app. 
              You can totally modify and improve it but be warned that the code is ugly ;)</li>
          </ul>
          <p><b>THE DISCLAIMER</b></p>
          <ul>
            <li style="text-transform: uppercase; font-weight: bold;">Crypto P&amp;L is an experimental piece of software and is provided to you as-is without any warranties whatsoever. 
              Under no circumstances should I be held liable for any damage it may cause you.</li>
          </ul>
          <button class="btn btn-success btn-lg" @click.prevent="goToLogStep">I understand and this works for me, let's proceed!</button>
          <p class="mt-2"><a href="https://github.com/ailon/cryptopnl">This doesn't work for me and I can write JavaScript/TypeScript</a></p>
          <p class="small">Doesn't work for you and not a developer? <a href="mailto:cryptopnl@outlook.com?subject=CryptoPnL">Send me an email</a> if you'd like to sponsor a generally useful feature.</p>
        </div>
      </div>        

      <div class="card border-danger mb-2" v-show="errors.length > 0">
        <div class="card-header">
          Issues processing: <a href="#" @click.prevent="showErrorDetails = !showErrorDetails">{{ errors.length }}</a>
        </div>
        <div class="card-body" v-show="showErrorDetails">
          <ul class="text-danger">
            <li v-for="(error, index) in errors" :key="index">{{error}}</li>
          </ul>
        </div>
      </div>
      

      <section id="logFileSection" v-show="step == 'logs'">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Add an<span v-show="tradeLog.length > 0">other</span> exchange log file</h2>
            <div class="form-group row">
              <label for="logType" class="col-sm-2 col-form-label">Exchange:</label>
              <div class="col-sm-10">
                <select class="form-control" id="logType" v-model="logType">
                  <option value="kraken">Kraken</option>
                  <option value="bitstamp">Bitstamp</option>
                </select>
              </div>
            </div>

            <div class="form-group row">
              <label for="logFileInput" class="col-sm-2 col-form-label">Select exchange log file (.csv)</label>
              <div class="col-sm-10">
                <input type="file" class="form-control-file" id="logFileInput" ref="logFileInput">
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <button type="button" class="btn btn-primary" @click.prevent="processLog">Add and process exchange log</button>
              </div>
              
            </div>

          </div>
        </div>


        <div class="card mt-2 border-success" v-show="tradeLog.length > 0">
          <div class="card-header">
            Log items processed: <a href="#" @click.prevent="showTradeLog = !showTradeLog">{{ tradeLog.length }}</a>
          </div>
          <div class="card-body" v-show="showTradeLog">
            <table class="table table-sm table-responsive">
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
          <div class="card-footer">
            <button type="button" class="btn btn-success btn-lg" @click.prevent="calculatePnL">Calculate Profit/Loss</button>
          </div>
        </div>
      </section>

      <section id="resultsSection" v-show="step == 'results'">
        <div class="row mt-4">
          <div class="col-12"><h3>Profits/losses by cryptocurrency</h3></div>
        </div>

        <div class="card" 
          v-for="(cryptoProfitLog, cryptoIndex, index) in profitLog"
          :key="cryptoIndex"
          v-show="cryptoProfitLog.length > 0"
        >

          <div class="card-header">
            <h4><a href="#" @click.prevent="toggleCryptProfitLog(index)">{{ cryptoIndex }}</a>: {{getCryptoProfit(cryptoProfitLog)}}</h4>
          </div>
          <div class="card-body" v-show="showCryptoProfitLog[index]">
            <table class="table table-sm table-responsive">
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

        </div>

        <div class="row my-5">
          <div class="col-12">
            <h2>Total profit/loss: {{ totalProfit }}</h2>
            <ul>
              <li><b>Total costs</b>: {{ totalCosts }}</li>
              <li><b>Total revenue</b>: {{ totalRevenue }} </li>
            </ul>
          </div>
          <div class="col-12">
            <a href="#" @click.prevent="showProfitLogCsv = !showProfitLogCsv">Profit log TSV</a>
            <textarea class="form-control" id="profitLogCsv" rows="8" v-model="profitLogCsv" v-show="showProfitLogCsv"></textarea>
          </div>
        </div>
        <div class="card text-center text-white bg-dark mt-4">
          <div class="card-body">
            <p class="lead" v-if="totalProfit > 0"><b>Congratulations on your profit!</b><br />Please, consider donating 0.5% or whatever you feel appropriate for the time this tool saved you. Thank you!</p>
            <p class="lead" v-else><b>No profit but look on the bright side &mdash; no taxes either!</b><br />Please, consider donating whatever you feel appropriate for the time this tool saved you. Thank you!</p>

            <a class="btn btn-primary btn-lg"
            :href="`https://www.paypal.me/ailonid/${totalProfit >= 1000 ? Math.round(totalProfit * 0.005) : 5}`">Donate via PayPal</a>
          </div>
        </div>
      </section>
    </form>

    <div class="row my-3" v-show="step != 'intro'">
      <div class="col-12"><a href="/">start over</a></div>
    </div>

    <footer class="mt-5">
      <hr />
      <div class="row">
        <div class="col-12 text-center small text-muted">
          &copy; 2018 by Alan Mendelevich
        </div>
      </div>
    </footer>
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

let logFile: File;

export default Vue.extend({
  name: 'home',
  // components: {
  //   HelloWorld,
  // },
  data() {
    return {
      step: "intro",
      logType: "",
      tradeLog: new Array<TradeLogItem>(),
      showTradeLog: false,
      profitLog: <CryptoProfitLog>{},
      showCryptoProfitLog: new Array<boolean>(),
      profitLogCsv: "",
      showProfitLogCsv: false,
      errors: new Array<string>(),
      showErrorDetails: false,
      totalProfit: 0,
      totalCosts: 0,
      totalRevenue: 0
    }
  },
  methods: {
    goToLogStep: function() {
      this.step = 'logs';
    },

    processLog: function() {
      let fileInput = <HTMLInputElement>this.$refs.logFileInput;
      if (this.logType != "" && fileInput.files) {
        logFile = fileInput.files[0];
        switch(this.logType) {
          case "kraken": {
            this.parseKrakenLog();
            break;
          }
          case "bitstamp": {
            this.parseBitstampLog();
            break;
          }
        }
        (<HTMLInputElement>this.$refs.logFileInput).value = "";
        this.logType = "";

      }
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
          let transactionId = item.txid;
          let timestamp = moment(item.time).toDate();
          let crypto = item.pair.length == 8 ? item.pair.substr(1, 3) : item.pair.substr(0, 3);
          crypto = crypto == 'XBT' ? 'BTC' : crypto;
          let fiat = item.pair.length == 8 ?  item.pair.substr(5, 3) : item.pair.substr(3, 3);
          let volume = item.vol;
          let price = operation == 'BUY' ? (item.cost + item.fee) / volume : (item.cost - item.fee) / volume;

          if (['EUR', 'USD', 'GBP'].indexOf(fiat) > -1) {
            this.tradeLog.push(new TradeLogItem(
              'kraken',
              transactionId,
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
            let transactionId = moment(timestamp).format('YYYYMMDDHHmmss');
            let crypto = item.Amount.substr(item.Amount.length - 3, 3);
            let volume = parseFloat(item.Amount.substr(0, item.Amount.length - 4));
            let fee = item.Fee.length > 4 ? parseFloat(item.Fee.substr(0, item.Fee.length - 4)) : 0;
            let value = parseFloat(item.Value.substr(0, item.Value.length - 4));
            let price = operation == 'BUY' ? (value + fee) / volume : (value - fee) / volume;

            this.tradeLog.push(new TradeLogItem(
              'bitstamp',
              transactionId,
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
      this.step = "results";

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
              cryptoBuyLog[0].platform,
              cryptoBuyLog[0].transactionId,
              cryptoBuyLog[0].price,
              sale.platform,
              sale.transactionId,
              sale.price,
              cryptoBuyLog[0].volume,
              (sale.price - cryptoBuyLog[0].price) * cryptoBuyLog[0].volume
            ));

            sale.volume -= cryptoBuyLog[0].volume;

            cryptoBuyLog.shift();
          }

          let lastPrice = 0;
          let lastBuyPlatform = "-";
          let lastBuyTransactionId = "-";
          if (cryptoBuyLog[0]) {
            lastPrice = cryptoBuyLog[0].price;
            lastBuyPlatform = cryptoBuyLog[0].platform;
            lastBuyTransactionId = cryptoBuyLog[0].transactionId;
          }
          else {
            this.errors.push(`Sell without buy: ${sale.crypto} on ${sale.timestamp}, unaccounted volume: ${sale.volume} at ${sale.price} logged as profit`);
          }
          this.profitLog[crypto].push(new ProfitLogItem(
              sale.timestamp,
              sale.crypto,
              lastBuyPlatform,
              lastBuyTransactionId,
              lastPrice,
              sale.platform,
              sale.transactionId,
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

      // reset profit log display
      this.showCryptoProfitLog.splice(0);
      for (let crypto in this.profitLog) {
        this.showCryptoProfitLog.push(false);
      }

      // create flat log for export
      let flatProfitLog = new Array<ProfitLogItem>();
      for (let crypto in this.profitLog) {
        flatProfitLog = flatProfitLog.concat(this.profitLog[crypto]);
      }

      // console.log(flatProfitLog);

      this.profitLogCsv = Papa.unparse(flatProfitLog, { delimiter: '\t' });

      this.setTotalProfit();
    },

    toggleCryptProfitLog: function(index: number) {
      Vue.set(this.showCryptoProfitLog, index, !this.showCryptoProfitLog[index]);
    },

    getCryptoProfit: function(cryptoProfitLog: ProfitLogItem[]): number {
      let profit = 0;
      cryptoProfitLog.forEach(sale => {
        profit += sale.profit;
      });
      return Math.round(profit * 100) / 100;
    },

    setTotalProfit: function() {
      this.totalCosts = 0;
      this.totalRevenue = 0;

      for (let cryptoProfitLog in this.profitLog) {
        this.profitLog[cryptoProfitLog].forEach(sale => {
          this.totalCosts += sale.buyPrice * sale.volume;
          this.totalRevenue += sale.sellPrice * sale.volume;
        })
      }

      this.totalProfit = Math.round((this.totalRevenue - this.totalCosts) * 100) / 100;
      this.totalCosts = Math.round(this.totalCosts * 100) / 100;
      this.totalRevenue = Math.round(this.totalRevenue * 100) / 100;
    },

    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD HH:mm');
    }
  }
});
</script>
<style lang="scss" scoped>
.home {
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  padding-top: 1rem;
  padding-bottom: 2rem;
}
</style>
