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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}
noInline(assert);

let called = false;
function baz(c) {
    if (c) {
        Array.prototype[Symbol.iterator] = function() {
            let i = 0;
            return {
                next() {
                    i++;
                    if (i === 2)
                        return {done: true};
                    return {value: 40, done: false};
                }
            };
        }
    }
}
noInline(baz);

function bar(...args) {
    return args;
}
noInline(bar);

function foo(c, ...args) {
    baz(c);
    return bar(...args);
}
noInline(foo);

for (let i = 0; i < 10000; i++) {
    const c = false;
    const args = [{}, 20, [], 45];
    let r = foo(c, ...args);
    assert(r.length === r.length);
    for (let i = 0; i < r.length; i++)
        assert(r[i] === args[i]);
}

const c = true;
const args = [{}, 20, [], 45];
let r = foo(c, ...args);
assert(r.length === 1);
assert(r[0] === 40);
