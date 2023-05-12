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

description(
"Checks that the DFG CFA does the right things if it proves that a put_by_id is a simple replace when storing to a specialized function property."
);

silentTestPass = true;

function foo(o, v) {
    o.func = v;
}

// Warm up foo's put_by_id to make it look polymorphic.
for (var i = 0; i < 100; ++i)
    foo(i % 2 ? {a: 1} : {b: 2});

function bar(f) {
    foo(this, f);
    return this.func();
}

function baz() {
    return "baz";
}

noInline(bar);
noInline(baz);

while (!dfgCompiled({f:bar}))
    shouldBe("bar.call({func:baz}, baz)", "\"baz\"");

function fuzz() {
    return "fuzz";
}

noInline(fuzz);

shouldBe("bar.call({func:baz}, fuzz)", "\"fuzz\"");

