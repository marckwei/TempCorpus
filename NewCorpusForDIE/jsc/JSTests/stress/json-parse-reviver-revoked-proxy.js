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

function revivedObjProxy(key, value) {
    if (key === 'a') {
        let {proxy, revoke} = Proxy.revocable({}, {});
        revoke();
        this.b = proxy;
    }

    return value;
}

function revivedArrProxy(key, value) {
    if (key === '0') {
        let {proxy, revoke} = Proxy.revocable([], {});
        revoke();
        this[1] = proxy;
    }

    return value;
}

const objJSON = '{"a": 1, "b": 2}';
const arrJSON = '[3, 4]';
const isArrayError = 'TypeError: Array.isArray cannot be called on a Proxy that has been revoked';

for (let i = 1; i < 10000; i++) {
    let error;
    try {
        JSON.parse(objJSON, revivedObjProxy);
    } catch (e) {
        error = e;
    }
    shouldBe(error.toString(), isArrayError);
}

for (let i = 1; i < 10000; i++) {
    let error;
    try {
        JSON.parse(arrJSON, revivedArrProxy);
    } catch (e) {
        error = e;
    }
    shouldBe(error.toString(), isArrayError);
}
