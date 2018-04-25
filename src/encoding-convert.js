var config = require('./config')
var util = require('./util')
var EncodingDetect = require('./encoding-detect')

/**
 * UTF-16 (JavaScript Unicode array) to UTF-8
 */
function UNICODEToUTF8(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c, second

  for (; i < len; i++) {
    c = data[i]

    // high surrogate
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < len) {
      second = data[i + 1]
      // low surrogate
      if (second >= 0xdc00 && second <= 0xdfff) {
        c = (c - 0xd800) * 0x400 + second - 0xdc00 + 0x10000
        i++
      }
    }

    if (c < 0x80) {
      results[results.length] = c
    } else if (c < 0x800) {
      results[results.length] = 0xc0 | ((c >> 6) & 0x1f)
      results[results.length] = 0x80 | (c & 0x3f)
    } else if (c < 0x10000) {
      results[results.length] = 0xe0 | ((c >> 12) & 0xf)
      results[results.length] = 0x80 | ((c >> 6) & 0x3f)
      results[results.length] = 0x80 | (c & 0x3f)
    } else if (c < 0x200000) {
      results[results.length] = 0xf0 | ((c >> 18) & 0xf)
      results[results.length] = 0x80 | ((c >> 12) & 0x3f)
      results[results.length] = 0x80 | ((c >> 6) & 0x3f)
      results[results.length] = 0x80 | (c & 0x3f)
    }
  }

  return results
}
exports.UNICODEToUTF8 = UNICODEToUTF8

/**
 * UTF-8 to UTF-16 (JavaScript Unicode array)
 */
function UTF8ToUNICODE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var n, c, c2, c3, c4, code

  while (i < len) {
    c = data[i++]
    n = c >> 4
    if (n >= 0 && n <= 7) {
      // 0xxx xxxx
      code = c
    } else if (n === 12 || n === 13) {
      // 110x xxxx
      // 10xx xxxx
      c2 = data[i++]
      code = ((c & 0x1f) << 6) | (c2 & 0x3f)
    } else if (n === 14) {
      // 1110 xxxx
      // 10xx xxxx
      // 10xx xxxx
      c2 = data[i++]
      c3 = data[i++]
      code = ((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)
    } else if (n === 15) {
      // 1111 0xxx
      // 10xx xxxx
      // 10xx xxxx
      // 10xx xxxx
      c2 = data[i++]
      c3 = data[i++]
      c4 = data[i++]
      code =
        ((c & 0x7) << 18) |
        ((c2 & 0x3f) << 12) |
        ((c3 & 0x3f) << 6) |
        (c4 & 0x3f)
    }

    if (code <= 0xffff) {
      results[results.length] = code
    } else {
      // Split in surrogate halves
      code -= 0x10000
      results[results.length] = (code >> 10) + 0xd800 // High surrogate
      results[results.length] = code % 0x400 + 0xdc00 // Low surrogate
    }
  }

  return results
}
exports.UTF8ToUNICODE = UTF8ToUNICODE

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16
 *
 * UTF-16BE (big-endian)
 * Note: this function does not prepend the BOM by default.
 *
 * RFC 2781 4.3 Interpreting text labelled as UTF-16
 *   If the first two octets of the text is not 0xFE followed by
 *   0xFF, and is not 0xFF followed by 0xFE, then the text SHOULD be
 *   interpreted as being big-endian.
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UNICODEToUTF16(data, options) {
  var results

  if (options && options.bom) {
    var optBom = options.bom
    if (!util.isString(optBom)) {
      optBom = 'BE'
    }

    var bom, utf16
    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xfe, 0xff]
      utf16 = UNICODEToUTF16BE(data)
    } else {
      // Little-endian
      bom = [0xff, 0xfe]
      utf16 = UNICODEToUTF16LE(data)
    }

    results = []
    results[0] = bom[0]
    results[1] = bom[1]

    for (var i = 0, len = utf16.length; i < len; i++) {
      results[results.length] = utf16[i]
    }
  } else {
    // Without BOM: Convert as BE (SHOULD).
    results = UNICODEToUTF16BE(data)
  }

  return results
}
exports.UNICODEToUTF16 = UNICODEToUTF16

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16BE
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UNICODEToUTF16BE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c

  while (i < len) {
    c = data[i++]
    if (c <= 0xff) {
      results[results.length] = 0
      results[results.length] = c
    } else if (c <= 0xffff) {
      results[results.length] = (c >> 8) & 0xff
      results[results.length] = c & 0xff
    }
  }

  return results
}
exports.UNICODEToUTF16BE = UNICODEToUTF16BE

