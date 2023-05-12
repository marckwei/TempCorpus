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

var createBuiltin = $vm.createBuiltin;

let i;
function verify(a, b, c, d, e, f) {
    function assert(b, m) {
        if (!b)
            throw new Error(m);
    }
    assert(a === i);
    assert(b === i+1);
    assert(c === i+2);
    assert(d === null);
    assert(e === undefined);
    assert(f === undefined);
}
noInline(verify);

function func(a, b, c, d, e, f)
{
    verify(a, b, c, d, e, f);
    return !!(a%2) ? a + b + c + d : a + b + c + d;
}

const bar = createBuiltin(`(function (f, a, b, c, d) {
    let y = @idWithProfile(null, "SpecInt32Only");
    return f(a, b, c, y);
})`);

noInline(bar);

for (i = 0; i < 1000; ++i) {
    bar(func, i, i+1, i+2, i+3);
}
