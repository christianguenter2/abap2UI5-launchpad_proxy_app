const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Absoluter Pfad zur Konfigurationsdatei
const configPath = path.join(__dirname, 'config.yaml');

// Konfigurationsdatei einlesen
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

// Funktion zum rekursiven Löschen eines Verzeichnisses
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

// Funktion zum Kopieren, Umbenennen und Ersetzen von Inhalten in Dateien
function copyAndRenameFiles(src, dest) {
    // Überprüfen, ob das Zielverzeichnis existiert, andernfalls erstellen
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Alle Dateien und Verzeichnisse im Quellverzeichnis lesen
    fs.readdir(src, (err, items) => {
        if (err) {
            console.error('Fehler beim Lesen des Verzeichnisses:', err);
            return;
        }

        items.forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item.replace(config.old_name, config.new_name));

            // Überprüfen, ob die Datei ausgeschlossen werden soll
            const shouldExclude = config.exclude_patterns.some(pattern => item.includes(pattern)) && !item.endsWith('wapa.xml');

            // Überprüfen, ob es sich um ein Verzeichnis handelt
            fs.stat(srcPath, (err, stats) => {
                if (err) {
                    console.error('Fehler beim Abrufen der Dateiinformationen:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // Rekursiv für Unterverzeichnisse aufrufen
                    copyAndRenameFiles(srcPath, destPath);
                } else {
                    // Datei kopieren und umbenennen
                    fs.copyFile(srcPath, destPath, err => {
                        if (err) {
                            console.error('Fehler beim Kopieren der Datei:', err);
                            return;
                        }

                        if (!shouldExclude || item.endsWith('wapa.xml')) {
                            // Inhalt ersetzen (sowohl in Klein- als auch in Großbuchstaben)
                            fs.readFile(destPath, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Fehler beim Lesen der Datei:', err);
                                    return;
                                }

                                const result = data
                                    .replace(new RegExp(config.old_name, 'g'), config.new_name)
                                    .replace(new RegExp(config.old_name.toUpperCase(), 'g'), config.new_name.toUpperCase());

                                // Datei im Zielverzeichnis speichern
                                fs.writeFile(destPath, result, 'utf8', err => {
                                    if (err) {
                                        console.error('Fehler beim Schreiben der Datei:', err);
                                    } else {
                                        console.log(`Datei kopiert und Inhalt ersetzt: ${srcPath} -> ${destPath}`);
                                    }
                                });
                            });
                        } else {
                            console.log(`Datei kopiert ohne Inhalt zu ersetzen: ${srcPath} -> ${destPath}`);
                        }
                    });
                }
            });
        });
    });
}

// Zielverzeichnis vor dem Kopieren leeren
const destDir = path.resolve(__dirname, config.destination_path);
deleteFolderRecursive(destDir);
fs.mkdirSync(destDir, { recursive: true });

// Skript für alle angegebenen Quellverzeichnisse ausführen
config.source_paths.forEach(srcPath => {
    const srcDir = path.resolve(__dirname, srcPath);
    const destSubDir = path.join(destDir, path.basename(srcPath));
    copyAndRenameFiles(srcDir, destSubDir);
});