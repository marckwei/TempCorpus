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

function shouldThrowSyntaxError(script) {
    let error;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }

    if (!(error instanceof SyntaxError))
        throw new Error('Expected SyntaxError!');
}

shouldThrowSyntaxError('{ var x; let x; }');
shouldThrowSyntaxError('{ { var x; } let x; }');
shouldThrowSyntaxError('{ { { var x; } } let x; }');
shouldThrowSyntaxError('{ let x; var x; }');
shouldThrowSyntaxError('{ let x; { var x; } }');
shouldThrowSyntaxError('{ let x; { { var x; } } }');

shouldNotThrow('{ var x; { let x; } }');
shouldNotThrow('{ var x; { { let x; } } }');
shouldNotThrow('{ { let x; } var x; }');
shouldNotThrow('{ { { let x; } } var x; }');

shouldThrowSyntaxError('{ var x; const x = 0; }');
shouldThrowSyntaxError('{ { var x; } const x = 0; }');
shouldThrowSyntaxError('{ { { var x; } } const x = 0; }');
shouldThrowSyntaxError('{ const x = 0; var x; }');
shouldThrowSyntaxError('{ const x = 0; { var x; } }');
shouldThrowSyntaxError('{ const x = 0; { { var x; } } }');

shouldNotThrow('{ var x; { const x = 0; } }');
shouldNotThrow('{ var x; { { const x = 0; } } }');
shouldNotThrow('{ { const x = 0; } var x; }');
shouldNotThrow('{ { { const x = 0; } } var x; }');
