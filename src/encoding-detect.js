/**
 * Binary (exe, images and so, etc.)
 *
 * Note:
 *   This function is not considered for Unicode
 */
function isBINARY(data) {
  var i = 0
  var len = data && data.length
  var c

  for (; i < len; i++) {
    c = data[i]
    if (c > 0xff) {
      return false
    }

    if ((c >= 0x00 && c <= 0x07) || c === 0xff) {
      return true
    }
  }

  return false
}
exports.isBINARY = isBINARY

/**
 * ASCII (ISO-646)
 */
function isASCII(data) {
  var i = 0
  var len = data && data.length
  var b

  for (; i < len; i++) {
    b = data[i]
    if (b > 0xff || (b >= 0x80 && b <= 0xff) || b === 0x1b) {
      return false
    }
  }

  return true
}
exports.isASCII = isASCII

/**
 * UTF-8
 */
function isUTF8(data) {
  var i = 0
  var len = data && data.length
  var b

  for (; i < len; i++) {
    b = data[i]
    if (b > 0xff) {
      return false
    }

    if (b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b <= 0x7e)) {
      continue
    }

    if (b >= 0xc2 && b <= 0xdf) {
      if (i + 1 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xbf) {
        return false
      }
      i++
    } else if (b === 0xe0) {
      if (
        i + 2 >= len ||
        data[i + 1] < 0xa0 ||
        data[i + 1] > 0xbf ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf
      ) {
        return false
      }
      i += 2
    } else if ((b >= 0xe1 && b <= 0xec) || b === 0xee || b === 0xef) {
      if (
        i + 2 >= len ||
        data[i + 1] < 0x80 ||
        data[i + 1] > 0xbf ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf
      ) {
        return false
      }
      i += 2
    } else if (b === 0xed) {
      if (
        i + 2 >= len ||
        data[i + 1] < 0x80 ||
        data[i + 1] > 0x9f ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf
      ) {
        return false
      }
      i += 2
    } else if (b === 0xf0) {
      if (
        i + 3 >= len ||
        data[i + 1] < 0x90 ||
        data[i + 1] > 0xbf ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf ||
        data[i + 3] < 0x80 ||
        data[i + 3] > 0xbf
      ) {
        return false
      }
      i += 3
    } else if (b >= 0xf1 && b <= 0xf3) {
      if (
        i + 3 >= len ||
        data[i + 1] < 0x80 ||
        data[i + 1] > 0xbf ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf ||
        data[i + 3] < 0x80 ||
        data[i + 3] > 0xbf
      ) {
        return false
      }
      i += 3
    } else if (b === 0xf4) {
      if (
        i + 3 >= len ||
        data[i + 1] < 0x80 ||
        data[i + 1] > 0x8f ||
        data[i + 2] < 0x80 ||
        data[i + 2] > 0xbf ||
        data[i + 3] < 0x80 ||
        data[i + 3] > 0xbf
      ) {
        return false
      }
      i += 3
    } else {
      return false
    }
  }

  return true
}
exports.isUTF8 = isUTF8

/**
 * UTF-16 (LE or BE)
 *
 * RFC2781: UTF-16, an encoding of ISO 10646
 *
 * @link http://www.ietf.org/rfc/rfc2781.txt
 */
function isUTF16(data) {
  var i = 0
  var len = data && data.length
  var pos = null
  var b1, b2, next, prev

  if (len < 2) {
    if (data[0] > 0xff) {
      return false
    }
  } else {
    b1 = data[0]
    b2 = data[1]
    if (
      b1 === 0xff && // BOM (little-endian)
      b2 === 0xfe
    ) {
      return true
    }
    if (
      b1 === 0xfe && // BOM (big-endian)
      b2 === 0xff
    ) {
      return true
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i
        break
      } else if (data[i] > 0xff) {
        return false
      }
    }

    if (pos === null) {
      return false // Non ASCII
    }

    next = data[pos + 1] // BE
    if (next !== void 0 && next > 0x00 && next < 0x80) {
      return true
    }

    prev = data[pos - 1] // LE
    if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
      return true
    }
  }

  return false
}
exports.isUTF16 = isUTF16

