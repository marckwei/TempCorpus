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

var theO;

function deleteAll() {
    delete theO.a;
    delete theO.b;
    delete theO.c;
    delete theO.d;
    for (var i = 0; i < 10; ++i)
        theO["i" + i] = 42;
    theO.a = 11;
    theO.b = 12;
    theO.c = 13;
    theO.d = 14;
}

function foo(o_) {
    var o = o_;
    var result = 0;
    for (var s in o) {
        result += o[s];
        deleteAll();
    }
    return result;
}

noInline(foo);

for (var i = 0; i < 1000; ++i) {
    var global = $vm.createGlobalObject();
    global.a = 1;
    global.b = 2;
    global.c = 3;
    global.d = 4;
    theO = global;
    var result = foo($vm.createGlobalProxy(global));
    if (result != 1 + 12 + 13 + 14)
        throw "Error: bad result: " + result;
}
