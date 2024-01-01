import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
  Column,
  Hr,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

const baseUrl = "https://www.famdigest.com";

export default function BaseTemplate({
  preview,
  children,
}: {
  preview?: string;
  children?: React.ReactNode;
}) {
  return (
    <Tailwind>
      <Html>
        <Head />
        {preview && <Preview>{preview}</Preview>}
        <Body className="bg-slate-100 text-slate-800 font-sans p-4">
          <Container className="bg-white border border-solid border-gray-200 rounded mx-auto w-full max-w-lg">
            <Section style={{ padding: "24px" }}>
              <Column>
                <Img
                  src={`${baseUrl}/assets/images/logo.png`}
                  alt="FamDigest"
                  width={100}
                />
              </Column>
            </Section>
            <Section className="px-8">{children}</Section>
            <Section style={{ padding: "0 32px" }}>
              <Hr className="border-slate-200 my-5" />
            </Section>
            <Section style={{ padding: "0 32px 24px" }}>
              <Column>
                <Text
                  style={{
                    ...paragraph,
                    fontSize: "14px",
                    margin: "0",
                  }}
                >
                  <Link
                    style={{
                      ...link,
                      textDecoration: "underline",
                    }}
                    href={baseUrl}
                    target="_blank"
                  >
                    FamDigest
                  </Link>{" "}
                  / Never share a calendar again
                </Text>
                <Text style={{ color: "#525f7f", margin: "0" }}>
                  <Link
                    style={{
                      ...link,
                      color: "#525f7f",
                      fontSize: "12px",
                    }}
                    href="https://twitter.com/famdigest"
                    target="_blank"
                  >
                    Twitter
                  </Link>{" "}
                  |{" "}
                  <Link
                    style={{
                      ...link,
                      color: "#525f7f",
                      fontSize: "12px",
                    }}
                    href="https://www.facebook.com/usefamdigest"
                    target="_blank"
                  >
                    Facebook
                  </Link>{" "}
                  |{" "}
                  <Link
                    style={{
                      ...link,
                      color: "#525f7f",
                      fontSize: "12px",
                    }}
                    href="https://www.instagram.com/famdigest"
                    target="_blank"
                  >
                    Instagram
                  </Link>
                </Text>
              </Column>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

const link = {
  color: "#000000",
  fontSize: "14px",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};
