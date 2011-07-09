(function(CodeExpression){
	var
		devourToken			= CodeExpression.devourToken,
		JSON				= CodeExpression.createLanguage('JSON');

	JSON.parser.operator	= /^[{}\[\]\,:]/;

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	JSON.addRule('String', function(left, str){
		if (left[0] !== '"'){
			return;
		}
		var token = left[0],
		nextChar = '\\',
		temp = left.substr(token.length),
		searchQuery = /[^"\\]/;
		while(nextChar === '\\'){
			if (temp[0] === '\\'){
				token += '\\'+temp[1];
				temp = temp.substr(2);
			}
			token += devourToken(temp, searchQuery);
			temp = left.substr(token.length);
			nextChar = temp[0];
		}
		if (left.length === token.length){
			throw('Error: unterminated string');
		}
		token += left[token.length];
		return token;
	});

	JSON.parser('Degal', /^(0|([1-9][0-9]*))e[0-9]+/i);

	JSON.parser('Number', /^(0\.[0-9]+)|^([1-9][0-9]*(\.[0-9]+)?)|^0/);

	JSON.parser('Whitespace', /^[\n\t\r ]/);

	JSON.addRule('Operator', function(left){
		left = JSON.parser.operator.exec(left);
		if (left){
			return left[0];
		}
	});

}(CodeExpression));
