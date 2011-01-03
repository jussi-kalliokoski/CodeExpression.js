(function(){
	var	startTag	= /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag		= /^<\/(\w+)[^>]*>/,
		attrib		= /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
		HTML 		= CodeExpression.createLanguage('HTML');

	function isIn(needle, haystack)
	{
		for (var i=0, l=haystack.length; i<l; i++)
			if (haystack[i] === needle)
				return true;
		return false;
	}

	HTML.addRule('Comment', function(left, str){
		if (left.indexOf('<!--') !== 0)
			return;
		var ends = left.indexOf('-->') + 3;
		console.log(left);
		return left.substr(0, ends);
	});

	HTML.addRule('EndTag', function(left, str){
		if (left.indexOf('</') !== 0)
			return;
		tok = left.match(endTag);
		if (tok)
			return chopEndTag(tok[0]);
	});

	HTML.addRule('StartTag', function(left, str){
		if (left.indexOf('<') !== 0)
			return;
		tok = left.match(startTag);
		if (tok)
			return chopStartTag(tok[0]);
	});

	HTML.addRule('CData', function(left, str){
		var ends = left.indexOf('<'),
		tok = ends < 0 ? left : left.substr(0, ends);
		return chopCData(tok);
	});

	function chopEndTag(token)
	{
		return token;
	}

	function chopStartTag(token)
	{
		var tokens = [new Token('<', 'TagOpener')];
		token.replace(startTag, function(tag, tagname, end){
			tokens.push(new Token(tagname, 'TagName'));
			end.replace(attrib, function(attr, name){
				var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : '';
			});
		});
		return token;
	}

	function chopCData(token)
	{
		return token;
	}

	function Token(content, type)
	{
		this.content = content;
		this.type = type;
	}
})();
