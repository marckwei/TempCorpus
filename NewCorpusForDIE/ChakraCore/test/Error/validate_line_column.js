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

// Validating that error thrown has right line and column number

function foo(validate) {
    try {
        validate();
    } catch (e) {
        print(e.stack);
    }
}

foo(function() {
    ([z1]);         // Error thrown here.
});

foo(function() {
    ({a:z1});         // Error thrown here.
});

foo(function() {
    var a;
    a;class b extends ([]){};    // Error thrown here.
});

foo(function() {
    (typeof a.b);         // Error thrown here.
});

foo(function() {
    var k = 1;
    !a.b;         // Error thrown here.
});

foo(function() {
    var k = 1;
    ~a.b;         // Error thrown here.
});

foo(function() {
    var k = 1;
    (a.b && a.b);          // Error thrown here.
});

foo(function() {
    var k = 1;
    (a.b || a.b);         // Error thrown here.
});

foo(function() {
    var k = 1;
    (a.b * a.b);         // Error thrown here.
});

foo(function() {
    var k = 1;
    `${a.b}`;         // Error thrown here.
});

foo(function() {
    var k = 1;
    while(unresolved[0]) {   // Error thrown here.
        break;
    }
});

foo(function() {
    var k = 1;
    while(typeof unresolved[0]) {   // Error thrown here.
        break;
    }
});

foo(function() {
    var k = 1;
    while(unresolved instanceof blah) {   // Error thrown here.
        break;
    }
});
