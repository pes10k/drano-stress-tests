var fs = require("fs"),
    pwd = fs.workingDirectory,
    system = require('system'),
    webpage = require('webpage'),
    async = require(pwd + "/contrib/async/lib/async.js"),
    num_args = system.args.length,
    num_runs = (num_args > 1) ? system.args[1] : 1,
    results_file = (num_args > 2) ? system.args[2] : "/dev/stdout",
    drano_homepage = 'http://drano-dev.uicbits.net/',
    i,
    responses = [],
    test_response = function (response, message, is_success) {

        response['end_time'] = +new Date();
        if (!is_success) {
            response['error'] = message;
        } else {
            response['message'] = message;
        }
        return response;
    },
    snap_shot_error_response = function (response, page, message) {
        page.render("error_" + (+new Date()) + ".png");
        console.log("Printing error: " + "error_" + (+new Date()) + ".png");
        return test_response(response, message, false);
    },
    get_current_url = function (page) {
        return page.evaluate(function () {
            return document.location.href;
        });
    },
    num_visible = function (page, query) {
        return page.evaluate(function (a_query) {
            if (!window.$) {
                return null;
            } else {
                return $(a_query).not(":hidden").length;
            }
        }, query);
    },
    wait_until = function (response, test_func, callback_func, page, timeout, max_attempts, current_attempt) {

        var secs = timeout || 500,
            max_a = max_attempts || 20,
            current_a = current_attempt || 0,
            rs = test_func();

        if (rs) {

            callback_func(response);

        } else if (rs === null || rs === undefined) {

            response['error'] = true;
            response['render_error'] = true;
            callback_func(snap_shot_error_response(response, page, "Error access full dom"));

        } else if (current_a > max_a) {

            response['error'] = true;
            response['timeout_error'] = true;
            callback_func(response);

        } else {

            setTimeout(function () {
                wait_until(response, test_func, callback_func, secs, max_a, (current_a + 1));
            }, secs);
        }
    },
    logout_complete = function (response, callback_func) {

        var page = this;

        if (response.timeout_error) {
            callback_func(test_response(response, "Error waiting for logout to complete"));
        } else {
            response.success = true;
            callback_func(test_response(response, "Logout Complete.  Total Success!", true));
        }
    },
    logout_begin = function (response, callback_func) {

        var page = this;

        this.open(drano_homepage + "logout", function (status) {

            wait_until(
                response,
                function () {
                    return num_visible(page, ".hero-unit") === 1;
                },
                function (new_response) {
                    logout_complete.call(page, new_response, callback_func);
                },
                page
            );
        });
    },
    pricing_completed = function (response, callback_func) {

        var page = this,
            num_bad = num_visible(this, ".well-alert li"),
            num_med = num_visible(this, ".well-warning li"),
            num_good = num_visible(this, ".well-success li"),
            price = this.evaluate(function () {
                var elm = document.querySelector(".cash-money-row span");
                return (elm) ? elm.textContent : false;
            });

        if ([num_bad, num_med, num_good, price].indexOf(null) !== -1 ||
            [num_bad, num_med, num_good, price].indexOf(undefined) !== -1) {
            callback_func(snap_shot_error_response(response, page, "Unable to query dom"));
        }
        else if (response.timeout_error) {
            callback_func(test_response(response, "Error waiting for the search to complete"));
        }
        else if (num_bad !== 1) {
            // Now check and make sure the world looks the way we expect
            callback_func(test_response(response, "Incorrect number of bad matches: " + num_bad));
        } else if (num_med !== 2) {
            callback_func(test_response(response, "Incorrect number of medium matches: " + num_med));
        } else if (num_good !== 0) {
            callback_func(test_response(response, "Incorrect number of good matches: " + num_good));
        } else if (price !== "$1.25") {
            callback_func(test_response(response, "Incorrect pricing of account: '" + price + "'"));
        } else {

            this.open(drano_homepage + "logout", function (status) {

                wait_until(
                    response,
                    function () {
                        return num_visible(page, ".hero-unit") === 1;
                    },
                    function (new_response) {
                        logout_complete.call(page, new_response, callback_func);
                    },
                    page
                );
            });
        }
    },
    search_started = function (response, callback_func) {

        var page = this,
            test_func = function () {
                return num_visible(page, "#search-bar-container") === 0;
            };

        if (response.timeout) {

            callback_func(test_response(response, "Error waiting for the search page to load"));

        } else {

            wait_until(
                response,
                test_func,
                function (new_response) {
                    logout_begin.call(page, new_response, callback_func);
                },
                page
            );
        }
    },
    click_pricing = function (response, callback_func) {

        var page = this,
            test_func = function () {
                return get_current_url(page).indexOf("/search") > -1;
            };

        if (response.error) {

            callback_func(test_response(response, "Error waiting for home page to load"));

        } else {

            page.evaluate(function () {
                document.querySelector("button[value='search']").click();
            });

            wait_until(
                response,
                test_func,
                function (new_response) {
                    search_started.call(page, new_response, callback_func);
                },
                page
            );
        }
    },
    // Calls the given callback function with an object with the following
    // properties:
    //   - start_time: unix timestamp for when the processes started
    //   - end_time:   unix timestamp for when the entire flow completed
    //   - error:      text description of the error if something went wrong
    drano_test = function (callback_func, request_index) {

        var page = webpage.create(),
            response = {
                'request': request_index,
                'start_time': +new Date(),
                'success': false
            },
            test_func = function () {
                return num_visible(page, "form") === 1;
            };

        page.open(drano_homepage, function (status) {

            if (status !== 'success') {

                callback_func(test_response(response, "Unable to connect to Drano"));

            } else {

                wait_until(
                    response,
                    test_func,
                    function (new_response) {
                        click_pricing.call(page, new_response, callback_func);
                    },
                    page
                );
            }
        });
    },
    perform_client_request = function (request_index, callback) {

        drano_test(
            function (new_response) {
                console.log(request_index + ". Finished (" + (new_response['end_time'] - new_response['start_time']) + ") - " + (new_response['success'] ? 'SUCCESS' : 'ERROR'));
                callback(null, new_response);
            },
            request_index
        );
    };


for (i = 0; i < num_runs; i += 1) {
    responses.push(i);
}

async.mapLimit(responses, 1, perform_client_request, function (err, results) {
    var filename = results_file.replace("{pid}", system.pid);
    fs.write(filename, JSON.stringify(results), 'w');
    phantom.exit();
});
