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
        throw new Error('bad value: ' + JSON.stringify(actual));
}

function raw(siteObject) {
    var result = '';
    for (var i = 0; i < siteObject.raw.length; ++i) {
        result += siteObject.raw[i];
        if ((i + 1) < arguments.length) {
            result += arguments[i + 1];
        }
    }
    return result;
}

function cooked(siteObject) {
    var result = '';
    for (var i = 0; i < siteObject.raw.length; ++i) {
        result += siteObject[i];
        if ((i + 1) < arguments.length) {
            result += arguments[i + 1];
        }
    }
    return result;
}

function Counter() {
    var count = 0;
    return {
        toString() {
            return count++;
        }
    };
}

var c = Counter();
shouldBe(raw`Hello ${c} World ${c}`, `Hello 0 World 1`);
var c = Counter();
shouldBe(raw`${c}${c}${c}`, `012`);
var c = Counter();
shouldBe(raw`${c}${ `  ${c}  ` }${c}`, `1  0  2`);
var c = Counter();
shouldBe(raw`${c}${ raw`  ${c}  ` }${c}`, `1  0  2`);
var c = Counter();
shouldBe(raw`${c}${ `  ${c}${c}  ` }${c}`, `2  01  3`);
var c = Counter();
shouldBe(raw`${c}${ raw`  ${c}${c}  ` }${c}`, `2  01  3`);

shouldBe(raw``, ``);
shouldBe(cooked``, ``);
shouldBe(raw`\n`, `\\n`);
shouldBe(cooked`\n`, `\n`);
shouldBe(raw`\v`, `\\v`);
shouldBe(cooked`\v`, `\v`);
shouldBe(raw`

`, `\n\n`);
shouldBe(cooked`

`, `\n\n`);
shouldBe(raw`\
\
`, `\\\n\\\n`);
shouldBe(cooked`\
\
`, ``);
