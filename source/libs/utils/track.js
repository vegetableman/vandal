import { api } from "./api";

export function trackUsage() {
  try {
    api(process.env.LAMBDA_TRACK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{\"usage\":\"1\"}"
    });
  } catch (ex) {
    console.error(ex.message);
  }
}

export async function trackDonate() {
  try {
    await api(process.env.LAMBDA_TRACK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{\"donate\":\"1\"}"
    });
  } catch (ex) {
    console.error(ex.message);
  }
}
