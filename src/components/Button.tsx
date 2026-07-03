import type {
    ButtonHTMLAttributes,
    ReactNode,
  } from 'react'
  
  type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
  
  type ButtonProps =
    ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: ButtonVariant
      fullWidth?: boolean
      children: ReactNode
    }
  
  function Button({
    variant = 'secondary',
    fullWidth = false,
    children,
    className = '',
    ...props
  }: ButtonProps) {
    return (
      <button
        type="button"
        className={[
          'app-button',
          `app-button-${variant}`,
          fullWidth ? 'app-button-full' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
    )
  }
  
  export default Button