/**
 * UTF-16 (JavaScript Unicode array) to UTF-16LE
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UNICODEToUTF16LE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c

  while (i < len) {
    c = data[i++]
    if (c <= 0xff) {
      results[results.length] = c
      results[results.length] = 0
    } else if (c <= 0xffff) {
      results[results.length] = c & 0xff
      results[results.length] = (c >> 8) & 0xff
    }
  }

  return results
}
exports.UNICODEToUTF16LE = UNICODEToUTF16LE

/**
 * UTF-16BE to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UTF16BEToUNICODE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c1, c2

  if (
    len >= 2 &&
    ((data[0] === 0xfe && data[1] === 0xff) ||
      (data[0] === 0xff && data[1] === 0xfe))
  ) {
    i = 2
  }

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]
    if (c1 === 0) {
      results[results.length] = c2
    } else {
      results[results.length] = ((c1 & 0xff) << 8) | (c2 & 0xff)
    }
  }

  return results
}
exports.UTF16BEToUNICODE = UTF16BEToUNICODE

/**
 * UTF-16LE to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UTF16LEToUNICODE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c1, c2

  if (
    len >= 2 &&
    ((data[0] === 0xfe && data[1] === 0xff) ||
      (data[0] === 0xff && data[1] === 0xfe))
  ) {
    i = 2
  }

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]
    if (c2 === 0) {
      results[results.length] = c1
    } else {
      results[results.length] = ((c2 & 0xff) << 8) | (c1 & 0xff)
    }
  }

  return results
}
exports.UTF16LEToUNICODE = UTF16LEToUNICODE

/**
 * UTF-16 to UTF-16 (JavaScript Unicode array)
 *
 * @link https://www.ietf.org/rfc/rfc2781.txt
 * UTF-16, an encoding of ISO 10646
 */
function UTF16ToUNICODE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var isLE = false
  var first = true
  var c1, c2

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]

    if (first && i === 2) {
      first = false
      if (c1 === 0xfe && c2 === 0xff) {
        isLE = false
      } else if (c1 === 0xff && c2 === 0xfe) {
        // Little-endian
        isLE = true
      } else {
        isLE = EncodingDetect.isUTF16LE(data)
        i = 0
      }
      continue
    }

    if (isLE) {
      if (c2 === 0) {
        results[results.length] = c1
      } else {
        results[results.length] = ((c2 & 0xff) << 8) | (c1 & 0xff)
      }
    } else {
      if (c1 === 0) {
        results[results.length] = c2
      } else {
        results[results.length] = ((c1 & 0xff) << 8) | (c2 & 0xff)
      }
    }
  }

  return results
}
exports.UTF16ToUNICODE = UTF16ToUNICODE

/**
 * UTF-16 to UTF-16BE
 */
function UTF16ToUTF16BE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var isLE = false
  var first = true
  var c1, c2

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]

    if (first && i === 2) {
      first = false
      if (c1 === 0xfe && c2 === 0xff) {
        isLE = false
      } else if (c1 === 0xff && c2 === 0xfe) {
        // Little-endian
        isLE = true
      } else {
        isLE = EncodingDetect.isUTF16LE(data)
        i = 0
      }
      continue
    }

    if (isLE) {
      results[results.length] = c2
      results[results.length] = c1
    } else {
      results[results.length] = c1
      results[results.length] = c2
    }
  }

  return results
}
exports.UTF16ToUTF16BE = UTF16ToUTF16BE

/**
 * UTF-16BE to UTF-16
 */
function UTF16BEToUTF16(data, options) {
  var isLE = false
  var bom

  if (options && options.bom) {
    var optBom = options.bom
    if (!util.isString(optBom)) {
      optBom = 'BE'
    }

    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xfe, 0xff]
    } else {
      // Little-endian
      bom = [0xff, 0xfe]
      isLE = true
    }
  }

  var results = []
  var len = data && data.length
  var i = 0

  if (
    len >= 2 &&
    ((data[0] === 0xfe && data[1] === 0xff) ||
      (data[0] === 0xff && data[1] === 0xfe))
  ) {
    i = 2
  }

  if (bom) {
    results[0] = bom[0]
    results[1] = bom[1]
  }

  var c1, c2
  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]

    if (isLE) {
      results[results.length] = c2
      results[results.length] = c1
    } else {
      results[results.length] = c1
      results[results.length] = c2
    }
  }

  return results
}
exports.UTF16BEToUTF16 = UTF16BEToUTF16

