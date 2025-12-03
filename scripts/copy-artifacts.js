const fs = require('fs');
const path = require('path');

const artifactsDir = path.join(__dirname, '../artifacts');
const contractsDir = path.join(artifactsDir, 'contracts');
const frontendArtifactsDir = path.join(__dirname, '../frontend/src/artifacts');

if (!fs.existsSync(frontendArtifactsDir)) {
    fs.mkdirSync(frontendArtifactsDir, { recursive: true });
}

function copyArtifacts(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            copyArtifacts(filePath);
        } else if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
            const destPath = path.join(frontendArtifactsDir, file);
            fs.copyFileSync(filePath, destPath);
            console.log(`Copied ${file} to frontend artifacts`);
        }
    });
}

// Copy from artifacts/contracts (Hardhat structure usually puts compiled json in artifacts/contracts/File.sol/File.json)
copyArtifacts(contractsDir);

// Also check if there are flat artifacts in artifacts/ (sometimes depends on config)
// But usually it's nested. The list_dir earlier showed artifacts/ERC20Item.json directly?
// Let's check the list_dir output from step 8 again.
// It showed:
// {"name":"ERC1155Item.json","sizeBytes":"1187743"}
// ...
// So they are directly in artifacts/ ?
// Wait, step 7 showed contracts/ has .sol files.
// Step 8 showed artifacts/ has .json files directly.
// So I should copy from artifactsDir directly too.

const rootArtifactsFiles = fs.readdirSync(artifactsDir);
rootArtifactsFiles.forEach(file => {
    if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
        const src = path.join(artifactsDir, file);
        const dest = path.join(frontendArtifactsDir, file);
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file} to frontend artifacts`);
    }
});

console.log('Artifacts copy complete.');
