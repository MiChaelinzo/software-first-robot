# Planning Guide

An autonomous warehouse robot simulation platform that demonstrates intelligent pathfinding, task prioritization, and adaptive decision-making in a dynamic fulfillment center environment.

**Experience Qualities**:
1. **Intelligent** - The system should feel smart and autonomous, with robots making real-time decisions based on environmental state and task priorities
2. **Transparent** - Users should clearly see the robot's decision-making process, current objectives, and system performance metrics in real-time
3. **Dynamic** - The simulation should feel alive with continuous activity, real-time updates, and responsive behavior to user interactions

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a sophisticated robotics simulation requiring real-time pathfinding algorithms, state management for multiple autonomous agents, collision detection, task queue management, performance analytics, and AI-driven decision making.

## Essential Features

### Multi-Robot Fleet Management
- **Functionality**: Simulate 10 autonomous warehouse robots operating simultaneously in a shared environment with advanced collision avoidance
- **Purpose**: Demonstrate coordination, collision avoidance, and parallel task execution at scale
- **Trigger**: Robots activate automatically on simulation start
- **Progression**: Robot spawns → Requests task assignment → Calculates optimal path → Executes movement → Updates status → Avoids collisions → Requests next task
- **Success criteria**: 10 robots operate without collisions, complete tasks efficiently, maintain coordination, and demonstrate priority-based yielding

### Advanced Collision Avoidance System
- **Functionality**: Multi-layered collision detection with critical distance monitoring, near-miss tracking, priority-based yielding, and adaptive speed learning based on congestion patterns
- **Purpose**: Demonstrate sophisticated spatial awareness, safe autonomous operation at scale, and intelligent traffic management
- **Trigger**: Continuous monitoring during robot movement with real-time traffic analysis
- **Progression**: Detect proximity → Calculate collision risk → Analyze traffic patterns → Adjust speed adaptively → Determine priority → Log event → Update learning model → Resume optimal operation
- **Success criteria**: Zero collisions, logged avoidance events, smooth traffic flow, priority task completion, and measurable efficiency improvements through learning

### Intelligent Pathfinding with A* Algorithm
- **Functionality**: Real-time path calculation considering obstacles, other robots, and task locations
- **Purpose**: Demonstrate autonomous navigation and adaptive behavior
- **Trigger**: Robot receives new task assignment
- **Progression**: Receives destination → Scans environment state → Calculates optimal path using A* → Executes movement with collision avoidance → Recalculates if blocked
- **Success criteria**: Robots find efficient paths, avoid collisions, and adapt to dynamic obstacles

### Dynamic Task Queue System
- **Functionality**: Priority-based task management with automatic assignment to available robots
- **Purpose**: Show intelligent task allocation and workload balancing
- **Trigger**: User creates tasks or simulation generates them automatically
- **Progression**: Task created → Added to queue with priority → System identifies available robot → Assigns based on proximity and capacity → Robot executes → Task marked complete
- **Success criteria**: Tasks assigned efficiently, queue updates in real-time, robots never idle when tasks available

### Real-Time Performance Analytics
- **Functionality**: Live metrics tracking efficiency, completion rates, robot utilization, congestion patterns, and adaptive learning performance
- **Purpose**: Validate robot performance, demonstrate system optimization, and showcase learning improvements
- **Trigger**: Continuous data collection during simulation
- **Progression**: Event occurs → Data logged → Traffic analyzed → Learning metrics updated → Dashboard updates → Historical trends tracked → Efficiency gains calculated
- **Success criteria**: Accurate metrics display, performance trends visible, insights actionable, learning improvements quantified

### Interactive Warehouse Environment
- **Functionality**: Grid-based warehouse with storage zones, charging stations, and dynamic obstacles
- **Purpose**: Provide realistic environment for robot decision-making
- **Trigger**: User configures environment or uses preset layouts
- **Progression**: User places obstacles/zones → Environment validates layout → Pathfinding updates → Robots adapt navigation
- **Success criteria**: Environment updates affect robot behavior, layout persists, zones function as intended

