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

function shouldThrowTypeError(func, messagePrefix) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof TypeError))
        throw new Error('Expected TypeError!');

    if (!error.message.startsWith(messagePrefix))
        throw new Error('TypeError has wrong message!');
}

function shouldThrowExactly(func, expectedError) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (error !== expectedError)
        throw new Error(`Expected ${errorType.name}!`);
}

shouldThrowTypeError(() => ([...1]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([...undefined]), 'Spread syntax requires ...iterable not be null or undefined');
shouldThrowTypeError(() => ([...null]), 'Spread syntax requires ...iterable not be null or undefined');
shouldThrowTypeError(() => ([...3.14]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([.../a/g]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([...{}]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([...{a:[].join()}]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');

function f() {}
shouldThrowTypeError(() => ([...f]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([...[...() => undefined]]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');

class C {}
shouldThrowTypeError(() => ([...new C()]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');
shouldThrowTypeError(() => ([...C]), 'Spread syntax requires ...iterable[Symbol.iterator] to be a function');

const myErr = new Error('Custom Error');
shouldThrowExactly(() => [...{ [Symbol.iterator]() { throw myErr; }}], myErr);

let iteratorCount = 0;
let toStringCount = 0;
const myIterable = {
    [Symbol.iterator]() {
        iteratorCount += 1;
        return {
        next() {
                return { done: true };
            }
        };
    },
    toString() {
        toStringCount += 1;
        return "Iterable";
    }
};

function assertEqual(a, b) {
    if (a !== b)
        throw new Error(`${a} !== ${b}`);
}

[...myIterable];
assertEqual(iteratorCount, 1);
assertEqual(toStringCount, 0);

