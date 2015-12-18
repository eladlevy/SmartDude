var express = require('express');
var https = require('https');
var Sparky = require('sparky');
var EventSource = require('eventsource');
var templates = require('./HandlebarsTemplates');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var expressSession= require('express-session');
var bodyParser= require('body-parser');

var AUTH_PASSWORD = '0508824266';
var app = express();
var lastOnTime;
var duration;
var dudeState;

var deviceId = '50ff6e065067545634530687';
var token = '';
var core = new Sparky({
    deviceId: deviceId,
    token: token
});



app.use(compression());
app.use(cookieParser());
app.use(expressSession({secret: 'bizzaboMostBestestSecretIs#3cafe4'}));
app.use(bodyParser());

app.use(function (req,res,next) {
    next();
});
app.use('/css', express.static('../client/css'));
app.use('/fonts', express.static('../client/fonts'));
app.use('/images', express.static('../client/images'));
app.use('/sounds', express.static('../client/sounds'));
app.use('/scripts', express.static('../client/scripts'));
app.use('/scripts', express.static('../common/scripts'));
app.use('/scripts/templates', express.static('../common/templates')); // For the requirejs handlebars plugin

//app.get('/', function(req, res) {
//    res.redirect(301, 'https://www.bizzabo.com');
//});
app.get('/status', function(req, res) {
    res.send('OK');
});

app.get('/robots.txt', function(req, res) {
    res.sendfile('robots.txt', {root:'./templates/'});
});
app.get('/', function(req, res) {
    var timeTrimmed = 'N/A'
    if (lastOnTime) {
        var timeAferTimeZone = new Date(lastOnTime.getTime());
        timeAferTimeZone.setHours(timeAferTimeZone.getHours() + 2);
        var timeString = timeAferTimeZone.toString();
        timeTrimmed = timeString.substring(0, timeString.length - 15);
    }


    res.send(templates.index({
        dudeState: dudeState,
        lastTimeOn: timeTrimmed,
        duration: duration ? duration : 'N/A'
    }));
});

var timeout = undefined;
app.put('/toggle-dude', function(req, res) {
    if (req.body.minutes && req.body.value == 'HIGH') {
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            switchOffDude();
        }, req.body.minutes * 60000);
    }
    core.run('toggleDude', req.body.value, function(response) {
        res.send({status: response});
    });
});

app.get('/dude-status', function(req, res) {
    checkDudeState(function(response) {
        res.send(response);
    });
});

app.put('/authenticate', function(req, res) {
    if (req.body.password == AUTH_PASSWORD) {
        res.send({auth: true});
    } else {
        res.send({auth: false});
    }
});

var checkDudeState = function(callback) {
    core.get('dudestate', function(response) {
        callback && callback(response);
    });
};

var switchOffDude = function() {
    core.run('toggleDude', 'LOW', function(response) {
    });
};

var eventHandler = function() {
    var eventSource = new EventSource("https://api.spark.io/v1/devices/" + deviceId + "/events/?access_token=" + token);
    eventSource.addEventListener('stateChanged', function(e) {
        var rawData = JSON.parse(e.data);
        var parsedData = JSON.parse(rawData.data);
        dudeState = parsedData.state;
    },false);
};

var pollDude = function() {
    var dudeStarted = false;
    setInterval(function() {
        checkDudeState(function(response) {
            if (response) {
                if (response.result == 1) {
                    if(!dudeStarted) {
                        lastOnTime = new Date();
                        dudeStarted = true;
                        duration = undefined;
                    }

                } else if (response.result == 0) {
                    if (dudeStarted) {
                        var now = new Date();
                        var diffMs = (now - lastOnTime );
                        duration = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                        dudeStarted = false;
                    }
                }
            }
        })
    }, 5000)
};

checkDudeState(function(response) {
    dudeState = response.result;
});
eventHandler();
app.listen(8080);
console.log('Listening on port 8080');


