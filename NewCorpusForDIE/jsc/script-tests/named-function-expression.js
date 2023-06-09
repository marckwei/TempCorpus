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

description(
"Tests variable resolution rules for named function expressions."
);

function Call(lambda) { return lambda(); }

debug("anonymous function expression");
shouldBe("var x = (function(a,b){ return a + b; }); x(1,2)", "3");

debug("named function expression");
shouldBe("var x = (function Named(a,b){ return a + b; }); x(2,3)", "5");

debug("eval'd code should be able to access scoped variables");
shouldBe("var z = 6; var x = eval('(function(a,b){ return a + b + z; })'); x(3,4)", "13");

debug("eval'd code + self-check");
shouldBe("var z = 10; var x = eval('(function Named(a,b){ return (!!Named) ? (a + b + z) : -999; })'); x(4,5)", "19");

debug("named function expressions are not saved in the current context");
shouldBe('(function Foo(){ return 1; }); try { Foo(); throw "FuncExpr was stored"; } catch(e) { if(typeof(e)=="string") throw e; } 1', "1");

debug("recursion is possible, though");
shouldBe("var ctr = 3; var x = (function Named(a,b){ if(--ctr) return 2 * Named(a,b); else return a + b; }); x(5,6)", "44");

debug("regression test where kjs regarded an anonymous function declaration (which is illegal) as a FunctionExpr");
shouldBe('var hadError = 0; try { eval("function(){ return 2; };"); } catch(e) { hadError = 1; }; hadError;', "1");

debug("\n-----\n");

function shouldBeTrueWithDescription(x, xDescription)
{
	if (x) {
		debug("PASS: " + xDescription + " should be true and is.");
		return;
	}

	debug("FAIL: " + xDescription + " should be true but isn't.");
}

// Recursion.
shouldBeTrueWithDescription(
	(function closure() { return closure == arguments.callee && !this.closure; })(),
	"(function closure() { return closure == arguments.callee && !this.closure; })()"
);

// Assignment.
shouldBeTrueWithDescription(
	(function closure() { closure = 1; return closure == arguments.callee && !this.closure; })(),
	"(function closure() { closure = 1; return closure == arguments.callee && !this.closure; })()"
);

// Function name vs parameter.
shouldBeTrueWithDescription(
	(function closure(closure) { return closure == 1 && !this.closure; })(1),
	"(function closure(closure) { return closure == 1 && !this.closure; })(1)"
);

// Function name vs var.
shouldBeTrueWithDescription(
	(function closure() { var closure = 1; return closure == 1 && !this.closure; })(),
	"(function closure() { var closure = 1; return closure == 1 && !this.closure; })()"
);

// Function name vs declared function.
shouldBeTrueWithDescription(
	(function closure() { function closure() { }; return closure != arguments.callee && !this.closure; })(),
	"(function closure() { function closure() { }; return closure != arguments.callee && !this.closure; })()"
);

// Resolve before tear-off.
shouldBeTrueWithDescription(
	(function closure() { return (function() { return closure && !this.closure; })(); })(),
	"(function closure() { return (function() { return closure && !this.closure; })(); })()"
);

// Resolve assignment before tear-off.
shouldBeTrueWithDescription(
	(function closure() { return (function() { closure = null; return closure && !this.closure; })(); })(),
	"(function closure() { return (function() { closure = null; return closure && !this.closure; })(); })()"
);

// Resolve after tear-off.
shouldBeTrueWithDescription(
	(function closure() { return (function() { return closure && !this.closure; }); })()(),
	"(function closure() { return (function() { return closure && !this.closure; }); })()()"
);

// Resolve assignment after tear-off.
shouldBeTrueWithDescription(
	(function closure() { return (function() { closure = null; return closure && !this.closure; }); })()(),
	"(function closure() { return (function() { closure = null; return closure && !this.closure; }); })()()"
);

// Eval var shadowing (should overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("var closure"); return closure == undefined && !this.closure; })(),
	"(function closure() { eval(\"var closure\"); return closure == undefined && !this.closure; })()"
);

// Eval function shadowing (should overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("function closure() { }"); return closure != arguments.callee && !this.closure; })(),
	"(function closure() { eval(\"function closure() { }\"); return closure != arguments.callee && !this.closure; })()"
);

// Eval shadowing (should overwrite), followed by put (should overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("var closure;"); closure = 1; return closure == 1 && !this.closure; })(),
	"(function closure() { eval(\"var closure;\"); closure = 1; return closure == 1 && !this.closure; })()"
);

// Eval var shadowing, followed by delete (should not overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("var closure"); delete closure; return closure == arguments.callee && !this.closure; })(),
	"(function closure() { eval(\"var closure\"); delete closure; return closure == arguments.callee && !this.closure; })()"
);

// Eval function shadowing, followed by delete (should not overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("function closure() { }"); delete closure; return closure == arguments.callee && !this.closure; })(),
	"(function closure() { eval(\"function closure() { }\"); delete closure; return closure == arguments.callee && !this.closure; })()"
);

// Eval assignment (should not overwrite).
shouldBeTrueWithDescription(
	(function closure() { eval("closure = 1;"); return closure == arguments.callee && !this.closure; })(),
	"(function closure() { eval(\"closure = 1;\"); return closure == arguments.callee && !this.closure; })()"
);
