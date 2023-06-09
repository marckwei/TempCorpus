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

let nullSymbol = Symbol();

let propKeys = [
     "foo", "", undefined, null, true, false, 0, 10, 1234.567,
     Symbol("foo"), Symbol(""), nullSymbol,
];

function toKeyString(x) {
    if (typeof x === "string")
        return '"' + x + '"';
    if (typeof x === "symbol")
        return x.toString();
    return "" + x;
}

function toFuncName(x) {
    if (typeof x === "symbol") {
        if (x !== nullSymbol) {
            let str = x.toString();
            let key = str.slice(7, str.length - 1);
            return "[" + key + "]";
        }
        return "";
    }
    return "" + x;
}

function shouldBe(title, actual, expected) {
    if (actual !== expected)
        throw Error(title + ": actual:" + actual + " expected:" + expected);
}

function makeObj(propKey, classMethodName) {
    return {
        [propKey]: class { static [classMethodName](){} },
    };
}
noInline(makeObj);

for (var i = 0; i < 1000; i++) {
    for (var k = 0; k < propKeys.length; k++) {
        let key = propKeys[k];
        let o = makeObj(key, "prop");
        shouldBe("typeof o[" + toKeyString(key) + "].name", typeof o[key].name, "string");
        shouldBe("o[" + toKeyString(key) + "].name", o[key].name, toFuncName(key));
    }

    for (var k = 0; k < propKeys.length; k++) {
        let key = propKeys[k];
        let o = makeObj(key, "name");
        shouldBe("typeof o[" + toKeyString(key) + "].name", typeof o[key], "function");
    }

    for (var k = 0; k < propKeys.length; k++) {
        let key = propKeys[k];
        let prop = { toString() { return "prop" } };
        let o = makeObj(key, prop);
        shouldBe("typeof o[" + toKeyString(key) + "].name", typeof o[key].name, "string");
        shouldBe("o[" + toKeyString(key) + "].name", o[key].name, toFuncName(key));
    }

    for (var k = 0; k < propKeys.length; k++) {
        let key = propKeys[k];
        let prop = { toString() { return "name" } };
        let o = makeObj(key, prop);
        shouldBe("typeof o[" + toKeyString(key) + "].name", typeof o[key], "function");
    }
}
