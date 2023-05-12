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

var abort = $vm.abort;

function testSyntaxError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected syntax error not thrown");

    if (String(error) !== message)
        throw new Error(`Bad error: ${String(error)}`);
}

async function testSyntax(script, message) {
    var error = null;
    try {
        await eval(script);
    } catch (e) {
        error = e;
    }
    if (error) {
        if (error instanceof SyntaxError)
            throw new Error("Syntax error thrown");
    }
}

testSyntaxError(`import)`, `SyntaxError: Unexpected token ')'. import call expects one or two arguments.`);
testSyntaxError(`new import(`, `SyntaxError: Cannot use new with import.`);
testSyntaxError(`import.hello()`, `SyntaxError: Unexpected identifier 'hello'. "import." can only be followed with meta.`);
testSyntaxError(`import[`, `SyntaxError: Unexpected token '['. import call expects one or two arguments.`);
testSyntaxError(`import<`, `SyntaxError: Unexpected token '<'. import call expects one or two arguments.`);

testSyntaxError(`import()`, `SyntaxError: Unexpected token ')'`);
testSyntaxError(`import(a, b, c)`, `SyntaxError: Unexpected identifier 'c'. import call expects one or two arguments.`);
testSyntaxError(`import(...a)`, `SyntaxError: Unexpected token '...'`);
testSyntaxError(`import(,a)`, `SyntaxError: Unexpected token ','`);
testSyntaxError(`import(,)`, `SyntaxError: Unexpected token ','`);
testSyntaxError(`import("Hello";`, `SyntaxError: Unexpected token ';'. import call expects one or two arguments.`);
testSyntaxError(`import("Hello"];`, `SyntaxError: Unexpected token ']'. import call expects one or two arguments.`);
testSyntaxError(`import("Hello",;`, `SyntaxError: Unexpected token ';'`);
testSyntaxError(`import("Hello", "Hello2";`, `SyntaxError: Unexpected token ';'. import call expects one or two arguments.`);


testSyntaxError(`import = 42`, `SyntaxError: Unexpected token '='. import call expects one or two arguments.`);
testSyntaxError(`[import] = 42`, `SyntaxError: Unexpected token ']'. import call expects one or two arguments.`);
testSyntaxError(`{import} = 42`, `SyntaxError: Unexpected token '}'. import call expects one or two arguments.`);
testSyntaxError(`let import = 42`, `SyntaxError: Unexpected keyword 'import'`);
testSyntaxError(`var import = 42`, `SyntaxError: Cannot use the keyword 'import' as a variable name.`);
testSyntaxError(`const import = 42`, `SyntaxError: Cannot use the keyword 'import' as a lexical variable name.`);

(async function () {
    await testSyntax(`import("./import-tests/cocoa.js")`);
    await testSyntax(`import("./import-tests/../import-tests/cocoa.js")`);
    await testSyntax(`import("./import-tests/../import-tests/cocoa.js").then(() => { })`);
    await testSyntax(`(import("./import-tests/../import-tests/cocoa.js").then(() => { }))`);
    await testSyntax(`(import("./import-tests/../import-tests/cocoa.js"))`);
    await testSyntax(`import("./import-tests/../import-tests/cocoa.js").catch(() => { })`);
    await testSyntax(`(import("./import-tests/../import-tests/cocoa.js").catch(() => { }))`);
}()).catch((error) => {
    print(String(error));
    abort();
});
