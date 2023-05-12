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


function shouldBeSyntaxError(s) {
    let isSyntaxError = false;
    try {
        eval(s);
    } catch(e) {
        if (e instanceof SyntaxError)
            isSyntaxError = true;
    }
    if (!isSyntaxError)
        throw new Error("expected a syntax error");
}
noInline(shouldBeSyntaxError);

function shouldNotBeSyntaxError(s) {
    let isSyntaxError = false;
    try {
        eval(s);
    } catch(e) {
        if (e instanceof SyntaxError)
            isSyntaxError = true;
    }
    if (isSyntaxError)
        throw new Error("did not expect a syntax error");
}

function truth() { return true; }
noInline(truth);

shouldBeSyntaxError("class A { }; class A { };");
shouldBeSyntaxError("function foo() { class A { }; class A { }; }");
shouldBeSyntaxError("function foo() { if (truth()) { class A { }; class A { }; } }");
shouldBeSyntaxError("switch(10) { case 10: class A { }; break; case 20: class A { } }");
shouldBeSyntaxError("if (truth()) class A { }");
shouldNotBeSyntaxError("switch(10) { case 10: { class A { }; break; } case 20: class A { } }");
shouldNotBeSyntaxError("class A { } if (truth()) { class A { } }");
