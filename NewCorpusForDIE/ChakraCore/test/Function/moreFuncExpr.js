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

function Test1()
{
    write("Declaration Test1")
};

Test1();

var Result1 = function Test1()
{
    write("Expression Test1")
};

Test1();
Result1();



var Result2, Test2;
Result2 = function Test2(n)
{
    if (n < 0)
    {
        write("Test2: Less 0");
    }
    else
    {
        write("Test2: Greater 0");
        Test2(-n);
    }
}

Test2 = function Test2(n)
{
    write("In second Test2");
};

Result2(2); 


var fact, factorial;
fact = function factorial(n)
{
    return n<=1?1:n*factorial(n-1)
};

factorial = function factorial(n)
{
    return -1
};
write("Test3 factorial : " + fact (3)); 


function Test4()
{
    write("first declaration of Test4")
};

Test4();

function Test4()
{
    write("Second declaration of Test4")
};

Test4();


function Test5(n)
{
    return n<=1?1:n*Test5(n-1)
};

var Result5 = Test5;

Test5 = function (n)
{
    return -1
};

write("Test5 factorial : " + Result5(3)); 


var Test6 = function Test6()
{
    write(Test6)
};

var Result6 = Test6;

Test6 = "Outer Binding";

Result6();  
