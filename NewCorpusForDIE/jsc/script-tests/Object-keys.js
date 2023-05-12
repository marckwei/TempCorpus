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

description("Test to ensure correct behaviour of Object.keys");

shouldBe("Object.keys({})", "[]");
shouldBe("Object.keys({a:null})", "['a']");
shouldBe("Object.keys({a:null, b:null})", "['a', 'b']");
shouldBe("Object.keys({b:null, a:null})", "['b', 'a']");
shouldBe("Object.keys([])", "[]");
shouldBe("Object.keys([null])", "['0']");
shouldBe("Object.keys([null,null])", "['0','1']");
shouldBe("Object.keys([null,null,,,,null])", "['0','1','5']");
shouldBe("Object.keys({__proto__:{a:null}})", "[]");
shouldBe("Object.keys({__proto__:[1,2,3]})", "[]");
shouldBe("x=[];x.__proto__=[1,2,3];Object.keys(x)", "[]");
