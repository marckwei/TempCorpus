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

function shouldBe(actual, expected, testInfo) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual} (${testInfo})`);
}

const functionPrototypeCallerGetter = Object.getOwnPropertyDescriptor(Function.prototype, "caller").get;

let callerViaGet;
let callerViaGetOwnProperty;
function updateCaller() {
    callerViaGet = updateCaller.caller;
    callerViaGetOwnProperty = functionPrototypeCallerGetter.call(updateCaller);
}
noInline(updateCaller);

function normalSloppyFunction() { updateCaller(); }
function normalStrictFunction() { "use strict"; updateCaller(); }

const { get, set } = Object.getOwnPropertyDescriptor({
    get accessor() { updateCaller(); },
    set accessor(_v) { updateCaller(); },
}, "accessor");

const arrowFunction = () => { updateCaller(); };
const asyncArrowFunctionWrapper = async (x = updateCaller()) => {};
const asyncArrowFunctionBody = async () => { updateCaller() };

const functionsVisibleAsCallers = [
    normalSloppyFunction,
    get,
    set,
    arrowFunction,
    { method() { updateCaller(); } }.method,
];

(function visibleAsCallers() {
    for (const fn of functionsVisibleAsCallers) {
        for (let i = 0; i < 1e4; ++i) {
            callerViaGet = undefined;
            callerViaGetOwnProperty = undefined;

            fn();

            shouldBe(callerViaGet, fn, fn.name);
            shouldBe(callerViaGetOwnProperty, fn, fn.name);
        }
    }
})();

const functionsHiddenAsCallers = [
    normalStrictFunction,
    normalStrictFunction.bind(),
    asyncArrowFunctionWrapper,
    asyncArrowFunctionBody,
    function * syncGeneratorWrapper(x = updateCaller()) {},
    { * syncGeneratorMethodWrapper(x = updateCaller()) {} }.syncGeneratorMethodWrapper,
    async function asyncFunctionWrapper(x = updateCaller()) {},
    { async asyncMethodWrapper(x = updateCaller()) {} }.asyncMethodWrapper,
    async function * asyncGeneratorWrapper(x = updateCaller()) {},
    { async * asyncGeneratorMethodWrapper(x = updateCaller()) {} }.asyncGeneratorMethodWrapper,
];

const constructorsHiddenAsCallers = [
    class baseConstructor {
        constructor() { updateCaller(); }
    },
    class derivedConstructor extends Array {
        constructor() { super(); updateCaller(); }
    },
];

(function hiddenAsCallers() {
    for (const fn of functionsHiddenAsCallers) {
        for (let i = 0; i < 1e4; ++i) {
            callerViaGet = undefined;
            callerViaGetOwnProperty = undefined;

            fn();

            shouldBe(callerViaGet, null, fn.name);
            shouldBe(callerViaGetOwnProperty, null, fn.name);
        }
    }

    for (const C of constructorsHiddenAsCallers) {
        for (let i = 0; i < 1e4; ++i) {
            callerViaGet = undefined;
            callerViaGetOwnProperty = undefined;

            new C();

            shouldBe(callerViaGet, null, C.name);
            shouldBe(callerViaGetOwnProperty, null, C.name);
        }
    }
})();
