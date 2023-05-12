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

const a = 1;

with({a:2}) {
    a++;
    print(a);  // 3
}

try {
    with({b:2}) {
        a++;
        print(a);
    }
}
catch(e) {
    print(e);  // TypeError: Assignment to const
}

let foo1 = new Function(
    "with({a:2}) {" + 
    "    a++;" +
    "    print(a);" +
    "}");

foo1();   // 3

let foo2 = new Function(
    "with({b:2}) {" + 
    "    a++;" +
    "    print(a);" +
    "}");

try {
    foo2();
}
catch(e) {
    print(e);  // TypeError: Assignment to const
}

try {
    eval('let b = 3');
    a++;
    print(a);
}
catch(e) {
    print(e);  // TypeError: Assignment to const
}

(function() {
    const a = 1;
    with({a:2}) {
        a++;
        print(a);  // 3
    }

    try {
        with({b:2}) {
            a++;
            print(a);
        }
    }
    catch(e) {
        print(e);  // TypeError: Assignment to const
    }

    try {
        eval('let b = 3');
        a++;
        print(a);
    }
    catch(e) {
        print(e);  // TypeError: Assignment to const
    }
})();

function print(x) { WScript.Echo(x) }

