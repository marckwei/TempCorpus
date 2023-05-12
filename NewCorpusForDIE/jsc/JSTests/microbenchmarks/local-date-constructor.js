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

function test() {
    a = {
        2016: {
            begin: new Date("2016-03-13T00:00:00").getTime(),
            end: new Date("2016-11-06T00:00:00").getTime()
        },
        2017: {
            begin: new Date("2017-03-12T00:00:00").getTime(),
            end: new Date("2017-11-05T00:00:00").getTime()
        },
        2018: {
            begin: new Date("2018-03-11T00:00:00").getTime(),
            end: new Date("2018-11-04T00:00:00").getTime()
        },
        2019: {
            begin: new Date("2019-03-10T00:00:00").getTime(),
            end: new Date("2019-11-03T00:00:00").getTime()
        },
        2020: {
            begin: new Date("2020-03-08T00:00:00").getTime(),
            end: new Date("2020-11-01T00:00:00").getTime()
        },
        2021: {
            begin: new Date("2021-03-14T00:00:00").getTime(),
            end: new Date("2021-11-07T00:00:00").getTime()
        },
        2022: {
            begin: new Date("2022-03-13T00:00:00").getTime(),
            end: new Date("2022-11-06T00:00:00").getTime()
        },
        2023: {
            begin: new Date("2023-03-12T00:00:00").getTime(),
            end: new Date("2023-11-05T00:00:00").getTime()
        },
        2024: {
            begin: new Date("2024-03-10T00:00:00").getTime(),
            end: new Date("2024-11-03T00:00:00").getTime()
        },
        2025: {
            begin: new Date("2025-03-09T00:00:00").getTime(),
            end: new Date("2025-11-02T00:00:00").getTime()
        }
    }
    return a;
}
noInline(test);

let count = 10000;
for (var i = 0; i < count; i++)
    test();
