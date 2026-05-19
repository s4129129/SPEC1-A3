(function () {
  // Quick art-direction numbers live here on purpose so they are easy to tweak
  // without digging through the long control schema further down.
  const QUICK_TUNE_VALUES = Object.freeze({
    canvasTextScale: 24,
    canvasTextShadowOffsetX: 0,
    canvasTextShadowOffsetY: 2,
    canvasTextShadowBlur: 10,
    canvasTextShadowAlpha: 148,
    secondsToFinalCycle: 20,
    cycleLeaderSpeedGrowthPerCycle: 0.38,
    cycleFollowerSpeedGrowthPerCycle: 0.32,
  });

  // Expose the quick-tune block so the canvas can read the same top-of-file art-direction numbers directly.
  window.BoidQuickTunes = { ...QUICK_TUNE_VALUES };

  // UI control model for the SDG 13 simulation.
  // Each entry defines one adjustable parameter and a concise explanation.
  const DEFAULT_CONFIG = Object.freeze({
    autonomousLeaderCount: 15,
    minFollowersPerLeader: 3,
    maxFollowersPerLeader: 7,
    userFollowerCount: 6,

    leaderSize: 32,
    bigLeaderSize: 100,
    followerSizeMin: 18,
    followerSizeMax: 42,
    globalElementScale: 1,
    userLeaderScale: 2,
    smallLeaderScale: 2,
    macroLeaderScale: 2,
    followerScale: 2,
    narrativeCubeScale: 2,
    droppedShapeScale: 1,
    overlayTextScale: QUICK_TUNE_VALUES.canvasTextScale,
    overlayTextShadowOffsetX: QUICK_TUNE_VALUES.canvasTextShadowOffsetX,
    overlayTextShadowOffsetY: QUICK_TUNE_VALUES.canvasTextShadowOffsetY,
    overlayTextShadowBlur: QUICK_TUNE_VALUES.canvasTextShadowBlur,
    overlayTextShadowAlpha: QUICK_TUNE_VALUES.canvasTextShadowAlpha,
    gridLineScale: 1,
    referenceLineScale: 1,
    bigFollowerCount: 0,

    leaderMaxSpeed: 6.8,
    leaderMaxForce: 0.34,
    separationRadius: 68,
    alignmentRadius: 116,
    cohesionRadius: 132,
    separationWeight: 1.74,
    alignmentWeight: 0.34,
    cohesionWeight: 0.42,
    wanderWeight: 1.18,
    wanderJitter: 0.66,
    wanderCircleRadius: 62,
    wanderCircleDistance: 18,
    bigLeaderSpeed: 6.4,
    bigLeaderForce: 0.24,
    bigLeaderWander: 1.05,
    bigLeaderSpacingRadius: 180,

    influenceFollowWeight: 3.25,
    influenceColorLerp: 0.024,
    assimilationRadius: 140,
    secondsToFinalCycle: QUICK_TUNE_VALUES.secondsToFinalCycle,
    sequenceSpeedMultiplier: 2,
    cycleReturnDelaySeconds: 6,
    finalHurtBlobCoverSeconds: 10.8,
    minCycleReturnDelaySeconds: 0.5,
    cycleReturnAccelerationPerCycle: 0,
    assimilationRampPerCycle: 1,
    cycleFollowerStartFactor: 0.55,
    cycleFollowerGrowthPerCycle: 0.16,
    cycleFollowerMaxFactor: 1,
    cycleLeaderSpeedGrowthPerCycle:
      QUICK_TUNE_VALUES.cycleLeaderSpeedGrowthPerCycle,
    cycleFollowerSpeedGrowthPerCycle:
      QUICK_TUNE_VALUES.cycleFollowerSpeedGrowthPerCycle,

    referencePatternCells: 24,
    referencePatternPhaseDivisor: 420,
    referencePatternMorphDrift: 0.001,
    referencePatternWarpStrength: 10,
    referencePatternLineDriftDivisor: 26,
    referencePatternShuffleIntervalFrames: 500,
    referencePatternOpacity: 85,

    userAcceleration: 0.85,
    userMaxSpeed: 4.6,
    userDrag: 0.95,

    followerFollowStrength: 1.22,
    followerMaxSpeed: 13.8,
    followerDrag: 0.93,
    followerOrbitRadiusMin: 20,
    followerOrbitRadiusMax: 75,
    followerOrbitJitter: 0.82,
    followerTrailBias: 0.18,
    droppedPhysicsDurationSeconds: 4,
    droppedFreezeVelocity: 0.12,
    droppedMinSettledFrames: 14,
    maxDynamicDroppedShapes: 40,
    droppedStaticShrinkRatio: 1,
    droppedStaticShrinkDurationMs: 220,

    backdropDrift: 0.42,
    shadowOffsetMinPx: 0.8,
    shadowOffsetBaseFactor: 0.04,
    shadowOffsetInfluenceFactor: 0.07,
    gridDensity: 64,
    gridLineOpacity: 77,
    roomLockShapeThreshold: 90,
    roomPortalRadiusFactor: 0.55,
    roomPortalCommitFactor: 1,
    halftoneSpacing: 10,

    headingSmoothing: 0.58,
    macroExitSpeed: 10.2,
    macroExitForce: 0.36,
    macroDespawnMargin: 1.15,
    userRejectRadius: 110,
    userRejectWeight: 0.9,
    previewFollowLerp: 0.08,
  });

  const CONTROL_SCHEMA = [
    {
      group: "Population",
      key: "autonomousLeaderCount",
      label: "Small Trend Leaders",
      description:
        "Desktop target for autonomous triangle leaders. Smaller screens scale this down automatically.",
      type: "range",
      min: 3,
      max: 30,
      step: 1,
    },
    {
      group: "Population",
      key: "minFollowersPerLeader",
      label: "Min Consumer Items",
      description:
        "Minimum random follower item count for each small leader. Keep this lower than Max Consumer Items.",
      type: "range",
      min: 1,
      max: 16,
      step: 1,
    },
    {
      group: "Population",
      key: "maxFollowersPerLeader",
      label: "Max Consumer Items",
      description:
        "Maximum random follower item count for each small leader. Higher values create busier swarms.",
      type: "range",
      min: 1,
      max: 24,
      step: 1,
    },
    {
      group: "Population",
      key: "userFollowerCount",
      label: "User Consumer Items",
      description:
        "User follower count is intentionally fixed to 6 to keep player identity consistent across all cycles.",
      type: "range",
      min: 6,
      max: 6,
      step: 1,
    },
    {
      group: "Population",
      key: "bigFollowerCount",
      label: "Macro Leader Items",
      description:
        "Locked at zero so big macro trend leaders stay visually clean; small swarms carry the follower clutter.",
      type: "range",
      min: 0,
      max: 0,
      step: 1,
    },

    {
      group: "Scale",
      key: "leaderSize",
      label: "Small Leader Size",
      description: "Visual size of regular autonomous small triangle leaders.",
      type: "range",
      min: 8,
      max: 30,
      step: 1,
    },
    {
      group: "Scale",
      key: "bigLeaderSize",
      label: "Macro Leader Size",
      description:
        "Visual size of the 3 big trend triangles that attract smaller groups.",
      type: "range",
      min: 24,
      max: 90,
      step: 1,
    },
    {
      group: "Scale",
      key: "followerSizeMin",
      label: "Item Min Size",
      description: "Minimum rendered size for consumer item follower shapes.",
      type: "range",
      min: 4,
      max: 24,
      step: 1,
    },
    {
      group: "Scale",
      key: "followerSizeMax",
      label: "Item Max Size",
      description: "Maximum rendered size for consumer item follower shapes.",
      type: "range",
      min: 5,
      max: 32,
      step: 1,
    },
    {
      group: "Scale",
      key: "globalElementScale",
      label: "Global Element Scale",
      description:
        "Master multiplier for all shape, text, and line scale multipliers.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "smallLeaderScale",
      label: "Small Leader Scale",
      description: "Scale multiplier for non-user small autonomous leaders.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "macroLeaderScale",
      label: "Macro Leader Scale",
      description: "Scale multiplier for large macro trend leaders.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "followerScale",
      label: "Follower Scale",
      description: "Scale multiplier for orbiting follower items.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "narrativeCubeScale",
      label: "Narrative Cube Scale",
      description: "Scale multiplier for intro interaction cubes.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "droppedShapeScale",
      label: "Intro Drop Scale",
      description:
        "Scale multiplier for intro cube drops. Follower drops keep their live follower size.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Typography",
      key: "overlayTextScale",
      label: "Overlay Text Size (px)",
      description: "Direct pixel size for canvas prompt and completion text.",
      type: "range",
      min: 20,
      max: 260,
      step: 1,
    },
    {
      group: "Scale",
      key: "gridLineScale",
      label: "Cell Texture Scale",
      description:
        "Scale multiplier for texture density inside each room cell backdrop tile.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      group: "Scale",
      key: "referenceLineScale",
      label: "Reference Line Scale",
      description:
        "Scale multiplier for the frozen cell separator lines in the backdrop.",
      type: "range",
      min: 0.4,
      max: 3,
      step: 0.01,
    },

    {
      group: "Small Leader AI",
      key: "leaderMaxSpeed",
      label: "Small Leader Max Speed",
      description:
        "Top velocity of normal small autonomous leaders during regular boid motion.",
      type: "range",
      min: 0.4,
      max: 7,
      step: 0.1,
    },
    {
      group: "Small Leader AI",
      key: "leaderMaxForce",
      label: "Small Leader Max Force",
      description:
        "Steering force cap for small leaders. Larger values make turns snappier.",
      type: "range",
      min: 0.01,
      max: 0.8,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "separationRadius",
      label: "Separation Radius",
      description: "Distance at which small leaders push away from each other.",
      type: "range",
      min: 8,
      max: 220,
      step: 1,
    },
    {
      group: "Small Leader AI",
      key: "alignmentRadius",
      label: "Alignment Radius",
      description: "Distance for matching heading with nearby small leaders.",
      type: "range",
      min: 12,
      max: 260,
      step: 1,
    },
    {
      group: "Small Leader AI",
      key: "cohesionRadius",
      label: "Cohesion Radius",
      description: "Distance for steering toward local group center.",
      type: "range",
      min: 12,
      max: 280,
      step: 1,
    },
    {
      group: "Small Leader AI",
      key: "separationWeight",
      label: "Separation Weight",
      description:
        "Relative strength of crowd avoidance in the small leader flock.",
      type: "range",
      min: 0,
      max: 3,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "alignmentWeight",
      label: "Alignment Weight",
      description:
        "Relative strength of heading alignment in the small leader flock.",
      type: "range",
      min: 0,
      max: 3,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "cohesionWeight",
      label: "Cohesion Weight",
      description:
        "Relative strength of group-centering behavior in the small leader flock.",
      type: "range",
      min: 0,
      max: 3,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "wanderWeight",
      label: "Wander Weight",
      description:
        "Ambient random drift blended into normal small leader movement.",
      type: "range",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "wanderJitter",
      label: "Wander Jitter",
      description: "How quickly small leaders change their wander direction.",
      type: "range",
      min: 0,
      max: 1.4,
      step: 0.01,
    },
    {
      group: "Small Leader AI",
      key: "wanderCircleRadius",
      label: "Wander Circle Radius",
      description:
        "Radius of the wander steering circle used by small leaders.",
      type: "range",
      min: 4,
      max: 120,
      step: 1,
    },
    {
      group: "Small Leader AI",
      key: "wanderCircleDistance",
      label: "Wander Circle Distance",
      description:
        "Distance of wander steering circle projection in front of small leaders.",
      type: "range",
      min: 4,
      max: 120,
      step: 1,
    },
    {
      group: "Macro Leader AI",
      key: "bigLeaderSpeed",
      label: "Macro Leader Max Speed",
      description: "Top velocity of the 3 large trend leaders.",
      type: "range",
      min: 0.2,
      max: 8,
      step: 0.01,
    },
    {
      group: "Macro Leader AI",
      key: "bigLeaderForce",
      label: "Macro Leader Max Force",
      description:
        "Steering force cap for macro leaders. Higher values mean sharper turns.",
      type: "range",
      min: 0.005,
      max: 0.4,
      step: 0.005,
    },
    {
      group: "Macro Leader AI",
      key: "bigLeaderWander",
      label: "Macro Leader Wander",
      description:
        "Amount of random drift macro leaders use while roaming the field.",
      type: "range",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "Macro Leader AI",
      key: "bigLeaderSpacingRadius",
      label: "Macro Leader Spacing",
      description: "Minimum preferred spacing between the big trend leaders.",
      type: "range",
      min: 40,
      max: 360,
      step: 1,
    },

    {
      group: "Assimilation",
      key: "influenceFollowWeight",
      label: "Attach Follow Strength",
      description:
        "Steering weight used while small leaders actively follow macro leaders.",
      type: "range",
      min: 0.1,
      max: 6,
      step: 0.01,
    },
    {
      group: "Assimilation",
      key: "influenceColorLerp",
      label: "Color & Shape Assimilation Rate",
      description:
        "Speed at which attached small leaders shift triangle and follower look toward macro leader identity.",
      type: "range",
      min: 0.001,
      max: 0.1,
      step: 0.001,
    },
    {
      group: "Assimilation",
      key: "assimilationRadius",
      label: "Assimilation Distance",
      description:
        "Small leaders only assimilate if they are physically near their assigned macro leader within this radius.",
      type: "range",
      min: 20,
      max: 420,
      step: 1,
    },
    {
      group: "Assimilation",
      key: "sequenceSpeedMultiplier",
      label: "Sequence Speed Multiplier",
      description:
        "Global speed factor for cycle timing and assimilation progression. Higher values compress the 6->4->2->1->0.5 cycle profile further.",
      type: "range",
      min: 0.25,
      max: 4,
      step: 0.05,
    },
    {
      group: "Assimilation",
      key: "cycleReturnDelaySeconds",
      label: "Base Cycle Return Delay (s)",
      description:
        "Scale anchor for the cycle return profile (6->4->2->1->0.5s). Raising this scales each step proportionally.",
      type: "range",
      min: 0.5,
      max: 40,
      step: 0.5,
    },
    {
      group: "Assimilation",
      key: "finalHurtBlobCoverSeconds",
      label: "Final Blob Cover Time (s)",
      description:
        "How long the final black corruption blob takes to grow until it fully covers the scene.",
      type: "range",
      min: 2,
      max: 30,
      step: 0.1,
    },
    {
      group: "Assimilation",
      key: "minCycleReturnDelaySeconds",
      label: "Minimum Return Delay (s)",
      description:
        "Lower clamp applied after profile scaling so cycle transitions never drop below this floor.",
      type: "range",
      min: 0,
      max: 20,
      step: 0.5,
    },
    {
      group: "Assimilation",
      key: "cycleReturnAccelerationPerCycle",
      label: "Return Delay Reduction / Cycle",
      description:
        "Additional profile-step bias per cycle. Higher values jump through the 6->4->2->1->0.5 profile more aggressively.",
      type: "range",
      min: 0,
      max: 4,
      step: 0.05,
    },
    {
      group: "Assimilation",
      key: "assimilationRampPerCycle",
      label: "Assimilation Ramp / Cycle",
      description:
        "Primary ramp factor for profile stepping each cycle. Values above 1 accelerate convergence toward the 0.5s endpoint.",
      type: "range",
      min: 0,
      max: 3,
      step: 0.05,
    },
    {
      group: "Assimilation",
      key: "cycleFollowerStartFactor",
      label: "Early Cycle Follower Scale",
      description:
        "Starting follower multiplier for non-user leaders at cycle 1. Lower values create sparse opening waves.",
      type: "range",
      min: 0.1,
      max: 1,
      step: 0.01,
    },
    {
      group: "Assimilation",
      key: "cycleFollowerGrowthPerCycle",
      label: "Follower Growth / Cycle",
      description:
        "How much non-user follower density increases each cycle until it reaches the cap.",
      type: "range",
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    {
      group: "Assimilation",
      key: "cycleFollowerMaxFactor",
      label: "Follower Scale Cap",
      description: "Upper cap for follower scaling as cycles progress.",
      type: "range",
      min: 0.2,
      max: 1.4,
      step: 0.01,
    },
    {
      group: "Assimilation",
      key: "cycleLeaderSpeedGrowthPerCycle",
      label: "Leader Speed Growth / Cycle",
      description:
        "Extra small-leader speed added after each completed cycle so swarms can reach macro leaders sooner.",
      type: "range",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "Assimilation",
      key: "cycleFollowerSpeedGrowthPerCycle",
      label: "Follower Speed Growth / Cycle",
      description:
        "Extra speed added to small-swarm follower shapes each completed cycle so they keep pace with faster leaders.",
      type: "range",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "Followers",
      key: "followerFollowStrength",
      label: "Follower Follow Strength",
      description:
        "Steering force followers use to stay with their leader orbit target.",
      type: "range",
      min: 0.01,
      max: 1.6,
      step: 0.01,
    },
    {
      group: "Followers",
      key: "followerMaxSpeed",
      label: "Follower Max Speed",
      description: "Maximum follower shape velocity.",
      type: "range",
      min: 0.2,
      max: 16,
      step: 0.1,
    },
    {
      group: "Followers",
      key: "followerDrag",
      label: "Follower Drag",
      description: "Motion damping of follower items.",
      type: "range",
      min: 0.6,
      max: 0.99,
      step: 0.01,
    },
    {
      group: "Followers",
      key: "followerOrbitRadiusMin",
      label: "Follower Orbit Min",
      description: "Minimum orbit radius for item followers around any leader.",
      type: "range",
      min: 6,
      max: 120,
      step: 1,
    },
    {
      group: "Followers",
      key: "followerOrbitRadiusMax",
      label: "Follower Orbit Max",
      description: "Maximum orbit radius for item followers around any leader.",
      type: "range",
      min: 10,
      max: 220,
      step: 1,
    },
    {
      group: "Followers",
      key: "followerOrbitJitter",
      label: "Follower Orbit Jitter",
      description: "Wobble amount in follower orbits.",
      type: "range",
      min: 0,
      max: 1.5,
      step: 0.01,
    },
    {
      group: "Followers",
      key: "followerTrailBias",
      label: "Follower Trail Bias",
      description:
        "How strongly followers chain behind previous followers for ribbon-like motion.",
      type: "range",
      min: 0,
      max: 0.95,
      step: 0.01,
    },
    {
      group: "Dropped Item Physics",
      key: "droppedPhysicsDurationSeconds",
      label: "Dynamic Fall Duration (s)",
      description:
        "How long dropped items remain in active physics before they can be frozen as static pile geometry.",
      type: "range",
      min: 0,
      max: 14,
      step: 0.1,
    },
    {
      group: "Dropped Item Physics",
      key: "droppedFreezeVelocity",
      label: "Freeze Speed Threshold",
      description:
        "Dropped items below this speed are eligible to freeze after the dynamic window ends.",
      type: "range",
      min: 0.01,
      max: 1,
      step: 0.01,
    },
    {
      group: "Dropped Item Physics",
      key: "droppedMinSettledFrames",
      label: "Min Settled Frames",
      description:
        "How many grounded low-motion frames are required before freezing is allowed.",
      type: "range",
      min: 0,
      max: 80,
      step: 1,
    },
    {
      group: "Dropped Item Physics",
      key: "maxDynamicDroppedShapes",
      label: "Max Dynamic Dropped Items",
      description:
        "Desktop cap for active dropped bodies. Smaller screens scale this down automatically.",
      type: "range",
      min: 0,
      max: 1200,
      step: 1,
    },
    {
      group: "Dropped Item Physics",
      key: "droppedStaticShrinkRatio",
      label: "Static Drop Shrink Ratio",
      description:
        "Scale ratio for instant-in-place dropped swarm shapes after they settle into the top-down floor plane.",
      type: "range",
      min: 0.5,
      max: 1,
      step: 0.01,
    },
    {
      group: "Dropped Item Physics",
      key: "droppedStaticShrinkDurationMs",
      label: "Static Drop Shrink Duration (ms)",
      description:
        "How long the in-place shrink transition lasts for dropped swarm shapes.",
      type: "range",
      min: 0,
      max: 2000,
      step: 10,
    },

    {
      group: "Reference Pattern",
      key: "referencePatternCells",
      label: "Pattern Cells",
      description: "Cell count for imported backdrop pattern.",
      type: "range",
      min: 16,
      max: 60,
      step: 1,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternPhaseDivisor",
      label: "Pattern Phase Divisor",
      description: "Higher values slow the imported pattern phase motion.",
      type: "range",
      min: 120,
      max: 520,
      step: 1,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternMorphDrift",
      label: "Pattern Morph Drift",
      description: "How quickly the imported pattern random state evolves.",
      type: "range",
      min: 0.0002,
      max: 0.02,
      step: 0.0001,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternWarpStrength",
      label: "Pattern Warp Strength",
      description: "Shear intensity for imported pattern tiles.",
      type: "range",
      min: 4,
      max: 90,
      step: 1,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternLineDriftDivisor",
      label: "Pattern Line Drift Divisor",
      description: "Higher values slow line drift in imported pattern tiles.",
      type: "range",
      min: 2,
      max: 36,
      step: 1,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternShuffleIntervalFrames",
      label: "Pattern Shuffle Interval (frames)",
      description:
        "How long a cell layout is held before a new random tiling is generated.",
      type: "range",
      min: 30,
      max: 1200,
      step: 1,
    },
    {
      group: "Reference Pattern",
      key: "referencePatternOpacity",
      label: "Pattern Overlay Opacity",
      description: "Opacity of imported pattern layer over the backdrop.",
      type: "range",
      min: 0,
      max: 255,
      step: 1,
    },

    {
      group: "Visual Pattern",
      key: "backdropDrift",
      label: "Pattern Drift",
      description: "Speed of subtle motion in shape pattern overlays.",
      type: "range",
      min: 0,
      max: 2.2,
      step: 0.01,
    },
    {
      group: "Visual Pattern",
      key: "shadowOffsetMinPx",
      label: "Shadow Min Offset (px)",
      description:
        "Minimum offset for shape drop shadows. Lower values keep the shadow tighter to the shape.",
      type: "range",
      min: 0,
      max: 8,
      step: 0.1,
    },
    {
      group: "Visual Pattern",
      key: "shadowOffsetBaseFactor",
      label: "Shadow Base Offset Factor",
      description:
        "Base shadow offset relative to shape size before distance influence is added.",
      type: "range",
      min: 0,
      max: 0.3,
      step: 0.005,
    },
    {
      group: "Visual Pattern",
      key: "shadowOffsetInfluenceFactor",
      label: "Shadow Extra Offset Factor",
      description: "Extra bottom-right shadow offset relative to shape size.",
      type: "range",
      min: 0,
      max: 0.4,
      step: 0.005,
    },
    {
      group: "Visual Pattern",
      key: "gridDensity",
      label: "Cell Density",
      description:
        "Size of backdrop routing cells. Lower values create denser room cells.",
      type: "range",
      min: 8,
      max: 56,
      step: 1,
    },
    {
      group: "Visual Pattern",
      key: "gridLineOpacity",
      label: "Cell Texture Opacity",
      description:
        "Opacity of per-cell texture overlays (used instead of explicit grid lines).",
      type: "range",
      min: 0,
      max: 255,
      step: 1,
    },
    {
      group: "Visual Pattern",
      key: "roomLockShapeThreshold",
      label: "Room Lock Threshold",
      description:
        "If a room reaches this many shapes, all four room entrances become blocked.",
      type: "range",
      min: 8,
      max: 420,
      step: 1,
    },
    {
      group: "Visual Pattern",
      key: "roomPortalRadiusFactor",
      label: "Portal Radius Factor",
      description:
        "Collision radius factor used for room-edge portal detection per shape size.",
      type: "range",
      min: 0.2,
      max: 0.9,
      step: 0.01,
    },
    {
      group: "Visual Pattern",
      key: "roomPortalCommitFactor",
      label: "Portal Commit Factor",
      description:
        "How far the shape center must cross before the portal transfer commits.",
      type: "range",
      min: 0.5,
      max: 1.8,
      step: 0.01,
    },
    {
      group: "Visual Pattern",
      key: "halftoneSpacing",
      label: "Pattern Shape Spacing",
      description:
        "Density of internal pattern marks drawn inside leaders and follower shapes.",
      type: "range",
      min: 4,
      max: 24,
      step: 1,
    },
    {
      group: "Visual Pattern",
      key: "headingSmoothing",
      label: "Triangle Heading Smoothing",
      description:
        "Smooths leader triangle orientation to reduce jitter while turning.",
      type: "range",
      min: 0.02,
      max: 0.9,
      step: 0.01,
    },
    {
      group: "Visual Pattern",
      key: "previewFollowLerp",
      label: "Preview Camera Smoothness",
      description:
        "How smoothly the small preview window follows the full-size world canvas.",
      type: "range",
      min: 0.01,
      max: 0.5,
      step: 0.01,
    },
    {
      group: "Post Trend Behavior",
      key: "macroExitSpeed",
      label: "Macro Exit Speed",
      description:
        "Speed used when big trend leaders leave the world after everyone is assimilated.",
      type: "range",
      min: 1,
      max: 12,
      step: 0.1,
    },
    {
      group: "Post Trend Behavior",
      key: "macroExitForce",
      label: "Macro Exit Steering Force",
      description:
        "Steering force for macro leader escape trajectory before despawn.",
      type: "range",
      min: 0.01,
      max: 1,
      step: 0.01,
    },
    {
      group: "Post Trend Behavior",
      key: "macroDespawnMargin",
      label: "Macro Despawn Outer Margin",
      description:
        "How far outside the screen macro leaders must travel before being considered gone.",
      type: "range",
      min: 0.2,
      max: 2.8,
      step: 0.01,
    },
    {
      group: "Post Trend Behavior",
      key: "userRejectRadius",
      label: "Post-Trend User Avoid Radius",
      description:
        "After macro leaders despawn, assimilated small leaders avoid the user inside this distance.",
      type: "range",
      min: 0,
      max: 320,
      step: 1,
    },
    {
      group: "Post Trend Behavior",
      key: "userRejectWeight",
      label: "Post-Trend User Avoid Weight",
      description:
        "Strength of the post-trend avoidance response from small leaders.",
      type: "range",
      min: 0,
      max: 3,
      step: 0.01,
    },
  ];

  const listeners = new Set();
  const config = { ...DEFAULT_CONFIG };
  const inputMap = new Map();
  const valueMap = new Map();
  const schemaMap = new Map(
    CONTROL_SCHEMA.map((schema) => [schema.key, schema]),
  );

  function cloneConfig() {
    return { ...config };
  }

  function clamp(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
  }

  function decimalPlaces(step) {
    if (!Number.isFinite(step)) {
      return 0;
    }

    const parts = String(step).split(".");
    return parts[1] ? parts[1].length : 0;
  }

  function formatValue(schema, value) {
    if (schema.type === "checkbox") {
      return value ? "On" : "Off";
    }

    if (Number.isInteger(schema.step)) {
      return String(Math.round(value));
    }

    return Number(value).toFixed(decimalPlaces(schema.step));
  }

  function normalizeLinkedRanges() {
    if (config.minFollowersPerLeader > config.maxFollowersPerLeader) {
      config.maxFollowersPerLeader = config.minFollowersPerLeader;
    }

    if (config.followerSizeMin > config.followerSizeMax) {
      config.followerSizeMax = config.followerSizeMin;
    }

    if (config.followerOrbitRadiusMin > config.followerOrbitRadiusMax) {
      config.followerOrbitRadiusMax = config.followerOrbitRadiusMin;
    }

    if (config.minCycleReturnDelaySeconds > config.cycleReturnDelaySeconds) {
      config.minCycleReturnDelaySeconds = config.cycleReturnDelaySeconds;
    }

    if (config.cycleFollowerStartFactor > config.cycleFollowerMaxFactor) {
      config.cycleFollowerMaxFactor = config.cycleFollowerStartFactor;
    }
  }

  function syncControl(key) {
    const schema = schemaMap.get(key);
    const input = inputMap.get(key);
    const valueBadge = valueMap.get(key);

    if (!schema || !input || !valueBadge) {
      return;
    }

    if (schema.type === "checkbox") {
      input.checked = Boolean(config[key]);
    } else {
      input.value = String(config[key]);
    }

    valueBadge.textContent = formatValue(schema, config[key]);
  }

  function syncAllControls() {
    for (const key of Object.keys(config)) {
      syncControl(key);
    }
  }

  function notify(changedKey) {
    const snapshot = cloneConfig();

    for (const listener of listeners) {
      listener(snapshot, changedKey);
    }
  }

  function updateConfigValue(key, rawValue) {
    const schema = schemaMap.get(key);

    if (!schema) {
      return;
    }

    if (schema.type === "checkbox") {
      config[key] = Boolean(rawValue);
    } else {
      const parsed = Number(rawValue);

      if (!Number.isFinite(parsed)) {
        return;
      }

      config[key] = clamp(parsed, schema.min, schema.max);
    }

    normalizeLinkedRanges();
    syncAllControls();
    notify(key);
  }

  function resetDefaults() {
    Object.assign(config, DEFAULT_CONFIG);
    normalizeLinkedRanges();
    syncAllControls();
    notify("__reset__");
  }

  function buildControlRow(schema) {
    const row = document.createElement("div");
    row.className = "control-row";

    const meta = document.createElement("div");
    meta.className = "control-row-meta";

    const label = document.createElement("label");
    label.className = "control-label";
    label.htmlFor = `control-${schema.key}`;
    label.textContent = schema.label;

    const value = document.createElement("output");
    value.className = "control-value";
    value.id = `control-value-${schema.key}`;

    meta.append(label, value);

    const input = document.createElement("input");
    input.className = "control-input";
    input.id = `control-${schema.key}`;

    if (schema.type === "checkbox") {
      row.classList.add("control-row-toggle");
      input.type = "checkbox";
      input.addEventListener("change", (event) => {
        updateConfigValue(schema.key, event.target.checked);
      });
    } else {
      input.type = "range";
      input.min = String(schema.min);
      input.max = String(schema.max);
      input.step = String(schema.step);

      // Prevent accidental value changes when the page/control panel is scrolled.
      input.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
        },
        { passive: false },
      );

      input.addEventListener("input", (event) => {
        updateConfigValue(schema.key, event.target.value);
      });
    }

    inputMap.set(schema.key, input);
    valueMap.set(schema.key, value);

    row.append(meta, input);
    return row;
  }

  function buildControlPanel() {
    const host = document.getElementById("control-root");

    if (!host) {
      return;
    }

    host.textContent = "";

    const shell = document.createElement("div");
    shell.className = "control-shell";

    const title = document.createElement("h3");
    title.className = "control-title";
    title.textContent = "Controls";

    shell.append(title);

    const groups = new Map();

    for (const schema of CONTROL_SCHEMA) {
      if (!groups.has(schema.group)) {
        const section = document.createElement("section");
        section.className = "control-group";

        const heading = document.createElement("h4");
        heading.className = "control-group-title";
        heading.textContent = schema.group;

        section.append(heading);
        groups.set(schema.group, section);
        shell.append(section);
      }

      groups.get(schema.group).append(buildControlRow(schema));
    }

    const actions = document.createElement("div");
    actions.className = "control-actions";

    const rebuildButton = document.createElement("button");
    rebuildButton.type = "button";
    rebuildButton.className = "control-button";
    rebuildButton.textContent = "Regenerate Swarms";
    rebuildButton.addEventListener("click", () => {
      notify("__rebuild__");
    });

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "control-button control-button-alt";
    resetButton.textContent = "Reset Defaults";
    resetButton.addEventListener("click", resetDefaults);

    actions.append(rebuildButton, resetButton);
    shell.append(actions);

    host.append(shell);
    syncAllControls();
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }

    listeners.add(listener);
    listener(cloneConfig(), "__init__");

    return () => {
      listeners.delete(listener);
    };
  }

  window.BoidControls = {
    getConfig: cloneConfig,
    subscribe,
    requestRebuild: () => {
      notify("__rebuild__");
    },
    reset: resetDefaults,
    setValue: updateConfigValue,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildControlPanel);
  } else {
    buildControlPanel();
  }
})();
