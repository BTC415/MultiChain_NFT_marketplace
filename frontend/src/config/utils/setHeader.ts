export default function setHeader(
  header:
    | {
      autherization?: string;
      contentType?: string;
    }
    | undefined
): object {
  return {
    Accept: "*/*",
    "Content-Type": header?.contentType || "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    //`Bearer ${header?.autherization}`,
  };
}
