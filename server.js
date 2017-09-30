/**
 * Dolor Slack Bot
 * 
 * TODO:
 * - Better cater imprecise command input (additional space, case sensitivity, alternate command etc)
 * - Diagnose neon-js health
 * - Check TX status
 * - Load bot version value from package.json
 * 
 * MORE TODO:
 * - Redo README.md
 * - Review bot.yml
 * - Formalise this project/bot name
 * - Formalise avatar image
 * - Uniform coding style/format
 * 
 * QUESTIONS FOR COMMUNITY:
 * - Is it preferrable to use command or use mention?
 * - Is it possible to lock down to 1 channel only, a workaround for ACL to prevent abuse
 */
'use strict'

const express = require('express')
const Utils = require('./utils/utils')
const Profiles = require('./helpers/profiles')

// -- Arrange

const VERSION = 'dolor-22'
const COMMAND_HANDLER = '/dolor'
const HELP_TEXT = `
I will respond to the following commands:
\`help\` - to see this message.
\`version\` - to see version of this Slack bot.
\`random\` - to output a random sentence, for fun.
\`height\` - to output current blockchain height.
\`wallet\` - to output this bot's wallet information.
\`send <address> <quantity> <asset-name>\` - to make a transfer from bot's account. 'asset name' can be either 'Neo' or 'Gas', case sensitive.
Examples:
  \`send AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD 10 Neo\`
  \`send AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD 7.6 Gas\`
`
let port = Utils.SlappHelper.GetPort()
let slapp = Utils.SlappHelper.CreateSlapp()

//*********************************************
// Setup commands handlers
//*********************************************

slapp.command(COMMAND_HANDLER, 'version', (msg) => {
  msg.say(`Version \`${VERSION}\``)
})

slapp.command(COMMAND_HANDLER, 'multisay', (msg) => {
  msg.say('I say 1 line.')
  msg.say('I say another.')
  setTimeout(() => {
    msg.say('I say something else after 2sec.')
  }, 2000)
})

slapp.command(COMMAND_HANDLER, 'random', (msg) => {
  /**
   * msg.response() doesn't take array as it will just response with entire array.
   * Have to use msg.say() for random sentence usage.
   */
  msg.say([
    "Be happy :smile:",
    'You the best',
    ':+1: go on!',
    'Anytime :sun_with_face: is good time :full_moon_with_face:'
  ])
})

slapp.command(COMMAND_HANDLER, 'help', (msg) => {
  msg.say(HELP_TEXT)
})

slapp.command(COMMAND_HANDLER, 'height', (msg) => {
  Utils.Neon.getWalletDBHeight(Profiles.Blockchains.CityOfZionTestNet)
    .then(function(height) {
      msg.say(`Block height: \`${height}\``)
    })
})

slapp.command(COMMAND_HANDLER, 'wallet', (msg) => {
  let blockchain = Profiles.Blockchains.CityOfZionTestNet;
  let address = Profiles.Wallets.WalletPiccolo.Address;
  Utils.Neon.getBalance(blockchain, address)
    .then(function(balanceObj) {
      msg.say(`Address: \`${address}\` Balance: \`${balanceObj.Neo.toString()} NEO\` and \`${balanceObj.Gas.toString()} GAS\` `)
    })
})

slapp.command(COMMAND_HANDLER, 'send (.*)', (msg, text, match) => {
  let args = match.trim().split(/\s+/)
  console.log('args:', args)
  let depositAddress = args[0]
  let assetAmount = parseFloat(args[1])
  let assetName = args[2]

  // Validation and sanitization
  if (!Utils.NeoHelper.IsValidAddress(depositAddress)) {
    msg.say(`The provided deposit address \`${depositAddress}\` is invalid.`)
    return
  }
  if (assetAmount <= 0) {
    msg.say(`The provided amount to send \`${assetAmount}\` is invalid.`)
  }

  // Act
  var url = Profiles.Blockchains.CityOfZionTestNet;
  var fromSecret = Profiles.Wallets.WalletPiccolo.Secret;
  Utils.Neon.doSendAsset(url, depositAddress, fromSecret, assetName, assetAmount)
    .then((res) => {
      console.log('doSendAsset response:', res);
      if(res.result) {
        msg.say('Transaction succeed.')
      } else {
        msg.say('Transaction seens to have been rejected.')
      }
    })
    .catch((err) => {
      console.log('doSendAsset error:', err);
      msg.say('There is an error while executing the transaction.')
    })
})

/**
 * Catch all command
 */
slapp.command(COMMAND_HANDLER, '(.*)', (msg, text, match) => {
  // console.log('text:', text)
  // console.log('match:', match)
  msg.say(`Unknown command: [${match}].`)
})

/**
 * Catch all message
 */
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  msg.say(`Don't message me directly. Use \`/dolor help\` to see list of available commands.`)
})

//*********************************************
// Sever Setup
//*********************************************

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port [${port}]`)
})
