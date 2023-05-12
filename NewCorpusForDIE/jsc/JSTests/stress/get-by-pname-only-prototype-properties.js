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

var foo = function (C, A) {
    for(var B in (A||{})) {
        C[B]=A[B];
    }
    return C;
}

var protos = [];
for (var i = 0; i < 256; i++) {
    var proto = Object.create(null);
    protos.push(proto);
    proto.aa = 1;
    proto.ab = 1;
    proto.ac = 1;
    proto.ad = 1;
    proto.ae = 1;
    proto.af = 1;
    proto.ag = 1;
    proto.ah = 1;
    proto.ai = 1;
    proto.aj = 1;
    proto.ak = 1;
    proto.al = 1;
    proto.am = 1;
    proto.an = 1;
    proto.ao = 1;
    proto.ap = 1;
    proto.aq = 1;
    proto.ar = 1;
    proto.as = 1;
    proto.at = 1;
    proto.au = 1;
    proto.av = 1;
    proto.aw = 1;
    proto.ax = 1;
    proto.ay = 1;
    proto.az = 1;
    proto.ba = 1;
    proto.bb = 1;
    proto.bc = 1;
    proto.bd = 1;
    proto.be = 1;
    proto.bf = 1;
    var weirdObject = Object.create(proto);
    var result = foo({}, weirdObject);
    for (var p in result) {
        if (result[p] !== result["" + p])
            throw new Error("OUT");
    }
}
