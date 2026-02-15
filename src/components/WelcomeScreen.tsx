import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  ChartBar,
  Key,
  Cube,
  Lock
  Lightn
  Network,
  User,
  EnvelopeSim

  onUserAuthen
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
 

        name: formData.name || formData.email.split('@')[0],
        organization: formData.organization || 'Guest User'
      }
      await window.spark?.kv?.set('user_session', mo
      onUserAuthenticated?.(mockUser)
      setTimeout(() => {
      }, 500)
      console.err
      setIsLo
  }
  co

      description: 
    },
      title
      description: 'Adaptive ML algorithms optimi
    },
      title: 'Digital Twin',
      des
    },
      title: 'Network Ops',
      d
    }
      title: '3
      de

      title: 'Live Analytics',
      description: 'Re
    }

    { val
    { value: '3D', label: 'View', icon: Cube },

  return (
      <div className="absolute inset-0 opacity-30">
          backgroundImage: `
            repeating-linear-gradient(90deg, oklch(0.35 0.05
        }} />


          background: 'radial-gradient(circle, oklch(0.55 0
        animate={{
          y: [0, -50, 0],
      
          duration: 20,
          ease: 'easeI
      />
      <motion.div
        style={{
        }}
          x: [0, -80, 0],
     
   

        }}

        {!showAuth ? (
            key="welcome
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl w-
      
     
                transition=
              >
                  <motion.div 
                    style={{ backgr
      
     
                      durati
                 
                  />
                    <AndroidLogo si
      
     
                initial={{ 
                tran
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-
                    Autonomous Ware
      
     
                </p>
                <d
                    <Lightning size={14} weight="fill" className="mr-
                  </Badge>
      
     
                    <Cube size
                  </B

                  <motion.div 
     
   

                )
            </div>
            <div className="grid grid-cols-2 sm:grid-cols
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
   

          
                  </Card>
              ))}

              {features.map(
                  key={i}
                  animate={{ opacity: 1, y: 0 }}
           
             
            

                 
                  </Card>
              ))

        }}
              anim
            >
                size="lg"
                onClick={onG
          
        transition={{
          duration: 20,
          repeat: Infinity,
                  size="lg"
        }}
      />

            </mot
        ) : (
            key=
            animate={{ opacity: 1, scale: 1 }}
          
            <Card 
                className
                animate=
                <div classNa
          
                <p cl

                <TabsList c
                  <TabsTrig

        

      <AnimatePresence mode="wait">
        {!showAuth ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
                      <div className="relativ
          >
                          type="password" 
              <motion.div
                          value={formData.password}
                        />
                    </div>

              >
                      <div className="rela
                        <Input
                          required
                          placeholder="John Doe"
                          onCh
                      </div>
                    <div className="space-y-2"
                      
                        <Input 
                          type="em
                          className="pl
                          value={formDa
                      
                    
                      <Label htmlFor="su-org" className="text-sm font-semibold">Organization (Optional)</Label>
                        <Buildings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 t
                        
                      
              </motion.div>
              
                  </TabsC
                  <div className="mt-8 space-y-
                      {isLoading ? (
                          <SpinnerGap size=
              >
                        <>
                          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                      )}
                    
                     
                
                    >
                    </Button>
                </fo

        )}
    </div>
}
































                >





                </motion.div>

            </div>




















              ))}
            </div>







              <Button 
                size="lg" 

                onClick={onGetStarted}
              >

                Launch Simulation

              </Button>
              
              {!currentUser && (








                </Button>
              )}

          </motion.div>
        ) : (
          <motion.div
            key="auth"

            animate={{ opacity: 1, scale: 1 }}

            className="w-full max-w-md z-10"
          >








                </div>




              <Tabs value={authMode} onValueChange={setAuthMode}>



                </TabsList>

                <form onSubmit={handleAuth}>

                    <div className="space-y-2">













                    </div>
                    <div className="space-y-2">













                    </div>
                  </TabsContent>


                    <div className="space-y-2">












                    </div>
                    <div className="space-y-2">













                    </div>
                    <div className="space-y-2">











                    </div>
                  </TabsContent>



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