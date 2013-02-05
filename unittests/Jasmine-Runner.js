FS = require('fs');
phantom.injectJs('Jasmine-Parser.js');

var url = 'file://' + FS.absolute('./SpecRunner.html');
UnitTester.init(url);