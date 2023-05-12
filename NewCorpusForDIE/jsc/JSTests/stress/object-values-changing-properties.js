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
    let result = Object.values(source);
    shouldBe(result.length, 1);
    shouldBe(result[0], 42);
}

{
    let source = Object.defineProperties({}, {
        nonEnumerable: {
            enumerable: false,
            value: 42
        }
    });

    let result = Object.values(source);
    shouldBe(result.length, 0);
}

{
    let order = [];
    let target = {x: 20, y:42};
    let handler = {
        getOwnPropertyDescriptor(theTarget, propName)
        {
            order.push(`getOwnPropertyDescriptor ${propName}`);
            return {
                enumerable: true,
                configurable: true,
                value: 42
            };
        },
        get(theTarget, propName, receiver)
        {
            order.push(`get ${propName}`);
            return 20;
        }
    };

    let proxy = new Proxy(target, handler);
    let result = Object.values(proxy);
    shouldBe(result.length, 2);
    shouldBe(result[0], 20);
    shouldBe(result[1], 20);
    shouldBe(order.join(','), `getOwnPropertyDescriptor x,get x,getOwnPropertyDescriptor y,get y`);
}

{
    let order = [];
    let target = Object.defineProperties({}, {
        x: {
            enumerable: false,
            configurable: true,
            value: 20
        },
        y: {
            enumerable: false,
            configurable: true,
            value: 42
        }
    });

    let handler = {
        getOwnPropertyDescriptor(theTarget, propName)
        {
            order.push(`getOwnPropertyDescriptor ${propName}`);
            return {
                enumerable: false,
                configurable: true,
                value: 42
            };
        },
        get(theTarget, propName, receiver)
        {
            order.push(`get ${propName}`);
            return 42;
        }
    };

    let proxy = new Proxy(target, handler);
    let result = Object.values(proxy);
    shouldBe(result.length, 0);
    shouldBe(order.join(','), `getOwnPropertyDescriptor x,getOwnPropertyDescriptor y`);
}
