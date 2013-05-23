// Unit test to run the pricing script using hardcoded oauth values
// entered server side.  The test will initiate the pricing path
// and then count the number of matching results for each category of
// pricing rule.
var casper = require('casper').create();

casper.start('http://drano-dev.uicbits.net/', function() {
    this.click("button[value='price']");

    this.waitFor(function check() {
        return !! this.getCurrentUrl().match("/price");
    });
});

// Once we've submitted the pricing form, we need to wait for the progress
// bar to complete (indicating the pricing search is going on).
// If we don't see a change in the progress bar's progress in 30 seconds,
// we assume something has gone very wrong.
casper.then(function () {

    this.test.assertTitleMatch(/Pricing Account \| /);

    // Now we wait for the search bar container to hide, indicating that,
    // the searching is complete.  We'll wait a maximum of 2 minutes
    this.waitWhileVisible("#search-bar-container", null, null, 120000);
});

// If we're at this point, it means that the progress bar has at least finished
// running.  We now should check to see if we have all the expected rules
// comming back
casper.then(function checkNumberOfRulesMatched() {

    this.test.assertEvalEquals(function fechingBadMatches() {
        return document.querySelectorAll(".well-alert li").length;
    }, 1, "Expected to only have one 'very bad' match.");

    this.test.assertEvalEquals(function fetchingMediumMatches() {
        return document.querySelector(".well-warning").getElementsByTagName("li").length;
    }, 2, "Expected two 'sorta bad' matches.");

    this.test.assertEvalEquals(function fetchingGoodMatches() {
        return document.querySelectorAll(".well-success li").length;
    }, 0, "Expected no 'fine' matches.");

    this.test.assertEquals(
        this.fetchText(".cash-money-row span"),
        "$1.25", "Expected priced value of account to be $1.25."
    );
});

casper.run(function () {
    this.test.done();
    this.test.renderResults(true);
});
