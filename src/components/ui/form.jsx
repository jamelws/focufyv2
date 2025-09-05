// components/ui/form.jsx
import * as React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const Form = FormProvider;

/* ---------- Contextos ---------- */
const FormFieldContext = React.createContext(undefined);
const FormItemContext = React.createContext(undefined);

/* ---------- Hook ---------- */
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField debe usarse dentro de <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField debe usarse dentro de <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/* ---------- Componentes ---------- */
export function FormField(props) {
  // props: { name, control, render, ... } de react-hook-form
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export const FormItem = React.forwardRef(function FormItem(
  { className, ...props },
  ref
) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={className} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef(function FormLabel(
  { className, ...props },
  ref
) {
  const { /* error, */ formItemId } = useFormField();
  return <Label ref={ref} className={className} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

/* React 19-safe: sin Radix <Slot/>, clona el único hijo e inyecta props/ref */
export const FormControl = React.forwardRef(function FormControl(
  { children, ...props },
  ref
) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  const child = React.Children.only(children);

  return React.cloneElement(child, {
    ref,
    id: formItemId,
    "aria-describedby": !error
      ? `${formDescriptionId}`
      : `${formDescriptionId} ${formMessageId}`,
    "aria-invalid": !!error,
    ...props,
    ...child.props,
  });
});
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef(function FormDescription(
  { className, ...props },
  ref
) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef(function FormMessage(
  { className, children, ...props },
  ref
) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
