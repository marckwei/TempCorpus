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
"Tests loop codegen when the condition is a logical node."
);

function while_or_eq()
{
    var a = 0;
    while (a == 0 || a == 0)
        return true;
    return false;
}

shouldBeTrue("while_or_eq()");

function while_or_neq()
{
    var a = 0;
    while (a != 1 || a != 1)
        return true;
    return false;
}

shouldBeTrue("while_or_neq()");

function while_or_less()
{
    var a = 0;
    while (a < 1 || a < 1)
        return true;
    return false;
}

shouldBeTrue("while_or_less()");

function while_or_lesseq()
{
    var a = 0;
    while (a <= 1 || a <= 1)
        return true;
    return false;
}

shouldBeTrue("while_or_lesseq()");

function while_and_eq()
{
    var a = 0;
    while (a == 0 && a == 0)
        return true;
    return false;
}

shouldBeTrue("while_and_eq()");

function while_and_neq()
{
    var a = 0;
    while (a != 1 && a != 1)
        return true;
    return false;
}

shouldBeTrue("while_and_neq()");

function while_and_less()
{
    var a = 0;
    while (a < 1 && a < 1)
        return true;
    return false;
}

shouldBeTrue("while_and_less()");

function while_and_lesseq()
{
    var a = 0;
    while (a <= 1 && a <= 1)
        return true;
    return false;
}

shouldBeTrue("while_and_lesseq()");

function for_or_eq()
{
    for (var a = 0; a == 0 || a == 0; )
        return true;
    return false;
}

shouldBeTrue("for_or_eq()");

function for_or_neq()
{
    for (var a = 0; a != 1 || a != 1; )
        return true;
    return false;
}

shouldBeTrue("for_or_neq()");

function for_or_less()
{
    for (var a = 0; a < 1 || a < 1; )
        return true;
    return false;
}

shouldBeTrue("for_or_less()");

function for_or_lesseq()
{
    for (var a = 0; a <= 1 || a <= 1; )
        return true;
    return false;
}

shouldBeTrue("for_or_lesseq()");

function for_and_eq()
{
    for (var a = 0; a == 0 && a == 0; )
        return true;
    return false;
}

shouldBeTrue("for_and_eq()");

function for_and_neq()
{
    for (var a = 0; a != 1 && a != 1; )
        return true;
    return false;
}

shouldBeTrue("for_and_neq()");

function for_and_less()
{
    for (var a = 0; a < 1 && a < 1; )
        return true;
    return false;
}

shouldBeTrue("for_and_less()");

function for_and_lesseq()
{
    for (var a = 0; a <= 1 && a <= 1; )
        return true;
    return false;
}

shouldBeTrue("for_and_lesseq()");

function dowhile_or_eq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a == 0 || a == 0)
    return false;
}

shouldBeTrue("dowhile_or_eq()");

function dowhile_or_neq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a != 1 || a != 1)
    return false;
}

shouldBeTrue("dowhile_or_neq()");

function dowhile_or_less()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a < 1 || a < 1)
    return false;
}

shouldBeTrue("dowhile_or_less()");

function dowhile_or_lesseq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a <= 1 || a <= 1)
    return false;
}

shouldBeTrue("dowhile_or_lesseq()");

function dowhile_and_eq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a == 0 && a == 0)
    return false;
}

shouldBeTrue("dowhile_and_eq()");

function dowhile_and_neq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a != 1 && a != 1)
    return false;
}

shouldBeTrue("dowhile_and_neq()");

function dowhile_and_less()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a < 1 && a < 1)
    return false;
}

shouldBeTrue("dowhile_and_less()");

function dowhile_and_lesseq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (a <= 1 && a <= 1)
    return false;
}

shouldBeTrue("dowhile_and_lesseq()");

function while_not_or_eq()
{
    var a = 0;
    while (!(a == 0 || a == 0))
        return true;
    return false;
}

shouldBeFalse("while_not_or_eq()");

function while_not_or_neq()
{
    var a = 0;
    while (!(a != 1 || a != 1))
        return true;
    return false;
}

shouldBeFalse("while_not_or_neq()");

function while_not_or_less()
{
    var a = 0;
    while (!(a < 1 || a < 1))
        return true;
    return false;
}

shouldBeFalse("while_not_or_less()");

function while_not_or_lesseq()
{
    var a = 0;
    while (!(a <= 1 || a <= 1))
        return true;
    return false;
}

shouldBeFalse("while_not_or_lesseq()");

function while_not_and_eq()
{
    var a = 0;
    while (!(a == 0 && a == 0))
        return true;
    return false;
}

shouldBeFalse("while_not_and_eq()");

function while_not_and_neq()
{
    var a = 0;
    while (!(a != 1 && a != 1))
        return true;
    return false;
}

shouldBeFalse("while_not_and_neq()");

