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
"Check that short-circuiting Branch(LogicalNot(@a)) and then failing speculation does not result in the branch being taken the wrong way."
);

function foo(a) {
    if (a.f)
        return 1;
    return 0;
}

function bar(a) {
    var b = !a.f;
    if (b)
        return 1;
    return 0;
}

silentTestPass = true;
noInline(foo);
noInline(bar);

var True = true;
var False = false;
for (var i = 0; i < 200; i = dfgIncrement({f:[foo, bar], i:i + 1, n:50})) {
    var x;
    if (i == 100) {
        True = "string";
        False = void 0;
    }
    shouldBe("foo({f:True})", "1");
    shouldBe("foo({f:False})", "0");
    shouldBe("bar({f:True})", "0");
    shouldBe("bar({f:False})", "1");
}

