// Common UI Components
export { default as UniversalSearch } from './UniversalSearch'
export { default as LoadingSpinner } from './LoadingSpinner'
export { LoadingSkeleton, CardSkeleton, TableSkeleton } from './LoadingSkeleton'
export { default as EmptyState } from './EmptyState'
export {
  default as ErrorBoundary,
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
} from './ErrorBoundary'
export { default as Pagination } from './Pagination'
export { default as Breadcrumbs } from './Breadcrumbs'
export { default as ConfirmDialog } from './ConfirmDialog'
export { default as BackToTop } from './BackToTop'

// Re-export existing shadcn/ui components for convenience
export { Button } from './button'
export { Input } from './input'
export { Badge } from './badge'
export { Card, CardHeader, CardTitle, CardContent } from './card'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { Progress } from './progress'
export { Label } from './label'
export { Slider } from './slider'

// Alert Dialog components
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

// Avatar components
export { Avatar, AvatarFallback, AvatarImage } from './avatar'

// Dropdown Menu components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'
