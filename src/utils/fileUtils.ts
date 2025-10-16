import fs from "fs";
import path from "path";
import archiver from "archiver";

/**
 * Write lines to a text file (tab separated)
 */
export const writeHISTextFile = async (
  filename: string,
  lines: string[]
): Promise<string> => {
  const folder = path.join(process.cwd(), "uploads", "his");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filePath = path.join(folder, filename);

  // Join each line with newline
  const content = lines.join("\n");

  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
};

export const sanitize = (value: string | null | undefined) => {
  let clean = (value ?? "").replace(/\n/g, " ").replace(/\t/g, " ").trim();
  if (clean.includes('"') || clean.includes("\n") || clean.includes("\t")) {
    clean = clean.replace(/"/g, '""'); // Escape quotes
    return `"${clean}"`; // Quote the field
  }
  return clean;
};

export const pad = (count: number) => Array(count).fill("").join("\t");

export const createZipFile = async (
  files: { path: string; name: string }[],
  zipFileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const zipDir = path.join(__dirname, "../../uploads/his_zip");
    if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

    const zipPath = path.join(zipDir, zipFileName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(zipPath));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    files.forEach((file) => archive.file(file.path, { name: file.name }));
    archive.finalize();
  });
};