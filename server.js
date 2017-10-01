/**
 * Dolor Slack Bot
 * 
 * TODO:
 * - Better cater imprecise command input (additional space, case sensitivity, alternate command etc)
 * - Diagnose neon-js health
 * - Check TX status
 * 
 * MORE TODO:
 * - Formalise this project/bot name
 * - Formalise avatar image
 * - Channel restriction
 * 
 * QUESTIONS FOR COMMUNITY:
 * - Is it preferrable to use command or use mention?
 * - Is it possible to lock down to 1 channel only, a workaround for ACL to prevent abuse
 */
'use strict'

// const fs = require('fs')
const express = require('express')
const SlappHelper = require('./utils/slapp-helper')
const NeoHelper = require('./utils/neo-helper')
const Profiles = require('./utils/profiles')
const Neon = require('neon-js')

// -- Arrange

const VERSION = '1.0.34'
// const VERSION = JSON.parse(fs.readFileSync('./package.json')).version // NOTE: fs usage seems to increase Beep Boop building time a lot.
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
let port = SlappHelper.GetPort()
let slapp = SlappHelper.CreateSlapp()



//*********************************************
// Setup commands handlers
//*********************************************

slapp.command(COMMAND_HANDLER, 'version', (msg) => {
  msg.say(`Version \`${VERSION}\``)
})

slapp.command(COMMAND_HANDLER, 'help', (msg) => {
  msg.say(HELP_TEXT)
})

slapp.command(COMMAND_HANDLER, 'height', (msg) => {
  // msg.say('So you want to find out the height of the blockchain...')
  //   .say("Let's see (not implemened).")
  console.log(Neon)
  Neon.getWalletDBHeight(Profiles.Blockchains.CityOfZionTestNet)
    .then(function(height) {
      msg.say(`Block height: \`${height}\``)
    })
})

slapp.command(COMMAND_HANDLER, 'wallet', (msg) => {
  let blockchain = Profiles.Blockchains.CityOfZionTestNet;
  let address = Profiles.Wallets.WalletPiccolo.Address;
  Neon.getBalance(blockchain, address)
    .then(function(balanceObj) {
      msg.say(`Address: \`${address}\` Balance: \`${balanceObj.Neo.toString()} NEO\` and \`${balanceObj.Gas.toString()} GAS\` `)
    })
})

slapp.command(COMMAND_HANDLER, 'send (.*)', (msg, text, match) => {
  let args = match.trim().split(/\s+/)
  console.log('args:', args)
  msg.say(`User input: \`${text}\``)
  let depositAddress = args[0]
  let assetAmount = parseFloat(args[1])
  let assetName = args[2]

  // Validation and sanitization
  if (!NeoHelper.IsValidAddress(depositAddress)) {
    msg.say(`The provided deposit address is invalid.`)
    return
  }
  assetName = NeoHelper.SanitizeAssetName(assetName)
  if (!assetName) {
    msg.say(`The provided asset name is invalid.`)
    return
  }
  if (!NeoHelper.IsValidAmount(assetName, assetAmount)) {
    msg.say(`The provided amount is invalid.`)
    return
  }

  // Act
  var url = Profiles.Blockchains.CityOfZionTestNet;
  var fromSecret = Profiles.Wallets.WalletPiccolo.Secret;
  Neon.doSendAsset(url, depositAddress, fromSecret, assetName, assetAmount)
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



//*********************************************
// Education Purpose
//*********************************************

/**
 * Experiment on capture non-registered command.
 * This is expected to fail.
 */
// slapp.command('/dolor2', 'hi', (msg) => {
//   msg.say('Umm... Hi. You not suppose to find me.')
// })

/**
 * Sample code snippet response
 */
slapp.command(COMMAND_HANDLER, 'codesnippet', (msg) => {
  const text = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./firebase-messaging-sw.js').then(function(registration) {
    console.log('Firebase Worker Registered');
  }).catch(function(err) {
    console.log('Service Worker registration failed: ', err);
  });
}
`
  msg.say('```' + text + '```')
})

/**
 * Identify the user and channel that made the command request
 */
slapp.command(COMMAND_HANDLER, 'idme', (msg) => {
  //TODO
})

/**
 * Console log this/slapp object
 */
slapp.command(COMMAND_HANDLER, 'debugthis', (msg) => {
  // console.log('this:', this)
  // console.log('slapp:', slapp)
  // console.log('slapp.client.bots.info():', slapp.client.bots.info())
  // console.log('slapp.client.channels.info():', slapp.client.channels.info())
  console.log('msg.body:', msg.body)
  msg.say(`We are in ${msg.body.team_domain}. This message is requested by @${msg.body.user_name} in #${msg.body.channel_name}.`)
})

/**
 * Make multiple msg.say() executions, even with condition break.
 */
slapp.command(COMMAND_HANDLER, 'multisay', (msg) => {
  if(Math.random() < 0.2) {
    msg.say('The RNG has spoken, there shall be cake.')
    return
  }

  msg.say('I say one line.')
  msg.say('I say another.')
  setTimeout(() => {
    msg.say('I say something 2 seconds later.')
  }, 2000)
})

/**
 * Say random phases.
 * Note that the syntax it'll only work with msg.say(), not msg.response()
 */
slapp.command(COMMAND_HANDLER, 'random', (msg) => {
  msg.say([
    "Be happy :smile:",
    'You the best',
    ':+1: go on!',
    'Anytime :sun_with_face: is good time :full_moon_with_face:'
  ])
})

/**
 * Example whisper usage
 */
// slapp.command(COMMAND_HANDLER, 'whisper', (msg) => {
//   msg.say('I am saying something here...')
//   msg.response('... but only the requestee will hear my whisper')
// })
slapp.command(COMMAND_HANDLER, 'whisper', (msg) => {
  msg.response('Dont forget umbrella.')
})



//*********************************************
// The Catch Alls
//*********************************************

/**
 * Catch all commands
 */
slapp.command(COMMAND_HANDLER, '(.*)', (msg, text, match) => {
  // console.log('text:', text)
  // console.log('match:', match)
  msg.say(`Unknown command: [${match}].`)
})

/**
 * Catch all mentioned and DM
 */
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  msg.say(`Don't message me directly. Use \`/dolor help\` to see list of available commands.`)
})



//*********************************************
// Legacy
//*********************************************

// slapp.command(COMMAND_HANDLER, /^get/, (msg, text, match, arg4) => {
//   console.log('text:', text)
//   console.log('match:', match)
//   console.log('arg4:', arg4)
//   /**
//    * msg.say() will create normal 'bot_message' visible by everyone in the channel.
//    */
//   msg.say(`You want to get [${match}].`)
// })

// slapp.command(COMMAND_HANDLER, 'go (.*)', (msg, text, match, arg4) => {
//   console.log('text:', text)
//   console.log('match:', match)
//   console.log('arg4:', arg4)
//   msg.say(`You want to go [${match}].`)
// })

// // response to the user typing "help"
// slapp.message('help', ['mention', 'direct_message'], (msg) => {
//   msg.say(HELP_TEXT)
// })

// slapp.command(COMMAND_HANDLER, /^in/, (msg, text, match) => {
//   // `respond` is used for actions or commands and uses the `response_url` provided by the
//   // incoming request from Slack
//   // console.log('[dolor in]. msg:', msg)
//   // msg.respond(`Glad you are in ${match}!`)
//   msg.respond(`Glad you are in [${text}].`)
// })

// slapp.command(COMMAND_HANDLER, 'create (.*)', (msg, text, question) => {
//   // if "/inorout create Who is in?" is received:
//   // text = create Who is in?
//   // question = Who is in?
//   // console.log('[dolor create]. msg:', msg, 'text:', text, 'question:', question)
//   // msg.response('Create something?')
//   msg.say('Create something??')
// })

// slapp.command('/dolor', 'create (.*)', (msg, text, question) => {
//   msg.response(`You said create something: [${text}]. question: [${question}]`)
// })

// // "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
// slapp
//   .message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
//     msg
//       .say(`${text}, how are you?`)
//       // sends next event from user to this route, passing along state
//       .route('how-are-you', { greeting: text })
//   })
//   .route('how-are-you', (msg, state) => {
//     var text = (msg.body.event && msg.body.event.text) || ''

//     // user may not have typed text as their next action, ask again and re-route
//     if (!text) {
//       return msg
//         .say("Whoops, I'm still waiting to hear how you're doing.")
//         .say('How are you?')
//         .route('how-are-you', state)
//     }

//     // add their response to state
//     state.status = text

//     msg
//       .say(`Ok then. What's your favorite color?`)
//       .route('color', state)
//   })
//   .route('color', (msg, state) => {
//     var text = (msg.body.event && msg.body.event.text) || ''

//     // user may not have typed text as their next action, ask again and re-route
//     if (!text) {
//       return msg
//         .say("I'm eagerly awaiting to hear your favorite color.")
//         .route('color', state)
//     }

//     // add their response to state
//     state.color = text

//     msg
//       .say('Thanks for sharing.')
//       .say(`Here's what you've told me so far: \`\`\`${JSON.stringify(state)}\`\`\``)
//     // At this point, since we don't route anywhere, the "conversation" is over
//   })

// // Can use a regex as well
// slapp.message(/^(thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
//   // You can provide a list of responses, and a random one will be chosen
//   // You can also include slack emoji in your responses
//   msg.say([
//     "You're welcome :smile:",
//     'You bet',
//     ':+1: Of course',
//     'Anytime :sun_with_face: :full_moon_with_face:'
//   ])
// })

// // demonstrate returning an attachment...
// slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
//   msg.say({
//     text: 'Check out this amazing attachment! :confetti_ball: ',
//     attachments: [{
//       text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
//       title: 'Slapp Library - Open Source',
//       image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
//       title_link: 'https://beepboophq.com/',
//       color: '#7CD197'
//     }]
//   })
// })



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
