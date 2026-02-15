import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTri
  AndroidLogo, 
  Cpu, 
  ChartBa
  Brain,
  ArrowRight,
  Key,
  Database,
  CheckCirc
} from '@p
interfac
  onUs

  const
  cons
  const [formDa
    passwor
    org

    const ch
        const user = await win

      } catch (error) {
      }
    checkUser()



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
        const user = await spark.user()
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
      

    {
      title: '10 Autonomous Ro
    },
      icon: Brain,
      description: 'Adaptive
    {
      t

      icon: Cpu,
      description: 'What-if scenari
    {
      title: 'Real-ti
    },
      icon: Eye
      description: 'Immer
  ]
  r

        <motion.div
          style={{
            backgr
          animate={{
          }}
            duration: 20,
            ease: 'linear'
        />

        initial={{
   

          {!showAuth
     
              animate={{
              className="space-y-8"
              <div className="text-center space-y-4">
      
     
                >
                </motion.div>
                <motion.h1
      
     
                  Au

                  initial={{ opacity: 0, y: 20 }}
      
     
                
                {currentUser && (
                    initial={{ opacity: 0 }}
      
     
                    <s
                )}

      
     
              >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
     
   

          
                          <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        </div>
                    </Card>
                ))}

                in
                transition={{ delay: 1.2 }}
              >
            
                  on
                  <RocketLaunch size={24} weight="duoton
            

                  size="l
                  className="
                >
            
          
            

                c
                <p className="text-sm t
                </p>
                  <div className="flex
                    <span>Real-time Analytics</spa
       
                    <span>Cloud Stora
                  <div c
                    <sp
                </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0
              exit={{ opacity: 0, s
            >
                <div className="text-center mb-6">
                    <Lock s
                  <h2 className="text-2x
                    Sign in to sync your
                </div>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="mb-6">
                 
                  </TabsList>
                  <TabsConten

                        <I
                          type="email"
                          value={formData.email}
                          required
                      </div>
                 
                          id="password
                          pl

                        /
                      <Button type="submit" class
                          <>
                            Signing In...
                        ) : (
                 
                          </>
                      </But

                  <TabsContent va
                      <div cl
                        <Input
                          type="text"
                          value={formData.name}
                          required
                   
                        <Label htmlFor="signup-em
                          id="signup-email"
                          place
                  
                    

                        <
                          type="text"
                          value={formData.orga
                        />
                      <div className="space-y-2">
               
                          type="password"
                          val
                          required
                      </div>
                        {isLoading ? (
                            <SpinnerGap size={20} className="
                   
                          <>
                            Create Account
                        )}
                    </form>
                </Tabs>
                <div classNam
                    variant="ghost"
                    onClick={() => setShowAuth(false)}
                  >
                  </Button>
              </Card>
          )}
      </motion.div>
  )
























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
