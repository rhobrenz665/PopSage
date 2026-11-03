import { cn } from "@/lib/utils"

type PopSageMarkProps = {
  className?: string
  label?: string
}

function PopSageMark({ className, label }: PopSageMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path
        d="M10 28.5C10 17.73 18.73 9 29.5 9h5C45.27 9 54 17.73 54 28.5S45.27 48 34.5 48H29l-11 8v-11.8A19.45 19.45 0 0 1 10 28.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M23 33.5c8.25-.45 13.82-4.72 17-12.5 2.18 8.67-1.65 15.35-11.5 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 40c2.85-4.4 6.43-7.9 10.75-10.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export { PopSageMark }
