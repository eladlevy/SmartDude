var fs = require('fs');
var Handlebars = require('handlebars');

var compiledTemplates = {};
var extension = 'html';
var templates = [
    'index'
];

templates.forEach(function(templateName) {
    var data = fs.readFileSync('./templates/' + templateName + '.' + extension).toString();
    compiledTemplates[templateName]= Handlebars.compile(data);
});

module.exports = compiledTemplates;