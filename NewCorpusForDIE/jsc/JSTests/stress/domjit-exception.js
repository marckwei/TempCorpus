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

var createDOMJITGetterComplexObject = $vm.createDOMJITGetterComplexObject;

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`bad value: ${String(actual)}`);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}
(function () {
    let domjit = createDOMJITGetterComplexObject();
    function access(object)
    {
        return object.customGetter;
    }
    noInline(access);
    for (var i = 0; i < 1e4; ++i)
        shouldBe(access(domjit), 42);
    domjit.enableException();
    shouldThrow(() => access(domjit), `Error: DOMJITGetterComplex slow call exception`);
}());
(function () {
    let domjit = createDOMJITGetterComplexObject();
    function access(object)
    {
        return object.customGetter;
    }
    noInline(access);
    for (let i = 0; i < 1e2; ++i)
        shouldBe(access(domjit), 42);
    domjit.enableException();
    shouldThrow(() => access(domjit), `Error: DOMJITGetterComplex slow call exception`);
}());
(function () {
    let domjit = createDOMJITGetterComplexObject();
    function access(object)
    {
        return object.customGetter;
    }
    noInline(access);
    for (let i = 0; i < 50; ++i)
        shouldBe(access(domjit), 42);
    domjit.enableException();
    shouldThrow(() => access(domjit), `Error: DOMJITGetterComplex slow call exception`);
}());
(function () {
    let domjit = createDOMJITGetterComplexObject();
    function access(object)
    {
        return object.customGetter;
    }
    noInline(access);
    for (let i = 0; i < 10; ++i)
        shouldBe(access(domjit), 42);
    domjit.enableException();
    shouldThrow(() => access(domjit), `Error: DOMJITGetterComplex slow call exception`);
}());
