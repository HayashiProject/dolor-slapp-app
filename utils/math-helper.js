const MathHelper = {
  IsInt: function (n) {
    return (Number(n) === n) && (n % 1 === 0)
  },

  IsFloat: function (n) {
    return (Number(n) === n) && (n % 1 !== 0)
  },
}

module.exports = MathHelper
