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

description("Tests for ES6 arrow function syntax errors");

shouldThrow('=>{}');

function checkStatement(statement) {
  var unexpectedSymbols = [ "",
      "*", "/", "%" ,  "+", "-" ,
       "<<", ">>", ">>>" ,
       "<", ">", "<=", ">=", "instanceof", "in" ,
       "==", "!=", "===", "!==",
       "&" ,  "^" ,  "|" ,
       "&&" ,  "||", ";" , ","
  ];

  for (var i = 0; i < unexpectedSymbols.length; i++) {
    shouldThrow(statement + unexpectedSymbols[i]);
  }
}

checkStatement('x=>');
checkStatement('x=>{');
shouldThrow('x=>}');

checkStatement('var y = x=>');
checkStatement('var y = x=>{');
shouldThrow('var y = x=>}');


shouldThrow('var t = x=>x+1; =>{}');
shouldThrow('[=>x+1]');
shouldThrow('[x=>x+1, =>x+1]');
shouldThrow('var f=>x+1;');
shouldThrow('var x, y=>y+1;');
shouldThrow('debug(=>x+1)');
shouldThrow('debug("xyz", =>x+1)');

shouldThrow("var af1=y\n=>y+1");
shouldThrow("var af2=(y)\n=>y+1");
shouldThrow("var af3=(x, y)\n=>y+1");

shouldThrow('([a, b] => a + b)(["a_", "b_"])' );
shouldThrow('({a, b} => a + b)({a:"a_", b:"b_"})');
shouldThrow('({c:a,d:b} => a + b)({c:"a_", d:"b_"})');
shouldThrow('({c:b,d:a} => a + b)({c:"a_", d:"b_"})');

shouldThrow('var arr1 = [a, b] => a + b;');
shouldThrow('var arr2 = {a, b} => a + b;');
shouldThrow('var arr3 = {c:a,d:b} => a + b;');
shouldThrow('var arr3 = {c:b,d:a} => a + b;');

shouldThrow('var arr4 = () => { super(); };', '"SyntaxError: super is not valid in this context."');
shouldThrow('var arr4 = () => { super; };', '"SyntaxError: super is not valid in this context."');
shouldThrow('var arr5 = () => { super.getValue(); };', '"SyntaxError: super is not valid in this context."');

shouldThrow('var arr6 = () =>  super();', '"SyntaxError: super is not valid in this context."');
shouldThrow('var arr7 = () =>  super;', '"SyntaxError: super is not valid in this context."');
shouldThrow('var arr8 = () =>  super.getValue();', '"SyntaxError: super is not valid in this context."');

shouldThrow('class A { constructor() { function a () { return () => { super(); };}}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class B { constructor() { function b () { return () => { super; }; }; }}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class C { constructor() { function c () { return () => { super.getValue(); };}}', '"SyntaxError: super is not valid in this context."');

shouldThrow('class D { constructor() { function a () { return () => super(); }}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class E { constructor() { function b () { return () => super; }; }}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class F { constructor() { function c () { return () => super.getValue(); }}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class G {}; class G2 extends G { getValue() { function c () { return () => super.getValue(); }}', '"SyntaxError: super is not valid in this context."');
shouldThrow('class H {}; class H2 extends H { method() { function *gen() { let arr = () => super.getValue(); arr(); } } }', '"SyntaxError: super is not valid in this context."');

var successfullyParsed = true;
