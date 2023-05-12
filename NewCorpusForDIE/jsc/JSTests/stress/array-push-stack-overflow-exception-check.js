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

//@ runDefault("--validateOptions=true", "--thresholdForJITSoon=10", "--thresholdForJITAfterWarmUp=10", "--thresholdForOptimizeAfterWarmUp=100", "--thresholdForOptimizeAfterLongWarmUp=100", "--thresholdForOptimizeSoon=100")

function main() {
    let v0 = -256;
    do {
        function v2(v3,v4,v5) {
            const v6 = eval;
            const v8 = 16 / v5;
            function v9(v10,v11) {
                try {
                    const v12 = v9();
                } catch(v13) {
                    const v14 = [];
                    const v15 = [];
                    const v16 = v15.__proto__;
                    const v17 = v14.values;
                    const v19 = {"set":v17};
                    const v21 = Object.defineProperty(v16,1,v19);
                    function v22(v23,v24) {
                        const v25 = [];
                        let {"__proto__":v26,"constructor":v27,"length":v28,} = v25;
                        const v29 = v26 || v22;
                        const v30 = v27();
                        const v31 = v30.push(v25);
                        const v32 = v30.push(v29);
                    }
                    const v33 = v22();
                } finally {
                }
            }
            const v34 = v9();
            let v35 = [v8];
            const v36 = --v35;
            const v37 = v0++;
        }
        const v38 = "bigint";
        const v39 = v2();
    } while (v0 !== 8);
    gc();
}
main();
