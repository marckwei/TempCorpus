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

function test() {

function f(key) {
  return {
    get: function() { result += key; return true; },
    set: Object,
    enumerable: true
  };
};
var result = '';
var obj = Object.defineProperties({}, {
  2:    f(2),
  0:    f(0),
  1:    f(1),
  ' ':  f(' '),
  9:    f(9),
  D:    f('D'),
  B:    f('B'),
  '-1': f('-1'),
});
Object.defineProperty(obj,'A',f('A'));
Object.defineProperty(obj,'3',f('3'));
Object.defineProperty(obj,'C',f('C'));
Object.defineProperty(obj,'4',f('4'));
delete obj[2];
obj[2] = true;

Object.assign({}, obj);

return result === "012349 DB-1AC";
      
}

if (!test())
    throw new Error("Test failed");