/**
 * UTF-16BE (big-endian)
 *
 * RFC 2781 4.3 Interpreting text labelled as UTF-16
 * Text labelled "UTF-16BE" can always be interpreted as being big-endian
 *  when BOM does not founds (SHOULD)
 *
 * @link http://www.ietf.org/rfc/rfc2781.txt
 */
function isUTF16BE(data) {
  var i = 0
  var len = data && data.length
  var pos = null
  var b1, b2

  if (len < 2) {
    if (data[0] > 0xff) {
      return false
    }
  } else {
    b1 = data[0]
    b2 = data[1]
    if (
      b1 === 0xfe && // BOM
      b2 === 0xff
    ) {
      return true
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i
        break
      } else if (data[i] > 0xff) {
        return false
      }
    }

    if (pos === null) {
      return false // Non ASCII
    }

    if (pos % 2 === 0) {
      return true
    }
  }

  return false
}
exports.isUTF16BE = isUTF16BE

/**
 * UTF-16LE (little-endian)
 */
function isUTF16LE(data) {
  var i = 0
  var len = data && data.length
  var pos = null
  var b1, b2

  if (len < 2) {
    if (data[0] > 0xff) {
      return false
    }
  } else {
    b1 = data[0]
    b2 = data[1]
    if (
      b1 === 0xff && // BOM
      b2 === 0xfe
    ) {
      return true
    }

    for (; i < len; i++) {
      if (data[i] === 0x00) {
        pos = i
        break
      } else if (data[i] > 0xff) {
        return false
      }
    }

    if (pos === null) {
      return false // Non ASCII
    }

    if (pos % 2 !== 0) {
      return true
    }
  }

  return false
}
exports.isUTF16LE = isUTF16LE

/**
 * UTF-32
 *
 * Unicode 3.2.0: Unicode Standard Annex #19
 *
 * @link http://www.iana.org/assignments/charset-reg/UTF-32
 * @link http://www.unicode.org/reports/tr19/tr19-9.html
 */
function isUTF32(data) {
  var i = 0
  var len = data && data.length
  var pos = null
  var b1, b2, b3, b4
  var next, prev

  if (len < 4) {
    for (; i < len; i++) {
      if (data[i] > 0xff) {
        return false
      }
    }
  } else {
    b1 = data[0]
    b2 = data[1]
    b3 = data[2]
    b4 = data[3]
    if (
      b1 === 0x00 &&
      b2 === 0x00 && // BOM (big-endian)
      b3 === 0xfe &&
      b4 === 0xff
    ) {
      return true
    }

    if (
      b1 === 0xff &&
      b2 === 0xfe && // BOM (little-endian)
      b3 === 0x00 &&
      b4 === 0x00
    ) {
      return true
    }

    for (; i < len; i++) {
      if (data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00) {
        pos = i
        break
      } else if (data[i] > 0xff) {
        return false
      }
    }

    if (pos === null) {
      return false
    }

    // The byte order should be the big-endian when BOM is not detected.
    next = data[pos + 3]
    if (next !== void 0 && next > 0x00 && next <= 0x7f) {
      // big-endian
      return data[pos + 2] === 0x00 && data[pos + 1] === 0x00
    }

    prev = data[pos - 1]
    if (prev !== void 0 && prev > 0x00 && prev <= 0x7f) {
      // little-endian
      return data[pos + 1] === 0x00 && data[pos + 2] === 0x00
    }
  }

  return false
}
exports.isUTF32 = isUTF32

/**
 * JavaScript Unicode array
 */
function isUNICODE(data) {
  var i = 0
  var len = data && data.length
  var c

  for (; i < len; i++) {
    c = data[i]
    if (c < 0 || c > 0x10ffff) {
      return false
    }
  }

  return true
}
exports.isUNICODE = isUNICODE
