define(['jquery', 'jquery-cookie', 'underscore', 'backbone-original', 'easyXDM', 'config'], function ($, jqueryCookie, _, Backbone, easyXDM, config) {

    var xhr = new easyXDM.Rpc({
        remote: config.apiServer + '/static/scripts/easyXDM/cors/'
    }, {
        remote: {
            request: {}
        }
    });

    Backbone.ajax = function() {
        var bizzaboToken = $.cookie('x-bz-access-token');
        var headers = {
            'Authorization': bizzaboToken ? 'Bizzabo token="' + bizzaboToken + '"' : undefined,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        var options = arguments[0];
        options.method = options.method || options.type;
        options.headers = _.extend(headers, options.headers || {});
        if(_.isString(options.data)) {
            options.data = $.parseJSON(options.data);
        }
        if (options.method == 'GET') {
            var hasQuestionMark = (options.url.indexOf('?') != -1);
            if (hasQuestionMark) {
                options.url = options.url + '&_nocache=' + new Date().getTime();
            } else {
                options.data = options.data || {};
                options.data._nocache = new Date().getTime();
            }
        }

        xhr.request(options, function(response) {
            var data = response.data && response.data.length && $.parseJSON(response.data);
            var responseHeaders = response.headers || {};
            options.success && options.success(data, response.status, responseHeaders);
        }, function(response) {
            if (options.error){
                if(response && response.data && response.data.data && response.data.data.length) {
                    options.error($.parseJSON(response.data.data), response.data.status);
                } else {
                    options.error({}, 503);
                }
            }
        });
    };

    return Backbone;
});