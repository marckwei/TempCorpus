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

description('This test exercises the source URL and line number that is embedded in JavaScript exceptions, which is displayed in places like the JavaScript console.');

function exceptionInFunction()
{
    throw new Error();
}

var e = undefined;

try {
    // Raises an exception that gets picked up by KJS_CHECKEXCEPTION
    document.documentElement.innerHTML(foo);
} catch (exception) {
    e = exception;
}
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '12');

e = undefined;
try {
    // Raises an exception that gets picked up by KJS_CHECKEXCEPTIONVALUE
    document.documentElement.appendChild('').prefix = '';
} catch (exception) {
    e = exception;
}
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '22');

e = undefined;
try {
    // Raises an exception that gets picked up by KJS_CHECKEXCEPTIONREFERENCE
    document.documentElement.appendChild('').innerHTML = '';
} catch (exception) {
    e = exception;
}
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '32');

e = undefined;
try {
    // Raises an exception that gets picked up by KJS_CHECKEXCEPTIONLIST
    document.getElementById(1());
} catch (exception) {
    e = exception;
}
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '42');

e = undefined;
// Raises an exception inside a function to check that its line number
// isn't overwritten in the assignment node.
try {
    var a = exceptionInFunction();
} catch (exception) {
    e = exception;
}
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '5');

realEval = eval;
delete eval;
(function(){
    try {
        eval("");
    } catch(exception) {
        e = exception;
    }
})();
eval = realEval;
shouldBe("typeof e.sourceURL", '"string"');
shouldBe("e.line", '64');

var firstPropIsGetter = {
    get getter() { throw new Error() }
};
var secondPropIsGetter = {
    prop: 1,
    get getter() { throw new Error() }
};
var firstPropIsSetter = {
    set setter(a) { throw new Error() }
};
var secondPropIsSetter = {
    prop: 1,
    set setter(a) { throw new Error() }
};

try {
    firstPropIsGetter.getter;
} catch(ex) {
    e = ex;
    shouldBe("e.line", "74");
}

try {
    secondPropIsGetter.getter;
} catch(ex) {
    e = ex;
    shouldBe("e.line", "78");
}

try {
    firstPropIsSetter.setter = '';
} catch(ex) {
    e = ex;
    shouldBe("e.line", "81");
}

try {
    secondPropIsSetter.setter = '';
} catch(ex) {
    e = ex;
    shouldBe("e.line", "85");
}
