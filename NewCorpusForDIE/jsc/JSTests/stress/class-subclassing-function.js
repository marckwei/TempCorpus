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

F = class extends Function { }
N = class extends null { }

function test(i) {

    let f = new F("x", "return x + " + i + ";");
    let C = new F("x", "this.x = x; this.i = " + i);

    if (!(f instanceof Function && f instanceof F))
        throw "bad chain";

    if (f(1) !== i+1)
        throw "function was not called correctly";

    let o = new C("hello");
    if (o.x !== "hello" || o.i !== i)
        throw "function as constructor was not correct";

    let g = new F("x", "y", "return this.foo + x + y");
    if (g.call({foo:1}, 1, 1) !== 3)
        throw "function was not .callable";

    let g2 = g.bind({foo:1}, 1);
    if (!(g2 instanceof F))
        throw "the binding of a subclass should inherit from the bound function's class";

    if (g2(1) !== 3)
        throw "binding didn't work";

    let bound = C.bind(null)
    if (bound.__proto__ !== C.__proto__)
        throw "binding with null as prototype didn't work";
}
noInline(test);

for (i = 0; i < 10000; i++)
    test(i);