function while_not_and_less()
{
    var a = 0;
    while (!(a < 1 && a < 1))
        return true;
    return false;
}

shouldBeFalse("while_not_and_less()");

function while_not_and_lesseq()
{
    var a = 0;
    while (!(a <= 1 && a <= 1))
        return true;
    return false;
}

shouldBeFalse("while_not_and_lesseq()");

function for_not_or_eq()
{
    for (var a = 0; !(a == 0 || a == 0); )
        return true;
    return false;
}

shouldBeFalse("for_not_or_eq()");

function for_not_or_neq()
{
    for (var a = 0; !(a != 1 || a != 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_or_neq()");

function for_not_or_less()
{
    for (var a = 0; !(a < 1 || a < 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_or_less()");

function for_not_or_lesseq()
{
    for (var a = 0; !(a <= 1 || a <= 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_or_lesseq()");

function for_not_and_eq()
{
    for (var a = 0; !(a == 0 && a == 0); )
        return true;
    return false;
}

shouldBeFalse("for_not_and_eq()");

function for_not_and_neq()
{
    for (var a = 0; !(a != 1 && a != 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_and_neq()");

function for_not_and_less()
{
    for (var a = 0; !(a < 1 && a < 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_and_less()");

function for_not_and_lesseq()
{
    for (var a = 0; !(a <= 1 && a <= 1); )
        return true;
    return false;
}

shouldBeFalse("for_not_and_lesseq()");

function dowhile_not_or_eq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a == 0 || a == 0))
    return false;
}

shouldBeFalse("dowhile_not_or_eq()");

function dowhile_not_or_neq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a != 1 || a != 1))
    return false;
}

shouldBeFalse("dowhile_not_or_neq()");

function dowhile_not_or_less()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a < 1 || a < 1))
    return false;
}

shouldBeFalse("dowhile_not_or_less()");

function dowhile_not_or_lesseq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a <= 1 || a <= 1))
    return false;
}

shouldBeFalse("dowhile_not_or_lesseq()");

function dowhile_not_and_eq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a == 0 && a == 0))
    return false;
}

shouldBeFalse("dowhile_not_and_eq()");

function dowhile_not_and_neq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a != 1 && a != 1))
    return false;
}

shouldBeFalse("dowhile_not_and_neq()");

function dowhile_not_and_less()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a < 1 && a < 1))
    return false;
}

shouldBeFalse("dowhile_not_and_less()");

function dowhile_not_and_lesseq()
{
    var a = 0;
    var i = 0;
    do {
        if (i > 0)
            return true;
        i++;
    } while (!(a <= 1 && a <= 1))
    return false;
}

shouldBeFalse("dowhile_not_and_lesseq()");

function float_while_or_eq()
{
    var a = 0.1;
    while (a == 0.1 || a == 0.1)
        return true;
    return false;
}

shouldBeTrue("float_while_or_eq()");

