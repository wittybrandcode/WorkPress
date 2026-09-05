<?php
/**
 * Validate all JS files as authentic ES Modules
 */

$pluginDir = dirname(__DIR__);

$dirIterator = new RecursiveDirectoryIterator( $pluginDir . '/assets/src', RecursiveDirectoryIterator::SKIP_DOTS );
$iterator = new RecursiveIteratorIterator( $dirIterator );

$errors = array();
$checked = 0;

foreach ($iterator as $file) {
    if ($file->getExtension() === 'js') {
        $checked++;
        $path = str_replace('\\', '/', $file->getPathname());
        $cmd = "node --experimental-vm-modules --disable-warning=ExperimentalWarning -e \"const fs = require('fs'); const vm = require('vm'); const code = fs.readFileSync('$path', 'utf8'); new vm.SourceTextModule(code);\" 2>&1";
        $out = trim((string) shell_exec($cmd));
        if (!empty($out)) {
            $errors[] = "Module error in $path:\n$out";
        }
    }
}

echo "Checked $checked ES Module files.\n";
if (!empty($errors)) {
    echo "Found " . count($errors) . " errors:\n";
    foreach ($errors as $e) {
        echo $e . "\n\n";
    }
    exit(1);
} else {
    echo "SUCCESS: All $checked JS files passed authentic ES Module syntax parsing with 0 errors!\n";
    exit(0);
}
