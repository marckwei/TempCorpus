function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}


function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldThrow(func, expected) {
    var error = null;
    try {
        func();
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error('not thrown');
    shouldBe(String(error), expected);
}

var errorKey = {
    toString() {
        throw new Error('out');
    }
};
var string = 'Cocoa, Cappuccino, Rize, Matcha, Kilimanjaro';

shouldThrow(function () {
    String.prototype.search.call(null, /Cocoa/);
}, "TypeError: String.prototype.search requires that |this| not be null or undefined");

shouldThrow(function () {
    String.prototype.search.call(undefined, /Cocoa/);
}, "TypeError: String.prototype.search requires that |this| not be null or undefined");

shouldThrow(function () {
    string.search(errorKey);
}, "Error: out");

shouldBe('Cocoa'.search(/Cocoa/), 0);

shouldBe(string.search(/Rize/), 19);
shouldBe(string.search('Rize'), 19);
shouldBe(string.search(/Matcha/), 25);
shouldBe(string.search('Matcha'), 25);

shouldBe('    undefined'.search(), 0);
shouldBe('    undefined'.search('undefined'), 4);

shouldBe((/Cocoa/)[Symbol.search]('Cocoa'), 0);

var primitives = [
    '',
    'string',
    null,
    undefined,
    42,
    Symbol('Cocoa'),
];

for (var primitive of primitives) {
    shouldThrow(function () {
        RegExp.prototype[Symbol.search].call(primitive)
    }, 'TypeError: RegExp.prototype.@@search requires that |this| be an Object');
}

shouldThrow(function () {
    /Cocoa/[Symbol.search](errorKey);
}, "Error: out");


function testRegExpSearch(regexp, string, result, lastIndex) {
    shouldBe(regexp[Symbol.search](string), result);
    shouldBe(regexp.lastIndex, lastIndex);
}

function testSearch(regexp, string, result, lastIndex) {
    shouldBe(string.search(regexp), result);
    shouldBe(regexp.lastIndex, lastIndex);
}

function testBoth(regexp, string, result, lastIndex) {
    testSearch(regexp, string, result, lastIndex);
    testRegExpSearch(regexp, string, result, lastIndex);
}

var cocoa = /Cocoa/;
cocoa.lastIndex = 20;
testBoth(cocoa, 'Cocoa', 0, 20);
testBoth(cocoa, '  Cocoa', 2, 20);
testBoth(cocoa, '  ', -1, 20);

var multibyte = /ココア/;
multibyte.lastIndex = 20;
testBoth(multibyte, 'ココア', 0, 20);
testBoth(multibyte, '  Cocoa', -1, 20);
testBoth(multibyte, 'カプチーノ', -1, 20);

function alwaysUnmatch(string) {
    return -1;
}

var regexp = new RegExp('ココア');
regexp[Symbol.search] = alwaysUnmatch;
shouldBe(regexp[Symbol.search], alwaysUnmatch);
testBoth(regexp, 'ココア', -1, 0);
