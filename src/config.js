var util = require('./util')

var hasOwnProperty = Object.prototype.hasOwnProperty

// Alternate character when can't detect
exports.UNKNOWN_CHARACTER = 63 // '?'

var HAS_TYPED = (exports.HAS_TYPED =
  typeof Uint8Array !== 'undefined' && typeof Uint16Array !== 'undefined')

// Test for String.fromCharCode.apply
var CAN_CHARCODE_APPLY = false
var CAN_CHARCODE_APPLY_TYPED = false

try {
  if (String.fromCharCode.apply(null, [0x61]) === 'a') {
    CAN_CHARCODE_APPLY = true
  }
} catch (e) {}

if (HAS_TYPED) {
  try {
    if (String.fromCharCode.apply(null, new Uint8Array([0x61])) === 'a') {
      CAN_CHARCODE_APPLY_TYPED = true
    }
  } catch (e) {}
}

exports.CAN_CHARCODE_APPLY = CAN_CHARCODE_APPLY
exports.CAN_CHARCODE_APPLY_TYPED = CAN_CHARCODE_APPLY_TYPED

// Function.prototype.apply stack max range
exports.APPLY_BUFFER_SIZE = 65533
exports.APPLY_BUFFER_SIZE_OK = null

var EncodingNames = (exports.EncodingNames = {
  UTF32: {
    order: 0
  },
  UTF32BE: {
    alias: ['UCS4']
  },
  UTF32LE: null,
  UTF16: {
    order: 1
  },
  UTF16BE: {
    alias: ['UCS2']
  },
  UTF16LE: null,
  BINARY: {
    order: 2
  },
  ASCII: {
    order: 3,
    alias: ['ISO646', 'CP367']
  },
  UTF8: {
    order: 5
  },
  UNICODE: {
    order: 8
  }
})

var EncodingAliases = {}

exports.EncodingOrders = (function() {
  var aliases = EncodingAliases

  var names = util.getKeys(EncodingNames)
  var orders = []
  var name, encoding, j, l

  for (var i = 0, len = names.length; i < len; i++) {
    name = names[i]
    aliases[name] = name

    encoding = EncodingNames[name]
    if (encoding != null) {
      if (typeof encoding.order !== 'undefined') {
        orders[orders.length] = name
      }

      if (encoding.alias) {
        // Create encoding aliases
        for (j = 0, l = encoding.alias.length; j < l; j++) {
          aliases[encoding.alias[j]] = name
        }
      }
    }
  }

  orders.sort(function(a, b) {
    return EncodingNames[a].order - EncodingNames[b].order
  })

  return orders
})()

/**
 * Assign the internal encoding name from the argument encoding name
 */
function assignEncodingName(target) {
  var name = ''
  var expect = ('' + target).toUpperCase().replace(/[^A-Z0-9]+/g, '')
  var aliasNames = util.getKeys(EncodingAliases)
  var len = aliasNames.length
  var hit = 0
  var encoding, encodingLen, j

  for (var i = 0; i < len; i++) {
    encoding = aliasNames[i]
    if (encoding === expect) {
      name = encoding
      break
    }

    encodingLen = encoding.length
    for (j = hit; j < encodingLen; j++) {
      if (
        encoding.slice(0, j) === expect.slice(0, j) ||
        encoding.slice(-j) === expect.slice(-j)
      ) {
        name = encoding
        hit = j
      }
    }
  }

  if (hasOwnProperty.call(EncodingAliases, name)) {
    return EncodingAliases[name]
  }

  return name
}
exports.assignEncodingName = assignEncodingName
