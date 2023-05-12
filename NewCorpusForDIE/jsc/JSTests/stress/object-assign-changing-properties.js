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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

{
    let source = {
        get x() {
            delete this.y;
            return 42;
        },
        y: 42
    };
    let result = Object.assign({}, source);
    shouldBe(result.x, 42);
    shouldBe(result.hasOwnProperty('y'), false);
}

{
    let source = {
        get x() {
            return 42;
        },
        y: 42
    };
    var store = 0;
    let target = {
        set x(value) {
            store = value;
            delete source.y;
        },
        get x() {
            return store;
        },
    };
    let result = Object.assign(target, source);
    shouldBe(result.x, 42);
    shouldBe(result.hasOwnProperty('y'), false);
}


{
    let source = {
        get x() {
            Object.defineProperty(source, 'y', {
                enumerable: false
            });
            return 42;
        },
        y: 42
    };
    let result = Object.assign({}, source);
    shouldBe(result.x, 42);
    shouldBe(result.hasOwnProperty('y'), false);
}

{
    let source = {
        get x() {
            return 42;
        },
        y: 42
    };
    var store = 0;
    let target = {
        set x(value) {
            store = value;
            Object.defineProperty(source, 'y', {
                enumerable: false
            });
        },
        get x() {
            return store;
        },
    };
    let result = Object.assign(target, source);
    shouldBe(result.x, 42);
    shouldBe(result.hasOwnProperty('y'), false);
}
