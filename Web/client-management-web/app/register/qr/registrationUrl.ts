export function registrationUrl(configured: string | undefined): string | null {
  if (!configured || configured.length > 200) return null;
  try {
    const url = new URL(configured.trim());
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    const ipv4 = host.split(".").map(Number);
    const isIpv4 = /^\d+\.\d+\.\d+\.\d+$/.test(host) && ipv4.every((part) => part >= 0 && part <= 255);
    const mappedIpv4 = host.match(/^\[::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})\]$/);
    const mappedFirstOctet = mappedIpv4 ? parseInt(mappedIpv4[1], 16) >> 8 : null;
    const privateIpv4 = isIpv4 && (ipv4[0] === 10 || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168));
    const unusableHost = !host || host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || host === "[::]" || (isIpv4 && (ipv4[0] === 127 || ipv4[0] === 0 || ipv4[0] >= 224)) || (mappedFirstOctet !== null && (mappedFirstOctet === 127 || mappedFirstOctet === 0 || mappedFirstOctet >= 224));
    if (unusableHost || url.username || url.password || url.search || url.hash || !["/", "/register", "/register/"].includes(url.pathname)) return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && privateIpv4)) return null;
    return `${url.origin}/register`;
  } catch {
    return null;
  }
}
