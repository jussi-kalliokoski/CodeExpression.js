import('build.js');

var	_just	= makejs.argumentedFlags['--just'] || makejs.argumentedFlags['-j'],
	_help	= makejs.flags.indexOf('--help') !== -1 || makejs.flags.indexOf('-h') !== -1,
	_force	= makejs.flags.indexOf('--force') !== -1 || makejs.flags.indexOf('-f') !== -1;

function _indexOfR(arr, regex, start){
	start = start || 0;
	var i, l = arr.length;
	for (i=start; i<l; i++){
		if (arr[i].match(regex)){
			return i;
		}
	}
	return -1;
}



function all(){
	if (_help){
		console.log('Usage:\tmakejs <rule=all> <flags>');
		console.log('\tRules:');
		console.log('\t\tall\t\tcombines the files into a single library and also makes a minified version of that file.');
		console.log('\t\tclean\t\tcleans up the created files.');
		console.log('\tFlags:');
		console.log('\t\t-j <language1> <language2> ... <language x>\tIgnores the language libraries that aren\'t specified.');
		console.log('\t\t--just\t\tSame as -j.');
		console.log('\t\t-f\t\tForces make, even if up to date.');
		console.log('\t\t--force\t\tSame as -f.');
		return;
	}
	console.log('Making CodeExpression.js' + (makejs.flags.length ? ' with flags ' + makejs.flags : ''));
	var	sameFlags = false,
		data, i, files, which;
	try{
		sameFlags = open('.makejs.config') == makejs.rawFlags.join(' ');
	} catch(e){}
	if (!sameFlags){
		save('.makejs.config', makejs.rawFlags.join(' '));
	} else {
		if (all.isUpToDate()){
			console.log('Already up to date!');
			return;
		}
	}
	if (_just){
		files = shell('ls js', true).split('\n');
		files.splice(files.length - 1, 1);
		data = open('js/CodeExpression.js');
		for (i=0; i<_just.length; i++){
			which = _indexOfR(files, new RegExp('CE\\.' + _just[i] + '\\.js', 'i'));
			if (which === -1){
				console.log('Invalid library name ' + _just[i] + ' specified in --just flag.');
				exit(1);
			}
			data += open('js/' + files[which]);
		}
		save('CodeExpression.full.js', data);
	} else {
		shell('cat js/CodeExpression.js js/CE* > CodeExpression.full.js');
	}
	shell('yui-compressor CodeExpression.full.js -o CodeExpression.min.js');
	console.log('Done.');
}

function clean(){
	shell('rm CodeExpression.full.js CodeExpression.min.js .makejs.config -f');
}

Build.createBuild(all, ['CodeExpression.full.js'], ['js']);
