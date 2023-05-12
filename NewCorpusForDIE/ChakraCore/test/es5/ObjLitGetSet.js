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

function write(value)
{
    WScript.Echo(value);
}

function RunTest(testCase, testCount)
{
  var testFunction = testCase[0];
  var testScenario = testCase[1];

  testScenario = " (test " + testCount + "): " + testScenario;

  write(testScenario);
  try
  {
    var result = testFunction();
    if (result == true)
    {
    write("PASS");
    }

  }
  catch (e)
  {
    var resultString = "FAILED" + testScenario;
    write(resultString + " :: " + e.message);
  }
}

function RunAllTests(){
  for(var i = 0; i < testList.length; ++i){
    RunTest(testList[i], i + 1);
  }
}

var testList = [

    [Test1,    "Object literal get set property"],
    [Test2,    "Object literal only get or set property"],
    [Test3,    "Object literal multiple set\get property"],
    [Test4,    "Object literal parse error check"],
    [Test5,    "Object literal get set function toString"],
];

// Utility functions
function Verify(expression, actualValue, expectedValue)
{
  if (expectedValue != actualValue)
  {
    write("Failed: Expected " + expression + " = " + expectedValue + ", got " + actualValue);
    return false;
  }
  write("Success: Expected " + expression + " = " + expectedValue + ", got " + actualValue);
  return true;
}

//Tests

write("ES 5 Object Literal grammer");

function Test1(args)
{
   var s1 = "In getter";
   var s2 = "In setter";
   var s3 = "Modified by setter";
   var o = {get foo(){ return s1;},set foo(arg){return s2 = s3}};
   if(!Verify("o.foo getter",o.foo,s1)) return false;
   o.foo=10;
   if(!Verify("o.foo setter",s2,s3)) return false;
   return true;
}

function Test2(args)
{
   var s2 = "In setter";
   var s3 = "Modified by setter";

   var o = {get foo(){ return 20}};
   if(!Verify("o.foo getter",o.foo,20)) return false;

   var b = {set foo(args){ s2=s3;}};
   b.foo = 10;
   if(!Verify("b.foo",s2,s3)) return false;

   return true;
}

function Test3(args)
{
   var o = {get foo(){return this.value;}, set foo(args){this.value = args*2;}, get bar(){return this.value*2;}, set bar(args){ this.value = args*args}};

   o.foo = 2;
   if(!Verify("o.foo get after set",o.foo,4)) return false;
   o.foo = 3;
   if(!Verify("o.foo get after set",o.foo,6)) return false;

   o.bar = 2;
   if(!Verify("o.bar get after set",o.bar,8)) return false;
   o.bar = 3;
   if(!Verify("o.bar get after set",o.bar,18)) return false;

   return true;
}

function Test4()
{
  try
  {
     eval("var a = {get test(args){}};");
     return false;
  }
  catch(ex)
  {
    if(!Verify("get property accessor in object literal must not accept any args", true, ex instanceof SyntaxError)) return false;
  }

  try
  {
     eval("var a = {set test(args1,args2){}};");
     return false;
  }
  catch(ex)
  {
    if(!Verify("set property accessor in object literal must accept only one args", true, ex instanceof SyntaxError)) return false;
  }

  try
  {
     eval("var a = {set test bar(args1){}};");
     return false;
  }
  catch(ex)
  {
    if(!Verify("Throw parse error in multiple property name" , true, ex instanceof SyntaxError)) return false;
  }

  try
  {
      eval("var a = {'set' bar(x) {}};");
      return false;
  }
  catch(ex)
  {
      if(!Verify("invalid syntax if set keyword is a string (then it is just a normal property name)", true, ex instanceof SyntaxError)) return false;
  }

  try
  {
      eval("var a = {'get' bar() {}};");
      return false;
  }
  catch(ex)
  {
      if(!Verify("invalid syntax if get keyword is a string (then it is just a normal property name)", true, ex instanceof SyntaxError)) return false;
  }

  return true;
}

function Test5()
{
    var obj =
    {
        get foo() { return _foo; },
        set foo(value) { _foo = value; }
    };
    var fooDescriptor = Object.getOwnPropertyDescriptor(obj, "foo");

    WScript.Echo("" + fooDescriptor.get);
    WScript.Echo("" + fooDescriptor.set);

    return true;
}

// Note: test for Object literal duplicate set\get property is in the file ObjLitGetSetDuplicate.js.

RunAllTests();

