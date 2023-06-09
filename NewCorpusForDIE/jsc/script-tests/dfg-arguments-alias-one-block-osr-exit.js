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
"Tests that if you alias the arguments in a very small function, arguments simplification still works even if you OSR exit."
);

function foo() {
    var args = arguments;
    return args[0] + args[1] + args[2];
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

shouldBe("result", "\"47101316192225283134374043464952555861646770737679828588919497100103106109112115118121124127130133136139142145148151154157160163166169172175178181184187190193196199202205208211214217220223226229232235238241244247250253256259262265268271274277280283286289292295298301304307310313316319322325328331334337340343346349352355358361364367370373376379382385388391394397400403406409412415418421424427430433436439442445448451454457460463466469472475478481484487490493496499502505508511514517520523526529532535538541544547550553556559562565568571574577580583586589592595598601hello201203hello202204hello203205hello204206hello205207hello206208hello207209hello208210hello209211hello210212hello211213hello212214hello213215hello214216hello215217hello216218hello217219hello218220hello219221hello220222hello221223hello222224hello223225hello224226hello225227hello226228hello227229hello228230hello229231hello230232hello231233hello232234hello233235hello234236hello235237hello236238hello237239hello238240hello239241hello240242hello241243hello242244hello243245hello244246hello245247hello246248hello247249hello248250hello249251hello250252hello251253hello252254hello253255hello254256hello255257hello256258hello257259hello258260hello259261hello260262hello261263hello262264hello263265hello264266hello265267hello266268hello267269hello268270hello269271hello270272hello271273hello272274hello273275hello274276hello275277hello276278hello277279hello278280hello279281hello280282hello281283hello282284hello283285hello284286hello285287hello286288hello287289hello288290hello289291hello290292hello291293hello292294hello293295hello294296hello295297hello296298hello297299hello298300hello299301hello300302\"");
