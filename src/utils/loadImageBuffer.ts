import fs from "fs";
import axios from "axios";

export async function loadImageBuffer(localPath: string, remoteUrl?: string) {
  try {
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    } else {
      const response = await axios.get(remoteUrl!, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    }
  } catch (err: any) {
    console.error(`Error loading image (${remoteUrl}):`, err.message);
    return null;
  }
}

export async function loadImageBufferFromUrl(remoteUrl: string) {
  try {
    const response = await axios.get(remoteUrl!, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
  } catch (err: any) {
    console.error(`Error loading image (${remoteUrl}):`, err.message);
    return null;
  }
}
