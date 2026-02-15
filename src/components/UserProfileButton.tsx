import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { User, SignOut, Gear, CheckCircle, House } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserProfileButtonProps {
  user: any
  onSignOut: () => void
  onResetWelcome?: () => void
}

export function UserProfileButton({ user, onSignOut, onResetWelcome }: UserProfileButtonProps) {
  const [open, setOpen] = useState(false)

  const handleSignOut = () => {
    onSignOut()
    setOpen(false)
    toast.info('Signed out successfully')
  }

  const handleResetWelcome = async () => {
    await window.spark.kv.delete('has_completed_welcome')
    setOpen(false)
    if (onResetWelcome) {
      onResetWelcome()
    }
    toast.info('Welcome screen reset')
  }

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User size={18} weight="duotone" />
          <span className="hidden sm:inline">{user.name || 'User'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <User size={24} weight="duotone" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{user.name}</h4>
                  {user.authenticated && (
                    <CheckCircle size={16} weight="fill" className="text-success flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                {user.organization && (
                  <Badge variant="secondary" className="mt-2">
                    {user.organization}
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">
                  {user.authenticated ? 'Authenticated' : 'Guest'}
                </span>
              </div>
              {user.loginTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Login Time</span>
                  <span className="font-medium font-mono text-xs">
                    {new Date(user.loginTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Gear size={18} className="mr-2" />
                Settings
              </Button>
              {onResetWelcome && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleResetWelcome}
                >
                  <House size={18} className="mr-2" />
                  Show Welcome Screen
                </Button>
              )}
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <SignOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
