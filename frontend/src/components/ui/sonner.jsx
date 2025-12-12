import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster section"
      toastOptions={{
        classNames: {
          toast:
            "section toast section-[.toaster]:bg-background section-[.toaster]:text-foreground section-[.toaster]:border-border section-[.toaster]:shadow-lg",
          description: "section-[.toast]:text-muted-foreground",
          actionButton:
            "section-[.toast]:bg-primary section-[.toast]:text-primary-foreground",
          cancelButton:
            "section-[.toast]:bg-muted section-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
