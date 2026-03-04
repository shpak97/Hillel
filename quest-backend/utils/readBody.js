export function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
  
      req.on("data", (chunk) => {
        body += chunk;
      });
  
      req.on("end", () => resolve(body));
      req.on("error", reject);
    });
  }
  
  export async function readJsonBody(req) {
    const raw = await readBody(req);
    if (!raw) return null;
  
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }