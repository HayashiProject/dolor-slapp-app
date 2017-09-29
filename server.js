/**
 * Dolor Slack Bot
 * 
 * TODO:
 * - Better cater imprecise command input (additional space, case sensitivity, alternate command etc)
 * - Diagnose neon-js health
 * - Transfer balance with "send [address] [neo amount] [gas amount]"
 * - Check TX status
 * - Load bot version value from package.json
 */
'use strict'

const express = require('express')
const SlappHelper = require('./helpers/slapp-helper')
const Profiles = require('./helpers/profiles')
const Neon = require('neon-js')

// -- Arrange

const VERSION = 'dolor-15'
const COMMAND_HANDLER = '/dolor'
const HELP_TEXT = `
I will respond to the following commands:
\`help\` - to see this message.
\`version\` - to see version of this Slack bot.
\`random\` - to output a random sentence, for fun.
\`height\` - to output current blockchain height.
\`wallet\` - to output this bot's wallet information.
\`send <address> <quantity> <asset-name>\` - to make a transfer from bot's account.
\`send help\` - to see help more help message on how to use 'send' command.
`
let port = SlappHelper.GetPort()
let slapp = SlappHelper.CreateSlapp()



//*********************************************
// Setup commands handlers
//*********************************************

slapp.command(COMMAND_HANDLER, 'version', (msg) => {
  msg.say(`Version \`${VERSION}\``)
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

slapp.command(COMMAND_HANDLER, 'send help', (msg) => {
  //TODO: list available fund
  msg.say(`Message on how to use \`send\` command... (TBA)`)
})

slapp.command(COMMAND_HANDLER, 'send (.*)', (msg, text, match) => {
  msg.say('So you want to make a transaction...')
    .say(`text: \`${text}\``)
    .say(`match: \`${match}\``)
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
// Legacy
//*********************************************

// slapp.command(COMMAND_HANDLER, 'whisper', (msg) => {
//   /**
//    * msg.response() will create response that's only visible to the requestee.
//    */
//   /**
//    * msg.response() doesn't take array as it will just response with entire array.
//    * Have to use msg.say() for random sentence usage.
//    */
//   msg.response('Dont forget umbrella.')
// })

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

// slapp.command('/dolor', '(.*)', (msg) => {
//   msg.response('I know you are saying something, but Im not sure what to do...')
// })

// slapp.message('foobar', ['mention', 'direct_message'], (msg) => {
//   msg.say('FOOBAR! FOO BAR!!')
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
