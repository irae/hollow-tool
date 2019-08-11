
const {homedir, platform} = require('os');
const {join} = require('path');
const ioHook = require('iohook');
const {Socket} = require('net');
const {existsSync, readdir, unlinkSync} = require('fs');
const { spawnSync } = require('child_process');

const hollowSavesWin = join(homedir(), 'AppData','LocalLow', 'Team Cherry', 'Hollow Knight');
const hollowSavesWSL = join(process.env.WSL_HOMEDIR || '', 'AppData','LocalLow', 'Team Cherry', 'Hollow Knight');

let hollowSaves = false;

if (existsSync(hollowSavesWin)) {
	hollowSaves = hollowSavesWin;
} else if (existsSync(hollowSavesWSL)){
	hollowSaves = hollowSavesWSL;
} else {
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

const gitZero = () => {
	console.log('git zero');
	if (platform() === 'win32') {
		spawnSync("C:\\Windows\\System32\\wsl.exe", ['git', 'zero'], { cwd: hollowSaves, stdio: 'inherit' });
	} else {
		spawnSync("git", ['zero'], { cwd: hollowSaves, stdio: 'inherit' });
	}
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
	gitZero();
});
ioHook.start();

