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
"This test checks that variable declarations with initializers inside of catch and with blocks do not set values in a deeper scope."
);

function catchTest() {
  var e = "foo";

  try {
    throw "bar";
  } catch (e) {
    var e = "baz";
  }

  return e;
}

function catchTest2() {
  var e = "foo";

  try {
    throw "bar";
  } catch (e) {
    var e = "baz";

    return e;
  }
}

function withTest() {
  var e = "foo"
  var object = { 'e' : "bar" };

  with (object) {
    var e = "baz";
  }

  return e;
}

function withTest2() {
  var e = "foo"
  var object = { 'e' : "bar" };

  with (object) {
    var e = "baz";

    return e;
  }
}

shouldBe("catchTest()", "'foo'");
shouldBe("catchTest2()", "'baz'");
shouldBe("withTest()", "'foo'");
shouldBe("withTest2()", "'baz'");
