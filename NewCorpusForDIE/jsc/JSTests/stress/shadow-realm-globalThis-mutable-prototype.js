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

//@ requireOptions("--useShadowRealm=1")

let sr = new ShadowRealm;

let install = sr.evaluate(`
(function(name, fn) {
  globalThis[name] = fn;
})
`);

let log = function(...args) {
  let string = args.join(" ");
  print(string);
  return string;
};
install("log", log);

// Test that the GlobalObject prototype is not immutable, 
let MAX_ITER = 10000;
sr.evaluate(`
  var i = 1;
  function test() {
    globalThis.__proto__ = { x: i++ };
  }
  for (let i = 0; i < ${MAX_ITER}; ++i) {
    try {
      test();
      if (globalThis.x !== i + 1)
        throw new Error(\`Prototype not written successfully (Expected globalThis.x === \${i + 1}, but found \${globalThis.x})\`);
    } catch (e) {
      log(\`\${e}\`);
      throw e;
    }
  }
`);

if (sr.evaluate(`globalThis.x`) !== MAX_ITER)
  throw new Error("Prototype invalid in separate eval");

