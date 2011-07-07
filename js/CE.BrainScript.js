(function(CodeExpression){
	var
		devourToken			= CodeExpression.devourToken,
		BS				= CodeExpression.createLanguage('BrainScript');

	BS.parser.operator	= /[{}\(\)\[\]\.;,<>+\-\*%&|\^!~\?:=\/]/;
	BS.parser.operator.list = [ '{}()[].;,<>+-*%&|^!~?:=/',
					['<=', '>=', '==', '!=', '++', '--', '<<', '>>', '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
					['===', '!==', '>>>', '<<=', '>>='], ['>>>=']];
	BS.parser.identifier	= /^[_\$]+/i;

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	BS.parser('RegExp', /^\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1fa-z0-9]|[^\x00-\x1fa-z0-9\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/i);

	BS.addRule('Identifier', function(left, str, i){
		str = BS.parser.identifier.exec(left);
		if (str){
			return str[0];
		}
	});

	BS.parser('Whitespace', /^\n+/);

	BS.addRule('Operator', function(left, str){
		if (left.search(BS.parser.operator) === 0){
			var	token	= devourToken(left, BS.parser.operator, 4),
				i;
			for (i = 3; i >= 0; i--){
				if (isIn(token, BS.parser.operator.list[i])){
					return token;
				}
				token = token.substr(0, i);
			}
		}
	});
}(CodeExpression));
