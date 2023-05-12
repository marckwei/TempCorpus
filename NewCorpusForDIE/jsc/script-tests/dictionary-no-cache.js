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

description("Test to ensure that we handle caching of prototype chains containing dictionaries.");

var Test = function(){};

var methodCount = 65;

for (var i = 0; i < methodCount; i++){
    Test.prototype['myMethod' + i] = function(){};
}

var test1 = new Test();

for (var k in test1);

Test.prototype.myAdditionalMethod = function(){};
var test2 = new Test();
var j = k;
var foundNewPrototypeProperty = false;
for (var k in test2){
    if ("myAdditionalMethod" == k) foundNewPrototypeProperty = true;
}
shouldBeTrue('foundNewPrototypeProperty');

var Test = function(){};
for (var i = 0; i < methodCount; i++){
    Test.prototype['myMethod' + i] = function(){};
}
var test1 = new Test();

for (var k in test1);

delete (Test.prototype)[k]
var test2 = new Test();
var j = k;
var foundRemovedPrototypeProperty = false;
for (var k in test2){
    if (j == k) foundRemovedPrototypeProperty = true;
}
shouldBeFalse("foundRemovedPrototypeProperty");

var Test = function(){};
for (var i = 0; i < methodCount; i++){
    Test.prototype['myMethod' + i] = function(){};
}

function update(test) {
    test.newProperty = true;
}
var test1 = new Test();
update(test1);

var test2 = new Test();
update(test2);

var test3 = new Test();
update(test3);
var calledNewPrototypeSetter = false;
Test.prototype.__defineSetter__("newProperty", function(){ calledNewPrototypeSetter = true; });
var test4 = new Test();
update(test4);
shouldBeTrue('calledNewPrototypeSetter');

var test4 = {__proto__:{prop:"on prototype"}};
for (var i = 0; i < 200; i++)
    test4[i]=[i];

var test5 = {__proto__:{__proto__:{prop:"on prototype's prototype"}}};
for (var i = 0; i < 200; i++)
    test5[i]=[i];

getTestProperty = function(o) {
    return o.prop;
}

getTestProperty(test4);
getTestProperty(test4);
shouldBe("getTestProperty(test4)", '"on prototype"');
test4.prop = "on self";
shouldBe("getTestProperty(test4)", '"on self"');

getTestProperty = function(o) {
    return o.prop;
}

getTestProperty(test5);
getTestProperty(test5);
shouldBe("getTestProperty(test5)", '"on prototype\'s prototype"');
test5.prop = "on self";
shouldBe("getTestProperty(test5)", '"on self"');