/**
 * UTF-16 to UTF-16LE
 */
function UTF16ToUTF16LE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var isLE = false
  var first = true
  var c1, c2

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]

    if (first && i === 2) {
      first = false
      if (c1 === 0xfe && c2 === 0xff) {
        isLE = false
      } else if (c1 === 0xff && c2 === 0xfe) {
        // Little-endian
        isLE = true
      } else {
        isLE = EncodingDetect.isUTF16LE(data)
        i = 0
      }
      continue
    }

    if (isLE) {
      results[results.length] = c1
      results[results.length] = c2
    } else {
      results[results.length] = c2
      results[results.length] = c1
    }
  }

  return results
}
exports.UTF16ToUTF16LE = UTF16ToUTF16LE

/**
 * UTF-16LE to UTF-16
 */
function UTF16LEToUTF16(data, options) {
  var isLE = false
  var bom

  if (options && options.bom) {
    var optBom = options.bom
    if (!util.isString(optBom)) {
      optBom = 'BE'
    }

    if (optBom.charAt(0).toUpperCase() === 'B') {
      // Big-endian
      bom = [0xfe, 0xff]
    } else {
      // Little-endian
      bom = [0xff, 0xfe]
      isLE = true
    }
  }

  var results = []
  var len = data && data.length
  var i = 0

  if (
    len >= 2 &&
    ((data[0] === 0xfe && data[1] === 0xff) ||
      (data[0] === 0xff && data[1] === 0xfe))
  ) {
    i = 2
  }

  if (bom) {
    results[0] = bom[0]
    results[1] = bom[1]
  }

  var c1, c2
  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]

    if (isLE) {
      results[results.length] = c1
      results[results.length] = c2
    } else {
      results[results.length] = c2
      results[results.length] = c1
    }
  }

  return results
}
exports.UTF16LEToUTF16 = UTF16LEToUTF16

/**
 * UTF-16BE to UTF-16LE
 */
function UTF16BEToUTF16LE(data) {
  var results = []
  var i = 0
  var len = data && data.length
  var c1, c2

  if (
    len >= 2 &&
    ((data[0] === 0xfe && data[1] === 0xff) ||
      (data[0] === 0xff && data[1] === 0xfe))
  ) {
    i = 2
  }

  while (i < len) {
    c1 = data[i++]
    c2 = data[i++]
    results[results.length] = c2
    results[results.length] = c1
  }

  return results
}
exports.UTF16BEToUTF16LE = UTF16BEToUTF16LE

/**
 * UTF-16LE to UTF-16BE
 */
function UTF16LEToUTF16BE(data) {
  return UTF16BEToUTF16LE(data)
}
exports.UTF16LEToUTF16BE = UTF16LEToUTF16BE

/**
 * UTF-8 to UTF-16
 */
function UTF8ToUTF16(data, options) {
  return UNICODEToUTF16(UTF8ToUNICODE(data), options)
}
exports.UTF8ToUTF16 = UTF8ToUTF16

/**
 * UTF-16 to UTF-8
 */
function UTF16ToUTF8(data) {
  return UNICODEToUTF8(UTF16ToUNICODE(data))
}
exports.UTF16ToUTF8 = UTF16ToUTF8

/**
 * UTF-8 to UTF-16BE
 */
function UTF8ToUTF16BE(data) {
  return UNICODEToUTF16BE(UTF8ToUNICODE(data))
}
exports.UTF8ToUTF16BE = UTF8ToUTF16BE

/**
 * UTF-16BE to UTF-8
 */
function UTF16BEToUTF8(data) {
  return UNICODEToUTF8(UTF16BEToUNICODE(data))
}
exports.UTF16BEToUTF8 = UTF16BEToUTF8

/**
 * UTF-8 to UTF-16LE
 */
function UTF8ToUTF16LE(data) {
  return UNICODEToUTF16LE(UTF8ToUNICODE(data))
}
exports.UTF8ToUTF16LE = UTF8ToUTF16LE

/**
 * UTF-16LE to UTF-8
 */
function UTF16LEToUTF8(data) {
  return UNICODEToUTF8(UTF16LEToUNICODE(data))
}
exports.UTF16LEToUTF8 = UTF16LEToUTF8
