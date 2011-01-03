(function(){
	var
		whiteSpace	= /[\n\t\r ]/g,
		startTag	= /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
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
		var tok = left.match(endTag);
		if (tok)
			return chopEndTag(tok[0]);
	});

	HTML.addRule('StartTag', function(left, str){
		if (left.indexOf('<') !== 0)
			return;
		var tok = left.match(startTag), tok2;
		if (tok)
			tok2 = chopStartTag(tok[0]);
		if (tok2[1].content == 'script' || tok2[1].content == 'style')
		{
			tok2 = tok2.concat(grabSpecial(left.substr(tok[0].length)));
		}
		return tok2;
	});

	HTML.addRule('CData', function(left, str){
		var ends = left.indexOf('<'),
		tok = ends < 0 ? left : left.substr(0, ends);
		return chopCData(tok);
	});

	function grabSpecial()
	{
		return [];
	}

	function chopEndTag(token)
	{
		var tokens = [new Token('<', 'TagOpener'), new Token('/', 'TagCancel')]
		token.replace(endTag, function(tag, tagname){
			tokens.push(new Token(tagname, 'TagName'));
		});
		tokens.push(new Token('>', 'TagCloser'));
		return tokens;
	}

	function chopStartTag(token)
	{
		var tokens = [new Token('<', 'TagOpener')];
		token.replace(startTag, function(tag, tagname, end, unary){
			tokens.push(new Token(tagname, 'TagName'));
			end.replace(attrib, function(attr, name){
				tokens.push(new Token(arguments[6].match(whiteSpace)[0], 'TagSpace'));
				tokens.push(new Token(name, 'AttributeName'));
				var value = arguments[2] ? '"'+arguments[2]+'"' : arguments[3] ? "'"+arguments[3]+"'" : arguments[4] ? arguments[4] : '';
				if (value)
				{
					tokens.push(new Token('=', 'AttributeOperator'));
					tokens.push(new Token(value, 'AttributeValue'));
				}
			});
			var left = tag.substr(0, tagname.length + end.length + 1).match(whiteSpace);
			if (left)
				tokens.push(new Token(left[0], 'TagSpace'));
			if (unary)
				tokens.push(new Token('/', 'TagCancel'));
			tokens.push(new Token('>', 'TagCloser'));
		});
		return tokens;
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
