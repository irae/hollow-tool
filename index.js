
const {homedir} = require('os');
const {join} = require('path');
const ioHook = require('iohook');
const {Socket} = require('net');
const {existsSync, readdir, unlinkSync} = require('fs');

const hollowSaves = join(homedir(), 'AppData','LocalLow', 'Team Cherry', 'Hollow Knight');

if (!existsSync(hollowSaves)) {
	console.error("Can't find saves!");
	process.exit(1);
}

const eraseSaves = () => {
	readdir(hollowSaves, (err, files) => {
		if (err) throw err;
		files
			.filter(f => /^user\d/.test(f))
			.forEach(f => {
				unlinkSync(join(hollowSaves, f));
				console.log('deleted:', f);
			});
	});
};

const livesplit = Socket();
livesplit.on('data', buff => {
	console.log('livesplit said:', buff.toString());
});
livesplit.on('error', error => {
	throw error;
});
livesplit.connect(16834);

const tellLivesplit = command => {
	livesplit.write(command+'\r\n');
	console.log('told livesplit:', command);
}

ioHook.on('keyup', event => {
	if (event.rawcode !== 35) return;
	console.log('reset pressed');
	tellLivesplit('reset');
	eraseSaves();
});
ioHook.start();

