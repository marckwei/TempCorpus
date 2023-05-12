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
        throw new Error("Bad assertion")
}
noInline(assert);
function test(map, key, value) {
    let loadValue = eval(`${Math.random()}; let k = key; (function getValue() { return map.get(k); });`);
    noInline(loadValue);
    for (let i = 0; i < 1000000; i++) {
        assert(loadValue() === value);
    }
}

let reallyLongString = "";
for (let i = 0; i < 60000; i++) {
    reallyLongString += "i";
}
reallyLongString.toString();

let keys = [
    "foo",
    "fdashfdsahfdashfdsh",
    "rope" + "string",
    reallyLongString,
    259243,
    1238231.2138321,
    -92138.328,
    {foo: 25},
    Symbol("Hello world"),
    true,
    false,
    undefined,
    null,
    NaN,
    -0,
    function foo() {}
];

let start = Date.now();
let map = new Map;
let i = 0;
for (let key of keys) {
    let value = {i: i++};
    map.set(key, value);
    test(map, key, value);
}
const verbose = false;
if (verbose)
    print(Date.now() - start);
