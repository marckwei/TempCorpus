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

{
    let name = 'prototype';
    let object = {
        prototype() { },
        get [name]() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, 'prototype')), `{"enumerable":true,"configurable":true}`);
}

{
    let name = 'prototype';
    let object = {
        get [name]() { },
        prototype() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, 'prototype')), `{"writable":true,"enumerable":true,"configurable":true}`);
}


{
    let name = 'prototype';
    let object = {
        [name]() { },
        get prototype() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, 'prototype')), `{"enumerable":true,"configurable":true}`);
}

{
    let name = 'prototype';
    let object = {
        get prototype() { },
        [name]() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, 'prototype')), `{"writable":true,"enumerable":true,"configurable":true}`);
}

{
    let object = {
        __proto__() { }
    };
    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '__proto__')), `{"writable":true,"enumerable":true,"configurable":true}`);
    shouldBe(Object.getPrototypeOf(object), Object.prototype);
}

{
    let name = '__proto__';
    let object = {
        [name]() { }
    };
    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '__proto__')), `{"writable":true,"enumerable":true,"configurable":true}`);
    shouldBe(Object.getPrototypeOf(object), Object.prototype);
}

{
    let name = '42';
    let object = {
        42() { },
        get [name]() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '42')), `{"enumerable":true,"configurable":true}`);
}

{
    let name = '42';
    let object = {
        get [name]() { },
        42() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '42')), `{"writable":true,"enumerable":true,"configurable":true}`);
}


{
    let name = '42';
    let object = {
        [name]() { },
        get 42() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '42')), `{"enumerable":true,"configurable":true}`);
}

{
    let name = '42';
    let object = {
        get 42() { },
        [name]() { },
    };

    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, '42')), `{"writable":true,"enumerable":true,"configurable":true}`);
}


