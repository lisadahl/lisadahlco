import fs from "fs";
import path from "path";
import readline from "readline";

const imagesRoot = "src/images";
const contentRoot = "src/content/comics";

// Ask a question and return the user's input
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
function dateFromFilename(filename) {
  const base = filename.replace(path.extname(filename), "");

  const yyyy = base.slice(0, 4);
  const mm = base.slice(4, 6);
  const dd = base.slice(6, 8);

  return `${yyyy} ${mm} ${dd}`;
}

function titleFromFilename(filename) {
  const base = filename.replace(path.extname(filename), ""); // remove extension

  const rawTitle = base.slice(9); // remove YYYYMMDD-

  const cleanTitle = rawTitle
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return cleanTitle; // no year added
}

// Extract image from existing frontmatter
function extractImagesFromFrontmatter(mdContent) {
  const match = mdContent.match(/!\[.*?\]\((.*?)\)/);
  if (!match) return [];
  return [match[1].split("/").pop()];
}

async function processFolder(folder) {
  const folderPath = path.join(imagesRoot, folder);

  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    console.log(`❌ Folder "${folder}" does not exist inside ${imagesRoot}`);
    return;
  }

  const images = fs
    .readdirSync(folderPath)
    .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
    .sort();

  if (images.length === 0) {
    console.log(`⚠️ No images found in folder "${folder}"`);
    return;
  }

  console.log(`\n📁 Folder: ${folder}`);
  console.log(`📸 Images detected (${images.length}):`);
  images.forEach(img => console.log("   -", img));

  const proceed = await ask("\nProceed with this folder? (y/n): ");
  if (proceed.toLowerCase() !== "y") {
    console.log(`⏭️  Skipping folder: ${folder}`);
    return;
  }

  const contentFolder = path.join(contentRoot, folder);

  // 🔥 NEW: Create folder if missing
  if (!fs.existsSync(contentFolder)) {
    fs.mkdirSync(contentFolder, { recursive: true });
    console.log(`📁 Created content folder: ${contentFolder}`);
  }

  const existingMdFiles = fs
    .readdirSync(contentFolder)
    .filter(f => f.endsWith(".md"));

  console.log(`\n🗂️  Existing .md files: ${existingMdFiles.length}`);

  for (const [index, img] of images.entries()) {
    const id = index + 1;
    const mdPath = path.join(contentFolder, `${id}.md`);

    const title = titleFromFilename(img);
    const subtitle = title;
    const date = dateFromFilename(img);
    const type = folder;
    const ogImage = `../images/${folder}/${img}`;
    const imageMarkdownPath = `../../../images/${folder}/${img}`;

    const newMdContent = `---
title: "${title}"
subtitle: "${subtitle}"
date: "${date}"
type: "${type}"
ogImage: "${ogImage}"
id: ${id}
---

![${title}](${imageMarkdownPath})
`;

    // OPTION A: Create missing file
    if (!fs.existsSync(mdPath)) {
      console.log(`\n🆕 Creating: ${mdPath}`);
      fs.writeFileSync(mdPath, newMdContent, "utf8");
      continue;
    }

    // OPTION B: Update if image changed
    const existing = fs.readFileSync(mdPath, "utf8");
    const existingImages = extractImagesFromFrontmatter(existing);

    const imageChanged =
      existingImages.length === 0 ||
      existingImages[0] !== img;

    if (!imageChanged) {
      console.log(`\n✔️ Skipping (no changes): ${mdPath}`);
      continue;
    }

    console.log(`\n🔄 Updating: ${mdPath}`);
    fs.writeFileSync(mdPath, newMdContent, "utf8");
  }
}

async function run() {
  const folder = await ask("Enter the folder name inside src/images/: ");
  await processFolder(folder);
  console.log("\n✨ Generation complete.");
}

run();