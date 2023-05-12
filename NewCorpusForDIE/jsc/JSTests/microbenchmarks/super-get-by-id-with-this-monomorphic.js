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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
const run = new Function("init", "num", `
const calc = val => {
    let c = 0;
    for (let v = val; v; v >>>= 1) c += v & 1;
    return val * 2 + val / 2 + c;
}

class A {
    constructor(x) { this._value = x; }
    set value(x) { this._value = x; }
    get value() { return this._value; }
}
class B extends A {
    set value(x) { super.value = x; }
    get value() { return calc(super.value); }
}

const bench = (init, num) => {
    let arr = [];
    for (let i = 0; i != num; ++i) arr.push(new B(init));
    for (let i = 0; i != num; ++i) arr[i].value += i;
    let sum = 0;
    for (let i = 0; i != num; ++i) sum += arr[i].value;
};

bench(init, num);
`);

run(2, 10000);
run(1 << 30, 10000);
run(42.2, 10000);
run(42.5e10, 10000);
