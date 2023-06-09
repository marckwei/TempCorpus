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

var assert = function (result, expected, message = "") {
  if (result !== expected) {
    throw new Error('Error in assert. Expected "' + expected + '" but was "' + result + '":' + message );
  }
};
var result = 0;
async function * foo() { yield 1; yield Promise.resolve(2); return 3;};

async function boo () {
    for await (const value of foo()) {
        result = result + value;
    }
}

boo();

drainMicrotasks();

assert(result, 3);

result =  0;

{
    const boo =  async function () {
        for await (const val of foo()) {
            result = result + val;
        }
    }

    boo();

    drainMicrotasks();

    assert(result, 3);
}

{
    result =  0;
    const boo = async function () {
        for await (const val of [1, 2, 3]) {
            result = result + val;
        }
    }

    boo();

    drainMicrotasks();

    assert(result, 6);
}

{ 
    let error = false;

    const boo = async function () {
        for await (const val of 1) {
            result = result + val;
        }
    }

    boo().catch(raisedError => error = raisedError instanceof TypeError);

    drainMicrotasks();

    assert(error, true);
}

{
    let conter = 0;
    const o = {
        [Symbol.asyncIterator]() {
            return this
        },
        next(args) {
            return { done: true }
        }
    }

    result = -1;
    const boo = async function () {
        for await (const val of o) {
            conter++;
            result = val;
        }
    }

    boo();

    drainMicrotasks();

    assert(conter, 0);
    assert(result, -1);
}

{
    let conter = 0;
    const o = {
        [Symbol.asyncIterator]() {
            this.index = 0;
            return this
        },
        next(args) {
            this.index++;
            if (this.index <= 10)
                return { done: false, value: this.index };
            else 
                return { done: true, value: this.index };
        }
    }

    result = 0;
    const boo = async function () {
        for await (const val of o) {
            conter++;
            result += val;
        }
    }

    boo();

    drainMicrotasks();

    assert(conter, 10);
    assert(result, 55);
}

{
    let conter = 0;
    let error = false;

    const o = {
        [Symbol.asyncIterator]() {
            this.index = 0;
            return this
        },
        next(args) {
            this.index++;
            if (this.index <= 10)
                return { done: false, value: this.index };
            else 
                throw new Error('some error');
        }
    }

    result = 0;
    const boo = async function () {
        for await (const val of o) {
            conter++;
            result += val;
        }
    }

    boo().catch(e => { error = e instanceof Error && e.message === 'some error'; });

    drainMicrotasks();

    assert(conter, 10);
    assert(result, 55);
    assert(error, true);
}

{
    let conter = 0;
    let error = false;
    let emptyParam = false;

    const o = {
        [Symbol.asyncIterator]() {
            this.index = 0;
            return this
        },
        next(args) {
            emptyParam = args === undefined;
            this.index++;
            if (this.index <= 10)
                return { done: false, value: this.index };
            else 
                throw new Error('some error');
        }
    }

    result = 0;
    const boo = async function () {
        try {
            for await (const val of o) {
                conter++;
                result += val;
            }
        } catch (e) {
            error =  e instanceof Error && e.message === 'some error';
        }
    }

    boo();

    drainMicrotasks();

    assert(conter, 10);
    assert(result, 55);
    assert(error, true);
    assert(emptyParam, true);
}

{
    let conter = 0;
    let error = false;

    const o = {
        [Symbol.asyncIterator]() {
            this.index = 0;
            return this
        },
        next(args) {
            this.index++;
            if (this.index <= 10)
                return { done: false, value: this.index };
            else 
                return { done: true, value: this.index };
        }
    }

    result = 0;
    const boo = async function () {
        if (true) {
            for await (const val of o) {
                conter++;
                result += val;
            }
        }
    }

    boo();

    drainMicrotasks();

    assert(conter, 10);
    assert(result, 55);
}

{
    let conter = 0;
    let error = false;
    let emptyParam = false;

    const o = {
        [Symbol.iterator]() {
            this.index = 0;
            return this
        },
        next(args) {
            emptyParam = args === undefined;
            this.index++;
            if (this.index <= 10)
                return { done: false, value: this.index };
            else 
                throw new Error('some error');
        }
    }

    result = 0;
    const boo = async function () {
        try {
            for await (const val of o) {
                conter++;
                result += val;
            }
        } catch (e) {
            error =  e instanceof Error && e.message === 'some error';
        }
    }

    boo();

    drainMicrotasks();

    assert(conter, 10);
    assert(result, 55);
    assert(error, true);
    assert(emptyParam, true);
}