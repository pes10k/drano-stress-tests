// Unit test to run the pricing script using hardcoded oauth values
// entered server side.  The test will initiate the pricing path
// and then count the number of matching results for each category of
// pricing rule.
var casper = require('casper').create();

casper.start('http://drano-dev.uicbits.net/', function() {
    this.click("button[value='price']");
});

casper.then(function() {
    console.log('clicked ok, new location is ' + this.getCurrentUrl());
});

casper.run();
