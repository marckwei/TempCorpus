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

function tag(elements) {
    return function (siteObject) {
        shouldBe(siteObject instanceof Array, true);
        shouldBe(Object.isFrozen(siteObject), true);
        shouldBe(siteObject.raw instanceof Array, true);
        shouldBe(Object.isFrozen(siteObject.raw), true);
        shouldBe(siteObject.hasOwnProperty("raw"), true);
        shouldBe(siteObject.propertyIsEnumerable("raw"), false);
        shouldBe(siteObject.length, arguments.length);
        shouldBe(siteObject.raw.length, arguments.length);
        var count = siteObject.length;
        for (var i = 0; i < count; ++i) {
            shouldBe(siteObject.hasOwnProperty(i), true);
            var desc = Object.getOwnPropertyDescriptor(siteObject, i);
            shouldBe(desc.writable, false);
            shouldBe(desc.enumerable, true);
            shouldBe(desc.configurable, false);
        }
        shouldBe(siteObject.length, elements.length + 1);
        for (var i = 0; i < elements.length; ++i)
            shouldBe(arguments[i + 1], elements[i]);
    };
}

var value = {
    toString() {
        throw new Error('incorrect');
    },
    valueOf() {
        throw new Error('incorrect');
    }
};

tag([])``;
tag([])`Hello`;
tag([])`Hello World`;
tag([value])`Hello ${value} World`;
tag([value, value])`Hello ${value} OK, ${value}`;
