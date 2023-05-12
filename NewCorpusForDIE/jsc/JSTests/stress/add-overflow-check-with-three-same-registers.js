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

//@ runDefault("--useDoublePredictionFuzzerAgent=1", "--useFTLJIT=0", "--useConcurrentJIT=0")

function foo(a, b) {
    var result = a + b;
    if (result)
        return (a + b) + result + this;
    else
        return this.f;
}

noInline(foo);

var x;
Number.prototype.valueOf = function() { return x; };

var globalCounter = 0;
function runWithNumber(num) {
    var test = Function(`this_, a, b, x_`, `
        x = x_;
        var result = foo.call(this_, a, b);
        if (result != (a + b) * 2 + x_)
            throw new Error("Error: bad result: " + result);
        return ${globalCounter++};
    `);
    noInline(test);

    for (var i = 0; i < 10000; ++i)
        test(5, 1, 2, 100);

    test(5, 2000000000, 2000000000, 1);
    try {
        test(5, num, num, 1000);
    } catch (error) {
        print(String(error));
    }
}

runWithNumber(536870911);
runWithNumber(536870912);
runWithNumber(536870913);
runWithNumber(536870914);
runWithNumber(1073741773);
runWithNumber(1073741774);
runWithNumber(1073741775);
runWithNumber(1073741776);
runWithNumber(-536870913);
runWithNumber(-536870914);
runWithNumber(-536870915);
runWithNumber(-1073741823);
runWithNumber(-1073741824);
runWithNumber(-1073741825);
runWithNumber(-1073741826);
