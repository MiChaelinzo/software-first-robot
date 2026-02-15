import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AndroidLogo,
  Cpu,
  ChartBar,
  Brain,
  ArrowRight,
  Key,
  Database,
  CheckCircle,
  Lock,
  RocketLaunch,
  CloudArrowUp,
  SpinnerGap,
  Eye
} from '@phosphor-icons/react'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onUserAuthenticated?: (userData: any) => void
}

export function WelcomeScreen({ onGetStarted, onUserAuthenticated }: WelcomeScreenProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organization: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await window.spark.user()
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

      await window.spark.kv.set('user_session', mockUser)
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
      title: '10 Autonomous Robots',
      icon: AndroidLogo,
      description: 'Real-time path planning and collision avoidance'
    },
    {
      title: 'Machine Learning',
      icon: Brain,
      description: 'Adaptive congestion detection and traffic optimization'
    },
    {
      title: 'Digital Twin',
      icon: Cpu,
      description: 'What-if scenario analysis and predictive maintenance'
    },
    {
      title: 'Real-time Analytics',
      icon: ChartBar,
      description: 'Comprehensive metrics and performance tracking'
    },
    {
      title: '3D Visualization',
      icon: Eye,
      description: 'Immersive warehouse environment with Three.js'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, oklch(0.55 0.25 265), transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-6xl"
      >
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center p-6 rounded-2xl bg-primary/20 mb-4"
                >
                  <AndroidLogo size={64} weight="duotone" className="text-primary" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  Autonomous Warehouse
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Enterprise-grade robotics simulation with AI-powered optimization, real-time analytics, and multi-warehouse networking
                </motion.p>

                {currentUser && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-2 text-accent"
                  >
                    <CheckCircle size={20} weight="fill" />
                    <span className="text-sm">Signed in as {currentUser.name}</span>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Card className="glass-panel p-6 h-full hover:scale-105 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/20">
                          <feature.icon size={24} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col items-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="group px-8 py-6 text-lg"
                >
                  <RocketLaunch size={24} weight="duotone" className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Launch Simulation
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowAuth(true)}
                  className="px-8"
                >
                  <Key size={20} className="mr-2" />
                  Sign In / Sign Up
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-center space-y-2"
              >
                <p className="text-sm text-muted-foreground">
                  Simulation-first robotics for enterprise automation
                </p>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ChartBar size={16} />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database size={16} />
                    <span>Cloud Storage</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock size={16} />
                    <span>Secure API</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <Card className="glass-panel p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center p-4 rounded-xl bg-primary/20 mb-4">
                    <Lock size={32} weight="duotone" className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in to sync your simulations across devices
                  </p>
                </div>

                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4 mt-6">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <SpinnerGap size={20} className="mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <Key size={20} className="mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          type="text"
                          placeholder="Acme Corp"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <SpinnerGap size={20} className="mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CloudArrowUp size={20} className="mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="text-center space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuth(false)}
                    className="text-muted-foreground"
                  >
                    ← Back to Welcome
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
