# NEO Testnet Bot

Slack bot uses [Slapp][https://github.com/BeepBoopHQ/slapp] library and interacts with NEO Testnet blockchain. This repo is designed to drop fit into [Beep Boop](https://beepboophq.com) platform.

## Setup Instructions

### Pre-requisites

This project is built using:

* `Linux 3.16.0-4-amd64`
* `node v6.7.0`
* `npm v3.10.3`

### Slack App

You'll want to enable **Event Subscriptions** on your Slack App using the `URL` provided and add subscriptions for the following **Bot Events**:

+ `message.channels`
+ `message.im`
