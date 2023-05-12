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

function assert(cond, msg = "") {
    if (!cond)
        throw new Error(msg);
}
noInline(assert);

function shouldThrowSyntaxError(str, message) {
    var hadError = false;
    try {
        eval(str);
    } catch (e) {
        if (e instanceof SyntaxError) {
            hadError = true;
            if (typeof message === "string")
                assert(e.message === message, "Expected '" + message + "' but threw '" + e.message + "'");
        }
    }
    assert(hadError, "Did not throw syntax error");
}
noInline(shouldThrowSyntaxError);

var AsyncFunction = (async function() {}).constructor;

// AsyncFunctionExpression
shouldThrowSyntaxError("(async function() { var await; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { var [await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { var [...await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { var {await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("(async function() { let await; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { let [await] = []; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { let [...await] = []; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { let {await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { let {isAsync: await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { let {isAsync: await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const await; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const [await] = []; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const [...await] = []; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const {await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const {isAsync: await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { const {isAsync: await} = {}; })", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("(async function() { function await() {} })", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("(async function() { async function await() {} })", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("(async function(await) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f([await]) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f([...await]) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f(...await) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f({await}) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f({isAsync: await}) {})", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("(async function f(x = await => {}) {})", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("(async function f(x = (await) => {}) {})", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("(async function f(x = await /1/g) {})", "Cannot use 'await' within a parameter default expression.");

// AsyncFunctionDeclaration
shouldThrowSyntaxError("async function f() { var await; }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { var [await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { var [...await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { var {await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("async function f() { let await; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { let [await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { let [...await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { let {await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { let {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { let {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const await; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const [await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const [...await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const {await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { const {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("async function f() { function await() {} }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("async function f() { async function await() {} }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("async function f(await) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f([await]) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f([...await]) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f(...await) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f({await}) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f({isAsync: await}) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("async function f(x = await => {}) {}", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("async function f(x = (await) => {}) {}", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("async function f(x = await /1/g) {}", "Cannot use 'await' within a parameter default expression.");

// AsyncArrowFunction
shouldThrowSyntaxError("var f = async () => { var await; }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { var [await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { var [...await] = []; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { var {await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { var {isAsync: await} = {}; })", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let await; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let [await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let [...await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let {await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { let {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const await; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const [await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const [...await] = []; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const {await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { const {isAsync: await} = {}; }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var f = async () => { function await() {} }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("var f = async () => { async function await() {} }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("var f = async await => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async (await) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async ([await]) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async ([...await]) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async (...await) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async ({await}) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async ({isAsync: await}) => {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var f = async (x = await => {}) => {}", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("var f = async (x = (await) => {}) => {}", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("var f = async (x = await /1/g) => {}", "Cannot use 'await' within a parameter default expression.");

// AsyncMethod
shouldThrowSyntaxError("var O = { async f() { var await; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { var [await] = []; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { var [...await] = []; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { var {await} = {}; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { var {isAsync: await} = {}; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { var {isAsync: await} = {}; } }", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let await; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let [await] = []; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let [...await] = []; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let {await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let {isAsync: await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { let {isAsync: await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const await; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const [await] = []; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const [...await] = []; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const {await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const {isAsync: await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { const {isAsync: await} = {}; } }", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("var O = { async f() { function await() {} }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("var O = { async f() { async function await() {} } }", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("var O = { async f(await) {} } ", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f([await]) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f([...await]) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f(...await) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f({await}) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f({isAsync: await}) {}", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("var O = { async f(x = await => {}) {} }", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("var O = { async f(x = (await) => {}) {} }", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("var O = { async f(x = await /1/g) {} }", "Cannot use 'await' within a parameter default expression.");

// AsyncFunction constructor
shouldThrowSyntaxError("AsyncFunction('var await;')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('var [await] = [];')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('var [...await] = [];')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('var {await} = {};')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('var {isAsync: await} = {};')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('var {isAsync: await} = {};')", "Cannot use 'await' as a variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let await;')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let [await] = [];')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let [...await] = [];')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let {await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let {isAsync: await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('let {isAsync: await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const await;')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const [await] = [];')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const [...await] = [];')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const {await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const {isAsync: await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('const {isAsync: await} = {};')", "Cannot use 'await' as a lexical variable name in an async function.");
shouldThrowSyntaxError("AsyncFunction('function await() {}')", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("AsyncFunction('async function await() {}')", "Cannot declare function named 'await' in an async function.");
shouldThrowSyntaxError("AsyncFunction('await', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('[await]', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('[...await]', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('...await', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('{await}', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('{isAsync: await}', '')", "Cannot use 'await' as a parameter name in an async function.");
shouldThrowSyntaxError("AsyncFunction('x = await => {}', '')", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("AsyncFunction('x = (await) => {}', '')", "Cannot use 'await' within a parameter default expression.");
shouldThrowSyntaxError("AsyncFunction('x = await /1/g', '')", "Cannot use 'await' within a parameter default expression.");
