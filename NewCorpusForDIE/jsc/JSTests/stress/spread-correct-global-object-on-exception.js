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

var globalObjectForObject = $vm.globalObjectForObject;

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}
function spread(a) {
    return [...a];
}
noInline(spread);

const objectText = `
    let o = {
        [Symbol.iterator]() {
            return {
                next() {
                    return {done: true};
                }
            };
        }
    };
    o;
`;

let o = eval(objectText);
for (let i = 0; i < 1000; i++) {
    if (i % 23 === 0)
        o = eval(objectText);
    spread(o);
}

let myGlobalObject = globalObjectForObject(new Object);

let secondGlobalObject = createGlobalObject();
let o2 = secondGlobalObject.Function("return {};")();

let error = null;
try {
    spread(o2);
} catch(e) {
    error = e;
}

assert(error);
assert(globalObjectForObject(error) === myGlobalObject);
