import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  Brain,
  AndroidLogo,
  ChartBar,
  ArrowRight,
  Key,
  CheckCircle,
  Cube,
  RocketLaunch,
  Lock,
  SpinnerGap,
  Lightning,
  Graph,
  Network,
  Sparkle,
  User,
  Buildings,
  EnvelopeSimple
} from '@phosphor-icons/react'

interface WelcomeScreenProps {
  onUserAuthenticated?: (user: any) => void
  onGetStarted: () => void
}

export default function WelcomeScreen({ onUserAuthenticated, onGetStarted }: WelcomeScreenProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [showAuth, setShowAuth] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organization: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await window.spark?.user?.()
        if (user) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    checkUser()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockUser = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        organization: formData.organization || 'Guest User',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email)}&background=random`
      }

      await window.spark?.kv?.set('user_session', mockUser)
      setCurrentUser(mockUser)
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

  const features = [
    {
      title: 'Autonomous Fleet',
      icon: AndroidLogo,
      description: 'Control 10 intelligent robots with real-time pathfinding',
      color: 'oklch(0.75 0.20 145)'
    },
    {
      title: 'AI Learning',
      icon: Brain,
      description: 'Adaptive ML algorithms optimize traffic patterns',
      color: 'oklch(0.75 0.20 265)'
    },
    {
      title: 'Digital Twin',
      icon: Cube,
      description: 'Virtual replica with predictive scenario modeling',
      color: 'oklch(0.75 0.18 100)'
    },
    {
      title: 'Network Ops',
      icon: Network,
      description: 'Multi-warehouse coordination and load balancing',
      color: 'oklch(0.70 0.22 325)'
    },
    {
      title: '3D Simulation',
      icon: Graph,
      description: 'Immersive warehouse visualization with Three.js',
      color: 'oklch(0.75 0.22 25)'
    },
    {
      title: 'Live Analytics',
      icon: ChartBar,
      description: 'Real-time metrics and performance dashboards',
      color: 'oklch(0.72 0.20 200)'
    }
  ]

  const stats = [
    { value: '10', label: 'Robots', icon: AndroidLogo },
    { value: '99.8%', label: 'Uptime', icon: Lightning },
    { value: '3D', label: 'View', icon: Cube },
    { value: 'AI', label: 'Powered', icon: Sparkle }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, oklch(0.35 0.05 265 / 0.1) 0px, transparent 1px, transparent 20px),
            repeating-linear-gradient(90deg, oklch(0.35 0.05 265 / 0.1) 0px, transparent 1px, transparent 20px)
          `
        }} />
      </div>

      <motion.div
        className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.25 265 / 0.3), transparent 70%)'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.75 0.20 145 / 0.25), transparent 70%)'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 15,
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
            className="max-w-6xl w-full z-10"
          >
            <div className="text-center mb-8 sm:mb-12">
              <motion.div
                initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="inline-flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 rounded-2xl blur-xl"
                    style={{ background: 'oklch(0.75 0.20 145)' }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  <div className="relative bg-gradient-to-br from-primary to-accent p-4 sm:p-6 rounded-2xl shadow-2xl">
                    <AndroidLogo size={64} className="text-primary-foreground" weight="duotone" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-4">
                  <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                    Autonomous Warehouse
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                  Experience the future of logistics with AI-powered robotics simulation
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-mono">
                    <Lightning size={14} weight="fill" className="mr-1 text-accent" />
                    Real-time AI
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-mono">
                    <Sparkle size={14} weight="fill" className="mr-1 text-primary" />
                    Machine Learning
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-mono">
                    <Cube size={14} weight="fill" className="mr-1 text-accent" />
                    3D Visualization
                  </Badge>
                </div>

                {currentUser && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent"
                  >
                    <CheckCircle size={18} weight="fill" />
                    <span className="text-sm font-medium">Logged in as {currentUser.name}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 text-center bg-card/50 backdrop-blur border-border/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                    <stat.icon size={24} className="mx-auto mb-2 text-accent" weight="duotone" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Card className="group p-6 h-full bg-card/40 backdrop-blur border-border/50 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <div 
                      className="p-3 rounded-xl mb-4 inline-block transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon size={28} weight="duotone" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                size="lg" 
                className="group px-8 py-6 text-lg font-bold rounded-xl shadow-2xl hover:shadow-accent/30 transition-all duration-300"
                onClick={onGetStarted}
              >
                <RocketLaunch size={24} weight="fill" className="mr-2 group-hover:rotate-12 transition-transform" />
                Launch Simulation
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              {!currentUser && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold rounded-xl border-2 hover:border-accent hover:bg-accent/10"
                  onClick={() => setShowAuth(true)}
                >
                  <User size={20} className="mr-2" />
                  Sign In
                </Button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md z-10"
          >
            <Card className="p-8 bg-card/95 backdrop-blur-xl shadow-2xl border-2 border-border/50">
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Lock size={32} className="text-primary-foreground" weight="duotone" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Enter your credentials to continue</p>
              </motion.div>

              <Tabs value={authMode} onValueChange={setAuthMode}>
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50">
                  <TabsTrigger value="signin" className="font-semibold">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="font-semibold">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth}>
                  <TabsContent value="signin" className="space-y-5 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <div className="relative">
                        <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          className="pl-10 h-12"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          required
                          className="pl-10 h-12"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-5 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="su-name" className="text-sm font-semibold">Full Name</Label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="su-name" 
                          required
                          className="pl-10 h-12"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email" className="text-sm font-semibold">Email Address</Label>
                      <div className="relative">
                        <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="su-email" 
                          type="email" 
                          required
                          className="pl-10 h-12"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-org" className="text-sm font-semibold">Organization (Optional)</Label>
                      <div className="relative">
                        <Buildings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="su-org"
                          className="pl-10 h-12"
                          placeholder="Acme Inc."
                          value={formData.organization}
                          onChange={e => setFormData({...formData, organization: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="mt-8 space-y-3">
                    <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <SpinnerGap size={20} className="animate-spin mr-2" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Key size={20} className="mr-2" weight="duotone" />
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