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

function write(v) { WScript.Echo(v + ""); }

function foo(a, b, c) {

    arguments[0] = "arguments[0]";
    write("foo a: " + a);
    b = "b";
    write("args[1] : " + arguments[1]);
    write("args[3] : " + arguments[3]);

    var g = function(x) {

        write("g args[1] : " + arguments[1]);
        delete x[1];
        x[2] = "x[2]";
        a = "g.a";

    };

    g(arguments, "g[1]");
    write("after call to g a : " + a + " b: "+ b + " c: " + c);
    
    var str = "eval.c";
    eval("c = str");
    write("after eval args[2]: " + arguments[2]);
    
    var arguments = [];
    arguments[0] = "new[0]";
    write("after variable a : " + a);
};

foo("foo.a", "foo.b", "foo.c", "foo.d");
foo("foo2.a", "foo2.b");

(function()
{
    eval("write(arguments[0])");
})("goodbye");


function lenChange() {
    write(arguments.length);
    arguments.length--;
    write(arguments.length);
}

lenChange(10,20,30);


function testDelete(a){
  a = 2;
  delete arguments[0];
  
  if (arguments[0] === 2) {
    write("if0 :" + arguments[0]);    
  }
  
  if (arguments[0] !== undefined) {
    write("if1 :" + arguments[0]);    
  }
  
  arguments[0] = "A";
  if (arguments[0] !== "A") {
    write("if2 :" + arguments[0]);
  }
  eval('delete a;');
  return a;
}

write("Value returned : " + testDelete(1));

function stackwithoverwrite() {
    for (var i = 0; i < arguments.length; i++) {
        write(arguments[i]);
        this.stackwithoverwrite.arguments[i] = i;
        write(arguments[i]);
    }
}
stackwithoverwrite('life', 'is', 'good');

(function()
{
    var arguments = ["a"];
    (function()
    {
        WScript.Echo(arguments.length);
        eval("");
    })()
})();

(function()
{
    var arguments;
    (function()
    {
        eval("");
    })()
})();

// Dead loop body containing load of arguments property
// interacted badly with stack args optimization.
(function(){
    for (var i = 0; i < 0; ++i) 
    {
        var c = arguments.some_property;
    }
})();

