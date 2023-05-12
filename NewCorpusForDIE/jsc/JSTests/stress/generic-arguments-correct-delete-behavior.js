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
        throw new Error("Bad")
}

function makeTest(shouldCaptureArgument, deleteTwice, zeroAsString) {
    return eval(`
        function foo(x) {
            ${shouldCaptureArgument ? `function bar() { return x; }` : ""}

            assert(x === null);

            let prop = ${zeroAsString ? "'0'" : "0"};
            Object.defineProperty(arguments, "0", {enumerable: false, value:45});
            assert(arguments[prop] === 45);
            assert(x === 45);

            let result = delete arguments[prop];
            assert(result);
            ${deleteTwice ? `assert(delete arguments[prop]);` : ""};

            assert(arguments[prop] === undefined); // don't crash here.
            assert(!(prop in arguments));

            arguments[prop] = 50;

            assert(arguments[prop] === 50);
            assert(x === 45);
        }; foo;
    `);
}

let functions = [];
functions.push(makeTest(false, false, true));
functions.push(makeTest(false, false, false));
functions.push(makeTest(false, true, false));
functions.push(makeTest(false, true, true));
functions.push(makeTest(true, false, true));
functions.push(makeTest(true, false, false));
functions.push(makeTest(true, true, false));
functions.push(makeTest(true, true, true));

for (let f of functions) {
    noInline(f);
    for (let i = 0; i < 1000; ++i) 
        f(null);
}
