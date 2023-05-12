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
"This test checks the behavior of the spread construct."
);

function f(a,b,c,d)
{
    args = arguments;
    passedThis = this;
    shouldBe("passedThis", "o")
    shouldBe("args[0]", "1")
    shouldBe("args[1]", "undefined")
    shouldBe("args[2]", "null")
    shouldBe("args[3]", "4")
}

var o = {}
o.f = f;
var test1 = [1, undefined, null, 4]
var test2 = [1, , null, 4]
o.f(...test1)
o.f(...test2)

var h=eval('"f"')
o[h](...test1)
o[h](...test2)

function g()
{
    o.f(...arguments)
}

g.apply(null, test1)
g.apply(null, test2)

g(...test1)
g(...test2)

var a=[1,2,3]

shouldBe("a", "[1,2,3]")
shouldBe("[...a]", "[1,2,3]")
a=[...a]
shouldBe("[...a]", "[1,2,3]")
shouldBe("[...a,...[...a]]", "[1,2,3,1,2,3]")
shouldBe("[,,,...a]", "[,,,1,2,3]")
shouldBe("[...a,,,].join('|')", "[1,2,3,,,].join('|')")
shouldBe("[,...a,4]", "[,1,2,3,4]")
shouldBe("[,...a,,5]", "[,1,2,3,,5]")
shouldBe("[...a.keys()]", "[0,1,2]")
shouldBe("[...a.entries()].join('|')", "[[0,1],[1,2],[2,3]].join('|')")
Array.prototype.__defineSetter__(0, function(){ fail() });
Array.prototype.__defineSetter__(1, function(){ fail() });
Array.prototype.__defineSetter__(2, function(){ fail() });
shouldBe("[...a]", "[1,2,3]")



