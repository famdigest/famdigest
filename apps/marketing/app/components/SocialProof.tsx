import { Link } from "@remix-run/react";
import { Avatar, AvatarImage, Button } from "@repo/ui";
import { IconStarFilled } from "@tabler/icons-react";
import sienna from "~/assets/sienna-avatar.png";
import imageGrid from "~/assets/image-grid.png";

export function SocialProof() {
  return (
    <div className="container max-w-screen-lg bg-background text-foreground rounded-xl shadow-lg p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="flex flex-col gap-y-1.5">
        <div className="flex items-center gap-x-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <IconStarFilled key={idx} className="text-yellow-300" />
          ))}
        </div>
        <h2 className="text-4xl md:text-5xl font-medium font-serif tracking-tight pt-12 pb-6 text-slate-800">
          As a remote employee and busy parent, this service is exactly what our
          family needed.
        </h2>
        <div className="flex items-center gap-x-4">
          <Avatar>
            <AvatarImage src={sienna} alt="avatar image" />
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-medium">Sienna Hewitt</p>
            <p className="text-muted-foreground text-xs">
              Product Manager & Parent of 3
            </p>
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <img src={imageGrid} alt="" />
      </div>
    </div>
  );
}