### AI-Powered Decision Engine
- **Functionality**: LLM-driven task prioritization, optimization suggestions, and adaptive learning system that adjusts robot speeds based on real-time congestion analysis
- **Purpose**: Demonstrate AI integration in robotics control systems and autonomous optimization capabilities
- **Trigger**: System requests optimization, user asks for insights, or congestion patterns trigger adaptive adjustments
- **Progression**: System collects current state → Analyzes traffic patterns → Generates prompt → LLM analyzes → Returns recommendations → System applies adaptive speed adjustments or presents to user → Measures efficiency gains
- **Success criteria**: Meaningful insights generated, recommendations improve efficiency, AI responds contextually, adaptive learning reduces congestion and increases throughput

### Adaptive Congestion Learning System
- **Functionality**: Real-time traffic pattern analysis with zone-based congestion tracking, historical data learning, and dynamic speed adjustments to optimize throughput
- **Purpose**: Demonstrate machine learning principles in robotics, reduce congestion, prevent collisions, and continuously improve system efficiency
- **Trigger**: Continuous analysis during simulation with speed adjustments every update cycle
- **Progression**: Analyze robot positions → Calculate zone congestion → Review historical patterns → Predict optimal speeds → Apply adaptive adjustments → Record results → Update learning model → Calculate efficiency gains
- **Success criteria**: Measurable reduction in congestion over time, improved robot throughput, fewer collision events, positive efficiency gain percentage, smooth traffic flow in high-density zones

### Heat Trail Visualization System
- **Functionality**: Real-time visualization of historical robot paths with speed-based color coding and decay effects, plus traffic heat mapping showing high-frequency zones
- **Purpose**: Provide visual insights into robot movement patterns, speed distribution, traffic hotspots, and system efficiency over time
- **Trigger**: Continuous recording during robot movement with automatic decay and cleanup
- **Progression**: Robot moves → Position recorded with speed and timestamp → Trail point added to history → Heat map cell updated → Decay applied over time → Visual overlay rendered with speed colors → Statistics calculated
- **Success criteria**: Smooth trail rendering with accurate speed colors, heat map shows traffic patterns clearly, trails fade naturally over time, performance remains optimal with multiple trails active

### 3D Warehouse Visualization
- **Functionality**: Immersive Three.js-powered 3D perspective view of the warehouse environment with real-time robot animation, path visualization, and dynamic lighting
- **Purpose**: Provide a compelling, realistic view of warehouse operations that showcases spatial awareness, depth perception, and professional presentation quality
- **Trigger**: User switches to 3D View tab
- **Progression**: Scene initializes → Camera orbits warehouse → Robots animate in 3D space → Paths render as glowing trails → Tasks float and rotate → Lighting responds to robot movement → Camera follows action
- **Success criteria**: Smooth 60fps rendering, robots move fluidly in 3D space, paths are clearly visible, warehouse elements have realistic depth and shadows, camera provides cinematic perspective

## Edge Case Handling
- **Robot Collision**: Robots detect proximity and pause/reroute to avoid collisions; congestion system learns from near-misses and adjusts speeds in high-traffic zones
- **Unreachable Destination**: Task reassigned or marked as blocked if path cannot be found after multiple attempts
- **Task Queue Empty**: Robots enter idle mode and return to charging stations
- **Simultaneous Task Assignment**: Locking mechanism ensures tasks assigned to only one robot
- **Environment Changes**: Robots recalculate paths mid-route if obstacles appear
- **Performance Degradation**: System alerts user if robot efficiency drops below threshold
- **High Congestion**: Adaptive learning system reduces speeds in congested zones and learns optimal traffic patterns over time
- **Critical Priority Tasks**: System maintains higher speeds for critical tasks even in congested areas
- **Learning Rate Adjustment**: System dynamically adjusts learning rate based on success metrics and collision avoidance performance
- **Trail Memory Overflow**: Heat trail system automatically cleans up old trail points and heat map cells to maintain performance
- **Multiple Active Trails**: System efficiently handles 10+ simultaneous robot trails with smooth rendering and minimal performance impact
- **Heat Map Saturation**: Heat map normalizes intensity values to prevent oversaturation in heavily-trafficked zones
- **3D Rendering Performance**: WebGL renderer automatically adjusts quality based on device capability; fallback to 2D view if Three.js fails to initialize
- **3D Camera Reset**: User can manually reset camera position if auto-orbit becomes disorienting
- **Multiple Simultaneous Views**: System optimizes rendering when both 2D and 3D views exist but only renders active tab

