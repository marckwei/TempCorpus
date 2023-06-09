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
"This tests that the static analysis we use to infer if a variable should be a double doesn't crash."
);

var grandResult = 0;

for (var i = 0; i < 256; ++i) {
    code  = "function foo(o, a, b) {\n";
    code += "    var x = 0;\n";
    code += "    var c = a + b;\n";
    for (var j = 0; j < 8; ++j)
        code += "    var " + String.fromCharCode("d".charCodeAt(0) + j) + " = " + ((i & (1 << ((j / 2) | 0))) ? "0.5" : "0") + ";\n";
    code += "    for (var __i = 0; __i < 10; ++__i) {\n";
    code += "        if (a + b + 1 > __i) {\n";
    code += "            c = d;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 2 > __i) {\n";
    code += "            c = e;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 3 > __i) {\n";
    code += "            c = f;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 4 > __i) {\n";
    code += "            c = g;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 5 > __i) {\n";
    code += "            c = h;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 6 > __i) {\n";
    code += "            c = i;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 7 > __i) {\n";
    code += "            c = j;\n";
    code += "            x += c;\n";
    code += "        }\n";
    code += "        if (a + b + 8 > __i) {\n";
    code += "            c = k;\n";
    code += "            x += c;\n";
    code += "        }\n";
    for (var j = 0; j < 8; ++j) {
        code += "        if (a + b + " + (9 + j) + " > __i)\n";
        code += "            " + String.fromCharCode("d".charCodeAt(0) + j) + " = __i + " + j + " + " + ((i & (1 << (((j / 2) | 0) + 4))) ? "0.5" : "0") + ";\n";
    }
    code += "    }\n";
    code += "    return x + c;\n";
    code += "}\n";
    code += "\n";
    code += "var result = 0;\n"
    code += "noInline(foo);\n"
    code += "while (!dfgCompiled({f:foo}))\n"
    code += "    foo({}, 25, 35);\n"
    code += "for (var __j = 0; __j < 100; ++__j) {\n";
    code += "    result += foo({}, __j, __j + 1);\n";
    code += "}\n";
    code += "\n";
    code += "result";
    
    var theResult = eval(code);
    debug("Result value is " + theResult);
    grandResult += theResult;
}

shouldBe("grandResult", "14578304");


