'use strict';

var assert = require('assert');
var fs = require('fs');
var encoding = require('../encoding');


describe('Encoding', function() {
  var encodings = [UTF-8'];
  var urlEncoded = {
    UTF8: '%E3%81%93%E3%81%AE%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AF%20UTF-8%20%E3%81%A7%E6%9B%B8%E3%81%8B%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%82'
  };

  var getExpectedName = function(name) {
    return name.replace(/\W/g, '');
  };

  var getExpectedText = function(name) {
    return '\u3053\u306e\u30c6\u30ad\u30b9\u30c8\u306f ' + name +
      ' \u3067\u66f8\u304b\u308c\u3066\u3044\u307e\u3059\u3002';
  };

  var getFileName = function(name) {
    return __dirname + '/encoding-' + getExpectedName(name).toLowerCase() + '.txt';
  };

  var getCode = function(data) {
    var code = [];
    for (var i = 0, len = data.length; i < len; i++) {
      code.push(data[i]);
    }
    return code;
  };

  var buffers = {};
  var tests = {};

  before(function() {
    tests.unicode = [];
    for (var i = 0; i <= 0xffff; i++) {
      tests.unicode.push(i);
    }
    tests.surrogatePairs = [0xD844, 0xDE7B];
    tests.ascii = 'Hello World.';
    tests.surrogatePairs2 = fs.readFileSync(__dirname + '/surrogate-pairs-utf8.txt');

    encodings.forEach(function(encodingName) {
      var data = fs.readFileSync(getFileName(encodingName));
      buffers[encodingName] = data;
    });
  });

  describe('detect', function() {
    encodings.forEach(function(encodingName) {
      it(encodingName, function () {
        var res = encoding.detect(buffers[encodingName]);
        assert.equal(res, getExpectedName(encodingName));
      });
    });

    it('UTF-16, UTF-16BE', function() {
      var utf16 = [
        0xFE,0xFF,0x30,0x53,0x30,0x6E,0x30,0xC6,0x30,0xAD,0x30,0xB9,0x30,
        0xC8,0x30,0x6F,0x00,0x20,0x00,0x55,0x00,0x54,0x00,0x46,0x00,0x2D,
        0x00,0x31,0x00,0x36,0x00,0x20,0x30,0x67,0x66,0xF8,0x30,0x4B,0x30,
        0x8C,0x30,0x66,0x30,0x44,0x30,0x7E,0x30,0x59,0x30,0x02
      ];
      assert(encoding.detect(utf16, 'utf-16'));
      assert(encoding.detect(utf16) === 'UTF16');

      var utf16_noBom = utf16.slice(2);
      assert(encoding.detect(utf16_noBom, 'utf-16'));
      assert(/^UTF16/.test(encoding.detect(utf16_noBom)));
    });

    it('UTF-16LE', function() {
      var utf16le = [
        0x53,0x30,0x6E,0x30,0xC6,0x30,0xAD,0x30,0xB9,0x30,0xC8,0x30,0x6F,
        0x30,0x20,0x00,0x55,0x00,0x54,0x00,0x46,0x00,0x2D,0x00,0x31,0x00,
        0x36,0x00,0x4C,0x00,0x45,0x00,0x20,0x00,0x67,0x30,0xF8,0x66,0x4B,
        0x30,0x8C,0x30,0x66,0x30,0x44,0x30,0x7E,0x30,0x59,0x30,0x02,0x30
      ];
      assert(encoding.detect(utf16le, 'utf-16'));
      assert(encoding.detect(utf16le) === 'UTF16');
    });

    it('UTF-32, UTF-32BE', function() {
      var utf32 = [
        0x00,0x00,0xFE,0xFF,0x00,0x00,0x30,0x53,0x00,0x00,0x30,0x6E,0x00,
        0x00,0x30,0xC6,0x00,0x00,0x30,0xAD,0x00,0x00,0x30,0xB9,0x00,0x00,
        0x30,0xC8,0x00,0x00,0x30,0x6F,0x00,0x00,0x00,0x20,0x00,0x00,0x00,
        0x55,0x00,0x00,0x00,0x54,0x00,0x00,0x00,0x46,0x00,0x00,0x00,0x2D,
        0x00,0x00,0x00,0x33,0x00,0x00,0x00,0x32,0x00,0x00,0x00,0x20,0x00,
        0x00,0x30,0x67,0x00,0x00,0x66,0xF8,0x00,0x00,0x30,0x4B,0x00,0x00,
        0x30,0x8C,0x00,0x00,0x30,0x66,0x00,0x00,0x30,0x44,0x00,0x00,0x30,
        0x7E,0x00,0x00,0x30,0x59,0x00,0x00,0x30,0x02
      ];
      assert(encoding.detect(utf32, 'utf-32'));
      assert(encoding.detect(utf32) === 'UTF32');

      var utf32_noBom = utf32.slice(4);
      assert(encoding.detect(utf32_noBom, 'utf-32'));
      assert(/^UTF32/.test(encoding.detect(utf32_noBom)));
    });

    it('UTF-32LE', function() {
      var utf32le = [
        0x53,0x30,0x00,0x00,0x6E,0x30,0x00,0x00,0xC6,0x30,0x00,0x00,0xAD,
        0x30,0x00,0x00,0xB9,0x30,0x00,0x00,0xC8,0x30,0x00,0x00,0x6F,0x30,
        0x00,0x00,0x20,0x00,0x00,0x00,0x55,0x00,0x00,0x00,0x54,0x00,0x00,
        0x00,0x46,0x00,0x00,0x00,0x2D,0x00,0x00,0x00,0x33,0x00,0x00,0x00,
        0x32,0x00,0x00,0x00,0x4C,0x00,0x00,0x00,0x45,0x00,0x00,0x00,0x20,
        0x00,0x00,0x00,0x67,0x30,0x00,0x00,0xF8,0x66,0x00,0x00,0x4B,0x30,
        0x00,0x00,0x8C,0x30,0x00,0x00,0x66,0x30,0x00,0x00,0x44,0x30,0x00,
        0x00,0x7E,0x30,0x00,0x00,0x59,0x30,0x00,0x00,0x02,0x30,0x00,0x00
      ];
      assert(encoding.detect(utf32le, 'utf-32'));
      assert(encoding.detect(utf32le) === 'UTF32');
    });
  });

  describe('convert', function() {
    encodings.forEach(function(encodingName) {
      it(encodingName, function () {
        var res = encoding.codeToString(
          encoding.convert(buffers[encodingName], 'unicode', encodingName));
        assert.equal(res, getExpectedText(encodingName));
      });
    });

    it('ASCII', function() {
      assert(tests.ascii.length > 0);
      var encoded = encoding.convert(tests.ascii, 'sjis', 'auto');
      assert(encoded.length > 0);
      var decoded = encoding.convert(encoded, 'unicode', 'auto');
      assert(decoded.length > 0);
      assert.deepEqual(decoded, tests.ascii);
    });

    it('Unicode/UTF-8', function() {
      assert(tests.unicode.length === 65536);
      var utf8 = encoding.convert(tests.unicode, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, tests.unicode);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length === 65536);
      assert.deepEqual(unicode, tests.unicode);
    });

    it('Object arguments', function() {
      var text = getExpectedText(getExpectedName('UTF-8'));
      var data = encoding.stringToCode(text);
      assert(data.length > 0);
      assert(encoding.detect(data, 'UNICODE'));

      var utf8 = encoding.convert(data, {
        to: 'utf-8',
        from: 'unicode'
      });
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, data);
      assert(encoding.detect(utf8, 'utf-8'));

      var unicode = encoding.convert(utf8, {
        to: 'unicode',
        from: 'utf-8'
      });
      assert(unicode.length > 0);
      assert.deepEqual(unicode, data);
      assert(encoding.detect(unicode, 'unicode'));
    });

    it('Surrogate pairs', function() {
      assert(tests.surrogatePairs.length >= 2);
      var utf8 = encoding.convert(tests.surrogatePairs, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, tests.surrogatePairs);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length >= 2);
      assert.deepEqual(unicode, tests.surrogatePairs);
    });

    it('Surrogate pairs and UTF-8 conversion', function() {
      var surrogatePairs = [
        83,117,114,114,111,103,97,116,101,32,80,97,105,114,115,32,84,
        101,115,116,10,55362,57271,37326,23478,12391,55399,56893,10
      ];
      var surrogatePairs_utf8 = [
        0x53, 0x75, 0x72, 0x72, 0x6F, 0x67, 0x61, 0x74, 0x65, 0x20,
        0x50, 0x61, 0x69, 0x72, 0x73, 0x20, 0x54, 0x65, 0x73, 0x74,
        0x0A, 0xF0, 0xA0, 0xAE, 0xB7, 0xE9, 0x87, 0x8E, 0xE5, 0xAE,
        0xB6, 0xE3, 0x81, 0xA7, 0xF0, 0xA9, 0xB8, 0xBD, 0x0A
      ];
      var utf8 = encoding.convert(surrogatePairs, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, surrogatePairs);
      assert.deepEqual(utf8, surrogatePairs_utf8);

      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length > 0);
      assert.notDeepEqual(unicode, utf8);
      assert.deepEqual(unicode, surrogatePairs);
    });

    it('Surrogate pairs and UTF-16 conversion', function() {
      var surrogatePairs = [];
      for (var i = 0; i < tests.surrogatePairs2.length; i++) {
        surrogatePairs.push(tests.surrogatePairs2[i]);
      }
      assert(surrogatePairs.length >= 2);
      var utf8 = encoding.convert(surrogatePairs, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, surrogatePairs);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length >= 2);
      assert.deepEqual(unicode, surrogatePairs);

      var utf16 = encoding.convert(utf8, 'utf-16', 'utf-8');
      assert(utf16.length > 0);
      assert.notDeepEqual(utf16, utf8);
      var isUTF16 = encoding.detect(utf16, 'utf-16');
      assert(isUTF16);
      var c1 = utf16[0];
      var c2 = utf16[1];
      // Check BOM
      assert(!((c1 === 0xFE && c2 === 0xFF) && (c1 === 0xFF && c2 === 0xFE)));
      var newUTF8 = encoding.convert(utf16, 'utf-8', 'utf-16');
      assert.deepEqual(utf8, newUTF8);
      var newUnicode = encoding.convert(utf16, 'unicode', 'utf-16');
      assert.deepEqual(newUnicode, unicode);
    });

    it('UTF-16 with BOM conversion', function() {
      var data = [];
      for (var i = 0; i < tests.surrogatePairs2.length; i++) {
        data.push(tests.surrogatePairs2[i]);
      }
      assert(data.length > 0);
      var utf8 = encoding.convert(data, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, data);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length > 0);
      assert.deepEqual(unicode, data);

      // UTF-16 without BOM
      var utf16_noBom = encoding.convert(utf8, 'utf-16', 'utf-8');
      assert(utf16_noBom.length > 0);
      assert.notDeepEqual(utf16_noBom, utf8);

      var c1 = utf16_noBom[0];
      var c2 = utf16_noBom[1];
      // Check BOM
      assert(!((c1 === 0xFE && c2 === 0xFF) && (c1 === 0xFF && c2 === 0xFE)));

      // Test detect
      var isUTF16 = encoding.detect(utf16_noBom, 'utf-16');
      assert(isUTF16);
      var isUTF16BE = encoding.detect(utf16_noBom, 'utf-16be');
      assert(isUTF16BE);
      var isUTF16LE = encoding.detect(utf16_noBom, 'utf-16le');
      assert(!isUTF16LE);

      // UTF-16 with BOM (BE)
      var utf16_bom_true = encoding.convert(utf8, {
        to: 'utf-16',
        from: 'utf-8',
        bom: true
      });

      c1 = utf16_bom_true[0];
      c2 = utf16_bom_true[1];
      // Check BOM
      assert(c1 === 0xFE && c2 === 0xFF);

      // Test detect
      isUTF16 = encoding.detect(utf16_bom_true, 'utf-16');
      assert(isUTF16);
      isUTF16BE = encoding.detect(utf16_bom_true, 'utf-16be');
      assert(isUTF16BE);
      isUTF16LE = encoding.detect(utf16_bom_true, 'utf-16le');
      assert(!isUTF16LE);

      // Check other argument specified
      var utf16_bom_be = encoding.convert(utf8, {
        to: 'utf-16',
        from: 'utf-8',
        bom: 'be'
      });
      assert.deepEqual(utf16_bom_true, utf16_bom_be);

      var newUTF8 = encoding.convert(utf16_bom_be, 'utf-8', 'utf-16');
      assert.deepEqual(utf8, newUTF8);
      var newUnicode = encoding.convert(utf16_bom_be, 'unicode', 'utf-16');
      assert.deepEqual(newUnicode, unicode);

      // UTF-16 with BOM (LE)
      var utf16_bom_le = encoding.convert(utf8, {
        to: 'utf-16',
        from: 'utf-8',
        bom: 'le'
      });

      c1 = utf16_bom_le[0];
      c2 = utf16_bom_le[1];
      // Check BOM
      assert(c1 === 0xFF && c2 === 0xFE);

      // Test detect
      isUTF16 = encoding.detect(utf16_bom_le, 'utf-16');
      assert(isUTF16);
      isUTF16BE = encoding.detect(utf16_bom_le, 'utf-16be');
      assert(!isUTF16BE);
      isUTF16LE = encoding.detect(utf16_bom_le, 'utf-16le');
      assert(isUTF16LE);

      newUTF8 = encoding.convert(utf16_bom_le, 'utf-8', 'utf-16');
      assert.deepEqual(utf8, newUTF8);
      newUnicode = encoding.convert(utf16_bom_le, 'unicode', 'utf-16');
      assert.deepEqual(newUnicode, unicode);
    });

    it('UTF-16BE conversion', function() {
      var data = [];
      for (var i = 0; i < tests.surrogatePairs2.length; i++) {
        data.push(tests.surrogatePairs2[i]);
      }
      assert(data.length > 0);
      var utf8 = encoding.convert(data, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, data);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length > 0);
      assert.deepEqual(unicode, data);

      var utf16be = encoding.convert(utf8, 'utf-16be', 'utf-8');
      assert(utf16be.length > 0);
      assert.notDeepEqual(utf16be, utf8);

      var isUTF16BE = encoding.detect(utf16be, 'utf-16be');
      assert(isUTF16BE);
      var isUTF16 = encoding.detect(utf16be, 'utf-16');
      assert(isUTF16);
      var isUTF16LE = encoding.detect(utf16be, 'utf-16le');
      assert(!isUTF16LE);

      var c1 = utf16be[0];
      var c2 = utf16be[1];
      // Check BOM
      assert(!((c1 === 0xFE && c2 === 0xFF) && (c1 === 0xFF && c2 === 0xFE)));
      var newUTF8 = encoding.convert(utf16be, 'utf-8', 'utf-16be');
      assert.deepEqual(utf8, newUTF8);
      var newUnicode = encoding.convert(utf16be, 'unicode', 'utf-16be');
      assert.deepEqual(newUnicode, unicode);
    });

    it('UTF-16LE conversion', function() {
      var data = [];
      for (var i = 0; i < tests.surrogatePairs2.length; i++) {
        data.push(tests.surrogatePairs2[i]);
      }
      assert(data.length > 0);
      var utf8 = encoding.convert(data, 'utf-8', 'unicode');
      assert(utf8.length > 0);
      assert.notDeepEqual(utf8, data);
      var unicode = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(unicode.length > 0);
      assert.deepEqual(unicode, data);

      var utf16le = encoding.convert(utf8, 'utf-16le', 'utf-8');
      assert(utf16le.length > 0);
      assert.notDeepEqual(utf16le, utf8);

      var isUTF16LE = encoding.detect(utf16le, 'utf-16le');
      assert(isUTF16LE);
      var isUTF16 = encoding.detect(utf16le, 'utf-16');
      assert(isUTF16);
      var isUTF16BE = encoding.detect(utf16le, 'utf-16be');
      assert(!isUTF16BE);

      var c1 = utf16le[0];
      var c2 = utf16le[1];
      // Check BOM
      assert(!((c1 === 0xFE && c2 === 0xFF) && (c1 === 0xFF && c2 === 0xFE)));
      var newUTF8 = encoding.convert(utf16le, 'utf-8', 'utf-16le');
      assert.deepEqual(utf8, newUTF8);
      var newUnicode = encoding.convert(utf16le, 'unicode', 'utf-16le');
      assert.deepEqual(newUnicode, unicode);
    });

    it('UTF-8 to Unicode', function() {
      var encoded = encoding.convert(tests.jisx0208, {
        to: 'unicode',
        from: 'utf-8'
      });
      assert(encoded.length > 0);
      assert(encoding.detect(encoded, 'unicode'));
      assert(encoding.detect(encoded) === 'UNICODE');
      tests.jisx0208_unicode = encoded;
    });

    encodingNames = [
      'UTF16', 'UTF16BE', 'UTF16LE', 'SJIS', 'EUCJP', 'JIS', 'UTF8'
    ];
    encodingNames.forEach(function(encodingName) {
      it('UNICODE to ' + encodingName, function() {
        assert(tests.jisx0208_unicode.length > 0);
        assert(encoding.detect(tests.jisx0208_unicode, 'unicode'));
        assert(encoding.detect(tests.jisx0208_unicode) === 'UNICODE');
        var encoded = encoding.convert(tests.jisx0208_unicode, {
          to: encodingName,
          from: 'unicode'
        });
        assert(encoded.length > 0);
        assert(encoding.detect(encoded, encodingName));

        var detected = encoding.detect(encoded);
        if (/^UTF16/.test(encodingName)) {
          assert(/^UTF16/.test(detected));
        } else {
          assert(detected === encodingName);
        }

        var decoded = encoding.convert(encoded, {
          to: 'unicode',
          from: encodingName
        });
        assert.deepEqual(decoded, tests.jisx0208_unicode);
      });
    });
  });

  describe('urlEncode/urlDecode', function() {
    encodings.forEach(function(encodingName) {
      it(encodingName, function () {
        var data = buffers[encodingName];
        var res = encoding.urlEncode(data);
        assert.equal(res, urlEncoded[getExpectedName(encodingName)]);
        assert.deepEqual(getCode(data), encoding.urlDecode(res));
      });
    });
  });

  describe('base64Encode/base64Decode', function() {
    encodings.forEach(function(encodingName) {
      it(encodingName, function () {
        var data = buffers[encodingName];
        var res = encoding.base64Encode(data);
        assert(typeof res === 'string');
        assert.equal(res, data.toString('base64'));
        assert.deepEqual(getCode(data), encoding.base64Decode(res));
      });
    });
  });


  describe('Assign/Expect encoding names', function() {
    var aliasNames = {
      'UCS-4': 'UTF32BE',
      'UCS-2': 'UTF16BE',
      'UCS4': 'UTF32BE',
      'UCS2': 'UTF16BE',
      'ISO 646': 'ASCII',
      'CP367': 'ASCII'
    };

    var text = getExpectedText(getExpectedName('UTF-8'));
    var data = encoding.stringToCode(text);
    assert(data.length > 0);
    assert(encoding.detect(data, 'UNICODE'));
  });

  describe('Result types of convert/detect', function() {
    var string = getExpectedText(getExpectedName('UTF-8'));
    assert(string.length > 0);

    var array = encoding.stringToCode(string);
    assert(array.length > 0);
    assert(encoding.detect(array, 'UNICODE'));

    var isTypedArray = function(a) {
      return !Array.isArray(a) && a != null &&
        typeof a.subarray !== 'undefined';
    };

    var isString = function(a) {
      return typeof a === 'string';
    };

    it('null/undefined', function() {
      var encoded = encoding.convert(null, 'utf-8');
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert(void 0, 'utf-8');
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));
    });

    it('array by default', function() {
      var encoded = encoding.convert([], 'utf-8');
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert([1], 'utf-8');
      assert(encoded.length === 1);
      assert(Array.isArray(encoded));

      encoded = encoding.convert(new Array(), 'utf-8');
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      var a = new Array(2);
      a[0] = 1;
      a[1] = 2;
      encoded = encoding.convert(a, 'utf-8');
      assert(encoded.length === 2);
      assert(Array.isArray(encoded));
    });

    it('Pass the string argument', function() {
      var encoded = encoding.convert('', 'utf-8');
      assert(encoded.length === 0);
      assert(isString(encoded));

      encoded = encoding.convert('123', 'utf-8');
      assert(encoded.length === 3);
      assert(isString(encoded));

      var utf8 = '\u00E3\u0081\u0093\u00E3\u0082\u0093\u00E3\u0081' +
        '\u00AB\u00E3\u0081\u00A1\u00E3\u0081\u00AF';

      var expect = '\u3053\u3093\u306B\u3061\u306F';

      encoded = encoding.convert(utf8, 'unicode', 'utf-8');
      assert(encoded.length > 0);
      assert(isString(encoded));
      assert.equal(encoded, expect);

      var detected = encoding.detect(utf8);
      assert.equal(detected, 'UTF8');
      detected = encoding.detect(expect);
      assert.equal(detected, 'UNICODE');
    });

    it('Specify { type: "array" }', function() {
      var encoded = encoding.convert(null, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert(void 0, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert('', {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert('123', {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 3);
      assert(Array.isArray(encoded));

      encoded = encoding.convert([], {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      encoded = encoding.convert([0x61, 0x62], {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 2);
      assert(Array.isArray(encoded));

      var buffer = new Buffer(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      buffer = new Buffer(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 2);
      assert(Array.isArray(encoded));

      buffer = new Uint8Array(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 0);
      assert(Array.isArray(encoded));

      buffer = new Uint8Array(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'array'
      });
      assert(encoded.length === 2);
      assert(Array.isArray(encoded));
    });

    it('Specify { type: "arraybuffer" }', function() {
      var encoded = encoding.convert(null, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      encoded = encoding.convert(void 0, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      encoded = encoding.convert('', {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      encoded = encoding.convert('123', {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 3);
      assert(isTypedArray(encoded));

      encoded = encoding.convert([], {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      encoded = encoding.convert([0x61, 0x62], {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 2);
      assert(isTypedArray(encoded));

      var buffer = new Buffer(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      buffer = new Buffer(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 2);
      assert(isTypedArray(encoded));

      buffer = new Uint8Array(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 0);
      assert(isTypedArray(encoded));

      buffer = new Uint8Array(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'arraybuffer'
      });
      assert(encoded.length === 2);
      assert(isTypedArray(encoded));
    });

    it('Specify { type: "string" }', function() {
      var encoded = encoding.convert(null, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      encoded = encoding.convert(void 0, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      encoded = encoding.convert('', {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      encoded = encoding.convert('123', {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 3);
      assert(isString(encoded));

      encoded = encoding.convert([], {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      encoded = encoding.convert([0x61, 0x62], {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 2);
      assert(isString(encoded));

      var buffer = new Buffer(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      buffer = new Buffer(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 2);
      assert(isString(encoded));

      buffer = new Uint8Array(0);
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 0);
      assert(isString(encoded));

      buffer = new Uint8Array(2);
      buffer[0] = 0x61;
      buffer[1] = 0x62;
      encoded = encoding.convert(buffer, {
        to: 'utf-8',
        from: 'unicode',
        type: 'string'
      });
      assert(encoded.length === 2);
      assert(isString(encoded));
    });
  });


  describe('codeToString / stringToCode', function() {

    it('Test for a long string', function() {
      this.timeout(5000);

      var config = require('../src/config');
      var longArray = [];
      var max = config.APPLY_BUFFER_SIZE;
      assert(typeof max === 'number');
      assert(max > 0);

      while (longArray.length < max) {
        for (var i = 0; i < tests.jisx0208Array.length; i++) {
          longArray.push(tests.jisx0208Array[i]);
        }
      }
      assert(longArray.length > max);

      var string = encoding.codeToString(longArray);
      assert(typeof string === 'string');
      var code = encoding.stringToCode(string);
      assert.deepEqual(code, longArray);

      // Run 2 times to check if APPLY_BUFFER_SIZE_OK is set up expected
      string = encoding.codeToString(longArray);
      code = encoding.stringToCode(string);
      assert.deepEqual(code, longArray);
    });
  });
});
