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

function assert(a) {
    if (!a)
        throw new Error('Bad assertion');
}

// Check spread ordering without Proxy
(function () {
    var calls = [];
    var o = { get z() { calls.push('z') }, get a() { calls.push('a') } };
    Object.defineProperty(o, 1, { get: () => { calls.push(1) }, enumerable: true });
    Object.defineProperty(o, Symbol('foo'), { get: () => { calls.push('Symbol(foo)') }, enumerable: true });

    var obj = {...o};

    assert(calls[0] === 1);
    assert(calls[1] === 'z');
    assert(calls[2] === 'a');
    assert(calls[3] === 'Symbol(foo)');
    assert(Object.keys(obj).length === 3);
})();

// Check spread ordering with Proxy
(function () {
    var calls = [];
    var o = { z: 2, a: 3 };
    var fooSymbol = Symbol('foo');
    Object.defineProperty(o, 1, { value: 4, enumerable: true });
    Object.defineProperty(o, fooSymbol, { value: 5, enumerable: true });

    var p = new Proxy(o, {
        get: function(target, property, receiver) {
            calls.push(property);
            return target[property];
        }
    });

    var obj = {...p};

    assert(calls[0] == 1);
    assert(calls[1] == 'z');
    assert(calls[2] == 'a');
    assert(calls[3] === fooSymbol);
    assert(Object.keys(obj).length === 3);
})();

