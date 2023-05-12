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


function test() {
  var line = '"Value1InQuotes",Value2,Value 3 ,0.33,,,Last Value';
  var inQuotes = false;
  var quoted = false;
  for (var i = 0; i < line.length; i++) {
    if (inQuotes) {
      if (line[i] === '"') {
          inQuotes = false;
      }
    } else {
      if (line[i] === '"') {
        inQuotes = true;
        quoted = true;
      } else if (line[i] === ',') {
        if (line[i - 1] === '"' && !quoted) {
          WScript.Echo('Read from wrong var');
          return false;
        }
      }
    }
  }
  return true;
}

if (test() && test() && test()) {
  WScript.Echo('Passed');
}
