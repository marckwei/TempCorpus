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

var niters = 100000;

// proxy -> target -> x
function cacheOnTarget() {
    var target = $vm.createGlobalObject();
    target.x = 42;
    var proxy = $vm.createGlobalProxy(target);

    var getX = function(o) { return o.x; };
    noInline(getX);

    var sum = 0;
    for (var i = 0; i < niters; ++i)
        sum += getX(proxy);

    if (sum != 42 * niters)
        throw new Error("Incorrect result");
};

// proxy -> target -> proto -> x
function cacheOnPrototypeOfTarget() {
    var proto = {x:42};
    var target = $vm.createGlobalObject(proto);
    var proxy = $vm.createGlobalProxy(target);

    var getX = function(o) { return o.x; };
    noInline(getX);

    var sum = 0;
    for (var i = 0; i < niters; ++i)
        sum += getX(proxy);

    if (sum != 42 * niters)
        throw new Error("Incorrect result");
};

// base -> proto (proxy) -> target -> x
function dontCacheOnProxyInPrototypeChain() {
    var target = $vm.createGlobalObject();
    target.x = 42;
    var protoProxy = $vm.createGlobalProxy(target);
    var base = Object.create(protoProxy);

    var getX = function(o) { return o.x; };
    noInline(getX);

    var sum = 0;
    for (var i = 0; i < niters; ++i)
        sum += getX(base);

    if (sum != 42 * niters)
        throw new Error("Incorrect result");
};

// proxy -> target 1 -> proto (proxy) -> target 2 -> x
function dontCacheOnTargetOfProxyInPrototypeChainOfTarget() {
    var target2 = $vm.createGlobalObject();
    target2.x = 42;
    var protoProxy = $vm.createGlobalProxy(target2);
    var target1 = $vm.createGlobalObject(protoProxy);
    var proxy = $vm.createGlobalProxy(target1);

    var getX = function(o) { return o.x; };
    noInline(getX);

    var sum = 0;
    for (var i = 0; i < niters; ++i)
        sum += getX(proxy);

    if (sum != 42 * niters)
        throw new Error("Incorrect result");
};

cacheOnTarget();
cacheOnPrototypeOfTarget();
dontCacheOnProxyInPrototypeChain();
dontCacheOnTargetOfProxyInPrototypeChainOfTarget();
