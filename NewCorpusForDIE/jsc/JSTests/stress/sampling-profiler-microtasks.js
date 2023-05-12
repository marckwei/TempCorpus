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

if (platformSupportsSamplingProfiler()) {
    load("./sampling-profiler/samplingProfiler.js", "caller relative");

    let tree = null;
    function testResults() {
        if (!tree)
            tree = makeTree();
        else
            updateCallingContextTree(tree);

        let result = doesTreeHaveStackTrace(tree, ["jar", "hello", "promiseReactionJob"], false);
        return result;
    }

    let o1 = {};
    let o2 = {};
    function jar(x) {
        for (let i = 0; i < 1000; i++) {
            o1[i] = i;
            o2[i] = i + o1[i];
            i++;
            i--;
        }
        return x;
    }
    noInline(jar)

    let numLoops = 0;
    function loop() {
        let counter = 0;
        const numPromises = 100;
        function jaz() {
            Promise.resolve(42).then(function hello(v1) {
                for (let i = 0; i < 100; i++)
                    jar();
                counter++;
                if (counter >= numPromises) {
                    numLoops++;
                    if (!testResults()) {
                        if (numLoops > 5)
                            abort();
                        else
                            loop();
                    }
                }
            });
        }

        for (let i = 0; i < numPromises; i++)
            jaz();
    }

    loop();
}
