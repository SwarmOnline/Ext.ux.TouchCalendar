/**
 * This class is a modified version of the run-jasmine.js example that ships with PhantomJS
 */

FS = require('fs');
var LOGFILE = '_jasmine-errors.txt';

UnitTester = {

    init : function(url) {
        var me   = this,
            page = new WebPage();

        console.log('Attempting to open page: ' + url);

        // Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
        page.onConsoleMessage = function(msg) {
            console.log(msg);
        };

        page.open(url, function(status){
            if (status !== "success") {
                console.log("Unable to access network");
                phantom.exit(1);
            }
            else {
                me.waitFor(
                    function() {
                        return page.evaluate(function(){
                            if (document.body.querySelector('.finished-at')) {
                                return true;
                            }
                            return false;
                        });
                    },

                    function() {
                        var failures = page.evaluate(function(){
                            console.log('\n\n' + document.body.querySelector('.description').innerText);

                            var failedSuites = document.body.querySelectorAll('div.jasmine_reporter > div.suite.failed');
                            var errorList = [];

                            for (i = 0; i < failedSuites.length; ++i) {
                                var el     = failedSuites[i],
                                    spec   = el.querySelector('.spec.failed'),
                                    desc   = spec.querySelector('.description'),
                                    msg    = spec.querySelector('.resultMessage'),
                                    stack  = spec.querySelector('.stackTrace'); // <-- Currently broken. See: http://code.google.com/p/phantomjs/issues/detail?id=166

                                if (spec) {
                                    errorList.push(
                                        'Spec: ' + spec.previousElementSibling.innerText
                                    );
                                }
                                if (desc) {
                                    errorList.push(
                                        'Description:',
                                        '    - ' + desc.innerText
                                    );
                                }
                                if (msg) {
                                    errorList.push(
                                        'Failure Message:',
                                        '    - ' + msg.innerText
                                    );
                                }
                                if (stack) {
                                    errorList.push(
                                        'Stack Trace:',
                                        '    - ' + stack.innerText
                                    );
                                }

                                errorList.push(''); //separate failures by blank line
                            }

                            return errorList;
                        });

                        FS.touch(LOGFILE);
                        var stream = FS.open(LOGFILE, 'w');
                        var i = 0;
                            
                        for (i; i < failures.length; i++) {
                            stream.writeLine(failures[i]);
                        }

                        stream.close();
                        
                        phantom.exit(failures.length > 0 ? 1 : 0);
                    },

                    3000
                );
            }
        });
    },

    /**
     * Wait until the test condition is true or a timeout occurs. Useful for waiting
     * on a server response or for a ui change (fadeIn, etc.) to occur.
     *
     * @param testFx javascript condition that evaluates to a boolean,
     * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
     * as a callback function.
     * @param onReady what to do when testFx condition is fulfilled,
     * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
     * as a callback function.
     * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
     */
    waitFor : function (testFx, onReady, timeOutMillis) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
            start            = new Date().getTime(),
            condition        = false,
            interval         = setInterval(function() {
                if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                    // If not time-out yet and condition not yet fulfilled
                    condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
                }
                else {
                    if(!condition) {
                        // If condition still not fulfilled (timeout but condition is 'false')
                        console.log("'waitFor()' timeout");
                        phantom.exit(1);
                    }
                    else {
                        // Condition fulfilled (timeout and/or condition is 'true')
                        console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                        typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                        clearInterval(interval); //< Stop this interval
                    }
                }
            }, 100); //< repeat check every 250ms
    }

};