## Design Direction
The design should evoke a sense of advanced technology and precision engineering - like stepping into a mission control center for an automated warehouse. It should feel professional, data-rich, and futuristic while maintaining clarity and usability. The interface should communicate intelligent automation, real-time monitoring, and cutting-edge robotics technology.

## Color Selection
A high-tech, cyberpunk-inspired palette with electric accents on dark surfaces, evoking advanced robotics and AI systems.

- **Primary Color**: oklch(0.55 0.25 265) - Deep electric blue communicating intelligence, technology, and precision
- **Secondary Colors**: oklch(0.25 0.02 265) for dark surfaces creating depth and focus, oklch(0.35 0.05 265) for elevated panels suggesting layered interfaces
- **Accent Color**: oklch(0.75 0.20 145) - Bright cyan for robot paths, active states, and CTAs drawing attention to key interactions
- **Foreground/Background Pairings**: 
  - Primary (Electric Blue oklch(0.55 0.25 265)): White text (oklch(0.98 0 0)) - Ratio 5.2:1 ✓
  - Accent (Cyan oklch(0.75 0.20 145)): Dark text (oklch(0.20 0.02 265)) - Ratio 8.1:1 ✓
  - Background (Deep Navy oklch(0.25 0.02 265)): Light text (oklch(0.90 0.01 265)) - Ratio 10.5:1 ✓
  - Secondary (Medium Blue oklch(0.35 0.05 265)): Light text (oklch(0.95 0.01 265)) - Ratio 8.8:1 ✓

## Font Selection
Typography should communicate precision, technology, and modern engineering through geometric, technical typefaces.

- **Typographic Hierarchy**:
  - H1 (Main Title): Space Grotesk Bold / 32px / tight tracking (-0.02em) - Commands attention with technical authority
  - H2 (Section Headers): Space Grotesk SemiBold / 20px / normal tracking - Clear section delineation
  - H3 (Panel Labels): Space Grotesk Medium / 16px / slight tracking (0.01em) - Precise labeling
  - Body (Metrics/Data): JetBrains Mono Regular / 14px / normal tracking - Technical data with monospace precision
  - Small (Status Text): Space Grotesk Regular / 12px / wide tracking (0.02em) - Subtle supporting information
  - Numbers (Performance Data): JetBrains Mono Medium / varies / tabular-nums - Aligned numerical displays

## Animations
Animations should emphasize the mechanical precision and fluid intelligence of autonomous systems, with smooth pathfinding visualization and subtle UI feedback that feels responsive but never distracting.

- Robot movement: Smooth easing with slight deceleration at waypoints (cubic-bezier(0.4, 0, 0.2, 1))
- Path visualization: Animated stroke dashoffset creating "drawing" effect at 300ms
- Task assignment: Pulse animation on robot selection (200ms) followed by path trace
- Metrics updates: Number counter animations with 400ms duration for satisfaction
- Panel transitions: Slide and fade (250ms) with slight blur for depth
- Robot status changes: Color transition over 300ms with subtle scale pulse (1.05x for 150ms)
- Collision warnings: Urgent pulse at 500ms intervals with red accent
- Success celebrations: Gentle confetti burst and green glow (600ms total)
- Heat trail rendering: Smooth fade-in over 200ms with pathLength animation for line segments
- Trail decay: Gradual opacity reduction over 5 seconds creating natural fade-out effect
- Heat map cells: Emerge with 500ms fade-in and scale animation, blend mode creates layered depth
- Speed color transitions: Instant color changes based on robot speed for immediate visual feedback
- 3D robot movement: Smooth interpolated position updates with gentle floating animation (0.05 units at 5ms intervals)
- 3D camera orbit: Slow rotation around warehouse center at 0.001 radians per frame when simulation running
- 3D robot rotation: Continuous spin on moving robots at 0.05 radians per frame for dynamic feel
- 3D task indicators: Hover animation with 0.1 unit vertical oscillation at 3ms intervals
- 3D lighting: Point lights pulse with robot status changes, emissive intensity varies 0.2-0.5
- 3D path lines: Fade in/out over 300ms when paths change, glowing effect matches robot color

