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
"Tests that when values predicted but not proven int are used in a tower of additions, we don't eliminate the overflow check unsoundly."
);

function foo(a, b, o) {
    return (a + b + o.f) | 0;
}

var badCases = [
    {a:2147483645, b:2147483644, c:9007199254740990, expected:-8},
    {a:2147483643, b:2147483643, c:18014398509481980, expected:-16},
    {a:2147483643, b:2147483642, c:36028797018963960, expected:-16},
    {a:2147483642, b:2147483642, c:36028797018963960, expected:-16},
    {a:2147483641, b:2147483640, c:144115188075855840, expected:-32},
    {a:2147483640, b:2147483640, c:144115188075855840, expected:-64},
    {a:2147483640, b:2147483639, c:288230376151711680, expected:-64},
    {a:2147483639, b:2147483639, c:288230376151711680, expected:-64}
];

noInline(foo);
silentTestPass = true;

for (var i = 0; i < 1 + badCases.length; i = dfgIncrement({f:foo, i:i + 1, n:1})) {
    var a, b, c;
    var expected;
    if (!i) {
        a = 1;
        b = 2;
        c = 3;
        expected = 6;
    } else {
        var current = badCases[i - 1];
        a = current.a;
        b = current.b;
        c = current.c;
        expected = current.expected;
    }
    shouldBe("foo(" + a + ", " + b + ", {f:" + c + "})", "" + expected);
}


