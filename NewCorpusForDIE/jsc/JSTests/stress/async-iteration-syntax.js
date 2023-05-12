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

var assert = function (result, expected, message = "") {
  if (result !== expected) {
    throw new Error('Error in assert. Expected "' + expected + '" but was "' + result + '":' + message );
  }
};

function evalForSyntaxError(src, message) {
    var bError = false;
    try {
        eval(src);
    } catch (error) {
        bError = error instanceof SyntaxError && (String(error) === message || typeof message === 'undefined'); 
    }
    if (!bError) {
        throw new Error("Expected syntax Error: " + message + "\n in script: `" + src + "`");
    }
}

(function checkSimpleAsyncGeneratorSloppyMode() {
    checkScriptSyntax('var a1 = async function*asyncGenWithName1(){}');
    checkScriptSyntax('var a2 = async function *asyncGenWithName2(){ yield 11; }');
    checkScriptSyntax('var a3 = async function * asyncGenWithName2(){ await p; yield 11; }');
    checkScriptSyntax('var d1 = async function*(){}');
    checkScriptSyntax('var d2 = async function* (){ yield 11; }');
    checkScriptSyntax('var d3 = async function * (){ await p; yield 11; }');
    checkScriptSyntax('async function* withName1(){  }');
    checkScriptSyntax('async function *withName2(){ yield 11; }');
    checkScriptSyntax('async function * withName3(){ await p; yield 11; }');
    checkScriptSyntax('class A { async * method() { } }');
    checkScriptSyntax('class B { async * method() {yield 11;} }');
    checkScriptSyntax('class C { async * method() {yield 11; await p;} }');
    checkScriptSyntax('class D { async * "method"() {yield 11; await p;} }');
    checkScriptSyntax('class F { async * 0() {yield 11; await p;} }');
    checkScriptSyntax('var obj = { async * method() {yield 11; await p;} }');
    checkScriptSyntax('({ async foo() {} })');
    checkScriptSyntax('({ async : 1 })');
})();

(function checkSimpleAsyncGeneratorStrictMode() {
    checkScriptSyntax('"use strict"; var a1 = async function*asyncGenWithName1(){}');
    checkScriptSyntax('"use strict"; var a2 = async function *asyncGenWithName2(){ yield 11; }');
    checkScriptSyntax('"use strict"; var a3 = async function * asyncGenWithName2(){ await p; yield 11; }');
    checkScriptSyntax('"use strict"; var d1 = async function*(){}');
    checkScriptSyntax('"use strict"; var d2 = async function* (){ yield 11; }');
    checkScriptSyntax('"use strict"; var d3 = async function * (){ await p; yield 11; }');
    checkScriptSyntax('"use strict"; async function* withName1(){  }');
    checkScriptSyntax('"use strict"; async function *withName2(){ yield 11; }');
    checkScriptSyntax('"use strict"; async function * withName3(){ await p; yield 11; }');
    checkScriptSyntax('"use strict"; class A { async * method() { } }');
    checkScriptSyntax('"use strict"; class B { async * method() {yield 11;} }');
    checkScriptSyntax('"use strict"; class C { async * method() {yield 11; await p;} }');
    checkScriptSyntax('"use strict"; class D { async * "method"() {yield 11; await p;} }');
    checkScriptSyntax('"use strict"; class E { async * ["calc" + "ulate"]() {yield 11; await p;} }');
    checkScriptSyntax('"use strict"; class F { async * 0() {yield 11; await p;} }');
    checkScriptSyntax('"use strict"; var obj = { async * method() {yield 11; await p;} }');
    checkScriptSyntax('"use strict"; ({ async foo() {} })');
    checkScriptSyntax('"use strict"; ({ async : 1 })');
})();


(function checkNestedAsyncGenerators() { 
    var wrappers = [
        {start: 'var a1 = async function*asyncGenWithName1(){', finish: '}'},
        {start: 'async function*asyncGenWithName2(){ ', finish: '}'},
        {start: 'class A { async * method() { ', finish: ' } }'}
    ];

    expressions = [
        'await 10; yield 11; return 12;',
        'var async = 10; yield async;',
        'var async = 10; await async;',
        'var async = 10; return async;',
        'var async = function() {}; return async;',
        'var async = function() {}; return async();',
    ];

    wrappers.forEach(wrapper => {
        expressions.forEach(exp => {
            checkScriptSyntax(wrapper.start + exp + wrapper.finish);
        });
    })
})();


(function checkSimpleAsyncGeneratorSyntaxErrorInSloppyMode() {
    evalForSyntaxError("var asyncGenFn = async function *await() {}");
    evalForSyntaxError("var asyncGenFn = async function*(await) {}");
    evalForSyntaxError("var asyncGenFn = async function *withName(await) {}");
    evalForSyntaxError("async function *asyncGeneratorFunctionDeclaration(await) {}");
    evalForSyntaxError("var asyncGenFn = *async function () {}");
    evalForSyntaxError("var asyncGenFn = *async function withName() {}");
    evalForSyntaxError("*async function asyncGeneratorFunctionDeclaration(await) {}");
    evalForSyntaxError("var obj = { *async asyncGeneratorMethod() {} };");
    evalForSyntaxError("var obj = { async asyncGeneratorMethod*() {} };");
    evalForSyntaxError("class A { get async* ttt() {} }");
    evalForSyntaxError("class B { get *async ttt() {} }");
    evalForSyntaxError('({ async = 1 })');
})();

(function checkSimpleAsyncGeneratorSyntaxErrorInStrictMode() {
    evalForSyntaxError("'use strict'; var asyncGenFn = async function *await() {}");
    evalForSyntaxError("'use strict'; var asyncGenFn = async function*(await) {}");
    evalForSyntaxError("'use strict'; var asyncGenFn = async function *withName(await) {}");
    evalForSyntaxError("'use strict'; async function *asyncGeneratorFunctionDeclaration(await) {}");
    evalForSyntaxError("'use strict'; var asyncGenFn = *async function () {}");
    evalForSyntaxError("'use strict'; var asyncGenFn = *async function withName() {}");
    evalForSyntaxError("'use strict'; *async function asyncGeneratorFunctionDeclaration(await) {}");
    evalForSyntaxError("'use strict'; var obj = { *async asyncGeneratorMethod() {} };");
    evalForSyntaxError("'use strict'; var obj = { async asyncGeneratorMethod*() {} };");
    evalForSyntaxError("'use strict'; class A { get async* ttt() {} }");
    evalForSyntaxError("'use strict'; class B { get *async ttt() {} }");
    evalForSyntaxError("'use strict'; ({ async = 1 })");
})();
