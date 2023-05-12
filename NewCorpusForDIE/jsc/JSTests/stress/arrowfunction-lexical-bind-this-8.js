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

var testCase = function (actual, expected, message) {
    if (actual !== expected) {
        throw message + ". Expected '" + expected + "', but was '" + actual + "'";
    }
};

let testValue = 'test-value';

var f_this = function () {
    let value = 'value';
    if (true) {
        let someValue = 'someValue';
        if (true) {
            let = anotherValue = 'value';
            return () => () => () => this.value;
        }
    }

    return () => value;
}

for (let i = 0; i < 10000; i++) {
    testCase(f_this.call({value : testValue})()()(), testValue);
}

var f_this_eval = function () {
    if (true) {
        let someValue = '';
        if (true) {
            let = anotherValue = 'value';
            return () => () => () => eval('this.value');
        }
    }

    return () => 'no-value';
}

for (let i = 0; i < 10000; i++) {
    testCase(f_this_eval.call({value : testValue}, false)()()(), testValue);
}


function f_this_branches (branch, returnThis) {
    let value = 'value';
    if (branch === 'A') {
        let someValue = 'someValue';
        if (true) {
            let = anotherValue = 'value';
            return () => () => () => {
                if (returnThis)
                    return this.value;
                  else
                    return anotherValue;
            }
        }
    }

    return () => value;
}

for (let i = 0; i < 10000; i++) {
    testCase(f_this_branches.call({value : testValue}, 'B')() == testValue, false);
    testCase(f_this_branches.call({value : testValue}, 'A', false)()()() == testValue, false);
    testCase(f_this_branches.call({value : testValue}, 'A', true)()()(), testValue);
}

function f_this_eval_branches (branch, returnThis) {
    let value = 'value';
    if (branch === 'A') {
        let someValue = 'someValue';
        if (true) {
            let = anotherValue = 'value';
            return () => () => () => {
                if (returnThis)
                    return eval('this.value');
                  else
                    return anotherValue;
            }
        }
    }

    return () => value;
}

for (let i = 0; i < 10000; i++) {
    testCase(f_this_eval_branches.call({value : testValue}, 'B')() == testValue, false);
    testCase(f_this_eval_branches.call({value : testValue}, 'A', false)()()() == testValue, false);
    testCase(f_this_eval_branches.call({value : testValue}, 'A', true)()()(), testValue);
}

let self = this;

let arrow = () => {
    testCase(self, this, "Error: Wrong lexical bind of this");
};

for (let i = 0; i < 10000; i++) {
    arrow();
}


for (let i = 0; i < 10000; i++) {
    eval("let _self=this;(()=>testCase(self, this, 'Error: Wrong lexical bind of this in eval'))();");
}
