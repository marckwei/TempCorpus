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
"This test checks for a crash in sort() that was seen on a particular input data set."
);

function natcompare(a, b) {
    if (a == b)
        return 0;
    return (a < b) ? -1 : 1;
}

SubwayData = [
"23rd St-Broadway ", 
"45 Road-Court Sq", 
"LIC-Court Sq", 
"LIC-Court Sq", 
"23rd St-Park Ave S", 
"241st St", 
"242nd St", 
"25th Ave", 
"25th St", 
"28th St-7th Ave", 
"28th St-Broadway", 
"28th St-Park Ave S", 
"2nd Ave-Houston St", 
"30th Ave", 
"33rd St", 
"33rd St-Park Ave", 
"34th St-6th Ave", 
"34th St-7th Ave", 
"34th St-8th Ave", 
"36th Ave", 
"36th St", 
"36th St", 
"39th Ave", 
"3rd Ave-138th St", 
"3rd Ave-149th St", 
"3rd Ave-14th St", 
"40th St", 
"42nd St-5th Ave-6th Ave", 
"42nd St-5th Ave-6th Ave", 
"45th St", 
"46th St", 
"46th St", 
"47-50th Sts-Rockefeller Center", 
"49th St-7th Ave", 
"50th St-New Utrecht Ave", 
"9th Ave", 
"90th St-Elmhurst Ave", 
"96th St", 
"96th St", 
"96th St", 
"9th St-4th Ave", 
"Alabama Ave", 
"Allerton Ave", 
"Aqueduct-North Conduit Ave", 
"Astor Place", 
"Astoria Blvd", 
"Atlantic Ave", 
"Atlantic Ave-Pacific St", 
"Ave H", 
"Ave N", 
"Ave P", 
"Ave U", 
"Ave U", 
"Ave U", 
"Ave X", 
"Bay Pkwy", 
"Bay Pkwy", 
"Bay Pkwy-22nd Ave", 
"Bay Ridge Ave", 
"Baychester Ave", 
"Beach 105th St", 
"Beach 25th St", 
"Beach 36th St", 
"Beach 44th St", 
"Beach 60th St", 
"Beach 67th St", 
"Beach 90th St", 
"Beach 98th St", 
"Bedford Ave", 
"Bedford Park Blvd", 
"Broadway", 
"Broadway", 
"Bronx Park East", 
"Brook Ave", 
"Buhre Ave", 
"Burke Ave", 
"Burnside Ave", 
"Bushwick Ave", 
"Uptown Bleecker St-Lafayette St", 
"Downtown Bleecker St-Lafayette St", 
"Canal Street", 
"Canal Street", 
"Canal Street", 
"Canal-Church Sts"
];

SubwayData.sort(natcompare)