## Component Selection
- **Components**: 
  - Card for robot status panels and metrics dashboards with glassmorphism effect
  - Badge for robot states (idle/moving/charging) and task priorities
  - Button for simulation controls with primary/secondary variants
  - Tabs for switching between 2D simulation view, 3D immersive view, and analytics
  - Dialog for task creation and environment configuration
  - Slider for simulation speed control
  - Progress for robot battery levels and task completion
  - Table for task queue display with sortable columns
  - Tooltip for detailed robot information on hover
  - Alert for system warnings and optimization suggestions
  - Switch for 3D view controls (paths, grid, lighting)

- **Customizations**: 
  - Custom robot visualizations using SVG with directional indicators
  - Custom grid-based warehouse environment with canvas rendering
  - Custom path visualization with animated bezier curves
  - Custom performance charts using recharts with streaming data
  - Glassmorphic panels with backdrop-filter blur and subtle borders
  - Three.js 3D scene with custom robot models, warehouse geometry, and dynamic lighting
  - WebGL-powered real-time rendering with shadows, fog, and post-processing effects

- **States**: 
  - Buttons: Default (subtle glow), hover (brighter glow + lift), active (pressed inset), disabled (50% opacity)
  - Robot cards: Idle (muted), active (accent border + shadow), selected (bright accent glow), error (red pulse)
  - Task rows: Pending (normal), assigned (blue tint), in-progress (animated border), complete (green with fade-out)
  - Grid cells: Empty (subtle grid), obstacle (solid dark), storage (blue tint), charging (yellow glow), occupied (robot color)

- **Icon Selection**: 
  - Robot/AndroidLogo for fleet icons
  - Lightning for charging stations
  - Package for storage zones and tasks
  - ArrowsClockwise for pathfinding recalculation
  - Play/Pause/Stop for simulation controls
  - SpeedometerHigh for performance metrics
  - Warning for collision alerts
  - CheckCircle for completed tasks
  - Brain for AI suggestions
  - Path for heat trail visualization toggle
  - Fire for heat map overlay toggle
  - Gauge for speed indicators
  - MapPin for trail point markers
  - Cube for 3D view mode
  - GridFour for 3D grid toggle

- **Spacing**: 
  - Panel padding: p-6 for main containers, p-4 for nested cards
  - Grid gaps: gap-4 for dashboard layout, gap-2 for compact metric displays
  - Element margins: mb-6 between major sections, mb-3 between related groups
  - Icon spacing: gap-2 between icon and label in buttons/badges
  - Warehouse grid: Base cell size 40px with 1px gaps

- **Mobile**: 
  - Stack simulation view above analytics dashboard
  - Collapse robot detail panels into accordions
  - Reduce warehouse grid cell size to 24px for better fit
  - Convert metric cards to horizontal scrollable carousel
  - Move simulation controls to fixed bottom bar
  - Single column layout for all sections
  - Hamburger menu for secondary navigation
  - Touch-friendly 48px minimum touch targets
  - 3D view defaults to disabled on mobile for performance, with opt-in toggle
  - Reduced polygon count and simpler materials in mobile 3D view
  - Tab bar becomes horizontally scrollable on narrow screens
