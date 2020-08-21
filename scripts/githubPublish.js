const { writeFile, write } = require('fs/promises');
const pkg = require('../package.json');
const pkgCopy = Object.assign({}, pkg);

pkg.name = '@olyno/' + pkg.name;

writeFile('../package.json', JSON.stringify(pkg))
    .then(() => {
        return new Promise((resolve, rejects) => {
            const publishJob = require('child_process').spawn('npm', ['publish'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });
            publishJob.on('close', resolve);
        })
    })
    .then(() => {
        return writeFile('../package.json', JSON.stringify(pkgCopy, null, 2));
    })