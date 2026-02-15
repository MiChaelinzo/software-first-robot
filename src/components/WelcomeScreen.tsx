import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  ChartBar,
  Cube,
  RocketLaunch,
  SpinnerGap,
  Lightning,
  Graph,
  Network,
  Sparkle,
  User,
  Buildings,
  EnvelopeSimple,
  Lock,
  AndroidLogo
} from '@phosphor-icons/react'

interface WelcomeScreenProps {
  onUserAuthenticated?: (user: any) => void
  onGetStarted: () => void
}

export default function WelcomeScreen({ onUserAuthenticated, onGetStarted }: WelcomeScreenProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organization: ''
  })

  const features = [
    {
      title: 'AI-Powered Pathfinding',
      description: 'Smart collision avoidance with real-time path optimization',
      icon: Brain
    },
    {
      title: 'Adaptive Learning',
      description: 'ML algorithms optimize traffic patterns automatically',
      icon: Sparkle
    },
    {
      title: 'Digital Twin',
      description: 'Real-time simulation and what-if scenario analysis',
      icon: Cube
    },
    {
      title: 'Network Operations',
      description: 'Multi-warehouse coordination and load balancing',
      icon: Network
    },
    {
      title: '3D Visualization',
      description: 'Immersive warehouse view with real-time tracking',
      icon: Graph
    },
    {
      title: 'Live Analytics',
      description: 'Real-time metrics and predictive insights',
      icon: ChartBar
    }
  ]

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const mockUser = {
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        organization: formData.organization || 'Guest User'
      }
      await window.spark?.kv?.set('user_session', mockUser)
      onUserAuthenticated?.(mockUser)
      setTimeout(() => {
        onGetStarted()
      }, 500)
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, oklch(0.35 0.05 265 / 0.1) 0px, transparent 1px, transparent 50px, oklch(0.35 0.05 265 / 0.1) 51px),
            repeating-linear-gradient(0deg, oklch(0.35 0.05 265 / 0.1) 0px, transparent 1px, transparent 50px, oklch(0.35 0.05 265 / 0.1) 51px)
          `,
          height: '100%',
          width: '100%'
        }} />
      </div>

      <motion.div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, oklch(0.55 0.25 265 / 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '10%',
          left: '10%',
          filter: 'blur(60px)'
        }}
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, oklch(0.75 0.20 145 / 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '10%',
          right: '10%',
          filter: 'blur(60px)'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <AnimatePresence mode="wait">
        {!showAuth ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl w-full z-10 space-y-12"
          >
            <Card className="glass-panel p-8 lg:p-12">
              <div className="text-center space-y-6 mb-12">
                <motion.div 
                  style={{ 
                    background: 'linear-gradient(135deg, oklch(0.55 0.25 265) 0%, oklch(0.75 0.20 145) 100%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 20px 60px oklch(0.55 0.25 265 / 0.3)'
                  }}
                  animate={{
                    boxShadow: [
                      '0 20px 60px oklch(0.55 0.25 265 / 0.3)',
                      '0 20px 80px oklch(0.75 0.20 145 / 0.4)',
                      '0 20px 60px oklch(0.55 0.25 265 / 0.3)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <AndroidLogo size={64} weight="duotone" className="text-white" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-4">
                    Autonomous Warehouse
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Advanced robotics simulation platform with AI-powered optimization, real-time analytics, and multi-warehouse coordination
                  </p>
                </motion.div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Lightning size={14} weight="fill" className="mr-1.5" />
                    Real-time Simulation
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Brain size={14} weight="fill" className="mr-1.5" />
                    AI-Powered
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Cube size={14} weight="fill" className="mr-1.5" />
                    3D Visualization
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Card className="metric-card p-6 h-full hover:border-primary/50 transition-all">
                      <feature.icon size={32} weight="duotone" className="text-primary mb-3" />
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={onGetStarted}
                >
                  <RocketLaunch size={20} weight="duotone" className="mr-2" />
                  Launch Simulation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8"
                  onClick={() => setShowAuth(true)}
                >
                  <User size={20} weight="duotone" className="mr-2" />
                  Sign In / Sign Up
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md z-10"
          >
            <Card className="glass-panel p-8">
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex p-3 rounded-lg bg-primary/20 mb-4">
                  <AndroidLogo size={40} weight="duotone" className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your warehouse dashboard
                </p>
              </motion.div>

              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth}>
                  <TabsContent value="signin" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="si-email" className="text-sm font-semibold">Email</Label>
                      <div className="relative">
                        <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="si-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="si-password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="si-password"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-name" className="text-sm font-semibold">Full Name</Label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-name"
                          type="text"
                          required
                          placeholder="John Doe"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email" className="text-sm font-semibold">Email</Label>
                      <div className="relative">
                        <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-password"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-org" className="text-sm font-semibold">Organization (Optional)</Label>
                      <div className="relative">
                        <Buildings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-org"
                          type="text"
                          placeholder="Acme Corp"
                          className="pl-10"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="mt-6 space-y-4">
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <SpinnerGap size={20} className="animate-spin mr-2" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setShowAuth(false)}
                    >
                      Back to Welcome
                    </Button>
                  </div>
                </form>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
