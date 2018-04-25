var config = require('./config')
var util = require('./util')
var EncodingDetect = require('./encoding-detect')
var EncodingConvert = require('./encoding-convert')

var hasOwnProperty = Object.prototype.hasOwnProperty

var Encoding = {
  /**
   * Encoding orders
   */
  orders: config.EncodingOrders,

  /**
   * Detects character encoding
   *
   * If encodings is "AUTO", or the encoding-list as an array, or
   *   comma separated list string it will be detected automatically
   *
   * @param {Array.<number>|TypedArray|string} data The data being detected
   * @param {(Object|string|Array.<string>)=} [encodings] The encoding-list of
   *   character encoding
   * @return {string|boolean} The detected character encoding, or false
   */
  detect: function(data, encodings) {
    if (data == null || data.length === 0) {
      return false
    }

    if (util.isObject(encodings) && !util.isArray(encodings)) {
      encodings = encodings.encoding
    }

    if (util.isString(data)) {
      data = util.stringToBuffer(data)
    }

    if (encodings == null) {
      encodings = Encoding.orders
    } else {
      if (util.isString(encodings)) {
        encodings = encodings.toUpperCase()
        if (encodings === 'AUTO') {
          encodings = Encoding.orders
        } else if (~encodings.indexOf(',')) {
          encodings = encodings.split(/\s*,\s*/)
        } else {
          encodings = [encodings]
        }
      }
    }

    var len = encodings.length
    var e, encoding, method
    for (var i = 0; i < len; i++) {
      e = encodings[i]
      encoding = config.assignEncodingName(e)
      if (!encoding) {
        continue
      }

      method = 'is' + encoding
      if (!hasOwnProperty.call(EncodingDetect, method)) {
        throw new Error('Undefined encoding: ' + e)
      }

      if (EncodingDetect[method](data)) {
        return encoding
      }
    }

    return false
  },

  /**
   * Convert character encoding
   *
   * If `from` is "AUTO", or the encoding-list as an array, or
   *   comma separated list string it will be detected automatically
   *
   * @param {Array.<number>|TypedArray|string} data The data being converted
   * @param {(string|Object)} to The name of encoding to
   * @param {(string|Array.<string>)=} [from] The encoding-list of
   *   character encoding
   * @return {Array|TypedArray|string} The converted data
   */
  convert: function(data, to, from) {
    var result
    var type
    var options = {}

    if (util.isObject(to)) {
      options = to
      from = options.from
      to = options.to
      if (options.type) {
        type = options.type
      }
    }

    if (util.isString(data)) {
      type = type || 'string'
      data = util.stringToBuffer(data)
    } else if (data == null || data.length === 0) {
      data = []
    }

    var encodingFrom
    if (
      from != null &&
      util.isString(from) &&
      from.toUpperCase() !== 'AUTO' &&
      !~from.indexOf(',')
    ) {
      encodingFrom = config.assignEncodingName(from)
    } else {
      encodingFrom = Encoding.detect(data)
    }

    var encodingTo = config.assignEncodingName(to)
    var method = encodingFrom + 'To' + encodingTo

    if (hasOwnProperty.call(EncodingConvert, method)) {
      result = EncodingConvert[method](data, options)
    } else {
      // Returns the raw data if the method is undefined.
      result = data
    }

    switch (('' + type).toLowerCase()) {
      case 'string':
        return util.codeToString_fast(result)
      case 'arraybuffer':
        return util.codeToBuffer(result)
      case 'array':
      /* falls through */
      default:
        return util.bufferToCode(result)
    }
  },

  /**
   * Encode a character code array to URL string like encodeURIComponent
   *
   * @param {Array.<number>|TypedArray} data The data being encoded
   * @return {string} The percent encoded string
   */
  urlEncode: function(data) {
    if (util.isString(data)) {
      data = util.stringToBuffer(data)
    }

    var alpha = util.stringToCode('0123456789ABCDEF')
    var results = []
    var i = 0
    var len = data && data.length
    var b

    for (; i < len; i++) {
      b = data[i]

      //FIXME: JavaScript UTF-16 encoding
      if (b > 0xff) {
        return encodeURIComponent(util.codeToString_fast(data))
      }

      if (
        (b >= 0x61 /*a*/ && b <= 0x7a) /*z*/ ||
        (b >= 0x41 /*A*/ && b <= 0x5a) /*Z*/ ||
        (b >= 0x30 /*0*/ && b <= 0x39) /*9*/ ||
        b === 0x21 /*!*/ ||
        (b >= 0x27 /*'*/ && b <= 0x2a) /***/ ||
        b === 0x2d /*-*/ ||
        b === 0x2e /*.*/ ||
        b === 0x5f /*_*/ ||
        b === 0x7e /*~*/
      ) {
        results[results.length] = b
      } else {
        results[results.length] = 0x25 /*%*/
        if (b < 0x10) {
          results[results.length] = 0x30 /*0*/
          results[results.length] = alpha[b]
        } else {
          results[results.length] = alpha[(b >> 4) & 0xf]
          results[results.length] = alpha[b & 0xf]
        }
      }
    }

    return util.codeToString_fast(results)
  },

  /**
   * Decode a percent encoded string to
   *  character code array like decodeURIComponent
   *
   * @param {string} string The data being decoded
   * @return {Array.<number>} The decoded array
   */
  urlDecode: function(string) {
    var results = []
    var i = 0
    var len = string && string.length
    var c

    while (i < len) {
      c = string.charCodeAt(i++)
      if (c === 0x25 /*%*/) {
        results[results.length] = parseInt(
          string.charAt(i++) + string.charAt(i++),
          16
        )
      } else {
        results[results.length] = c
      }
    }

    return results
  },

  /**
   * Encode a character code array to Base64 encoded string
   *
   * @param {Array.<number>|TypedArray} data The data being encoded
   * @return {string} The Base64 encoded string
   */
  base64Encode: function(data) {
    if (util.isString(data)) {
      data = util.stringToBuffer(data)
    }
    return util.base64encode(data)
  },

  /**
   * Decode a Base64 encoded string to character code array
   *
   * @param {string} string The data being decoded
   * @return {Array.<number>} The decoded array
   */
  base64Decode: function(string) {
    return util.base64decode(string)
  },

  /**
   * Joins a character code array to string
   *
   * @param {Array.<number>|TypedArray} data The data being joined
   * @return {String} The joined string
   */
  codeToString: util.codeToString_fast,

  /**
   * Splits string to an array of character codes
   *
   * @param {string} string The input string
   * @return {Array.<number>} The character code array
   */
  stringToCode: util.stringToCode
}

module.exports = Encoding
