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

description(
'Test for processing of RegExp dotAll flag'
);

// Check dotAll matching operation
shouldBe('"aaXcc".match(/.X./)[0].length', '3');
shouldBe('"aaXcc".match(/.X./s)[0].length', '3');
shouldBeNull('"aa\\nXcc".match(/.X./)');
shouldBeNull('"aa\\nXcc".match(/.X./m)');
shouldBe('"aa\\nX\\ncc".match(/.X./s)[0]', '"\\nX\\n"');
shouldBe('"aa\\nX\\ncc".match(/.X./ms)[0]', '"\\nX\\n"');
shouldBe('"aa\\nXcc".match(/.*X/)[0]', '"X"');
shouldBe('"aa\\nXcc".match(/.*X/m)[0]', '"X"');
shouldBe('"aa\\nXcc".match(/.*X/s)[0]', '"aa\\nX"');
shouldBe('"aa\\nXcc".match(/.*X/sm)[0]', '"aa\\nX"');
shouldBe('"aaX\\ncc".match(/X.*/)[0]', '"X"');
shouldBe('"aaX\\ncc".match(/X.*/m)[0]', '"X"');
shouldBe('"aaX\\ncc".match(/X.*/s)[0]', '"X\\ncc"');
shouldBe('"aaX\\ncc".match(/X.*/sm)[0]', '"X\\ncc"');
shouldBe('"aa\\nX\\ncc".match(/.*X.*/)[0]', '"X"');
shouldBe('"aa\\nX\\ncc".match(/.*X.*/m)[0]', '"X"');
shouldBe('"aa\\nX\\ncc".match(/.*X.*/s)[0]', '"aa\\nX\\ncc"');
shouldBe('"aa\\nX\\ncc".match(/.*X.*/sm)[0]', '"aa\\nX\\ncc"');
shouldBeNull('"aa\\nXcc".match(/.*^X/)');
shouldBe('"aa\\nXcc".match(/.*^X/m)[0]', '"X"');
shouldBeNull('"aa\\nXcc".match(/.*^X/s)', '"aa\\nX"');
shouldBe('"aa\\nXcc".match(/.*^X/sm)[0]', '"aa\\nX"');
shouldBeNull('"aaX\\ncc".match(/X$.*/)');
shouldBe('"aaX\\ncc".match(/X$.*/m)[0]', '"X"');
shouldBeNull('"aaX\\ncc".match(/X$.*/s)');
shouldBe('"aaX\\ncc".match(/X$.*/sm)[0]', '"X\\ncc"');
shouldBeNull('"aa\\nX\\ncc".match(/.*^X$.*/)');
shouldBe('"aa\\nX\\ncc".match(/.*^X$.*/m)[0]', '"X"');
shouldBeNull('"aa\\nX\\ncc".match(/.*^X$.*/s)');
shouldBe('"aa\\nX\\ncc".match(/.*^X$.*/sm)[0]', '"aa\\nX\\ncc"');
shouldBeNull('"aa\\nXcc".match(/^.*X/)');
shouldBe('"aa\\nXcc".match(/^.*X/m)[0]', '"X"');
shouldBe('"aa\\nXcc".match(/^.*X/s)[0]', '"aa\\nX"');
shouldBe('"aa\\nXcc".match(/^.*X/sm)[0]', '"aa\\nX"');
shouldBeNull('"aaX\\ncc".match(/X.*$/)');
shouldBe('"aaX\\ncc".match(/X.*$/m)[0]', '"X"');
shouldBe('"aaX\\ncc".match(/X.*$/s)[0]', '"X\\ncc"');
shouldBe('"aaX\\ncc".match(/X.*$/sm)[0]', '"X\\ncc"');
shouldBeNull('"aa\\nX\\ncc".match(/^.*X.*$/)');
shouldBe('"aa\\nX\\ncc".match(/^.*X.*$/m)[0]', '"X"');
shouldBe('"aa\\nX\\ncc".match(/^.*X.*$/s)[0]', '"aa\\nX\\ncc"');
shouldBe('"aa\\nX\\ncc".match(/^.*X.*$/sm)[0]', '"aa\\nX\\ncc"');
shouldBeNull('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/)');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/m)[0]', '"X"');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/s)[0]', '"a\\na\\nX\\nc\\nc\\n"');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/sm)[0]', '"a\\na\\nX\\nc\\nc\\n"');
shouldBeNull('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/)');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/m)[0]', '"X"');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/s)[0]', '"a\\na\\nX\\nc\\nc\\n"');
shouldBe('"a\\na\\nX\\nc\\nc\\n".match(/^.*X.*$/sm)[0]', '"a\\na\\nX\\nc\\nc\\n"');
shouldBe('"\\n\\n\\nX".match(/.{1}X/sm)[0]', '"\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,2}X/sm)[0]', '"\\n\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,3}X/sm)[0]', '"\\n\\n\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,4}X/sm)[0]', '"\\n\\n\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,2}?X/sm)[0]', '"\\n\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,3}?X/sm)[0]', '"\\n\\n\\nX"');
shouldBe('"\\n\\n\\nX".match(/.{1,4}?X/sm)[0]', '"\\n\\n\\nX"');
shouldBe('"X\\n\\n\\nY".match(/X.{1}/sm)[0]', '"X\\n"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,2}/sm)[0]', '"X\\n\\n"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,3}/sm)[0]', '"X\\n\\n\\n"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,4}/sm)[0]', '"X\\n\\n\\nY"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,2}?/sm)[0]', '"X\\n"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,3}?/sm)[0]', '"X\\n"');
shouldBe('"X\\n\\n\\nY".match(/X.{1,4}?/sm)[0]', '"X\\n"');
shouldBe('"The\\nquick\\nbrown\\nfox\\njumped.".match(/.*brown.*/)[0]', '"brown"');
shouldBe('"The\\nquick\\nbrown\\nfox\\njumped.".match(/.*brown.*/s)[0]', '"The\\nquick\\nbrown\\nfox\\njumped."');
shouldBeNull('"The\\nquick\\nbrown\\nfox\\njumped.".match(/The.quick.brown.fox.jumped./)');
shouldBe('"The\\nquick\\nbrown\\nfox\\njumped.".match(/The.quick.brown.fox.jumped./s)[0]', '"The\\nquick\\nbrown\\nfox\\njumped."');

// Check that the dotAll flag getter works as expected
shouldBeFalse('/a/.dotAll');
shouldBeTrue('/a/s.dotAll');