function float_while_or_neq()
{
    var a = 0.1;
    while (a != 1.1 || a != 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_or_neq()");

function float_while_or_less()
{
    var a = 0.1;
    while (a < 1.1 || a < 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_or_less()");

function float_while_or_lesseq()
{
    var a = 0.1;
    while (a <= 1.1 || a <= 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_or_lesseq()");

function float_while_and_eq()
{
    var a = 0.1;
    while (a == 0.1 && a == 0.1)
        return true;
    return false;
}

shouldBeTrue("float_while_and_eq()");

function float_while_and_neq()
{
    var a = 0.1;
    while (a != 1.1 && a != 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_and_neq()");

function float_while_and_less()
{
    var a = 0.1;
    while (a < 1.1 && a < 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_and_less()");

function float_while_and_lesseq()
{
    var a = 0.1;
    while (a <= 1.1 && a <= 1.1)
        return true;
    return false;
}

shouldBeTrue("float_while_and_lesseq()");

function float_for_or_eq()
{
    for (var a = 0.1; a == 0.1 || a == 0.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_or_eq()");

function float_for_or_neq()
{
    for (var a = 0.1; a != 1.1 || a != 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_or_neq()");

function float_for_or_less()
{
    for (var a = 0.1; a < 1.1 || a < 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_or_less()");

function float_for_or_lesseq()
{
    for (var a = 0.1; a <= 1.1 || a <= 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_or_lesseq()");

function float_for_and_eq()
{
    for (var a = 0.1; a == 0.1 && a == 0.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_and_eq()");

function float_for_and_neq()
{
    for (var a = 0.1; a != 1.1 && a != 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_and_neq()");

function float_for_and_less()
{
    for (var a = 0.1; a < 1.1 && a < 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_and_less()");

function float_for_and_lesseq()
{
    for (var a = 0.1; a <= 1.1 && a <= 1.1; )
        return true;
    return false;
}

shouldBeTrue("float_for_and_lesseq()");

function float_dowhile_or_eq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a == 0.1 || a == 0.1)
    return false;
}

shouldBeTrue("float_dowhile_or_eq()");

function float_dowhile_or_neq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a != 1.1 || a != 1.1)
    return false;
}

shouldBeTrue("float_dowhile_or_neq()");

function float_dowhile_or_less()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a < 1.1 || a < 1.1)
    return false;
}

shouldBeTrue("float_dowhile_or_less()");

function float_dowhile_or_lesseq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a <= 1.1 || a <= 1.1)
    return false;
}

shouldBeTrue("float_dowhile_or_lesseq()");

function float_dowhile_and_eq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a == 0.1 && a == 0.1)
    return false;
}

shouldBeTrue("float_dowhile_and_eq()");

function float_dowhile_and_neq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a != 1.1 && a != 1.1)
    return false;
}

shouldBeTrue("float_dowhile_and_neq()");

function float_dowhile_and_less()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a < 1.1 && a < 1.1)
    return false;
}

shouldBeTrue("float_dowhile_and_less()");

function float_dowhile_and_lesseq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (a <= 1.1 && a <= 1.1)
    return false;
}

shouldBeTrue("float_dowhile_and_lesseq()");

function float_while_not_or_eq()
{
    var a = 0.1;
    while (!(a == 0.1 || a == 0.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_or_eq()");

function float_while_not_or_neq()
{
    var a = 0.1;
    while (!(a != 1.1 || a != 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_or_neq()");

function float_while_not_or_less()
{
    var a = 0.1;
    while (!(a < 1.1 || a < 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_or_less()");

function float_while_not_or_lesseq()
{
    var a = 0.1;
    while (!(a <= 1.1 || a <= 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_or_lesseq()");

function float_while_not_and_eq()
{
    var a = 0.1;
    while (!(a == 0.1 && a == 0.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_and_eq()");

function float_while_not_and_neq()
{
    var a = 0.1;
    while (!(a != 1.1 && a != 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_and_neq()");

function float_while_not_and_less()
{
    var a = 0.1;
    while (!(a < 1.1 && a < 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_and_less()");

function float_while_not_and_lesseq()
{
    var a = 0.1;
    while (!(a <= 1.1 && a <= 1.1))
        return true;
    return false;
}

shouldBeFalse("float_while_not_and_lesseq()");

function float_for_not_or_eq()
{
    for (var a = 0.1; !(a == 0.1 || a == 0.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_or_eq()");

function float_for_not_or_neq()
{
    for (var a = 0.1; !(a != 1.1 || a != 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_or_neq()");

function float_for_not_or_less()
{
    for (var a = 0.1; !(a < 1.1 || a < 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_or_less()");

function float_for_not_or_lesseq()
{
    for (var a = 0.1; !(a <= 1.1 || a <= 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_or_lesseq()");

function float_for_not_and_eq()
{
    for (var a = 0.1; !(a == 0.1 && a == 0.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_and_eq()");

function float_for_not_and_neq()
{
    for (var a = 0.1; !(a != 1.1 && a != 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_and_neq()");

function float_for_not_and_less()
{
    for (var a = 0.1; !(a < 1.1 && a < 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_and_less()");

function float_for_not_and_lesseq()
{
    for (var a = 0.1; !(a <= 1.1 && a <= 1.1); )
        return true;
    return false;
}

shouldBeFalse("float_for_not_and_lesseq()");

function float_dowhile_not_or_eq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a == 0.1 || a == 0.1))
    return false;
}

shouldBeFalse("float_dowhile_not_or_eq()");

function float_dowhile_not_or_neq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a != 1.1 || a != 1.1))
    return false;
}

shouldBeFalse("float_dowhile_not_or_neq()");

function float_dowhile_not_or_less()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a < 1.1 || a < 1.1))
    return false;
}

shouldBeFalse("float_dowhile_not_or_less()");

function float_dowhile_not_or_lesseq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a <= 1.1 || a <= 1.1))
    return false;
}

shouldBeFalse("float_dowhile_not_or_lesseq()");

function float_dowhile_not_and_eq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a == 0.1 && a == 0.1))
    return false;
}

shouldBeFalse("float_dowhile_not_and_eq()");

function float_dowhile_not_and_neq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a != 1.1 && a != 1.1))
    return false;
}

shouldBeFalse("float_dowhile_not_and_neq()");

function float_dowhile_not_and_less()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a < 1.1 && a < 1.1))
    return false;
}

shouldBeFalse("float_dowhile_not_and_less()");

function float_dowhile_not_and_lesseq()
{
    var a = 0.1;
    var i = 0.1;
    do {
        if (i > 0.1)
            return true;
        i++;
    } while (!(a <= 1.1 && a <= 1.1))
    return false;
}
