
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Snapchat' });
};

exports.chat = function(req, res) {
	res.render('chat', {title: 'Snapchat'}); //	alias: req.body.alias });	
}

exports.sandbox = function(req, res) {
	res.render('sandbox', {title: 'Sandbox'});
}