import { json } from "@remix-run/node";

export async function action() {
  return json({
    ok: true,
  });
}
