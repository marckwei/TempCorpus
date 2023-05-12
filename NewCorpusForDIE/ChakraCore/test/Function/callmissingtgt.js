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

var echo = WScript.Echo;

var globalObject = this;

var o = {};
function foo() {
    echo(" ", "Evaluate arg list");
}

function test(title, f) {
    echo(title);
    try {
        f();
    } catch (e) {
        echo(" ", e.name);
    }
    echo();
}

test("Global member missing", function () {
    bar(foo());
});

test("Global member undefined", function () {
    bar = undefined;
    bar(foo());
});

test("Global member null", function () {
    bar = null;
    bar(foo());
});

test("Global member is not callable", function () {
    bar = 23;
    bar(foo());
});

if (Object.defineProperties) {
    test("Global member getter returns undefined", function () {
        Object.defineProperty(this, "bar", {
            get: function () { },
            configurable: true
        });
        bar(foo());
    });

    test("Global member getter returns null", function () {
        Object.defineProperty(this, "bar", {
            get: function () { return null; },
            configurable: true
        });
        bar(foo());
    });
}

echo();

test("Global member missing via property reference via dot syntax", function () {
    globalObject.baz(foo());
});

test("Global member undefined via property reference via dot syntax", function () {
    globalObject.baz = undefined;
    globalObject.baz(foo());
});

test("Global member null via property reference via dot syntax", function () {
    globalObject.baz = null;
    globalObject.baz(foo());
});

test("Global member is not callable via property reference via dot syntax", function () {
    globalObject.baz = 23;
    globalObject.baz(foo());
});

if (Object.defineProperties) {
    test("Global member getter returns undefined via property reference via dot syntax", function () {
        Object.defineProperty(this, "baz", {
            get: function () { },
            configurable: true
        });
        globalObject.baz(foo());
    });

    test("Global member getter returns null via property reference via dot syntax", function () {
        Object.defineProperty(this, "baz", {
            get: function () { return null; },
            configurable: true
        });
        globalObject.baz(foo());
    });
}

echo();

function elementname() { return "buz"; }

test("Global member missing via property reference via element access syntax", function () {
    globalObject[elementname()](foo());
});

test("Global member undefined via property reference via element access syntax", function () {
    globalObject[elementname()] = undefined;
    globalObject[elementname()](foo());
});

test("Global member null via property reference via element access syntax", function () {
    globalObject[elementname()] = null;
    globalObject[elementname()](foo());
});

test("Global member is not callable via property reference via element access syntax", function () {
    globalObject[elementname()] = 23;
    globalObject[elementname()](foo());
});

if (Object.defineProperties) {
    test("Global member getter returns undefined via property reference via element access syntax", function () {
        Object.defineProperty(this, elementname(), {
            get: function () { },
            configurable: true
        });
        globalObject[elementname()](foo());
    });

    test("Global member getter returns null via property reference via element access syntax", function () {
        Object.defineProperty(this, elementname(), {
            get: function () { return null; },
            configurable: true
        });
        globalObject[elementname()](foo());
    });
}

echo();

test("Object member missing", function () {
    o.bar(foo());
});

test("Object member undefined", function () {
    o.bar = undefined;
    o.bar(foo());
});

test("Object member null", function () {
    o.bar = null;
    o.bar(foo());
});

test("Object member is not callable", function () {
    o.bar = 23;
    o.bar(foo());
});

if (Object.defineProperties) {
    test("Object member getter returns undefined", function () {
        Object.defineProperty(o, "bar", {
            get: function () { },
            configurable: true
        });
        o.bar(foo());
    });

    test("Object member getter returns null", function () {
        Object.defineProperty(o, "bar", {
            get: function () { return null; },
            configurable: true
        });
        o.bar(foo());
    });
}

echo();

test("Object element missing", function () {
    o[3](foo());
});

test("Object element undefined", function () {
    o[3] = undefined;
    o[3](foo());
});

test("Object element null", function () {
    o[3] = null;
    o[3](foo());
});

test("Object element is not callable", function () {
    o[3] = 23;
    o[3](foo());
});

if (Object.defineProperties) {
    test("Object element getter returns undefined", function () {
        Object.defineProperty(o, 3, {
            get: function () { },
            configurable: true
        });
        o[3](foo());
    });

    test("Object element getter returns null", function () {
        Object.defineProperty(o, 3, {
            get: function () { return null; },
            configurable: true
        });
        o[3](foo());
    });
}
