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

try {
   var ary_1 = [1.1,2.2,3.3]
   var ary_2 = [1.1,2.2,3.3]
   var ary_3 = [1.1,2.2,3.3]
   ary_3['www'] = 1
   var f64_1 = new Float64Array(0x10)
   f64_1['0x7a'] = 0xffffffff

   var flag = 0;
   var p = {"a":{}};
   p[Symbol.iterator] = function* () {
       if (flag == 1) {
           ary_2[0] = {}
       }
       yield 1;
       yield 2;
   };
   var go = function(a,b,c){
       a[0] = 1.1;
       a[1] = 2.2;
       [...c];
       b[0] = a[0];
       a[2] = 2.3023e-320
   }

   for (var i = 0; i < 0x100000; i++) {
       go(ary_1, f64_1, p)
   }

   flag = 1;

   go(ary_2, f64_1, p);
} catch(e) { }
