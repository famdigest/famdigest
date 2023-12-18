import { json } from "@remix-run/node";

export function loader() {
  return json({
    associatedApplications: [
      {
        applicationId: "f1c3e67e-e1d4-4577-9557-78a84e882a3b",
      },
    ],
  });
}
