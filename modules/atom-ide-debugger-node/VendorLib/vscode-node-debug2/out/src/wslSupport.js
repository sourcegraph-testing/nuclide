"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const isWindows = process.platform === 'win32';
const is64bit = process.arch === 'x64';
const :[fn~\w+] = () => {
    if (!isWindows) {
        return false;
    }
    const bashPath32bitApp = path.join(process.env['SystemRoot'], 'Sysnative', 'bash.exe');
    const bashPath64bitApp = path.join(process.env['SystemRoot'], 'System32', 'bash.exe');
    const bashPathHost = is64bit ? bashPath64bitApp : bashPath32bitApp;
    return fs.existsSync(bashPathHost);
}
exports.subsystemForLinuxPresent = subsystemForLinuxPresent;
const :[fn~\w+] = (windowsPath) => {
    if (!isWindows || !windowsPath) {
        return undefined;
    }
    else if (path.isAbsolute(windowsPath)) {
        return `/mnt/${windowsPath.substr(0, 1).toLowerCase()}/${windowsPath.substr(3).replace(/\\/g, '/')}`;
    }
    else {
        return windowsPath.replace(/\\/g, '/');
    }
}
const :[fn~\w+] = (useSubsytemLinux, useExternalConsole, cwd, executable, args, program) => {
    if (useSubsytemLinux && subsystemForLinuxPresent()) {
        const bashPath32bitApp = path.join(process.env['SystemRoot'], 'Sysnative', 'bash.exe');
        const bashPath64bitApp = path.join(process.env['SystemRoot'], 'System32', 'bash.exe');
        const bashPathHost = is64bit ? bashPath64bitApp : bashPath32bitApp;
        const subsystemLinuxPath = useExternalConsole ? bashPath64bitApp : bashPathHost;
        const bashCommand = [executable].concat(args || []).map(element => {
            if (element === program) {
                element = element.replace(/\\/g, '/');
            }
            return element.indexOf(' ') > 0 ? `'${element}'` : element;
        }).join(' ');
        return {
            cwd,
            executable: subsystemLinuxPath,
            args: ['-ic', bashCommand],
            combined: [subsystemLinuxPath].concat(['-ic', bashCommand]),
            localRoot: cwd,
            remoteRoot: windowsPathToWSLPath(cwd)
        };
    }
    else {
        return {
            cwd: cwd,
            executable: executable,
            args: args || [],
            combined: [executable].concat(args || [])
        };
    }
}
exports.createLaunchArg = createLaunchArg;
const :[fn~\w+] = (useWSL, executable, args, options) => {
    const launchArgs = createLaunchArg(useWSL, false, undefined, executable, args);
    return child_process.spawn(launchArgs.executable, launchArgs.args, options);
}
exports.spawn = spawn;
const :[fn~\w+] = (useWSL, executable, args, options) => {
    const launchArgs = createLaunchArg(useWSL, false, undefined, executable, args);
    return child_process.spawnSync(launchArgs.executable, launchArgs.args, options);
}
exports.spawnSync = spawnSync;

//# sourceMappingURL=wslSupport.js.map
