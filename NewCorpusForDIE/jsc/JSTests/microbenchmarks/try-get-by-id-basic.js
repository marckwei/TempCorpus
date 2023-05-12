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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
// Test tryGetById's value profiling feedback without going too polymorphic.

var createBuiltin = $vm.createBuiltin;

var it = 1e5;

const check = (got, expect) => { if (got != expect) throw "Error: bad result got " + got + " expected " + expect; };

const bench = f => {
    // Re-create the builtin each time, so each benchmark gets its own value prediction.
    const fooPlusBar = createBuiltin(`(function (o) { return @tryGetById(o, "foo") + @tryGetById(o, "bar"); })`);
    noInline(fooPlusBar);
    f(fooPlusBar);
}
noInline(bench);

// Non bool int32.
o = { foo: 42, bar: 1337 };
bench(builtin => { var res = 0; for (var i = 0; i < it; ++i) res += builtin(o);  check(res, (o.foo + o.bar) * it); });

// Non int double.
p = { foo: Math.PI, bar: Math.E };
bench(builtin => { var res = 0.; for (var i = 0; i < it; ++i) res += builtin(p); check(Math.round(res), Math.round((p.foo + p.bar) * it)); });

// String ident.
s = { foo: "", bar: "⌽" };
bench(builtin => { var res = ""; for (var i = 0; i < it; ++i) res += builtin(s); check(res.length, (s.foo.length + s.bar.length) * it); });

// Again: non bool int32.
bench(builtin => { var res = 0; for (var i = 0; i < it; ++i) res += builtin(o); check(res, (o.foo + o.bar) * it); });
