var express = require('express');
var https = require('https');
var Sparky = require('sparky');
var templates = require('./HandlebarsTemplates');

var AUTH_PASSWORD = '0508824266';
var app = express();
var lastOnTime;
var duration;

var core = new Sparky({
    deviceId: '50ff6e065067545634530687',
    token: '32722114c0edaa8c11e1cdaf2ed958d17fb0658f'
});



app.use(express.compress());
app.use(express.cookieParser());
app.use(express.session({secret: 'bizzaboMostBestestSecretIs#3cafe4'}));
app.use(express.bodyParser());

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

app.get('/', function(req, res) {
    res.redirect(301, 'https://www.bizzabo.com');
});
app.get('/status', function(req, res) {
    res.send('OK');
});

app.get('/robots.txt', function(req, res) {
    res.sendfile('robots.txt', {root:'./templates/'});
});
app.get('/smartdude', function(req, res) {
    checkDudeState(function(response) {
        var timeTrimmed = 'N/A'
        if (lastOnTime) {
            var timeString = lastOnTime.toString();
            timeTrimmed = timeString.substring(0, timeString.length - 15);
        }


        res.send(templates.index({
            dudeState: response.result,
            lastTimeOn: timeTrimmed,
            duration: duration ? duration : 'N/A'
        }));
    });
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
    checkDudeState(function(response){
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
}

var switchOffDude = function() {
    core.run('toggleDude', 'LOW', function(response) {

    });
}

var pollDude = function() {
    var dudeStarted = false;
    setInterval(function(){
        checkDudeState(function(response) {
            if (response.result == 1) {
                if(!dudeStarted) {
                    lastOnTime = new Date();
                    dudeStarted = true;
                }

            } else if (response.result == 0) {
                var now = new Date();
                var diffMs = (now - lastOnTime );
                duration = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                dudeStarted = false;
            }
        })
    }, 5000)
};

pollDude();
app.listen(8080);
console.log('Listening on port 8080');


