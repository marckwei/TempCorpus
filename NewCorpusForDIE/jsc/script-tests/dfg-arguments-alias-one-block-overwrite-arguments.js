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
"Tests that if you alias the arguments in a very small function, arguments simplification still works even if you overwrite the arguments register."
);

function foo() {
    var args = arguments;
    arguments = [1, 2, 3];
    return args[0] + arguments[1] + args[2];
}

noInline(foo);

while (!dfgCompiled({f:foo})) {
    var a = i;
    var b = i + 1;
    var c = i + 3;
    foo(a, b, c);
}

var result = "";
for (var i = 0; i < 300; ++i) {
    var a;
    if (i < 200)
        a = i;
    else
        a = "hello";
    var b = i + 1;
    var c = i + 3;
    result += foo(a, b, c);
}
shouldBe("result", "\"579111315171921232527293133353739414345474951535557596163656769717375777981838587899193959799101103105107109111113115117119121123125127129131133135137139141143145147149151153155157159161163165167169171173175177179181183185187189191193195197199201203205207209211213215217219221223225227229231233235237239241243245247249251253255257259261263265267269271273275277279281283285287289291293295297299301303305307309311313315317319321323325327329331333335337339341343345347349351353355357359361363365367369371373375377379381383385387389391393395397399401403hello2203hello2204hello2205hello2206hello2207hello2208hello2209hello2210hello2211hello2212hello2213hello2214hello2215hello2216hello2217hello2218hello2219hello2220hello2221hello2222hello2223hello2224hello2225hello2226hello2227hello2228hello2229hello2230hello2231hello2232hello2233hello2234hello2235hello2236hello2237hello2238hello2239hello2240hello2241hello2242hello2243hello2244hello2245hello2246hello2247hello2248hello2249hello2250hello2251hello2252hello2253hello2254hello2255hello2256hello2257hello2258hello2259hello2260hello2261hello2262hello2263hello2264hello2265hello2266hello2267hello2268hello2269hello2270hello2271hello2272hello2273hello2274hello2275hello2276hello2277hello2278hello2279hello2280hello2281hello2282hello2283hello2284hello2285hello2286hello2287hello2288hello2289hello2290hello2291hello2292hello2293hello2294hello2295hello2296hello2297hello2298hello2299hello2300hello2301hello2302\"");
