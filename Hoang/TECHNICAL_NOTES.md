# Technical Notes

This document explains the main coding techniques used in `sketch.js` for the
boids, collision system, big-leader color conversion, and final fluid/blob
sequence.

## Boid Movement

The movement system is a custom p5.js boid implementation built from classic
steering behaviors. Small leaders are updated in `updateSmallLeaders()`, where
each leader receives acceleration from separation, alignment, cohesion, wander,
and sometimes macro-leader chase forces.

- `steerSeparationCustom()` pushes leaders away from nearby leaders. It uses
  inverse squared distance so close neighbors create a much stronger avoidance
  force.
- `steerAlignmentCustom()` averages nearby leader velocities, making leaders
  drift in related directions.
- `steerCohesionCustom()` steers toward the local center of nearby leaders.
- `steerWander()` creates anxious wandering by projecting a steering circle in
  front of the current heading, then jittering an angle around that circle.
- `seekTarget()` and `seekTargetXY()` are used for goal-directed motion, such as
  chasing a macro leader, exiting the screen, or moving followers around their
  leader.

The final velocity integration happens in `integrateLeader()`: acceleration is
added to velocity, drag is applied, velocity is limited by each leader's
`maxSpeed`, and the position is advanced. This keeps behavior modular: steering
functions only suggest forces, while integration decides the final movement.

Followers use a lighter orbit-follow behavior in `updateFollowersForLeader()`.
Each follower computes a moving target around its leader using an orbit radius,
phase, speed, and jitter, then seeks that target. This creates a swarm orbit
without requiring every follower to run the full leader boid rules.

## Collision System

The collision system is a custom circle-body solver optimized for many simple
shape contacts. Shapes are collected into lightweight collision bodies by
`collectCollisionBodies()`. Each body stores:

- position and velocity references
- collision radius
- inverse mass
- body kind, owner, and source metadata
- an audio entity id for collision sound gating

`resolveGlobalCollisionPhysics()` uses a spatial hash grid before checking
pairs. The cell size is based on the largest body radius, then each body only
checks bodies in its own cell and neighboring cells. This avoids testing every
shape against every other shape.

Collisions are resolved in multiple passes using
`COLLISION_SOLVER_ITERATIONS`. In each pass, `resolveCollisionPair()`:

- skips intentional exemptions, such as intro drops versus the user cluster
- detects overlap between two circular collision bounds
- moves both bodies apart based on inverse mass
- computes relative velocity along the collision normal
- applies restitution as a normal impulse
- applies friction as a tangential impulse

Resting dropped shapes are cached as static collision bodies through
`rebuildStaticDroppedCollisionBodies()`. This keeps settled piles cheaper while
still allowing the player/user cluster to push against them.

Collision audio is also pair-aware. `queueFabricCollisionSoundForBodies()` uses
pair state so repeated long contact does not constantly spam full-volume impact
sounds. A pair must separate by a meaningful distance before it can create
another full collision sound; sustained contact can only create a quieter sound
on a slower cooldown.

## Big-Leader Color Conversion

The big leaders act like conversion targets during each influence cycle. Small
swarms are assigned to macro trend leaders, then `updateSmallLeaders()` steers
them toward a macro chase target around that trend. When a swarm gets within
`boidConfig.assimilationRadius`, `assimilateSwarmLook()` starts converting its
appearance.

The conversion is not an instant swap. It uses progressive interpolation:

- `swarm.assimilationProgress` moves toward `1`.
- `getSwarmAssimilationColor()` samples the current cycle color palette.
- the small leader's `currentColor` and `leader.colorData` lerp toward that
  sampled target.
- each follower's tint lerps toward `getFollowerAssimilationTint()`.

Once progress passes `0.35`, the follower shapes and patterns switch to the
macro leader's visual language. This creates a staged conversion: color begins
first, then pattern/shape identity follows.

When `assimilationProgress` reaches the end, `finalizeSwarmAssimilation()` locks
the final colors and style, drops the old followers into the world through
`dropSwarmFollowers()`, and respawns a fresh converted follower group from the
trend. This is what creates the repeated consumer pile buildup across cycles.

## Final Fluid / Blob

The final fluid is drawn as a procedural black blob, not a fluid simulation.
The code creates a radial polygon in `drawFinalHurtLiquidFlood()` with 84
vertices around the center of the canvas.

The blob growth is driven by:

- `getFinalHurtLiquidGrowthProgress()`: time-based eased progress from `0` to
  `1`.
- `getFinalHurtLiquidBaseRadius()`: radius interpolation by area, using squared
  radius interpolation so coverage feels more even.
- `getFinalHurtLiquidWaveAmplitude()`: wave size grows as the blob grows.
- `getFinalHurtLiquidSurfaceRadius()`: combines the base radius with two sine
  waves at different frequencies and speeds.

Because every vertex samples `getFinalHurtLiquidSurfaceRadius()`, the outline
looks organic and unstable while still being deterministic enough to test
against.

Dropped shapes interact with the blob through
`updateFinalBlobDroppedShapeDecay()`. Each dropped shape checks its distance
from the blob center against the liquid surface radius for its angle. When the
blob reaches a shape, the shape records `finalBlobTouchedAtMs`.

After contact, `getFinalBlobDroppedShapeDecayState()` controls a staged decay:

- first, the shape loses pattern/shadow and blends toward gray
- after a short delay, it shrinks
- once it is below the tiny scale threshold, it is removed from `droppedShapes`
  and its collision cache is marked dirty

This makes the blob feel like it is consuming the accumulated fabric pile,
instead of all dropped shapes disappearing globally at the same time.
