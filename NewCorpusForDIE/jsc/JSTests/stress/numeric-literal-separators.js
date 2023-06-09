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

function shouldNotThrow(script) {
  eval(script);
}

function shouldThrow(script, errorType) {
    let error;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }

    if (!(error instanceof errorType))
        throw new Error(`Expected ${errorType.name}!`);
}

shouldNotThrow('1_1_1');
shouldNotThrow('0x1_1_1');
shouldNotThrow('0b1_1_1');
shouldNotThrow('0o1_1_1');
shouldNotThrow('10000000000_0');
shouldNotThrow('0x100000000_0');
shouldNotThrow('0b100000000000000000000000000000000_0');
shouldNotThrow('0o10000000000_0');

shouldNotThrow('1_1_1n');
shouldNotThrow('0x1_1_1n');
shouldNotThrow('0b1_1_1n');
shouldNotThrow('0o1_1_1n');
shouldNotThrow('10000000000_0n');
shouldNotThrow('0x100000000_0n');
shouldNotThrow('0b100000000000000000000000000000000_0n');
shouldNotThrow('0o10000000000_0n');

shouldNotThrow('.1_1_1');
shouldNotThrow('1_1_1.2_2_2');
shouldNotThrow('1_1_1.2_2_2e3_3_3');
shouldNotThrow('1_1_1.2_2_2e+3_3_3');
shouldNotThrow('1_1_1.2_2_2e-3_3_3');
shouldNotThrow('1_1_1e2_2_2');
shouldNotThrow('1_1_1e+2_2_2');
shouldNotThrow('1_1_1e-2_2_2');
shouldNotThrow('1_1_1.e2_2_2');
shouldNotThrow('1_1_1.e+2_2_2');
shouldNotThrow('1_1_1.e-2_2_2');

shouldThrow('_1', ReferenceError);
shouldThrow('1_', SyntaxError);
shouldThrow('1__1', SyntaxError);
shouldThrow('0x_1', SyntaxError);
shouldThrow('0x1_', SyntaxError);
shouldThrow('0x1__1', SyntaxError);
shouldThrow('0b_1', SyntaxError);
shouldThrow('0b1_', SyntaxError);
shouldThrow('0b1__1', SyntaxError);
shouldThrow('0o_1', SyntaxError);
shouldThrow('0o1_', SyntaxError);
shouldThrow('0o1__1', SyntaxError);
shouldThrow('0_1', SyntaxError);
shouldThrow('10000000000_', SyntaxError);
shouldThrow('10000000000__0', SyntaxError);
shouldThrow('0x100000000_', SyntaxError);
shouldThrow('0x100000000__0', SyntaxError);
shouldThrow('0b100000000000000000000000000000000_', SyntaxError);
shouldThrow('0b100000000000000000000000000000000__0', SyntaxError);
shouldThrow('0o10000000000_', SyntaxError);
shouldThrow('0o10000000000__0', SyntaxError);

shouldThrow('1_n', SyntaxError);
shouldThrow('0x1_n', SyntaxError);
shouldThrow('0b1_n', SyntaxError);
shouldThrow('0o1_n', SyntaxError);
shouldThrow('10000000000_n', SyntaxError);
shouldThrow('0x100000000_n', SyntaxError);
shouldThrow('0b100000000000000000000000000000000_n', SyntaxError);
shouldThrow('0o10000000000_n', SyntaxError);

shouldThrow('._1', SyntaxError);
shouldThrow('.1_', SyntaxError);
shouldThrow('.1__1', SyntaxError);
shouldThrow('1_.2', SyntaxError);
shouldThrow('1._2', SyntaxError);
shouldThrow('1.2_', SyntaxError);
shouldThrow('1.2__2', SyntaxError);
shouldThrow('1_e2', SyntaxError);
shouldThrow('1e_2', SyntaxError);
shouldThrow('1e2_', SyntaxError);
shouldThrow('1e2__2', SyntaxError);
shouldThrow('1e+_2', SyntaxError);
shouldThrow('1e+2_', SyntaxError);
shouldThrow('1e+2__2', SyntaxError);
shouldThrow('1e-_2', SyntaxError);
shouldThrow('1e-2_', SyntaxError);
shouldThrow('1e-2__2', SyntaxError);

shouldThrow('01_1', SyntaxError);
shouldThrow('01_9', SyntaxError);
shouldThrow('09_1', SyntaxError);
shouldThrow('0100_001', SyntaxError);
shouldThrow('0100_009', SyntaxError);
shouldThrow('0900_001', SyntaxError);
shouldThrow('010000000000_1', SyntaxError);
shouldThrow('010000000000_9', SyntaxError);
shouldThrow('090000000000_1', SyntaxError);
