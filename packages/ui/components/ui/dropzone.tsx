"use client";

import * as React from "react";
import type { DropzoneProps, DropzoneState } from "react-dropzone";
import * as rdz from "react-dropzone";
import { cn } from "@repo/ui/lib/utils";

const { useDropzone } = rdz;

export interface DropzoneComponentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  config: DropzoneProps;
  unstyled?: boolean;
}

export interface DropzoneContextValue {
  idle: boolean;
  accept: boolean;
  reject: boolean;
}

export interface DropzoneProviderProps extends DropzoneState {
  children: React.ReactNode;
}

export const DropzoneContext = React.createContext<DropzoneContextValue>({
  idle: true,
  accept: false,
  reject: false,
});

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneComponentProps>(
  ({ config, children, className, unstyled = false, ...props }, ref) => {
    const {
      getRootProps,
      getInputProps,
      isDragAccept,
      isDragReject,
      isDragActive,
    } = useDropzone({
      ...config,
    });

    const isIdle = !isDragAccept && !isDragReject;

    return (
      <DropzoneContext.Provider
        value={{ accept: isDragAccept, reject: isDragReject, idle: isIdle }}
      >
        <div
          ref={ref}
          className={cn(
            !unstyled &&
              "rounded-lg border bg-card text-card-foreground shadow-sm transition-all data-[active=true]:border-foreground data-[active=true]:border-dashed data-[accepted=true]:border-emerald-600 data-[rejected=true]:border-destructive",
            className
          )}
          {...props}
          {...getRootProps()}
          data-active={isDragActive}
          data-accepted={isDragAccept}
          data-rejected={isDragReject}
        >
          <input {...getInputProps()} />
          {children}
        </div>
      </DropzoneContext.Provider>
    );
  }
);

const DropzoneIdle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { idle } = React.useContext(DropzoneContext);

  if (idle) return <div {...props} ref={ref} />;

  return null;
});

const DropzoneAccepted = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { accept } = React.useContext(DropzoneContext);

  if (accept) return <div {...props} ref={ref} />;

  return null;
});

const DropzoneRejected = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { reject } = React.useContext(DropzoneContext);

  if (reject) return <div {...props} ref={ref} />;

  return null;
});

Dropzone.displayName = "Dropzone";
DropzoneIdle.displayName = "Dropzone/Idle";
DropzoneAccepted.displayName = "Dropzone/Accepted";
DropzoneRejected.displayName = "Dropzone/Rejected";

export { Dropzone, DropzoneIdle, DropzoneAccepted, DropzoneRejected };
