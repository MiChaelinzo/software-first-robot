import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AndroidLogo, 
  RocketLaunch, 
  Cpu, 
  Lightning, 
  ChartBar,
  Network,
  Brain,
  Eye,
  ArrowRight,
  User,
  Key,
  CloudArrowUp,
  Database,
  Lock,
  CheckCircle,
  SpinnerGap
} from '@phosphor-icons/react'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onUserAuthenticated: (userData: any) => void
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
      
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        organization: formData.organization || 'Default Org',
        authenticated: true,
        timestamp: Date.now()
      }

      await window.spark.kv.set('user_session', userData)
      onUserAuthenticated(userData)
      setShowAuth(false)
    } catch (error) {
      console.error('Auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickStart = () => {
    onUserAuthenticated({
      id: 'guest',
      name: currentUser?.login || 'Guest User',
      email: currentUser?.email || 'guest@warehouse.ai',
      organization: 'Demo',
      authenticated: false,
      timestamp: Date.now()
    })
    onGetStarted()
  }

  const features = [
    {
      icon: AndroidLogo,
      title: '10 Autonomous Robots',
      description: 'AI-powered fleet with intelligent pathfinding'
    },
    {
      icon: Brain,
      title: 'Machine Learning',
      description: 'Adaptive learning from traffic patterns'
    },
    {
      icon: Network,
      title: 'Multi-Warehouse Network',
      description: 'Transfer robots between facilities'
    },
    {
      icon: Cpu,
      title: 'Digital Twin Engine',
      description: 'What-if scenario simulation'
    },
    {
      icon: Lightning,
      title: 'Real-time Analytics',
      description: 'Performance metrics and predictions'
    },
    {
      icon: Eye,
      title: '3D Visualization',
      description: 'Immersive warehouse perspective'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, oklch(0.75 0.20 145 / 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl"
      >
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center p-6 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30"
                >
                  <AndroidLogo size={64} weight="duotone" className="text-primary" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  Autonomous Warehouse
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Enterprise-grade robotics simulation platform powered by AI, machine learning, and real-time analytics
                </motion.p>

                {currentUser && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 text-sm text-accent"
                  >
                    <CheckCircle weight="fill" />
                    <span>Welcome, {currentUser.login}</span>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="glass-panel p-6 h-full hover:scale-105 transition-transform">
                      <div className="flex flex-col items-start gap-3">
                        <div className="p-3 rounded-lg bg-accent/20">
                          <feature.icon size={28} weight="duotone" className="text-accent" />
                        </div>
                        <div>
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
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 group"
                  onClick={handleQuickStart}
                >
                  <RocketLaunch size={24} weight="duotone" className="mr-2" />
                  Quick Start
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => setShowAuth(true)}
                >
                  <User size={24} weight="duotone" className="mr-2" />
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
