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

function shouldNotThrow(func) {
    func();
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

shouldNotThrow(() => { l\u0065t: 3; });
shouldNotThrow(() => { aw\u0061it: 3; });
shouldNotThrow(() => { yi\u0065ld: 3; });
shouldNotThrow(() => { st\u0061tic: 3; });
shouldThrowSyntaxError('nu\\u006cl: 3;');
shouldThrowSyntaxError('async function f() { aw\\u0061it: 3; }');
shouldThrowSyntaxError('function* g() { yi\\u0065ld: 3; }');

shouldNotThrow(() => { var l\u0065t = 3; });
shouldNotThrow(() => { var aw\u0061it = 3; });
shouldNotThrow(() => { var yi\u0065ld = 3; });
shouldNotThrow(() => { var st\u0061tic = 3; });
shouldThrowSyntaxError('var nu\\u006cl = 3;');
shouldThrowSyntaxError('async function f() { var aw\\u0061it = 3; }');
shouldThrowSyntaxError('function* g() { var yi\\u0065ld = 3; }');

shouldNotThrow(() => { let aw\u0061it = 3; });
shouldNotThrow(() => { let yi\u0065ld = 3; });
shouldNotThrow(() => { let st\u0061tic = 3; });
shouldThrowSyntaxError('let l\\u0065t = 3;');
shouldThrowSyntaxError('let nu\\u006cl = 3;');
shouldThrowSyntaxError('async function f() { let aw\\u0061it = 3; }');
shouldThrowSyntaxError('function* g() { let yi\\u0065ld = 3; }');

shouldNotThrow(() => { const aw\u0061it = 3; });
shouldNotThrow(() => { const yi\u0065ld = 3; });
shouldNotThrow(() => { const st\u0061tic = 3; });
shouldThrowSyntaxError('const l\\u0065t = 3;');
shouldThrowSyntaxError('const nu\\u006cl = 3;');
shouldThrowSyntaxError('async function f() { const aw\\u0061it = 3; }');
shouldThrowSyntaxError('function* g() { const yi\\u0065ld = 3; }');

shouldNotThrow(() => { class aw\u0061it {} });
shouldThrowSyntaxError('class l\\u0065t {}');
shouldThrowSyntaxError('class yi\\u0065ld {}');
shouldThrowSyntaxError('class st\\u0061tic {}');
shouldThrowSyntaxError('class nu\\u006cl {}');
shouldThrowSyntaxError('async function f() { class aw\\u0061it {} }');
shouldThrowSyntaxError('function* g() { class yi\\u0065ld {} }');

shouldNotThrow(() => { async function aw\u0061it() {} });
shouldNotThrow(() => { function* yi\u0065ld() {} });
shouldThrowSyntaxError('async function f() { function aw\\u0061it() {} }');
shouldThrowSyntaxError('function* g() { function yi\\u0065ld() {} }');

shouldNotThrow(() => { function f(aw\u0061it) {} });
shouldNotThrow(() => { function g(yi\u0065ld) {} });
shouldThrowSyntaxError('async function f(aw\\u0061it) {}');
shouldThrowSyntaxError('function* g(yi\\u0065ld) {}');

shouldNotThrow(() => { function l\u0065t() {} });
shouldNotThrow(() => { function st\u0061tic() {} });
shouldNotThrow(() => { function f(l\u0065t) {} });
shouldNotThrow(() => { function f(st\u0061tic) {} });
shouldThrowSyntaxError('function f() { function nu\\u006cl() {} }');
shouldThrowSyntaxError('function f(nu\\u006cl) {}');

shouldNotThrow(() => { l\u0065t => 3; });
shouldNotThrow(() => { aw\u0061it => 3; });
shouldNotThrow(() => { yi\u0065ld => 3; });
shouldNotThrow(() => { st\u0061tic => 3; });
shouldThrowSyntaxError('nu\\u006cl => 3;');
shouldThrowSyntaxError('async function f() { aw\\u0061it => 3; }');
shouldThrowSyntaxError('function* g() { yi\\u0065ld => 3; }');
