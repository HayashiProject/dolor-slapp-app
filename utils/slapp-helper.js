const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

const SlappHelper = {
    CreateSlapp: function () {
        return Slapp({
            // Beep Boop sets the SLACK_VERIFY_TOKEN env var
            verify_token: process.env.SLACK_VERIFY_TOKEN,
            convo_store: ConvoStore(),
            context: Context()
          });
    },

    GetPort: function () {
        // use `PORT` env var on Beep Boop - default to 3000 locally
        return process.env.PORT || 3000;
    },
};

module.exports = SlappHelper;
