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

function foo(a, i, p) {
    if (p || !$vm.dfgTrue())
        return [$vm.dfgTrue(), a[(i - ($vm.dfgTrue() ? 2147483646 : 0)) | 0], a[i], a[(i + ($vm.dfgTrue() ? 2147483646 : 0)) | 0], $vm.dfgTrue()];
    return [12];
}

noInline(foo);

function arraycmp(a, b) {
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i])
            return false;
    }
    return true;
}

for (var i = 0; i < 100000; ++i) {
    var result = foo([42], 0, false);
    if (!arraycmp(result, [false, 42, 42, 42, false]) && !arraycmp(result, [12]))
        throw "Error: bad result for i = " + i + ": " + result;
}

var result = foo([1, 2, 3, 4, 5], -2147483646, true);
if (!arraycmp(result, [true, 5, void 0, void 0, false])
    && !arraycmp(result, [false, void 0, void 0, void 0, false]))
    throw "Error: bad result for trick: " + result;
