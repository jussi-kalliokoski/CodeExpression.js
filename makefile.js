var	_just	= makejs.argumentedFlags['--just'] || makejs.argumentedFlags['-j'],
	_help	= makejs.flags.indexOf('--help') !== -1 || makejs.flags.indexOf('-h') !== -1;

function all(){
	if (_help){
		console.log('Usage:\tmakejs <rule=all> <flags>');
		console.log('\tRules:');
		console.log('\t\tall\t\tcombines the files into a single library and also makes a minified version of that file.');
		console.log('\t\tclean\t\tcleans up the created files.');
		console.log('\tFlags:');
		console.log('\t\t-j <language1> <language2> ... <language x>\tIgnores the language libraries that aren\'t specified.');
		console.log('\t\t--just\t\tSame as -j.');
	}
	console.log('Making CodeExpression.js' + (makejs.flags.length ? ' with flags ' + makejs.flags : ''));
	var data, i;
	if (_just){
		data = open('js/CodeExpression.js');
		for (i=0; i<_just.length; i++){
			data += open('js/CE.' + _just[i] + '.js');
		}
		save('CodeExpression.full.js', data);
	} else {
		shell('cat js/CodeExpression.js js/CE* > CodeExpression.full.js');
	}
	shell('yui-compressor CodeExpression.full.js -o CodeExpression.min.js');
	console.log('Done.');
}

function clean(){
	shell('rm CodeExpression.full.js CodeExpression.min.js -f');
}
