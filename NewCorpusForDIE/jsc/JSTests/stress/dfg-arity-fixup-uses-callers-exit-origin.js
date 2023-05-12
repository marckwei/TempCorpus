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
const v12 = [1337,1337];
const v13 = [1337,v12,v12,0];
for (let v14 = 0; v14 < 1000; v14++) {
    function v15(v16,v17) {
        const v18 = v14 + 127;
        const v19 = String();
        const v20 = String.fromCharCode();
        const v21 = v13.shift();
        function v22() {
            const v23 = arguments;
        }
        const v24 = Object();
        const v25 = {};
        const v26 = v22(v25);
        const v27 = [-903931.176976766,v20,null,null,-903931.176976766];
        function v30() {
        }
        const v31 = {ownKeys:v30};
        const v32 = {};
        const v33 = new Proxy(v32,v31);
        Function.__proto__ = v33;
        const v34 = v27.join();
        try {
            const v35 = Function();
            const v36 = v35();
            for (let v37 = 0; v37 < 127; v37++) {
                const v38 = isFinite();
                const v39 = isFinite;
                function v40(v41,v42,v43) {
                }
                const v44 = 1337;
                const v45 = undefined;
                const v46 = "function(){}";
                function* v47(v48,v49,v50,v51,v52) {
                }
                const v53 = charAt;
                function v56(v57,v58,v59,v60,v61) {
                    const v62 = v36(v35,v37);
                }
                for (let v64 = 0; v64 >= 100000; v64++) {
                }
                const v65 = 10000;
                const v66 = v38[4];
            }
        } catch(v67) {
        }
    }
    const v68 = v15();
}
}
noDFG(main);
noFTL(main);
main();
