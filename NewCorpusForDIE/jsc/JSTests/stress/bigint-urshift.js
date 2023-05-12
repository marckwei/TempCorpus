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
        throw new Error('bad value: ' + actual);
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

shouldThrow(() => {
    2n >>> 1n;
}, `TypeError: BigInt does not support >>> operator`);

{
    let called = false;
    shouldThrow(() => {
        2n >>> {
            [Symbol.toPrimitive]() {
                called = true;
                return 2n;
            }
        };
    }, `TypeError: BigInt does not support >>> operator`);
    shouldBe(called, true);
}

{
    let calledLeft = false;
    let calledRight = false;
    shouldThrow(() => {
        ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, false);
                shouldBe(calledRight, false);
                calledLeft = true;
                return 2n;
            }
        }) >>> ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, true);
                shouldBe(calledRight, false);
                calledRight = true;
                return 2n;
            }
        });
    }, `TypeError: BigInt does not support >>> operator`);
    shouldBe(calledLeft, true);
    shouldBe(calledRight, true);
}

{
    let calledLeft = false;
    let calledRight = false;
    shouldThrow(() => {
        ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, false);
                shouldBe(calledRight, false);
                calledLeft = true;
                return 2;
            }
        }) >>> ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, true);
                shouldBe(calledRight, false);
                calledRight = true;
                return 2n;
            }
        });
    }, `TypeError: BigInt does not support >>> operator`);
    shouldBe(calledLeft, true);
    shouldBe(calledRight, true);
}

{
    let calledLeft = false;
    let calledRight = false;
    shouldThrow(() => {
        ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, false);
                shouldBe(calledRight, false);
                calledLeft = true;
                return 2n;
            }
        }) >>> ({
            [Symbol.toPrimitive]() {
                shouldBe(calledLeft, true);
                shouldBe(calledRight, false);
                calledRight = true;
                return 2;
            }
        });
    }, `TypeError: BigInt does not support >>> operator`);
    shouldBe(calledLeft, true);
    shouldBe(calledRight, true);
}
