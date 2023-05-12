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

function main() {
    const v2 = [1337,1337];
    const v3 = [1337,v2,v2,0];
    Object.__proto__ = v3;
    for (let v10 = 0; v10 < 1000; v10++) {
        function v11(v12,v13) {
            var ____repro____;
            const v15 = v10 + 127;
            const v16 = String();
            const v17 = String.fromCharCode(v10,v10,v15);
            const v19 = v3.shift();
            function v23() {
                let v28 = arguments;
            }
            const v29 = Object();
            const v30 = v23({},129);
            const v31 = [-903931.176976766,v17,,,-903931.176976766];
            const v32 = v31.join("");

            try {
                const v34 = Function(v32);
                const v35 = v34();
                for (let v39 = 0; v39 < 127; v39++) {
                    const v41 = isFinite();
                    let v42 = isFinite;
                    function v43(v44,v45,v46) {
                    }
                    const v47 = v41[4];
                    const v48 = v47[64];
                    const v49 = v35();
                    const v50 = v43();
                    const v51 = v34();
                }
            } catch(v52) {
            }

        }
        const v53 = v11();
    }
}
noDFG(main);
noFTL(main);
main();
