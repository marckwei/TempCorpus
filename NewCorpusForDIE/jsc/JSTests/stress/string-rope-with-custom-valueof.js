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

// This file tests the concatenating of known strings with different objects with overridden valueOf functions.
// Note: we intentionally do not test Symbols since they cannot be appended to strings...

function catNumber(obj) {
    return "test" + "things" + obj;
}
noInline(catNumber);

number = { valueOf: function() { return 1; } };

function catBool(obj) {
    return "test" + "things" + obj;
}
noInline(catBool);

bool = { valueOf: function() { return true; } };

function catUndefined(obj) {
    return "test" + "things" + obj;
}
noInline(catUndefined);

undef = { valueOf: function() { return undefined; } };

function catRandom(obj) {
    return "test" + "things" + obj;
}
noInline(catRandom);

i = 0;
random = { valueOf: function() {
    switch (i % 3) {
    case 0:
        return number.valueOf();
    case 1:
        return bool.valueOf();
    case 2:
        return undef.valueOf();
    }
} };

for (i = 0; i < 100000; i++) {
    if (catNumber(number) !== "testthings1")
        throw "bad number";
    if (catBool(bool) !== "testthingstrue")
        throw "bad bool";
    if (catUndefined(undef) !== "testthingsundefined")
        throw "bad undefined";
    if (catRandom(random) !== "testthings" + random.valueOf())
        throw "bad random";
}

// Try passing new types to each of the other functions.
for (i = 0; i < 100000; i++) {
    if (catUndefined(number) !== "testthings1")
        throw "bad number";
    if (catNumber(bool) !== "testthingstrue")
        throw "bad bool";
    if (catBool(undef) !== "testthingsundefined")
        throw "bad undefined";
}
