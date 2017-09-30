const NeoHelper = {
  IsValidAddress: function (address) {
    return /^([a-zA-Z0-9]){34}$/.test(address)
  },
}

module.exports = SlappHelper
