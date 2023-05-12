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

const foo = new Proxy({}, {
    get() { throw 0xc0defefe; }
});

const bar = new Proxy({}, {
    get() { throw 0xdeadbeef; }
});

const check = value => {
    if (value !== 0xc0defefe)
        throw new Error(`bad ${value}!`);
}

try { Math.acos(foo, bar); } catch (e) { check(e); }
try { Math.acosh(foo, bar); } catch (e) { check(e); }
try { Math.asin(foo, bar); } catch (e) { check(e); }
try { Math.asinh(foo, bar); } catch (e) { check(e); }
try { Math.atan(foo, bar); } catch (e) { check(e); }
try { Math.atanh(foo, bar); } catch (e) { check(e); }
try { Math.atan2(foo, bar); } catch (e) { check(e); }
try { Math.cbrt(foo, bar); } catch (e) { check(e); }
try { Math.ceil(foo, bar); } catch (e) { check(e); }
try { Math.clz32(foo, bar); } catch (e) { check(e); }
try { Math.cos(foo, bar); } catch (e) { check(e); }
try { Math.cosh(foo, bar); } catch (e) { check(e); }
try { Math.exp(foo, bar); } catch (e) { check(e); }
try { Math.expm1(foo, bar); } catch (e) { check(e); }
try { Math.floor(foo, bar); } catch (e) { check(e); }
try { Math.fround(foo, bar); } catch (e) { check(e); }
try { Math.hypot(foo, bar); } catch (e) { check(e); }
try { Math.imul(foo, bar); } catch (e) { check(e); }
try { Math.log(foo, bar); } catch (e) { check(e); }
try { Math.log1p(foo, bar); } catch (e) { check(e); }
try { Math.log10(foo, bar); } catch (e) { check(e); }
try { Math.log2(foo, bar); } catch (e) { check(e); }
try { Math.max(foo, bar); } catch (e) { check(e); }
try { Math.min(foo, bar); } catch (e) { check(e); }
try { Math.pow(foo, bar); } catch (e) { check(e); }
Math.random(foo, bar);
try { Math.round(foo, bar); } catch (e) { check(e); }
try { Math.sign(foo, bar); } catch (e) { check(e); }
try { Math.sin(foo, bar); } catch (e) { check(e); }
try { Math.sinh(foo, bar); } catch (e) { check(e); }
try { Math.sqrt(foo, bar); } catch (e) { check(e); }
try { Math.tan(foo, bar); } catch (e) { check(e); }
try { Math.tanh(foo, bar); } catch (e) { check(e); }
try { Math.trunc(foo, bar); } catch (e) { check(e); }
