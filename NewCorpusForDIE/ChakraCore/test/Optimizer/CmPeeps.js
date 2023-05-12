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

function foo0(o,i)
{
    if (o==10 && i++,o)
    {
    }
    else
    {
        WScript.Echo("FAILED");
    }
}
foo0(9, 0);

// - At 'o.p && 1', 'BrTrue 1' is const-folded to 'Br' to the loop exit block with the 'break'
// - 'a' becomes live as a float on the right side of '||' and is only live as an int on the left side
// - Since both of those blocks are predecessors to the loop exit block with the 'break', 'a' is kept live as a float on exit
//   out of the loop
// - When compensating in the 'BrTrue 1' block, we don't need an airlock block to convert 'a' to a float only on exit out of the
//   loop because that branch was already const-folded into 'Br' and always flows into the exit block
function foo1() {
    var o = { p: 0 };
    var a = 0;
    for(var i = 0; i < 2; ++i) {
        a = 1;
        if(o.p && 1 || (a /= 2))
            break;
    }
}
foo1();
foo1();

function foo2(){
  var ary = new Array(10);
  var c = -1;
  var e = 1;
  var g = 1;
  ary[ary.length-1] = 1;
  ary.length = 100;
  g =((e < c)||(g < c));
  if(g)
        c=((e < c));
  c =((e < c)) + g;
  ary[ary.length-1];
};

foo2();
foo2();
foo2();

WScript.Echo("Passed");
