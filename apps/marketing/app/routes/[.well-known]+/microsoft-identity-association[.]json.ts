import { json } from "@remix-run/node";

export function loader() {
  return json({
    associatedApplications: [
      {
        applicationId: "7a028b07-61c1-4ea5-88c6-8db5578308ac",
      },
    ],
  });
}
