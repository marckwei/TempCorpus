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

// Inspired by mozilla tests
description('Tests for ES6 arrow function toString() method');

debug('var simpleArrowFunction = () => {}');
var simpleArrowFunction = () => {};
shouldBe("simpleArrowFunction.toString()", "'() => {}'");
shouldBe("((x) => { x + 1 }).toString()", "'(x) => { x + 1 }'");
shouldBe("(x => x + 1).toString()", "'x => x + 1'");

debug('var f0 = x => x');
var f0 = x => x;
shouldBe("f0.toString()", "'x => x'");

debug('var f1 = () => this');
var f1 = () => this;
shouldBe("f1.toString()", "'() => this'");

debug('var f2 = x => { return x; };');
var f2 = (x) => { return x; };
shouldBe("f2.toString()", "'(x) => { return x; }'");

debug('var f3 = (x, y) => { return x + y; };');
var f3 = (x, y) => { return x + y; };
shouldBe("f3.toString()", "'(x, y) => { return x + y; }'");

function foo(x) { return x.toString()};
debug('function foo(x) { return x.toString()};');
shouldBe("foo((x)=>x)", "'(x)=>x'");

var a = z => z*2, b = () => ({});
debug('var a = z => z*2, b = () => ({});');
shouldBe("a.toString()", "'z => z*2'");
shouldBe("b.toString()", "'() => ({})'");

var arrExpr = [y=>y + 1, x=>x];
debug('var arrExpr = [y=>y + 1, x=>x];');
shouldBe("arrExpr[0].toString()", "'y=>y + 1'");
shouldBe("arrExpr[1].toString()", "'x=>x'");

var arrBody  = [y=>{ y + 1 }, x=>{ x }];
debug('var arrBody  = [y=>{ y + 1 }, x=>{ x }];');
shouldBe("arrBody[0].toString()", "'y=>{ y + 1 }'");
shouldBe("arrBody[1].toString()", "'x=>{ x }'");

var successfullyParsed = true;
