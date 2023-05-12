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
    checkScriptSyntax('var a1 = async function*asyncGenWithName1(){ for await(const value of foo()) {} }');
    checkScriptSyntax('var a1 = async function asyncWithName1(){ for await(const value of foo()) {} }');
    checkScriptSyntax('var a1 = async function*asyncGenWithName1(){ for await(let value of foo()) {} }');
    checkScriptSyntax('var a1 = async function asyncWithName1(){ for await(let value of foo()) {} }');
})();

(function checkSimpleAsyncGeneratorStrictMode() {
    checkScriptSyntax('"use strict"; var a1 = async function*asyncGenWithName1(){ for await(const value of foo()) {}  }');
    checkScriptSyntax('"use strict"; var a1 = async function asyncWithName1(){ for await(const value of foo()) {} }');
    checkScriptSyntax('"use strict"; var a1 = async function*asyncGenWithName1(){ for await(let value of foo()) {} }');
    checkScriptSyntax('"use strict"; var a1 = async function asyncWithName1(){ for await(let value of foo()) {} }');
})();


(function checkNestedAsyncGenerators() { 
    var wrappers = [
        {start: 'var a1 = async function*asyncGenWithName1(){', finish: '}'},
        {start: 'async function*asyncGenWithName2(){ ', finish: '}'},
        {start: 'async function asyncWithName2(){ ', finish: '}'},
        {start: 'class A { async * method() { ', finish: ' } }'},
        {start: 'var a1 = async () => {', finish: '}'},
        {start: 'var a1 = async () => { try {   ', finish: ' } catch (e) {} }'},
        {start: 'var a1 = async () => { {   ', finish: ' } }'},
        {start: 'var a1 = async () => { if (true) {   ', finish: ' } }'},
        {start: 'var a1 = async () => { if (true) ', finish: ' }'},
        {start: 'var a1 = async () => { if (true) foo(); else { ', finish: ' } }'},
        {start: 'var a1 = async () => { while (true) { ', finish: ' } }'},
        {start: 'var a1 = async () => { for(;;) { ', finish: ' } }'},
        {start: 'var a1 = async () => { switch(e) { case \'1\' :  ', finish: ' } }'},
    ];

    expressions = [
        'for await(const value of foo()) {}',
        'for await(let value of foo()) {}',
        'for await(var value of foo()) {}',
        'for await(var [a, b] of foo()) {}',
        'for await(let {a, b} of foo()) {}',
        'for await(const [... b] of foo()) {}',
        'for await(const [,,, b] of foo()) {}',
        'for await(const value of boo) {}',
        'for await(let value of boo) {}',
        'for await(const value of foo().boo()) {}',
        'for await(let value of foo.boo()) {}',
        'for await(let value of foo.boo(value)) {}',
        'for await(let value of [1,2,3]) {}',
        'for await(value of [1,2,3]) {}',
        'for await(value of x + x) {}',
        'for await(value of f()) {}',
        'for await(value of (x + x)) {}',
    ];

    wrappers.forEach(wrapper => {
        expressions.forEach(exp => {
            checkScriptSyntax(wrapper.start + exp + wrapper.finish);
        });
    })
})();


(function checkSimpleAsyncGeneratorSyntaxErrorInSloppyMode() {
    evalForSyntaxError("var asyncGenFn = function () { for await(const value of foo()) {} }");
    evalForSyntaxError("var asyncGenFn = async function () { var arr = () => { for await(const value of foo()) {} } }");
    evalForSyntaxError("var asyncGenFn = function* () { for await(const value of foo()) {} }");
    evalForSyntaxError("var asyncGenFn = async function* () { var arr = () => { for await(const value of foo()) {} } }");
    evalForSyntaxError('var a1 = async function*asyncGenWithName1(){ for await(const value in foo()) {} }');
    evalForSyntaxError('var a1 = async function asyncWithName1(){ for await(const value in foo()) {} }');
    evalForSyntaxError('var a1 = async function asyncWithName1(){ for await (;;) {} }');
    evalForSyntaxError("var a1 = async function asyncWithName1(){ for await (let v = 4;;) {} }");
    evalForSyntaxError("var a1 = async function asyncWithName1(){ for await (let v of f();;) {} }");
    evalForSyntaxError("var a1 = async function asyncWithName1(){ for await (let v of boo;;) {} }");
    evalForSyntaxError("var a1 = async function asyncWithName1(){ for await (let v of boo of) {} }");
    evalForSyntaxError("async function asyncWithName1(){ for await (let v of boo in) {} }");
    evalForSyntaxError("async function asyncWithName1(){ for await (v in x + x ) {} }");
})();

(function checkSimpleAsyncGeneratorSyntaxErrorInStrictMode() {
    evalForSyntaxError("'use strict'; var asyncGenFn = function () { for await(const value of foo()) {} }");
    evalForSyntaxError("'use strict'; var asyncGenFn = async function () { var arr = () => { for await(const value of foo()) {} } }");
    evalForSyntaxError("'use strict'; var asyncGenFn = function* () { for await(const value of foo()) {} }");
    evalForSyntaxError("'use strict'; var asyncGenFn = async function* () { var arr = () => { for await(const value of foo()) {} } }");
    evalForSyntaxError("'use strict'; var a1 = async function*asyncGenWithName1(){ for await(const value in foo()) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await(const value in foo()) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await (;;) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await (let v = 4;;) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await (let v of f();;) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await (let v of boo;;) {} }");
    evalForSyntaxError("'use strict'; var a1 = async function asyncWithName1(){ for await (let v of boo of) {} }");
    evalForSyntaxError("'use strict'; async function asyncWithName1(){ for await (let v of boo in) {} }");
    evalForSyntaxError("'use strict'; async function asyncWithName1(){ for await (v in x + x ) {} }");
})();
