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

let assert = {
    sameValue: function(i, e, m) {
        if (i !== e)
            throw new Error(m);
    }
}

function postInc(x) {
    return x++;
}
noInline(postInc);
function preInc(x) {
    return ++x;
}
noInline(preInc);
function postDec(x) {
    return x--;
}
noInline(postDec);
function preDec(x) {
    return --x;
}
noInline(preDec);

for (let i = 0; i < 10000; i++) {
    var r = postInc(3012);
    assert.sameValue(r, 3012, 3012 + "++ = " + r);

    r = preInc(3012)
    assert.sameValue(r, 3013, "++" + 3012 + " = " + r);

    r = postDec(3012);
    assert.sameValue(r, 3012, 3012 + "-- = " + r);
    
    r = preDec(3012)
    assert.sameValue(r, 3011, "--" + 3012 + " = " + r);
}

var r = postInc(3n);
assert.sameValue(r, 3n, 3n + "++ = " + r);

r = preInc(12345678901234567890n);
assert.sameValue(r, 12345678901234567891n, "++" + 12345678901234567890n, " = ", r);

var count = 0;
var o = {};
o.valueOf = () => { count++; return 42n; };
r = postDec(o)
assert.sameValue(r, 42n, "{valueOf: () => 42n} -- = " + r);
assert.sameValue(count, 1, "execution count of valueOf on o = " + count);

r = preDec(123456789000n);
assert.sameValue(r, 123456788999n, "--123456789000n = " + r);
