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

//@ runDefault("--thresholdForJITAfterWarmUp=10", "--thresholdForFTLOptimizeAfterWarmUp=20", "--useConcurrentJIT=0", "--useConcurrentGC=0")

function var3() { 
    const var15 = { a : 10 } ;
    const var7 = { } ;
    var7.d = var15 ;
    const var10 = [ 1 ] ;
    var10 . toString = [ ] ;
    if ( ! var10 ) { return 0 ; }
    for ( var i =0; i < 50; i++ ) {
        var var2 = "aa";
        var2.x = function ( ) {
            var3.c = new Uint32Array ( 1 ) ;
            var15.b = new Uint32Array ( 1 ) ;
        }
        var7 [ 0 ] = { } ;
    } 
} 

for(var i = 0; i < 2000; i++) {
    var3();
}
