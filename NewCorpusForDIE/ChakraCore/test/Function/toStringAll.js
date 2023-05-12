function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function test(func) {
  console.log(func.toString());
  try {
    var result = func();
    if (result && result.next) {
      result.next();
    }
  } catch (e) {
    // Ignore
  }
}

function testFunctions() {
  function/*ß*/ a/*ß*/()/*ß*/ { console.log('a'); }
  test(a);
  var b = /*ß*/(/*ß*/)/*ß*/ => { console.log('b'); }
  test(b);
  async/*ß*/ function/*ß*/ c/*ß*/()/*ß*/ { console.log('c'); }
  test(c);
  function/*ß*/ */*ß*/d/*ß*/(/*ß*/)/*ß*/ { console.log('d'); }
  test(d);
}
testFunctions();

var objectMemberTest  = {
  a/*ß*/() /*ß*/{ console.log('a'); },
  b: /*ß*/()/*ß*/ => { console.log('b'); },
  async/*ß*/ c/*ß*/()/*ß*/ { console.log('c'); },
  */*ß*/ d/*ß*/()/*ß*/ { console.log('d'); },
  ['e']/*ß*/()/*ß*/ { console.log('e'); },
  async/*ß*/ ['f']/*ß*/()/*ß*/ { console.log('f'); },
  */*ß*/ ['g']/*ß*/()/*ß*/ { console.log('g'); },
  get/*ß*/()/*ß*/ { console.log('get'); },
  set/*ß*/()/*ß*/ { console.log('set'); },
  [/]/.exec(']')]/*ß*/()/*ß*/ { console.log('regex'); },
  [(function () { return 'h'})()]/*ß*/()/*ß*/ { console.log('function'); },
}

for (var i of Object.keys(objectMemberTest)) {
  test(objectMemberTest[i]);
}

var objectAccessorTest = {
  get/*ß*/ a/*ß*/()/*ß*/ { console.log('getter'); },
  set /*ß*/a/*ß*/(x)/*ß*/ { console.log('setter'); },
}

var d = Object.getOwnPropertyDescriptor(objectAccessorTest, 'a');
console.log(d.get.toString())
d.get();
console.log(d.set.toString())
d.set(0);

class ClassTest {
  constructor/*ß*/()/*ß*/ {}
  static /*ß*/a/*ß*/()/*ß*/ {}
  static /*ß*/async/*ß*/ b()/*ß*/ {}
  static /*ß*/*/*ß*/ c/*ß*/()/*ß*/ {}
  static /*ß*/['d']/*ß*/()/*ß*/ {}
  static /*ß*/async /*ß*/['e']/*ß*/()/*ß*/ {}
  static /*ß*/* /*ß*/['f']/*ß*/()/*ß*/ {}

  g/*ß*/()/*ß*/ {}
  async/*ß*/ h/*ß*/()/*ß*/ {}
  */*ß*/ i/*ß*/()/*ß*/ {}
  ['j']/*ß*/()/*ß*/ {}
  async/*ß*/ ['k']/*ß*/()/*ß*/ {}
  * /*ß*/['l']/*ß*/()/*ß*/ {}
}

var classInstance = new ClassTest();

for(var i of ['a', 'b', 'c', 'd', 'e', 'f']) {
  test(ClassTest[i]);
}

for(var i of ['g', 'h', 'i', 'j', 'k', 'l']) {
  test(classInstance[i]);
}
test(classInstance.constructor)

async function awaitTests() {
  return {
    [await 'a']/*ß*/()/*ß*/ { console.log("await a"); }
  }
}
awaitTests().then(o => {
  for (var i of Object.keys(o)) {
    test(o[i]);
  }
});

function * yieldTests() {
  return {
    [yield 'a']/*ß*/()/*ß*/ { console.log("yield a"); }
  }
}

var it = yieldTests();
var last;
do {
  last = it.next();
} while (!last.done);
for (var i of Object.keys(last.value)) {
  test(last.value[i]);
}