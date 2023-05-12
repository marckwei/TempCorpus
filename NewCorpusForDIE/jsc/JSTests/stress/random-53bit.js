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

function test() {
    var MAX = 50;
    var found53Bit = false;
    var foundLessThan53Bit = false;
    var results = new Array(MAX);

    for (var i = 0; i < MAX; ++i) {
        var str = Math.random().toString(2);
        results[i] = str;
        // 53 bit + '0.'.length
        if (str.length === (53 + 2))
            found53Bit = true;
        else if (str.length < (53 + 2))
            foundLessThan53Bit = true;

        if (found53Bit && foundLessThan53Bit)
            return true;
    }
    print(`Random seed ${getRandomSeed()}`);
    print(results.join('\n'));
    return false;
}
noInline(test);

for (var i = 0; i < 1e4; ++i) {
    if (!test())
        throw new Error("OUT");
}
