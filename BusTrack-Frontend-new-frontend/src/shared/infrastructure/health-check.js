import { BaseApi } from "@/shared/infrastructure/base-api.js";

export async function checkApi() {
  const api = new BaseApi();
  try {
    const res = await api.http.get('/routes');
    console.log('[API HEALTH] /routes ->', res.status, res.data);
    return { ok: true, data: res.data };
  } catch (err) {
    console.error('[API HEALTH] error', err);
    return { ok: false, error: err };
  }
}

