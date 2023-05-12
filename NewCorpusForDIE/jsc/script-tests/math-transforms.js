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

"This test checks for potential edge case bugs with certain math transforms involving multiplication by 1 and unary plus."

);

var values = {
    someInt: 42,
    someFloat: 42.42,
    one: 1,
    minusOne: -1,
    zero: 0,
    minusZero: -0,
    infinity: Infinity,
    minusInfinity: -Infinity,
    notANumber: NaN,
    nonNumberString: "x",
    someFloatString: "42.42"
};

var numberForString = {
    nonNumberString: "notANumber",
    someFloatString: "someFloat"
};

for (var name in values) {
    var numForStr = numberForString[name] ? numberForString[name] : name;

    shouldBe("values." + name + " * 1", "+values." + name);
    shouldBe("values." + name + " * 1", stringify(values[numForStr]));

    shouldBe("1 * values." + name, "+values." + name);
    shouldBe("1 * values." + name, stringify(values[numForStr]));
}

for (var name1 in values) {
    var numForStr1 = numberForString[name1] ? numberForString[name1] : name1;
    for (var name2 in values) {
        var numForStr2 = numberForString[name2] ? numberForString[name2] : name2;

        shouldBe("+values." + name1 + " * values." + name2, "values." + name1 + " * values." + name2);
        shouldBe("+values." + name1 + " * values." + name2, stringify(values[name1] * values[name2]));
        shouldBe("values." + name1 + " * +values." + name2, "values." + name1 + " * values." + name2);
        shouldBe("values." + name1 + " * +values." + name2, stringify(values[name1] * values[name2]));
        shouldBe("+values." + name1 + " * +values." + name2, "values." + name1 + " * values." + name2);
        shouldBe("+values." + name1 + " * +values." + name2, stringify(values[name1] * values[name2]));

        shouldBe("+values." + name1 + " / values." + name2, "values." + name1 + " / values." + name2);
        shouldBe("+values." + name1 + " / values." + name2, stringify(values[name1] / values[name2]));
        shouldBe("values." + name1 + " / +values." + name2, "values." + name1 + " / values." + name2);
        shouldBe("values." + name1 + " / +values." + name2, stringify(values[name1] / values[name2]));
        shouldBe("+values." + name1 + " / +values." + name2, "values." + name1 + " / values." + name2);
        shouldBe("+values." + name1 + " / +values." + name2, stringify(values[name1] / values[name2]));

        shouldBe("+values." + name1 + " - values." + name2, "values." + name1 + " - values." + name2);
        shouldBe("+values." + name1 + " - values." + name2, stringify(values[name1] - values[name2]));
        shouldBe("values." + name1 + " - +values." + name2, "values." + name1 + " - values." + name2);
        shouldBe("values." + name1 + " - +values." + name2, stringify(values[name1] - values[name2]));
        shouldBe("+values." + name1 + " - +values." + name2, "values." + name1 + " - values." + name2);
        shouldBe("+values." + name1 + " - +values." + name2, stringify(values[name1] - values[name2]));
    }
}
