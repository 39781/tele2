var basicAuth = require('basic-auth');

exports.BasicAuthentication = function(request, response, next) {

    function unauthorized(response) {
        response.set('WWW-Authenticate', 'Basic realm=' + request.authRealm);
        return response.sendStatus(401);
    };

    var user = basicAuth(request);

    if (!user || !user.name || !user.pass) {
        return unauthorized(response);
    };

    if (user.name === 'foo' && user.pass === 'bar') {
        return next();
    } else {
        return unauthorized(response);
    };
	
};

exports.SetRealm = function(realm) {
    return function(request, response, next) {
        request.authRealm = realm || 'default';	
        return next();
    }
};