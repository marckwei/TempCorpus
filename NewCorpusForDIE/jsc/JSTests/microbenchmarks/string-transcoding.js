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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
function decodeUTF8(array) {
    var string = "";
    for (var i = 0; i < array.length; ++i)
        string += String.fromCharCode(array[i]);
    return decodeURIComponent(escape(string));
}

function encodeUTF8(string) {
    string = unescape(encodeURIComponent(string));

    var array = new Uint8Array(string.length);
    for (var i = 0; i < array.length; ++i)
        array[i] = string.charCodeAt(i);
    return array;
}

function arraysEqual(a, b) {
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i])
            return false;
    }
    return true;
}

function arrayToString(array) {
    return "[" + Array.prototype.join.call(array, ", ") + "]";
}

function setHeader(s) {
}

function print(s) {
    document.getElementById("console").innerHTML += "<br/>" + s;
}

function tryArray(array) {
    try {
        var string = decodeUTF8(array);
        try {
            var array2 = encodeUTF8(string);
            if (!arraysEqual(array, array2)) {
                print("Round trip failed: " + arrayToString(array) + " turned into " + arrayToString(array2));
                return;
            }
        } catch (e) {
            print("Threw exception in encode for: " + arrayToString(array));
            return;
        }
    } catch (e) {
        return;
    }
}

var array = new Uint8Array(5);

function doSteps(numSteps) {
    while (numSteps--) {
        tryArray(array);

        var done = false;
        array[0]++;
        for (var i = 0; i < array.length; ++i) {
            if (array[i])
                break;
            if (i + 1 == array.length) {
                done = true;
                break;
            }
            array[i + 1]++;
        }

        if (done)
            return false;
    }

    return true;
}

doSteps(5000);
