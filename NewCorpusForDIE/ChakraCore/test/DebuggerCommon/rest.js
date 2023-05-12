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

function justRest(...a) {
  /**bp:stack();locals();evaluate('a');**/
}

justRest();
justRest(1, 2, 3);

WScript.Attach(justRest);
WScript.Detach(justRest);

function someParams(a, b, ...c) {
  /**bp:stack();locals();evaluate('[a, b, c]');**/
}

someParams();
someParams(1);
someParams(1, 2);
someParams(1, 2, 3);
someParams(1, 2, 3, 4);
someParams(1, 2, 3, 4, 5);

WScript.Attach(someParams);
WScript.Detach(someParams);

class C {
  justRest(...a) {
    /**bp:stack();locals();evaluate('a');**/
  }
  someParams(a, b, ...c) {
    /**bp:stack();locals();evaluate('[a, b, c]');**/
  }
}

let classC = new C();

classC.justRest();
classC.justRest(1, 2, 3);

classC.someParams();
classC.someParams(1);
classC.someParams(1, 2);
classC.someParams(1, 2, 3);
classC.someParams(1, 2, 3, 4);
classC.someParams(1, 2, 3, 4, 5);


let arrowJustRest = (...a) => {
  /**bp:stack();locals();evaluate('a');**/
}

arrowJustRest();
arrowJustRest(1, 2, 3);

let arrowSomeParams = (a, b, ...c) => {
  /**bp:stack();locals();evaluate('[a, b, c]');**/
}

arrowSomeParams();
arrowSomeParams(1);
arrowSomeParams(1, 2);
arrowSomeParams(1, 2, 3);
arrowSomeParams(1, 2, 3, 4);
arrowSomeParams(1, 2, 3, 4, 5);

let obj = {
  justRest(...a) {
    /**bp:stack();locals();evaluate('a');**/
  },
  someParams(a, b, ...c) {
    /**bp:stack();locals();evaluate('[a, b, c]');**/
  }
}

obj.justRest();
obj.justRest(1, 2, 3);

obj.someParams();
obj.someParams(1);
obj.someParams(1, 2);
obj.someParams(1, 2, 3);
obj.someParams(1, 2, 3, 4);
obj.someParams(1, 2, 3, 4, 5);

WScript.Echo("PASS");
