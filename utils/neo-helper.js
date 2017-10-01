const MathHelper = require('./math-helper')

const NeoHelper = {
  /**
   * Check if the address matches typical NEO wallet address syntax
   */
  IsValidAddress: function (address) {
    //TODO: Check if the first character is 'A'
    return (/^([a-zA-Z0-9]){34}$/.test(address) === true)
  },

  /**
   * Verify provided asset name and response with desire CoZ asset name casing convention:
   * - Neo
   * - Gas
   * - null
   */
  SanitizeAssetName: function (assetName) {
    if (/^(neo)$/i.test(assetName)) {
      return 'Neo'
    } else if (/^(gas)$/i.test(assetName)) {
      return 'Gas'
    } else {
      return null
    }
  },
  
  IsValidAmount: function (assetName, amount) {
    if (amount <= 0) {
      return false
    } else if (assetName === 'Neo' && !MathHelper.IsInt(amount)) {
      return false
    }
    return true
  },
}

module.exports = NeoHelper
