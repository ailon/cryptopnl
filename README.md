# Crypto P&L
Calculate your crypto trading profit/loss in accounting(-ish) way.

This tool can help you calculate profits/losses from your cryptocurrency trading logs according to FIFO accounting method. It is limited in scope and currently supports logs from Kraken and Bitstamp exchanges only.

## THE GOOD

- Crypto P&L is 100% client-side — none of your data is sent to any servers.
- It calculates your profit/losses according to [FIFO accounting method](https://en.wikipedia.org/wiki/FIFO_and_LIFO_accounting) as most tax authorities would like you to do it.
- It's open-source — you can add missing functionality (see below).

## THE BAD (known issues and limitations)

- I made this for myself so it only does what I need it to do and nothing else.
- Crypto P&L supports logs from Kraken and Bitstamp exchanges only.
- It only works with crypto-fiat transactions. All crypto-crypto transactions will be discarded (with a warning).
- It assumes all transactions use the same fiat currency.
- It assumes all purchases of cryptocurrencies happened on supported platforms and are represented in the source logs. Sales exceeding purchases will be counted as profit. You can probably amend your logs with "fake" initial transactions to mitigate this.
- It doesn't check that sales happen after purchases. So, if not all purchases are accounted for it will not calculate correctly.
- I've only tested it with logs from 2 people, so there could be issues unaccounted for due to limited sample size.
- Crypto P&L is open-source but it was quickly hacked together as a one-off app. You can totally modify and improve it but be warned that the code is ugly ;)

## THE DISCLAIMER

**CRYPTO P&L IS AN EXPERIMENTAL PIECE OF SOFTWARE AND IS PROVIDED TO YOU AS-IS WITHOUT ANY WARRANTIES WHATSOEVER. UNDER NO CIRCUMSTANCES SHOULD I BE HELD LIABLE FOR ANY DAMAGE IT MAY CAUSE YOU.**
