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
        throw new Error(`bad value: {String(actual)}`);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

{
    let object = {
        toString()
        {
            return "C";
        }
    };
    shouldBe(String.prototype.repeat.call(object, 2.5), "CC");
    shouldBe(String.prototype.repeat.call(object, -0), "");
    shouldBe(String.prototype.repeat.call(object, 1), "C");
    shouldBe(String.prototype.repeat.call(object, {
        valueOf()
        {
            return 2.5;
        }
    }), "CC");
    shouldThrow(() => {
        String.prototype.repeat.call(object, {
            valueOf()
            {
                throw new Error("OK");
            }
        });
    }, `Error: OK`);
}

{
    shouldBe(String.prototype.repeat.call("", 0), "");
    shouldBe(String.prototype.repeat.call("", 0xFFFFFFFFF), "");
    shouldThrow(() => {
        String.prototype.repeat.call("", Infinity);
    }, `RangeError: String.prototype.repeat argument must be greater than or equal to 0 and not be Infinity`);

    shouldThrow(() => {
        String.prototype.repeat.call("", -2000);
    }, `RangeError: String.prototype.repeat argument must be greater than or equal to 0 and not be Infinity`);
}
