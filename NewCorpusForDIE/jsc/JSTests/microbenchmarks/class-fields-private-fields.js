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

class ES2022_Private_Fields {
    verification=1;

    #_00=1; #_01=1; #_02=1; #_03=1; #_04=1; #_05=1; #_06=1; #_07=1; #_08=1; #_09=1;
    #_10=1; #_11=1; #_12=1; #_13=1; #_14=1; #_15=1; #_16=1; #_17=1; #_18=1; #_19=1;
    #_20=1; #_21=1; #_22=1; #_23=1; #_24=1; #_25=1; #_26=1; #_27=1; #_28=1; #_29=1;
    #_30=1; #_31=1; #_32=1; #_33=1; #_34=1; #_35=1; #_36=1; #_37=1; #_38=1; #_39=1;
    #_40=1; #_41=1; #_42=1; #_43=1; #_44=1; #_45=1; #_46=1; #_47=1; #_48=1; #_49=1;
    #_50=1; #_51=1; #_52=1; #_53=1; #_54=1; #_55=1; #_56=1; #_57=1; #_58=1; #_59=1;
    #_60=1; #_61=1; #_62=1; #_63=1; #_64=1; #_65=1; #_66=1; #_67=1; #_68=1; #_69=1;
    #_70=1; #_71=1; #_72=1; #_73=1; #_74=1; #_75=1; #_76=1; #_77=1; #_78=1; #_79=1;
    #_80=1; #_81=1; #_82=1; #_83=1; #_84=1; #_85=1; #_86=1; #_87=1; #_88=1; #_89=1;
    #_90=1; #_91=1; #_92=1; #_93=1; #_94=1; #_95=1; #_96=1; #_97=1; #_98=1; #_99=1;
}


// Benchmarking

const ITERATIONS = 100_000;

function bench(testClass) {
    var acc = 0;
    for (var i=0; i<ITERATIONS; i++) {
        const instance = new testClass()
        acc += instance.verification;
    }
}

bench(ES2022_Private_Fields);
