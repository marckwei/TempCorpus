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

function shouldThrow(func, expectedMessage, testInfo) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== expectedMessage)
            throw new Error(`Bad error: ${error}\n${testInfo}`)
    }
    if (!errorThrown)
        throw new Error(`Didn't throw!\n${testInfo}`);
}

var get = function() {};
var set = function(_v) {};

var testCases = [
    {
        targetDescriptor: { value: 1, writable: false, enumerable: true, configurable: false },
        resultDescriptor: {           writable: false, enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { value: 1, writable: false, enumerable: true, configurable: false },
        resultDescriptor: {                            enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { get: undefined, set: undefined, enumerable: true, configurable: false },
        resultDescriptor: {                                 enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { get: get, set: set, enumerable: true, configurable: false },
        resultDescriptor: { get: get,           enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { get: get, set: undefined, enumerable: true, configurable: false },
        resultDescriptor: {           set: undefined, enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { get: get, set: set, enumerable: true, configurable: false },
        resultDescriptor: {                     enumerable: true, configurable: false },
    },
    {
        targetDescriptor: { value: 1, writable: false, enumerable: true, configurable: false },
        resultDescriptor: { value: 1, writable: false,                   configurable: false },
    },
    {
        targetDescriptor: { value: 1, writable: false, enumerable: true, configurable: false },
        resultDescriptor: { value: 1,                                    configurable: false },
    },
    {
        targetDescriptor: { value: undefined, writable: false, enumerable: true, configurable: false },
        resultDescriptor: {                   writable: false,                   configurable: false },
    },
    {
        targetDescriptor: { value: undefined, writable: false, enumerable: true, configurable: false },
        resultDescriptor: {                                                      configurable: false },
    },
];

testCases.forEach(function(testCase) {
    var target = {};
    Object.defineProperty(target, "foo", testCase.targetDescriptor);

    var proxy = new Proxy(target, {
        getOwnPropertyDescriptor: function() {
            return testCase.resultDescriptor;
        },
    });

    shouldThrow(
        () => { Object.getOwnPropertyDescriptor(proxy, "foo"); },
        "TypeError: Result from 'getOwnPropertyDescriptor' fails the IsCompatiblePropertyDescriptor test",
        JSON.stringify(testCase, replacer, 2).replace(/"/g, "")
    );
});

function replacer(_key, value) {
    var type = typeof value;
    return type === "undefined" || type === "function" ? type : value;
}
