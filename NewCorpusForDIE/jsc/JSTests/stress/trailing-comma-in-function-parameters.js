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

function test(result, expected, message) {
    if (result !== expected)
        throw "Error: " + message + ". was: " + result + " wanted: " + expected;
}

function evalWithThrow(text) {
    var result; 
    try {
        result = eval(text);
    } catch (error) {
        return error.toString();
    }
    return result;
}

test(evalWithThrow('typeof function(,){ return a; }'), 'SyntaxError: Unexpected token \',\'. Expected a parameter pattern or a \')\' in parameter list.');
test(evalWithThrow('typeof function(a,,){ return a; }'), 'SyntaxError: Unexpected token \',\'. Expected a parameter pattern or a \')\' in parameter list.');
test(evalWithThrow('function a(a, ...last,){ return; }'), 'SyntaxError: Unexpected token \',\'. Rest parameter should be the last parameter in a function declaration.');
test(eval('typeof function(a,){ return a; }'), 'function');
test(eval('typeof function(a, b,){ return a + b; }'), 'function');
test(eval('typeof function(a, b, c, ){ return a + b + c; }'), 'function');

test(evalWithThrow('typeof ((,)=>{ return a; })'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('typeof ((a,,)=>{ return a; })'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('typeof ((a, ...last,)=>{ return a; })'), 'SyntaxError: Unexpected token \'...\'');
test(eval('typeof ((a,)=>{ return a; })'), 'function');
test(eval('typeof ((a, b,)=>{ return a + b; })'), 'function');
test(eval('typeof ((a, b, c)=>{ return a + b + c; })'), 'function');

test(evalWithThrow('typeof ((,)=>a)'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('typeof ((a,,)=>a)'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('(a,...last,)=>0;'), 'SyntaxError: Unexpected token \'...\'');
test(eval('typeof ((a,)=>a)'), 'function');
test(eval('typeof ((a, b,)=>a + b)'), 'function');
test(eval('typeof ((a, b, c)=>a + b + c)'), 'function');

test(evalWithThrow('typeof ((,)=>a)'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('typeof ((a,,)=>a)'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('(a,...last,)=>0;'), 'SyntaxError: Unexpected token \'...\'');
test(eval('typeof ((a,)=>a)'), 'function');
test(eval('typeof ((a, b,)=>a + b)'), 'function');
test(eval('typeof ((a, b, c)=>a + b + c)'), 'function');

test(evalWithThrow('typeof function(a = "x0",,){ return a; }'), 'SyntaxError: Unexpected token \',\'. Expected a parameter pattern or a \')\' in parameter list.');
test(evalWithThrow('typeof function(a = "x0",...last,){ return a; }'), 'SyntaxError: Unexpected token \',\'. Rest parameter should be the last parameter in a function declaration.');
test(eval('typeof function(a = "x0",){ return a; }'), 'function');
test(eval('typeof function(a = "x1", b = "y1",){ return a + b; }'), 'function');
test(eval('typeof function(a = "x2", b = "y2", c = "z3"){ return a + b + c; }'), 'function');

test(evalWithThrow('(function(a){ return a; })(,)'), 'SyntaxError: Unexpected token \',\'');
test(evalWithThrow('(function(a){ return a; })("A",,)'), 'SyntaxError: Unexpected token \',\'');
test(eval('(function(a){ return a; })("A",)'), 'A');
test(eval('(function(a, b,){ return a + b; })("A", "B",)'), 'AB');
test(eval('(function(a, b, c){ return a + b + c; })("A", "B", "C",)'), 'ABC');

test(eval('(function(a){ return arguments.length; })("A",)'), 1);
test(eval('(function(a, b,){ return arguments.length; })("A", "B",)'), 2);
test(eval('(function(a, b, c){ return arguments.length; })("A", "B", "C",)'), 3);
test(eval('(function(a,) { }).length'), 1);
test(eval('(function(a, b, ) { }).length'), 2);
test(eval('(function(a, b, c, ) { }).length'), 3);


