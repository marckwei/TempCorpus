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

description("Tests for ES6 arrow function endings");

var afEOL = x=>x+1
result = afEOL(12);

shouldBe('afEOL(12)', '13');

shouldNotThrow('x=>x+1');

var afEOLTxt = 'x=>x+1' + String.fromCharCode(10);
shouldNotThrow(afEOLTxt);

var f = function () {
  var result = 0;
  var afEOF;


  afEOF = x => x*10000 + x*1000 - x*10000 - x*1000 + x



  result = afEOF(12);


  result = result + afEOF(13);


  result = result + afEOF(14);

  return result;
};

shouldBe('f()', '39');

eval('var af = x=>x*2');
debug("eval('var af = x=>x*2')");
shouldBe('af(10)','20');

eval('var af1 = x=>x*3, af2=x=>x*4');
debug("eval('var af1 = x=>x*3, af2=x=>x*4')");
shouldBe('af1(10)','30');
shouldBe('af2(10)','40');

eval('var af3 = x=>x*3;');
debug("eval('var af1 = x=>x*3;')");
shouldBe('af3(10)','30');

eval('var af4 = x=>(x*3)');
debug("eval('var af4 = x=>(x*3)')");
shouldBe('af4(10)','30');

eval('var af5 = x => { return x*3; }');
debug("eval('var af5 = x=> { return x*3; }')");
shouldBe('af5(10)','30');

var successfullyParsed = true;
