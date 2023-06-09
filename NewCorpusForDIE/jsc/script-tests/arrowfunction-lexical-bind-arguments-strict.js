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

"use strict";
description('Tests for ES6 arrow function lexical bind of arguments');

function afFactory0() {
    return a => arguments;
}
var af0 = afFactory0('ABC', 'DEF');

var arr = af0(0);

shouldBe('arr.length', '2');
shouldBe('arr[0]','"ABC"');
shouldBe('arr[1]','"DEF"');
shouldBe('typeof arr[2]','"undefined"');

function afFactory1(x, y, z) {
    return (a, b) => arguments[0] + '-' + arguments[1] + '-' + arguments[2] + '-' + a + '-' + b;
}

shouldBe("afFactory1('AB', 'CD', 'EF')('G', 'H')", '"AB-CD-EF-G-H"');

var afFactory2 = function () {
    this.func = (a, b) => arguments[0] + '_' + arguments[1] + '_' + arguments[2] + '_' + a + '_' + b;
};

shouldBe("(new afFactory2('P1', 'Q2', 'R3')).func('A4', 'B5')", '"P1_Q2_R3_A4_B5"');

var afFactory3 = function () {
    this.func = (a, b) => (c, d) => arguments[0] + '_' + arguments[1] + '_' + arguments[2] + '_' + a + '_' + b + '_' + c + '_' + d;
};

shouldBe("(new afFactory3('PQ', 'RS', 'TU')).func('VW', 'XY')('Z', 'A')", '"PQ_RS_TU_VW_XY_Z_A"');

var afNested = function () {
    return function () {
        this.func = (a, b) => (c, d) => arguments[0] + '_' + arguments[1] + '_' + arguments[2] + '_' + a + '_' + b + '_' + c + '_' + d;
    };
};

var afInternal = new afNested('AB', 'CD', 'EF');
var af5 = new afInternal('GH', 'IJ', 'KL');
shouldBe("af5.func('VW', 'XY')('Z', '')", '"GH_IJ_KL_VW_XY_Z_"');

var objFactory = function () {
    return {
        name : 'nested',
        method : (index) => arguments[0] + '-' + index
    };
};

var objInternal = objFactory('ABC', 'DEF');
shouldBe("objInternal.method('H')", '"ABC-H"');

var obj = function (value) {
  this.id = value;
};

var arr_nesting = () => () => () => new obj('data');

shouldBe("arr_nesting()()().id", '"data"');

var func_with_eval = function (a, b) { return () => eval('arguments') }

shouldBe('func_with_eval("abc", "def")("xyz")[0]', '"abc"');
shouldBe('func_with_eval("abc", "def")("xyz")[1]', '"def"');

class A {
   constructor() {
      this.list = [];
   }
};

class B extends A {
   addObj(obj) {
      this.list.push(obj);
      this.result = 0;
   }
   runAll() {
      for (let i = 0; i < this.list.length; i++) {
          this.result += this.list[i].operand(1);
      }
   }
};

function test() {
    let b = new B();

    function runTest () {
        b.addObj({ operand : (value) =>  value + value });
        b.addObj({ operand : (value) =>  value + value });
    }

    for (var i = 0; i < 10000; i++) {
        runTest();
    }

    b.runAll();

    return b.result;
}

test();

shouldBe("test()", "40000");

function* foo(a, b, c) {
    yield () => arguments;
}

foo(10, 11, 12).next().value()[0];

shouldBe("foo(10, 11, 12).next().value()[0]", "10");
shouldBe("foo(10, 11, 12).next().value()[1]", "11");
shouldBe("foo(10, 11, 12).next().value()[2]", "12");

var successfullyParsed = true;
