import * as React from "react";
import type { Input } from "./input";
import { Label } from "./label";

import { cn } from "@repo/ui/lib/utils";

/**
 * provider style
 */
export type FormFieldProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
  };

export type FormFieldProviderProps<T extends React.ElementType> =
  FormFieldProps<T> & {
    flow?: "column" | "row";
    render: (props: FormFieldProps<T>) => React.ReactElement;
  };
const FormFieldContext = React.createContext<FormFieldProps<"input">>(
  {} as unknown as FormFieldProps<"input">
);
function useFormField() {
  return React.useContext(FormFieldContext);
}

export function FormField<T extends React.ElementType = typeof Input>({
  className,
  render,
  flow = "column",
  ...props
}: FormFieldProviderProps<T>) {
  const id = React.useId();
  const finalProps = {
    ...props,
    id: props.id ?? id,
  };

  return (
    <FormFieldContext.Provider value={finalProps}>
      <div
        className={cn(
          "flex",
          flow === "column"
            ? "flex-col gap-y-1"
            : "flex-row items-center gap-x-2",
          className
        )}
      >
        <FormLabel />
        {render(finalProps as T)}
        {flow === "column" && <FormError />}
      </div>
    </FormFieldContext.Provider>
  );
}

type FormLabelProps = React.ComponentPropsWithoutRef<"label"> & {};
export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel({ className, ...props }, ref) {
    const { label, id } = useFormField();
    if (!label) return null;
    return (
      <Label
        ref={ref}
        htmlFor={id}
        className={cn("text-sm", className)}
        {...props}
      >
        {label}
      </Label>
    );
  }
);

function FormError() {
  const { error } = useFormField();
  if (!error) return null;
  return <p className={cn("text-sm text-destructive")}>{error}</p>;
}
