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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error("Failed assertion: actual " + actual + " should be " + expected);
}
function shouldNotBe(actual, expected) {
    if (actual === expected)
        throw new Error("Failed assertion: actual " + actual + " should not be " + expected);
}

function readX(f) {
    return f.x;
}
noInline(readX);

function readY(f) {
    return f.y;
}
noInline(readY);

var lazyPropNames = [ "name", "length" ];

function test(propName, foo) {
    foo.x = 20;
    for (var i = 0; i < 1000; i++)
        shouldBe(readX(foo), 20);

    // Reify the lazy property.
    var propValue = foo[propName];

    // Verify that we can still access the property after the reification of foo.name.
    for (var i = 0; i < 1000; i++)
        shouldBe(readX(foo), 20);

    foo.y = 25;
    for (var i = 0; i < 1000; i++)
        shouldBe(readY(foo), 25);

    // Verify that the property has the configurable attribute.
    var desc = Object.getOwnPropertyDescriptor(foo, propName);
    shouldBe(desc.configurable, true);
    shouldBe(desc.writable, false);
    shouldBe(desc.enumerable, false);
    shouldBe(desc.value, propValue);

    shouldBe(eval("foo[propName] = 5, foo[propName]"), propValue);
    shouldBe(eval("foo." + propName + " = 5, foo." + propName), propValue);
    for (var prop in foo)
        shouldNotBe(prop, propName);

    Object.defineProperty(foo, propName, {
        value: propValue,
        writable: true,
        enumerable: true,
        configurable: true
    });

    shouldBe(eval("foo[propName] = 5, foo[propName]"), 5);
    shouldBe(eval("foo." + propName + " = 25, foo." + propName), 25);
    var found = false;
    for (var prop in foo) {
        if (prop === propName) {
            found = true;
            break;
        }
    }
    shouldBe(found, true);
    
    shouldBe(eval("delete foo." + propName), true);

    delete foo.y;
    shouldBe(foo.y, undefined);
}

function runTest() {
    for (var i = 0; i < lazyPropNames.length; i++)
        test(lazyPropNames[i], new Function(""));
}

runTest();
