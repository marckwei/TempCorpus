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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function allAreTrue(list)
{
    for (let item of list)
        shouldBe(item, true);
}

function allAreFalse(list)
{
    for (let item of list)
        shouldBe(item, false);
}

function lessThan()
{
    return [0n < 2n, -10n < 20n, -10n < -2n, -100000000000000n < 0n, -100000000000000n < 10000n, -100000000000000n < -10000n, -1000000000000000000000n < -100000000000n, 1000000000000000000000n < 1000000000000000000000000n];
}
noInline(lessThan);

function lessThanFalse()
{
    return [100000000000000000000n < 100000000000000000000n, 0n < 0n, 2n < 0n, 2n < 2n, -10n < -10n, 20n < -20n, -2n < -10n, 0n < -100000000000000n, -10000n < -100000000000000n, -100000000000n < -1000000000000000000000n, 1000000000000000000000000n < 1000000000000000000000n ];
}
noInline(lessThanFalse);

function lessThanEqual()
{
    return [100000000000000000000n <= 100000000000000000000n, 0n <= 0n, 0n <= 2n, 2n <= 2n, -10n <= -10n, -20n <= 20n, -10n <= -2n, -100000000000000n <= 0n, -100000000000000n <= -10000n, -1000000000000000000000n <= -100000000000n, 1000000000000000000000n <= 1000000000000000000000000n ];
}
noInline(lessThanEqual);

function lessThanEqualFalse()
{
    return [100000000000000000001n <= 100000000000000000000n, 1n <= 0n, 2n <= 0n, 3n <= 2n, -10n <= -11n, 20n <= -20n, -2n <= -10n, 0n <= -100000000000000n, -10000n <= -100000000000000n, -100000000000n <= -1000000000000000000000n, 1000000000000000000000000n <= 1000000000000000000000n ];
}
noInline(lessThanEqualFalse);

function greaterThan()
{
    return [2n > 0n, 20n > -10n, -2n > -10n, 0n > -100000000000000n, 10000n > -100000000000000n, -10000n > -100000000000000n, -100000000000n > -1000000000000000000000n, 1000000000000000000000000n > 1000000000000000000000n ];
}
noInline(greaterThan);

function greaterThanFalse()
{
    return [100000000000000000000n > 100000000000000000000n, 0n > 0n, 0n > 2n, 2n > 2n, -10n > -10n, -20n > 20n, -10n > -2n, -100000000000000n > 0n, -100000000000000n > -10000n, -1000000000000000000000n > -100000000000n, 1000000000000000000000n > 1000000000000000000000000n ];
}
noInline(greaterThanFalse);

function greaterThanEqual()
{
    return [100000000000000000000n >= 100000000000000000000n, 0n >= 0n, 2n >= 0n, 2n >= 2n, -10n >= -10n, 20n >= -20n, -2n >= -10n, 0n >= -100000000000000n, -10000n >= -100000000000000n, -100000000000n >= -1000000000000000000000n, 1000000000000000000000000n >= 1000000000000000000000n ];
}
noInline(greaterThanEqual);

function greaterThanEqualFalse()
{
    return [100000000000000000000n >= 100000000000000000001n, 0n >= 1n, 0n >= 2n, 2n >= 3n, -11n >= -10n, -20n >= 20n, -10n >= -2n, -100000000000000n >= 0n, -100000000000000n >= -10000n, -1000000000000000000000n >= -100000000000n, 1000000000000000000000n >= 1000000000000000000000000n ];
}
noInline(greaterThanEqualFalse);

function equal()
{
    return [100000000000000000000n == 100000000000000000000n, 0n == 0n, 2n == 2n, -2n == -2n, -20n == -20n, -100000000000000n == -100000000000000n];
}
noInline(equal);

function equalFalse()
{
    return [100000000000000000001n == 100000000000000000000n, 1n == 0n, -2n == 2n, 2n == -2n, -20n == 20n, -100000000000000n == 100000000000000n, 100000000000000n == -100000000000000n, -100000000000001n == -100000000000000n, 100000000000001n == 100000000000000n, -100000000000000n == 1n, 100000000000000n == 1n, -1n == 100000000000000n, 1n == -100000000000000n, -1n == -100000000000000n];
}
noInline(equalFalse);

for (var i = 0; i < 1e4; ++i) {
    allAreTrue(lessThan());
    allAreTrue(lessThanEqual());
    allAreTrue(greaterThan());
    allAreTrue(greaterThanEqual());
    allAreTrue(equal());

    allAreFalse(lessThanFalse());
    allAreFalse(lessThanEqualFalse());
    allAreFalse(greaterThanFalse());
    allAreFalse(greaterThanEqualFalse());
    allAreFalse(equalFalse());
}
