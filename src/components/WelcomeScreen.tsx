import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  Brain,
  AndroidLogo,
  ChartBar,
  ArrowRight,
  Key,
  Database,
  CheckCircle,
  Eye,
  RocketLaunch,
  Lock,
  SpinnerGap
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
        // @ts-ignore
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

      // @ts-ignore
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

      <AnimatePresence mode="wait">
        {!showAuth ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full z-10"
          >
            <div className="text-center mb-12 space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block p-4 rounded-full bg-primary/10 mb-4"
              >
                <Cpu size={64} className="text-primary" weight="duotone" />
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
              >
                Spark Warehouse Sim
              </motion.h1>
              
              <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Next-generation warehouse automation and digital twin platform
              </motion.p>

              {currentUser && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-primary"
                >
                  <CheckCircle weight="fill" />
                  <span className="text-sm">Signed in as {currentUser.name}</span>
                </motion.div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {features.slice(0, 3).map((feature, i) => (
                <Card key={i} className="p-6 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-colors">
                  <feature.icon size={32} className="text-primary mb-4" weight="duotone" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="group px-8 py-6 text-lg rounded-full"
                onClick={onGetStarted}
              >
                <RocketLaunch size={24} weight="fill" className="mr-2" />
                Launch Simulation
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {!currentUser && (
                <Button variant="ghost" onClick={() => setShowAuth(true)}>
                  Sign In / Sign Up
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md z-10"
          >
            <Card className="p-6 bg-card/95 backdrop-blur shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-muted-foreground text-sm">Sign in to sync your simulation data</p>
              </div>

              <Tabs value={authMode} onValueChange={setAuthMode}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth}>
                  <TabsContent value="signin" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-name">Full Name</Label>
                      <Input 
                        id="su-name" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email">Email</Label>
                      <Input 
                        id="su-email" 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-org">Organization</Label>
                      <Input 
                        id="su-org"
                        value={formData.organization}
                        onChange={e => setFormData({...formData, organization: e.target.value})}
                      />
                    </div>
                  </TabsContent>

                  <div className="mt-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <SpinnerGap size={20} className="animate-spin mr-2" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Key size={20} className="mr-2" />
                          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Tabs>

              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" onClick={() => setShowAuth(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}