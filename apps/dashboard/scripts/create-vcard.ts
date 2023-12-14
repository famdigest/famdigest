import fs from "fs/promises";
import path from "path";
import vCardJs from "vcards-js";

const main = async () => {
  const vcard = vCardJs();
  vcard.firstName = "FamDigest";
  vcard.organization = "FamDigest";
  vcard.url = "https://www.famdigest.com";
  vcard.workPhone = process.env.TWILIO_PHONE;

  const image = await fs.readFile(path.resolve("./scripts/logo-light.png"));
  vcard.photo.embedFromString(image.toString("base64"), "image/png");
  vcard.saveToFile(path.resolve("./public/assets/vcard.vcf"));
};

main();
