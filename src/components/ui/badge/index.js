import { cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        hot: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        cold: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        drink: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        breakfast:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        coffee:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        nonCoffee:
          'border-transparent bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)
