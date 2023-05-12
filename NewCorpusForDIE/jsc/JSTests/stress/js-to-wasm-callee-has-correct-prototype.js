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

//@ runDefault("--jitPolicyScale=0", "--useSamplingProfiler=1")

function test() {
    function getInstance(bytes) {
        let u8 = Uint8Array.from(bytes, x=>x.charCodeAt(0));
        let module = new WebAssembly.Module(u8.buffer);
        return new WebAssembly.Instance(module);
    }

    let webAsm = getInstance('\0asm\x01\0\0\0\x01\x8E\x80\x80\x80\0\x03`\0\x01\x7F`\0\x01\x7F`\x01\x7F\x01\x7F\x03\x88\x80\x80\x80\0\x07\0\0\0\x01\x01\x02\x02\x04\x85\x80\x80\x80\0\x01p\x01\x07\x07\x07\x91\x80\x80\x80\0\x02\x05callt\0\x05\x05callu\0\x06\t\x8D\x80\x80\x80\0\x01\0A\0\x0B\x07\0\x01\x02\x03\x04\0\x02\nÆ\x80\x80\x80\0\x07\x84\x80\x80\x80\0\0A\x01\x0B\x84\x80\x80\x80\0\0A\x02\x0B\x84\x80\x80\x80\0\0A\x03\x0B\x84\x80\x80\x80\0\0A\x04\x0B\x84\x80\x80\x80\0\0A\x05\x0B\x87\x80\x80\x80\0\0 \0\x11\0\0\x0B\x87\x80\x80\x80\0\0 \0\x11\x01\0\x0B');

    for (let j = 0; j < 1000; j++) {
        try {
            webAsm.exports.callt(-1);
        } catch(e) {}
    }

    samplingProfilerStackTraces();
}

if (this.WebAssembly)
    test();
