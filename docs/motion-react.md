---
summary: 'Motion for React (Framer Motion) — complete animation library docs. Covers motion components, gestures, layout animations, scroll, transitions, and variants.'
read_when:
  - Building animated UIs with Motion / Framer Motion
  - Implementing gestures, page transitions, or scroll animations
  - Adding entrance animations, layout animations, or variants
---
<!--
Downloaded via https://llm.codes by @steipete on March 18, 2026 at 09:19 PM
Source URL: https://motion.dev/docs/react
Total pages processed: 107
URLs filtered: Yes
Content de-duplicated: Yes
Availability strings filtered: Yes
Code blocks only: No
-->

# https://motion.dev/docs/react

Motion homepage

Docs

Examples

Tutorials

Motion+

Presented by

Clerk

**Motion for React** (previously Framer Motion) is a React animation library for building smooth, production-grade UI animations. You can start with simple prop-based animations before growing to layout, gesture and scroll animations.

Motion's unique **hybrid engine** delivers 120fps animations by combining native browser APIs like Web Animations API and `ScrollTimeline` with the flexibility of JavaScript. It's also trusted by companies like Framer and Figma to power their amazing no-code animations and gestures.

In this guide, we'll learn **why** and **when** you should use Motion, how to **install** it, and give you an overview of its main features.

## Why Motion for React?

React gives you the power to build dynamic user interfaces, but orchestrating complex, performant animations can be a challenge. Motion is a production-ready React animation library designed to solve this problem, making it simple to create everything from beautiful micro-interactions to complex, gesture-driven animations.

import{motion}from"motion/react"

functionComponent(){

### Key advantages

Here’s when it’s the right choice for your project.

- **Built for React.** While other animation libraries like GSAP are messy to integrate with React, Motion's declarative API is a natural fit. Animations can be linked directly to state and props.

- **Hardware-acceleration.** Motion leverages the same high-performance browser animations as CSS, ensuring your UIs stay smooth and snappy. 120fps animations with a much simpler and more expressive API.

- **Animate anything.** CSS has hard limits. Values you can't animate, keyframes you can't interrupt, staggers that must be hardcoded. Motion provides a single, consistent API that scales from simple to complex.

- **App-like gestures.** Standard CSS `:hover` events are unreliable on touch devices. Motion provides robust, cross-device gesture recognisers for tap, drag, and hover that feel native and intuitive on any device.

- **Production ready.** Built on TypeScript, surrounded by an extensive test suite, and fully tree-shakable so you only include what you import.

### When is CSS a better choice?

For simple, self-contained effects (like a color change on hover) a standard CSS transition is a lightweight solution. The strength of Motion is that it can do these simple kinds of animations but also scale to anything you can imagine. All with the same easy to write and maintain API.

## Install

Motion is available via npm:

npm install motion

Features can now be imported via `"motion/react"`:

Prefer to install via CDN, or looking for framework-specific instructions? Check out our full installation guide.

## Your first animation

When values in `animate` change, the component will animate. Motion has intuitive defaults, but animations can of course be configured via the`transition` prop.

<motion.div

animate={{

scale:2,

transition:{duration:2}

}}

If you're the kind of developer who learns better by doing, check out our library of Basics examples. Each comes complete with a live demo and copy/paste source code.

## Enter animation

When a component enters the page, it will automatically animate to the values defined in the `animate` prop.

You can provide values to animate from via the `initial` prop (otherwise these will be read from the DOM).

Or disable this initial animation entirely by setting `initial` to `false`.

<motion.button

whileHover={{scale:1.1}}

whileTap={{scale:0.95}}

Motion's gestures are designed to feel better than using CSS or JavaScript events alone.

## Scroll animation

Motion supports both types of scroll animations: **Scroll-triggered** and **scroll-linked**.

To trigger an animation on scroll, the `whileInView` prop defines a state to animate to/from when an element enters/leaves the viewport:

initial={{backgroundColor:"rgb(0, 255, 0)",opacity:0}}

whileInView={{backgroundColor:"rgb(255, 0, 0)",opacity:1}}

🍅

🍊

🍋

🍐

🍏

🫐

🍆

🍇

Whereas to link a value directly to scroll position, it's possible to use `MotionValue`s via `useScroll`.

const{scrollYProgress} = useScroll()

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.

Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo. In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta. Mauris laoreet augue ut felis blandit, at iaculis odio ultrices. Nulla facilisi. Vestibulum cursus ipsum tellus, eu tincidunt neque tincidunt a.

## Sub-header

In eget sodales arcu, consectetur efficitur metus. Duis efficitur tincidunt odio, sit amet laoreet massa fringilla eu.

Pellentesque id lacus pulvinar elit pulvinar pretium ac non urna. Mauris id mauris vel arcu commodo venenatis. Aliquam eu risus arcu. Proin sit amet lacus mollis, semper massa ut, rutrum mi.

Sed sem nisi, luctus consequat ligula in, congue sodales nisl.

Vestibulum bibendum at erat sit amet pulvinar. Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.

Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet. Pellentesque auctor vehicula malesuada. Aliquam id feugiat sem, sit amet tempor nulla. Quisque fermentum felis faucibus, vehicula metus ac, interdum nibh. Curabitur vitae convallis ligula. Integer ac enim vel felis pharetra laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque hendrerit ac augue quis pretium.

Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique, elit metus efficitur elit, ac pretium sapien nisl nec ante. In et ex ultricies, mollis mi in, euismod dolor.

Quisque convallis ligula non magna efficitur tincidunt.

## Layout animation

Motion's layout animation engine detects layout changes (size, position, reorder) and smoothly animates between states using transforms. Unlike basic "FLIP" implementations, it does so while correcting for scale-distortion.

It's as easy as applying the `layout` prop.

Or to animate between completely different elements, a `layoutId`:

## Exit animations

Hide

## SVG animations

Motion has full support for SVG animations, including support for animating `viewBox` and special values for simple path drawing effects.

## Development tools

Motion Studio provides AI and visual animation editing directly inside your code editor. Enhance your workflow tools with an AI-searchable examples database, a CSS and Motion transition editor, performance audit skill, and more.

### Install Motion Studio

One-click install for Cursor:

Add Extension

Add MCP

Motion Studio is also compatible with VS Code, Google Antigravity and more. See full installation guide.

## Learn next

That's a very quick overview of Motion for React's basic features. But there's a lot more to learn!

Next, we recommend starting with the React animation guide. There, you'll learn more about the different types of animations you can build with this React animation library.

Or, you can learn by doing, diving straight into our collection of examples. Each comes complete with full source code that you can copy-paste into your project.

## Related topics

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

- **Scroll animation**\\
\\
Create scroll-triggered and scroll-linked effects — parallax, progress and more.

- **Layout animation**\\
\\
Smoothly animate layout changes and create shared element animations.

Tutorial\\
\\
**Rotate**\\
\\
An example of animation the rotation of an element with Motion for React

Next

React animation

## On this page

- Why Motion for React?
- Key advantages
- When is CSS a better choice?
- Install
- Your first animation
- Enter animation
- Hover & tap animation
- Scroll animation
- Layout animation
- Exit animations
- SVG animations
- Learn next

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs

Motion homepage

Docs

Examples

Tutorials

Upgrade to Motion+

Documentation

# Get started with Motion

### Animation library

![React logo\\
\\
React](https://motion.dev/docs/react)

![JS logo\\
\\
JavaScript](https://motion.dev/docs/quick-start)

![Vue logo\\
\\
Vue](https://motion.dev/docs/vue)

### Developer tools

![React logo\\
\\
Motion Studio](https://motion.dev/docs/studio)

#### Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

Get Motion+

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Motion+

Login

Register

Upgrade

---

# https://motion.dev/docs/gsap-vs-motion

Motion homepage

Docs

Examples

Tutorials

Motion+

Ready to migrate? Check out our simple GSAP to Motion migration guide.

When deciding which JavaScript animation library to trust for your project, two libraries often get mentioned because of their feature set and popularity: **Motion** (formerly Framer Motion) and **GSAP** (formerly GreenSock).

Both can create stunning animations, but they have fundamental differences. This guide compares Motion and GSAP on **adoption**, **licensing**, **performance**, and **features** (complete with full comparison table), to help you decide which is right for your project.

## Adoption

Before delving into the libraries themselves, it's helpful to see what other developers are choosing. For modern applications, npm is a great measure of a library's adoption and momentum.

Here, the numbers are clear: **Motion is growing exponentially,** making it the most-used and fastest-growing animation library in the ecosystem. It even just passed **16 million downloads per month**.

## Licensing

Motion is **fully independent** and **MIT open source**. It's financially supported by a mix of incredible industry-leading sponsors like Framer, Figma, Sanity, Tailwind CSS and LottieFiles, as well as sales from Motion+.

GSAP, by contrast, is **closed source** and **owned and funded by Webflow**. While it can be used for free in many projects, its license contains a critical restriction: You're prohibited from using GSAP in any tool that competes with Webflow. Furthermore, its license states that **Webflow can terminate it at its discretion**.

Motion's independence and self-sufficiency also means we work with a broad base of users and companies, creating a library that works for the whole web, rather than the interests of a single company.

## Performance

Performance is more than just smooth animations. It's about providing a flawless 120fps, faster start-up times, and minimal bundle sizes. This is where Motion's modern architecture provides an advantage.

### Hardware accelerated animations

You might already know that for best animation performance you should stick to animating `opacity` , `transform`, `filter` and `clipPath`, because these styles can be rendered entirely on the GPU.

But when animating with Motion, these values can enjoy an extra performance boost using "hardware accelerated" animations. This means the animations themselves also run entirely the GPU - separate from the JavaScript running on your CPU.

This means if your website or app is performing heavy work, **animations remain smooth**.

To illustrate, in the following example the ball on the left is animated with Motion, and the ball on the right by a traditional animation library. Press the "Block JavaScript" button to block JS execution for two seconds:

Motion

Other JavaScript libraries

Block JavaScript

In the majority of browsers, the left ball will continue animating at 60/120fps, even as the website becomes unresponsive. Traditional animation libraries like GSAP will pause and stutter where Motion remains perfectly smooth.

What's more, Motion can even perform hardware accelerated scroll animations. Because browsers render all scroll on the GPU, JS-based scroll animations are always slightly out-of-sync. Not so with Motion.

constanimation = animate(element,{opacity:\[0,1\]})

scroll(animation)

### Start-up time

Two animate any two values, they have to be mixable. Think, two numbers, or two colors. But what if we want to perform an animation where we don't even know the initial value? Or we do - but it's a value like `height: auto`, or a color defined in a CSS variable like `var(—my-color)`?

To make these values mixable, the library first needs to **measure** them. But measuring something that's just been rendered forces a layout or style calculation. These are slow.

To solve this, Motion introduced **deferred keyframe resolution**. This ensures we batch all measurements into a single operation, drastically reducing style and layout calculations.

In benchmarks, Motion is **2.5x faster** than GSAP at animating from unknown values, and **6x faster** at animating between different value types.

This is great for user experience, and also great for performance scores like Interaction to Next Paint (INP).

### Bundle size

Motion is built with a modern, modular architecture. If your bundler supports tree-shaking (like Vite, Rollup or Webpack), you only ever include the code you actually use. GSAP's older architecture, by contrast, means that importing any part of the library includes all of it.

This, combined with Motion's focus on leveraging native browser APIs, results in a significantly smaller footprint.

| Library | Size |
| --- | --- |
| `animate()` (mini) | 2.6kb |
| `animate()` (full) | 18kb |
| GSAP | 23kb |

A smaller bundle means a **faster site load and a better user experience**, especially on mobile devices. With Motion, you can deliver stunning animations with a minimal performance cost.

## Features

Of course, performance means little if a library can't deliver the features you need. While there is plenty of overlap, both libraries have unique strengths.

### React & Vue APIs

Motion provides a first-class, declarative API that is a natural extension of React and Vue. Animations are defined directly in your components via props, keeping your code clean, readable and easy to maintain.

constcontainer = useRef()

gsap.to(".box",{x:100})

},{scope:container})

return(

Furthermore, Motion for React and Vue features an **industry-leading** **layout animation** **engine**, which goes far beyond the FLIP animations in GSAP.

### Timelines & sequencing

GSAP is famous for its powerful timeline function, which uses an imperative, chain-based API to build complex animation sequences. It's mature, and an industry standard for good reason.

consttl = gsap.timeline()

tl.to("h1",{opacity:1})

tl.to("p",{y:0},"-=0.5")

Motion provides a modern, declarative alternative. Instead of chain-based commands, `animate()` accepts a simple JavaScript array, making it easy to read, modify and dynamically generate animation sequences.

animate(\[\
\
\["h1",{opacity:1}\],\
\
\["p",{y:0},{at:"-0.5"}\]\
\
\])

This timeline can animate anything the `animate()` function can, mixing HTML elements, SVG elements, motion values, and even 3D objects from libraries like Three.js - all within the same sequence. As mentioned earlier, it's also 5kb lighter.

The benefit to GSAP's timeline API is that it's **mutable**. Once playback has begun, individual tracks can be added and removed to the overarching sequence, an ability that Motion doesn't yet offer.

### Full feature comparison table

This table compares Motion's mini and full-size `animate` functions functions with GSAP's `gsap` object.

#### Key

- ✅ Supported

- ❌ Not supported

- ⏩ Support relies on modern browser features

- 🚧 In development

- ⚠ Partial support

- ⚛️ React/Vue only

| | `animate` mini | `animate` | GSAP |
| --- | --- | --- | --- |
| Core bundlesize (kb) | 2.6 | 18 | 23.5 |
| #### General | | | |

| Accelerated animations | ✅ | ✅ | ❌ |
| React API | ❌ | ✅ (+15kb) | ❌ |
| Vue API | ❌ | ✅ (+15kb) | ❌ |
| #### Values | | | |
| Individual transforms | ❌ | ✅ | ✅ |

| Named colors | ✅ | ❌ | ⚠ (20) |

| Wildcard keyframes | ✅ | ✅ | ❌ |
| Relative values | ❌ | ❌ | ✅ |
| #### Output | | | |
| Element styles | ✅ | ✅ | ✅ |
| Element attributes | ❌ | ✅ | ✅ |
| Custom animations | ❌ | ✅ | ✅ |
| #### Options | | | |
| Duration | ✅ | ✅ | ✅ |
| Direction | ✅ | ✅ | ✅ |
| Repeat | ✅ | ✅ | ✅ |
| Delay | ✅ | ✅ | ✅ |
| End delay | ✅ | ❌ | ✅ |
| Repeat delay | ❌ | ✅ | ✅ |
| #### Stagger | | | |
| Stagger | ✅ (+0.1kb) | ✅ (+0.1kb) | ✅ |
| Min delay | ✅ | ✅ | ✅ |
| Ease | ✅ | ✅ | ✅ |
| Grid | ❌ | ❌ | ✅ |
| #### Layout | | | |
| Animate layout | ❌ | ⚠ (View) | ⚠ (FLIP) |
| Transform-only | ❌ | ✅ ⚛️ | ❌ |
| Scale correction | ❌ | ✅ ⚛️ | ❌ |
| #### Timeline | | | |
| Timeline | ✅ (+0.6kb) | ✅ | ✅ |
| Selectors | ✅ | ✅ | ✅ |
| Relative offsets | ✅ | ✅ | ✅ |
| Absolute offsets | ✅ | ✅ | ✅ |

| Percentage offsets | ❌ | ❌ | ✅ |
| Label offsets | ✅ | ✅ | ✅ |
| Segment stagger | ✅ | ✅ | ✅ |
| Segment keyframes | ✅ | ✅ | ❌ |
| #### Controls | | | |
| Play | ✅ | ✅ | ✅ |
| Pause | ✅ | ✅ | ✅ |
| Finish | ✅ | ✅ | ✅ |
| Reverse | ❌ | ❌ | ✅ |
| Stop | ✅ | ✅ | ✅ |
| Playback rate | ✅ | ✅ | ✅ |
| #### Easing | | | |
| Linear | ✅ | ✅ | ✅ |
| Cubic bezier | ✅ | ✅ | ✅ |
| Steps | ✅ | ✅ | ✅ |
| Spring | ✅ (+1kb) | ✅ | ❌ |
| Spring physics | ❌ | ✅ | ❌ |
| Inertia | ❌ | ✅ | ✅ |

| #### Events | | | |
| Complete | ✅ | ✅ | ✅ |
| Cancel | ✅ | ✅ | ✅ |
| Start | ❌ | ✅ | ✅ |
| Update | ❌ | ✅ | ✅ |
| Repeat | ❌ | ❌ | ✅ |
| #### Path | | | |
| Motion path | ✅ ⏩ | ✅ ⏩ | ✅ (+9.5kb) |
| Path morphing | ❌ | ✅ (+ Flubber) | ✅ |
| Path drawing | ✅ | ✅ | ✅ |
| #### Scroll | | | |
| Scroll trigger | ✅ (+0.5kb) | ✅ (+0.5kb) | ✅ (+12kb) |

| #### Extra Features | | | |
| AnimateNumber | ⚛️ ( Motion+) | ⚛️ ( Motion+) | ❌ |
| Cursor | ⚛️ ( Motion+) | ⚛️ ( Motion+) | ❌ |
| Split Text | ✅ ( Motion+) | ✅ ( Motion+) | ✅ |
| Ticker | ⚛️ ( Motion+) | ⚛️ ( Motion+) | ❌ |
| Typewriter | ⚛️ ( Motion+) | ⚛️ ( Motion+) | ❌ |
| View animations | ⚛️ ( Motion+) | ⚛️ ( Motion+) | ❌ |

## Conclusion

**Both Motion and GSAP are powerful, production-ready libraries capable of creating stunning, award-winning animations.** The best choice depends entirely on the priorities of your project and team.

### When to use GSAP?

You might still prefer **GSAP** if your project requires **intricate, timeline-sequenced animations on non-React sites**. Its maturity and long history mean it is a reliable, if more traditional, choice.

Previous

FAQs

Next

Improvements to Web Animations API

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Adoption
- Licensing
- Performance
- Hardware accelerated animations
- Start-up time
- Bundle size
- Features
- React & Vue APIs
- Timelines & sequencing
- Full feature comparison table
- Conclusion
- When to use Motion?
- When to use GSAP?

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-installation

Motion homepage

Docs

Examples

Tutorials

Motion+

This guide covers everything you need to install and set up **Motion for React**. We'll cover installation via:

- **Package managers** like npm, Yarn and pnpm.

- **CDN** via jsDelivr.

- **Frameworks** like Next.js and Vite.

## Prerequisites

Before you install Motion, note that Motion is only compatible with React versions `18.2` and higher.

## Install via package manager

The most common way of installing Motion is via a package manager.

### npm

npm install motion

### Yarn

yarn add motion

### pnpm

pnpm add motion

Once the package is installed, you can import Motion's components and hooks via `"motion/react"`:

import{motion}from"motion/react"

## Add via CDN

It's also possible to import Motion directly from an external CDN, without installation. jsDelivr mirrors packages published to npm, so you can import the exact same bundle like this:

## Frameworks

Motion is designed to work seamlessly with modern React frameworks. Here are a few tips for the most popular.

### Next.js

Motion supports both the Next.js Page and App Routers.

To use with the App Router, you either need to convert the importing file to a client component with the `"use client"` directive:

"use client"

exportdefaultfunctionMyComponent(){

Or to reduce the amount of JS delivered to the client, you can replace the import with `import * as motion from "motion/react-client"`:

import\*asmotionfrom"motion/react-client"

### Vite

No special configuration is needed with Vite. Motion works out of the box!

## Related topics

- **Get started with Motion for React**\\
\\
Install Motion for React, animate elements with spring animations. Complete guide with examples.

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- Motion+\\
\\
**Cursor**\\
\\
Create custom cursor and follow-along effects in React.

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Prerequisites
- Install via package manager
- npm
- Yarn
- pnpm
- Add via CDN
- Frameworks
- Next.js
- Vite

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-transitions

Motion homepage

Docs

Examples

Tutorials

Motion+

A `transition` defines the type of animation used when animating between two values.

consttransition = {

duration:0.8,

delay:0.5,

ease:\[0,0.71,0.2,1.01\],

}

// Motion component

<motion.div

animate={{x:100}}

transition={transition}

animate(".box",{x:100},transition)

Transition options — Motion for React Example

## Setting a transition

`transition` can be set on any animation prop, and that transition will be used when the animation fires.

whileHover={{

scale:1.1,

transition:{duration:0.2}

}}

When animating multiple values, each value can be animated with a different transition, with `default` handling all other values:

<motion.li

animate={{

x:0,

opacity:1,

transition:{

default:{type:"spring"},

opacity:{ease:"linear"}

animate("li",{x:0,opacity:1},{

})

### Default transitions

It's possible to set default transitions via the `transition` prop. Either for specific `motion` components:

transition={{type:"spring",stiffness:100}}

By default, transitions of higher specificity will replace default transitions. For example:

transition={{ease:"easeInOut"}}

By setting `inherit: true`, a transition will inherit values from transitions with lower specificity.

transition={{

inherit:true,// duration 1 now inherited

ease:"easeInOut"

animate={{x:100,opacity:1}}

duration:1,

ease:"easeInOut",

opacity:{

inherit:true,// inherit 1 second

ease:"linear"

#### `type`

**Default:** Dynamic

`type` decides the type of animation to use. It can be `"tween"`, `"spring"` or `"inertia"`.

**Tween** animations are set with a duration and an easing curve.

**Spring** animations are either physics-based or duration-based.

Physics-based spring animations are set via `stiffness`, `damping` and `mass`, and these incorporate the velocity of any existing gestures or animations for natural feedback.

iOS App Store — Motion for React Example

- ![](https://examples.motion.dev/photos/app-store/a.jpg)

Travel

## 5 Inspiring Apps for Your Next Trip

- ![](https://examples.motion.dev/photos/app-store/c.jpg)

How to

## Contemplate the Meaning of Life Twice a Day

- ![](https://examples.motion.dev/photos/app-store/d.jpg)

Steps

## Urban Exploration Apps for the Vertically-Inclined

- ![](https://examples.motion.dev/photos/app-store/b.jpg)

Hats

## Take Control of Your Hat Life With This Stunning New App

Duration-based spring animations are set via a `duration` and `bounce`. These don't incorporate velocity but are easier to understand.

**Inertia** animations decelerate a value based on its initial velocity, usually used to implement inertial scrolling.

<motion.path

animate={{pathLength:1}}

transition={{duration:2,type:"tween"}}

TimePhysics

Duration

Bounce

Use visual duration

#### `duration`

**Default:**`0.3` (or `0.8` if multiple keyframes are defined)

The duration of the animation. Can also be used for `"spring"` animations when `bounce` is also set.

#### `ease`

The easing function to use with tween animations. Accepts:

- Easing function name. E.g `"linear"`

- An array of four numbers to define a cubic bezier curve. E.g `[.17,.67,.83,.67]`

- A JavaScript easing function, that accepts and returns a value `0`-`1`.

These are the available easing function names:

- `"linear"`

- `"easeIn"`, `"easeOut"`, `"easeInOut"`

- `"circIn"`, `"circOut"`, `"circInOut"`

- `"backIn"`, `"backOut"`, `"backInOut"`

- `"anticipate"`

When animating keyframes, `ease` can optionally be set as an array of easing functions to set different easings between each value:

x:\[0,100,0\],

transition:{ease:\["easeIn","easeOut"\]}

#### `times`

When animating multiple keyframes, `times` can be used to adjust the position of each keyframe throughout the animation.

Each value in `times` is a value between `0` and `1`, representing the start and end of the animation.

transition:{times:\[0,0.3,1\]}

#### `bounce`

**Default:**`0.25`

`bounce` determines the "bounciness" of a spring animation.

`0` is no bounce, and `1` is extremely bouncy.

`bounce` and `duration` will be overridden if `stiffness`, `damping` or `mass` are set.

animate={{rotateX:90}}

transition={{type:"spring",bounce:0.25}}

If `visualDuration` is set, this will override `duration`.

The visual duration is a time, **set in seconds**, that the animation will take to visually appear to reach its target.

In other words, the bulk of the transition will occur before this time, and the "bouncy bit" will mostly happen after.

This makes it easier to edit a spring, as well as visually coordinate it with other time-based animations.

type:"spring",

visualDuration:0.5,

bounce:0.25

**Default:**`10`

Strength of opposing force. If set to 0, spring will oscillate indefinitely.

<motion.a

animate={{rotate:180}}

transition={{type:'spring',damping:300}}

**Default:**`1`

Mass of the moving object. Higher values will result in more lethargic movement.

<motion.feTurbulence

animate={{baseFrequency:0.5}}

transition={{type:"spring",mass:0.5}}

Stiffness of the spring. Higher values will create more sudden movement.

<motion.section

transition={{type:'spring',stiffness:50}}

/>

> _I never really understood how_`damping` _,_`mass` _and_`stiffness` _influence a spring animation, so I made a_ _tool for myself_ _to visualise it._ ~ Emil Kowalski, Animations on the Web

#### `velocity`

**Default:** Current value velocity

The initial velocity of the spring.

transition={{type:'spring',velocity:2}}

**Default:**`0.1`

End animation if absolute speed (in units per second) drops below this value and delta is smaller than `restDelta`.

transition={{type:'spring',restSpeed:0.5}}

**Default:**`0.01`

End animation if distance is below this value and speed is below `restSpeed`. When animation ends, the spring will end.

transition={{type:'spring',restDelta:0.5}}

An animation that decelerates a value based on its initial velocity. Optionally, `min` and `max` boundaries can be defined, and inertia will snap to these with a spring animation.

This animation will automatically precalculate a target value, which can be modified with the `modifyTarget` property.

This allows you to add snap-to-grid or similar functionality.

Inertia is also the animation used for `dragTransition`, and can be configured via that prop.

#### `power`

**Default:**`0.8`

A higher power value equals a further calculated target.

drag

dragTransition={{power:0.2}}

**Default:**`700`

Adjusting the time constant will change the duration of the deceleration, thereby affecting its feel.

dragTransition={{timeConstant:200}}

A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.

// dragTransition always type: inertia

dragTransition={{

power:0,

// Snap calculated target to nearest 50 pixels

Minimum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as less than this value).

dragTransition={{min:0,max:100}}

Maximum constraint. If set, the value will "bump" against this value (or immediately snap to it, if the initial animation value exceeds this value).

**Default:**`500`

If `min` or `max` is set, this affects the stiffness of the bounce spring. Higher values will create more sudden movement.

min:0,

max:100,

bounceStiffness:100

If `min` or `max` is set, this affects the damping of the bounce spring. If set to `0`, spring will oscillate indefinitely.

#### `delay`

**Default:**`0`

Delay the animation by this duration (in seconds).

animate(element,{filter:"blur(10px)"},{delay:0.3})

By setting `delay` to a negative value, the animation will start that long into the animation. For instance to start 1 second in, `delay` can be set to -`1`.

#### `repeat`

The number of times to repeat the transition. Set to `Infinity` for perpetual animation.

transition={{repeat:Infinity,duration:2}}

**Default:**`"loop"`

How to repeat the animation. This can be either:

- `loop`: Repeats the animation from the start.

- `reverse`: Alternates between forward and backwards playback.

- `mirror`: Switches animation origin and target on each iteration.

repeat:1,

repeatType:"reverse",

duration:2

When repeating an animation, `repeatDelay` will set the duration of the time to wait, in seconds, between each repetition.

transition={{repeat:Infinity,repeatDelay:1}}

**Default:**`false`

With variants, describes when an animation should trigger, relative to that of its children.

- `"beforeChildren"`: Children animations will play after the parent animation finishes.

- `"afterChildren"`: Parent animations will play after the children animations finish.

constlist = {

hidden:{

opacity:0,

transition:{when:"afterChildren"}

constitem = {

transition:{duration:2}

return(

#### `delayChildren`

With variants, setting `delayChildren` on a parent will delay child animations by this duration (in seconds).

constcontainer = {

hidden:{opacity:0},

show:{

delayChildren:0.5

show:{opacity:1}

<motion.ul

variants={container}

initial="hidden"

Using the `stagger` function, we can stagger the delay across children.

delayChildren:stagger(0.1)

By default, delay will stagger across children from first to last. By using `stagger`'s `from` option, we can stagger from the last child, the center, or a specific index.

delayChildren:stagger(0.1,{from:"last"})

## Related topics

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- **useAnimate**\\
\\
Manually start and control animations, scoped to the current React component.

- **MotionConfig**\\
\\
Configure default transition options and manage reduced motion preferences.

Tutorial\\
\\
**Transition options**\\
\\
An example of setting transition options in Motion for React.

Previous

SVG animation

Next

Gesture animation

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Setting a transition
- Value-specific transitions
- Default transitions
- Inheritance
- Transition settings
- Tween
- Spring
- Inertia
- Orchestration

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animation

Motion homepage

Docs

Examples

Tutorials

Motion+

New to Motion? Start with the Motion for React quickstart guide

Motion for React is a simple yet powerful animation library. Whether you're building hover effects, scroll-triggered animations, or complex animation sequences, this guide will provide an overview of all the ways you can animate in React with Motion.

## What you'll learn

- Which values and elements you can animate.

- How to customise your animations with transition options.

- How to animate elements as they enter and exit the DOM.

- How to orchestrate animations with variants.

If you haven't installed Motion already, hop over to the quick start guide for full instructions.

import{motion}from"motion/react"

Every HTML & SVG element can be defined with a `motion` component:

The most common animation prop is `animate`. When values passed to `animate` change, the element will automatically animate to that value.

`x``y``rotate`

### Enter animations

We can set initial values for an element with the `initial` prop. So an element defined like this will fade in when it enters the DOM:

<motion.article

initial={{opacity:0}}

animate={{opacity:1}}

**Motion can animate any CSS value**, like `opacity`, `filter` etc.

<motion.section

initial={{filter:"blur(10px)"}}

animate={{filter:"none"}}

<motion.nav

initial={{maskImage:"linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)"}}

animate={{maskImage:"linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,1) 100%)"}}

Unlike CSS, Motion can animate every transform axis independently.

- Translate: `x`, `y`, `z`

- Scale: `scale`, `scaleX`, `scaleY`

- Rotate: `rotate`, `rotateX`, `rotateY`, `rotateZ`

- Skew: `skewX`, `skewY`

- Perspective: `transformPerspective`

`motion` components also have enhanced `style` props, allowing you to use these shorthands statically:

<motion.button

initial={{y:10}}

animate={{y:0}}

whileHover={{scale:1.1}}

whileTap={{scale:0.9}}

<motion.li

initial={{transform:"translateX(-100px)"}}

animate={{transform:"translateX(0px)"}}

transition={{type:"spring"}}

### Supported value types

Motion can animate any of the following value types:

- Numbers: `0`, `100` etc.

- Strings containing numbers: `"0vh"`, `"10px"` etc.

- Colors: Hex, RGBA, HSLA.

- Complex strings containing multiple numbers and/or colors (like `box-shadow`).

- `display: "none"/"block"` and `visibility: "hidden"/"visible"`.

### Value type conversion

In general, values can only be animated between two of the same type (i.e `"0px"` to `"100px"`).

Colors can be freely animated between hex, RGBA and HSLA types.

Additionally, `x`, `y`, `width`, `height`, `top`, `left`, `right` and `bottom` can animate between different value types.

<motion.div

initial={{x:"100%"}}

animate={{x:"calc(100vw - 50%)"}}

initial={{height:0}}

animate={{height:"auto"}}

### Transform origin

`transform-origin` has three shortcut values that can be set and animated individually:

- `originX`

- `originY`

- `originZ`

If set as numbers, `originX` and `Y` default to a progress value between `0` and `1`. `originZ` defaults to pixels.

Motion for React can animate CSS variables, and also use CSS variable definitions as animation targets.

#### Animating CSS variables

Sometimes it's convenient to be able to animate a CSS variable to animate many children:

<motion.ul

initial={{'--rotate':'0deg'}}

animate={{'--rotate':'360deg'}}

### CSS variables as animation targets

HTML `motion` components accept animation targets with CSS variables:

By default, Motion will create appropriate transitions for snappy animations based on the type of value being animated.

For instance, physical properties like `x` or `scale` are animated with spring physics, whereas values like `opacity` or `color` are animated with duration-based easing curves.

However, you can define your own animations via the`transition` prop.

animate={{x:100}}

transition={{ease:"easeOut",duration:2}}

Or you can set a specific `transition` on any animation prop:

whileHover={{

opacity:0.7,

// Specific transitions override default transitions

transition:{duration:0.3}

}}

transition={{duration:0.5}}

When a `motion` component is first created, it'll automatically animate to the values in `animate` if they're different from those initially rendered, which you can either do via CSS or via the`initial` prop.

initial={{opacity:0,scale:0}}

animate={{opacity:1,scale:1}}

You can also disable the enter animation entirely by setting `initial={false}`. This will make the element render with the values defined in `animate`.

Motion for React can animate elements as they're removed from the DOM.

In React, when a component is removed, it's usually removed instantly. Motion provides the`AnimatePresence` component which keeps elements in the DOM while they perform an animation defined with the `exit` prop.

key="modal"

exit={{opacity:0}}

Hide

## Keyframes

So far, we've set animation props like `animate` and `exit` to single values, like `opacity: 0`.

This is great when we want to animate from the current value to a new value. But sometimes we want to animate through a **series of values**. In animation terms, these are called **keyframes**.

All animation props can accept keyframe arrays:

When we animate to an array of values, the element will animate through each of these values in sequence.

In the previous example, we explicitly set the initial value as `0`. But we can also say "use the current value" by setting the first value to `null`.

This way, if a keyframe animation is interrupting another animation, the transition will feel more natural.

### Wildcard keyframes

This `null` keyframe is called a **wildcard keyframe**. A wildcard keyframe simply takes the value before it (or the current value, if this is the first keyframe in the array).

Wildcard keyframes can be useful for holding a value mid-animation without having to repeat values.

animate={{x:\[0,100,null,0\]}}

// same as x: \[0, 100, 100, 0\] but easier to maintain

By default, each keyframe is spaced evenly throughout the animation. You can override this by setting the`times` option via `transition`.

`times` is an array of progress values between `0` and `1`, defining where in the animation each keyframe should be positioned.

<motion.circle

cx={500}

animate={{

cx:\[null,100,200\],

transition:{duration:3,times:\[0,0.2,1\]}

## Gesture animations

Motion for React has animation props that can define how an element animates when it recognises a gesture.

Supported gestures are:

- `whileHover`

- `whileTap`

- `whileFocus`

- `whileDrag`

- `whileInView`

When a gesture starts, it animates to the values defined in `while-`, and then when the gesture ends it animates available in Motion+ takes this a step further with magnetic and target-morphing effects as a user hovers clickable targets (like buttons and links):

Appearance

## Variants

Setting `animate` as a target is useful for simple, single-element animations. It's also possible to orchestrate animations that propagate throughout the DOM. We can do so with variants.

Variants are a set of named targets. These names can be anything.

constvariants = {

visible:{opacity:1},

hidden:{opacity:0},

}

Variants are passed to `motion` components via the `variants` prop:

variants={variants}

initial="hidden"

whileInView="visible"

exit="hidden"

animate={\["visible","danger"\]}

iOS Notifications stack — Motion for React Example

## Notifications

Collapse

### Propagation

Variants are useful for reusing and combining animation targets. But it becomes powerful for orchestrating animations throughout trees.

Variants will flow down through `motion` components. So in this example when the `ul` enters the viewport, all of its children with a "visible" variant will also animate in:

constlist = {

constitem = {

visible:{opacity:1,x:0},

hidden:{opacity:0,x: -100},

return(

Variants — Motion for React Example

### Orchestration

By default, this children animations will start simultaneously with the parent. But with variants we gain access to new `transition` props `when` and`delayChildren`.

visible:{

opacity:1,

transition:{

when:"beforeChildren",

delayChildren:stagger(0.3),// Stagger children by .3 seconds

},

hidden:{

opacity:0,

when:"afterChildren",

### Dynamic variants

Each variant can be defined as a function that resolves when a variant is made active.

transition:{delay:index \\* 0.3}

})

These functions are provided a single argument, which is passed via the `custom` prop:

This way, variants can be resolved differently for each animating element.

## Animation controls

Declarative animations are ideal for most UI interactions. But sometimes we need to take manual control over animation playback.

The `useAnimate` hook can be used for:

- Animating any HTML/SVG element (not just `motion` components).

- Complex animation sequences.

- Controlling animations with `time`, `speed`, `play()`, `pause()` and other playback controls.

functionMyComponent(){

const\[scope,animate\] = useAnimate()

constcontrols = animate(\[\
\
\[scope.current,{x:"100%"}\],\
\
\["li",{opacity:1}\]\
\
\])

controls.speed = 0.8

},\[\])

## Animate content

By passing a`MotionValue` as the child of a `motion` component, it will render its latest value in the HTML.

import{useMotionValue,motion,animate}from"motion/react"

functionCounter(){

constcount = useMotionValue(0)

constcontrols = animate(count,100,{duration:5})

This is more performant than setting React state as the `motion` component will set `innerHTML` directly.

HTML content — Motion for React Example

100

It's also possible to animate numbers with a ticking counter effect using the `AnimateNumber` component in Motion+ by passing them directly to the component:

​​01234567890123456789​​

## Next

In this guide we've covered the basic kinds of animations we can perform in Motion using its **animation props**. However, there's much more to discover.

Most of the examples on this page have used HTML elements, but Motion also has unique SVG animation features, like its simple line drawing API.

We've also only covered time-based animations, but Motion also provides powerful scroll animation features like `useScroll` and `whileInView`.

It also provides a powerful layout animation engine, that can animate between any two layouts using performant transforms.

Finally, there's also a whole Fundamentals examples category that covers all the basics of animating with Motion for React with live demos and copy-paste code.

## Related topics

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- **Scroll animation**\\
\\
Create scroll-triggered and scroll-linked effects — parallax, progress and more.

- Motion+\\
\\
**Cursor**\\
\\
Create custom cursor and follow-along effects in React.

Tutorial\\
\\
**Transition options**\\
\\
An example of setting transition options in Motion for React.

Previous

Get started with Motion for React

Next

Layout animation

## Ready for the next step?

Learn more by unlocking the full vault of Motion+ pre-built animation examples. Ready to copy-paste directly into your project.

See Motion+ features & pricing

One-time payment, lifetime updates.

## On this page

- What you'll learn

- Enter animations
- Animatable values
- Transforms
- Supported value types
- Value type conversion
- Transform origin
- CSS variables
- CSS variables as animation targets
- Transitions
- Enter animations
- Exit animations
- Keyframes
- Wildcard keyframes
- Keyframe timing
- Gesture animations
- Variants
- Propagation
- Orchestration
- Dynamic variants
- Animation controls
- Animate content
- Next

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-gestures

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion extends React's basic set of event listeners with a simple yet powerful set of UI gestures.

The `motion` component currently has support for **hover**, **tap**, **pan**, **drag, focus** and **inView**.

Each gesture has both a set of event listeners and a `while-` animation prop.

## Animation props

`motion` components provide multiple gesture animation props: `whileHover`, `whileTap`, `whileFocus`, `whileDrag` and `whileInView`. These can define animation targets to temporarily animate to while a gesture is active.

<motion.button

whileHover={{

scale:1.2,

transition:{duration:1},

}}

whileTap={{scale:0.9}}

whileTap="tap"

whileHover="hover"

Gestures — Motion for React Example

### Hover

The hover gesture detects when a pointer hovers over or leaves a component. Learn more about hover animations.

<motion.a

whileHover={{scale:1.2}}

The tap gesture detects when the **primary pointer** (like a left click or first touch point) presses down and releases on the same component.

If the tappable component is a child of a draggable component, it'll automatically cancel the tap gesture if the pointer moves further than 3 pixels during the gesture.

#### Accessibility

Elements with tap events are keyboard-accessible.

Any element with a tap prop will be able to receive focus and `Enter` can be used to trigger tap events on focused elements.

- Pressing `Enter` down will trigger `onTapStart` and `whileTap`

- Releasing `Enter` will trigger `onTap`

- If the element loses focus before `Enter` is released, `onTapCancel` will fire.

### Pan

The pan gesture recognises when a pointer presses down on a component and moves further than 3 pixels. The pan gesture is ended when the pointer is released.

For pan gestures to work correctly with touch input, the element needs touch scrolling to be disabled on either x/y or both axis with the `touch-action` CSS rule.

### Drag

The drag gesture applies pointer movement to the x and/or y axis of the component.

Learn more about drag animations.

### Focus

The focus gesture detects when a component gains or loses focus by the same rules as the CSS :focus-visible selector.

Typically, this is when an `input` receives focus by any means, and when other elements receive focus by accessible means (like via keyboard navigation).

### React components

React components can prevent pointer events bubbling up to their `motion` component parents using the `-Capture` props.

For instance, a child can stop parent drag and tap gestures, and their related `while-` animations, from firing by passing `e.stopPropagation()` to `onPointerDownCapture`.

Because `motion` gesture handlers are deferred, `e.stopPropagation()` can't be fired in time for event propagation to be blocked from a propagating from inside a (for instance) `onTapStart` handler. Instead, use the `propagate` prop to prevent specific gestures from propagating.

Currently, `propagate` only supports `tap`.

whileTap={{opacity:0.8}}

propagate={{tap:false}}

Gestures aren't recognised on SVG `filter` components, as these elements don't have a physical presence and therefore don't receive events.

You can instead add `while-` props and event handlers to a parent and use variants to animate these elements.

return(

stdDeviation={0}

variants={{hover:{stdDeviation:2}}}

}

## Related topics

- **useDragControls**\\
\\
Manually start/stop drag gestures. Supports snap to cursor and more.

- Motion+\\
\\
**Cursor**\\
\\
Create custom cursor and follow-along effects in React.

**Gesture animation examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Gestures**\\
\\
An example of using gestures to animate an element using Motion for React's simple whileTap and whileHover props.

Previous

Transitions

Next

Hover animation

## Mastered gestures?

Take your interactive animations to the next level. The premium Cursor component in Motion+ creates custom cursor and cursor-follow effects that build on the gesture concepts you've just learned.

See all features

One-time payment, lifetime updates.

## On this page

- Animation props
- Gestures
- Hover
- Tap
- Pan
- Drag
- Focus
- Event propagation
- React components
- motion components
- Note: SVG filters

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-scroll-animations

Motion homepage

Docs

Examples

Tutorials

Motion+

Learn how to create scroll animations in React with Motion. This guide covers **scroll-linked** animations, **scroll-triggered** animations, **parallax**, **horizontal scrolling**, and more. All with live examples and copy-paste code.

## Types of scroll animation

There are two fundamental types of scroll animations:

- **Scroll-triggered:** An animation is triggered when an element enters or leaves the viewport. Common for fade-in effects and lazy-loading.

- **Scroll-linked:** Animation values are linked directly to scroll position. Used for parallax, progress bars, and interactive storytelling.

Motion supports both types of scroll animations with simple, performant APIs.

## Scroll-triggered animations

Scroll-triggered animations fire when an element enters or leaves the viewport, or scrolls to a specific point in the viewport.

Motion provides the`whileInView` prop to set an animation target.

<motion.div

initial={{opacity:0}}

whileInView={{opacity:1}}

🍅

🍊

🍋

🍐

🍏

🫐

🍆

🍇

### Animate once on scroll

By default, elements will animate between `initial`/`animate`, and `whileInView`, as the element enters and leaves the viewport. Via the`viewport` options, set `once: true` so an animation only plays the first time an element scrolls into view.

initial="hidden"

whileInView="visible"

viewport={{once:true}}

By default, animations will trigger based on the `window` viewport. To set a custom scroll container element, pass the `ref` of another scrollable element to the `root` option:

functionComponent(){

constscrollRef = useRef(null)

return(

viewport={{root:scrollRef}}

}

For more configuration options, checkout the`motion` component API reference.

### Setting state

It's also possible to set React state when any element (not just a `motion` component) enters and leaves the viewport with the `useInView` hook.

constref = useRef(null)

constisInView = useInView(ref)

## Scroll-linked animations

Scroll-linked animations connect CSS styles directly to scroll position. In Motion, this is done with the `useScroll` hook.

`useScroll` returns four motion values:

- `scrollX`/`scrollY`: Scroll position in pixels

- `scrollXProgress`/`scrollYProgress`: Scroll progress from `0` to `1`

### Scroll progress bar

Create a reading progress indicator by linking `scrollYProgress` to `scaleX`:

const{scrollYProgress} = useScroll();

Scroll-linked animations — Motion for React Example

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.

Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo. In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta. Mauris laoreet augue ut felis blandit, at iaculis odio ultrices. Nulla facilisi. Vestibulum cursus ipsum tellus, eu tincidunt neque tincidunt a.

## Sub-header

In eget sodales arcu, consectetur efficitur metus. Duis efficitur tincidunt odio, sit amet laoreet massa fringilla eu.

Pellentesque id lacus pulvinar elit pulvinar pretium ac non urna. Mauris id mauris vel arcu commodo venenatis. Aliquam eu risus arcu. Proin sit amet lacus mollis, semper massa ut, rutrum mi.

Sed sem nisi, luctus consequat ligula in, congue sodales nisl.

Vestibulum bibendum at erat sit amet pulvinar. Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.

Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet. Pellentesque auctor vehicula malesuada. Aliquam id feugiat sem, sit amet tempor nulla. Quisque fermentum felis faucibus, vehicula metus ac, interdum nibh. Curabitur vitae convallis ligula. Integer ac enim vel felis pharetra laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque hendrerit ac augue quis pretium.

Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique, elit metus efficitur elit, ac pretium sapien nisl nec ante. In et ex ultricies, mollis mi in, euismod dolor.

Quisque convallis ligula non magna efficitur tincidunt.

### Detect scroll direction

It's possible to track scroll direction by using `useMotionValueEvent` on `scrollY`. With this, it's possible to animate items to different states, like a menu that only shows as we scroll down.

const{scrollY} = useScroll()

const\[scrollDirection,setScrollDirection\] = useState("down")

constdiff = current \- scrollY.getPrevious()

})

Scroll Direction: Hide Header — Motion for React Example

Scroll down to hide header.

Scroll up to reveal header.

### Smoothing scroll values

Smooth changes to a scroll value by passing one through `useSpring`:

constscaleX = useSpring(scrollYProgress,{

stiffness:100,

damping:30,

restDelta:0.001

Use the `useTransform` hook to map scroll progress to colours, positions, or any other CSS value:

constfilter = useTransform(

scrollYProgress,

\[0,1\],

\["blur(0px)","blur(10px)"\]

)

# PRAGUE

Fin

### Track element scroll position through viewport

By default, `useScroll` progress values will represent the overall viewport scroll (or element scroll).

By passing an element via the `target` option, `scrollYProgress` will return its progress through the visible space.

const{scrollYProgress} = useScroll({

target:ref,

/\*

When the top of the target meets the bottom of the container

to when the bottom of the target meets the top of the container

\*/

offset:\["start end","end start"\]

Track element within viewport — Motion for React Example

### Parallax scrolling

Parallax creates the illusion of depth by moving elements at different speeds. Background layers should move slower than foreground layers:

const{foregroundY,backgroundY} = useTransform(

scrollY,

{

foregroundY:\[0,2\],// move 2px for every 1 scroll px

backgroundY:\[0,0.5\]// move 0.5px for every 1 scroll px

},

{clamp:false}

Parallax — Motion for React Example

## \#001

## \#002

## \#003

## \#004

## \#005

### Scroll image reveal effect

By linking `clipPath` to `scrollYProgress`, you can have an image "reveal" itself as it scrolls into view.

offset:\["start end","center center"\]

constclipPath = useTransform(

\["inset(0% 50% 0% 50%)","inset(0% 0% 0% 0%)"\]

Scroll Image Reveal — Motion for React Example

# Amsterdam Cyclists

### Horizontal scroll section

You can make a horizontally-scrolling section by combining `useScroll`, a tall container section, and a wide `position: sticky` container.

constcontainerRef = useRef(null)

target:containerRef,

offset:\["start start","end end"\]

constx = useTransform(scrollYProgress,\[0,1\],\["0%","-75%"\])

The container should have a long viewport-relative measurement like `300vh`. Increasing this length will make the horizontal scrolling feel slower.

Scroll Horizontal Gallery — Motion for React Example

# Tokyo Nights

01

## Night One

02

## Night Two

03

## Night Three

04

## Night Four

05

## Night Five

### Text scroll

By combining `useScroll` with the Motion+ `Ticker` we can make this popular effect where blocks of text scroll horizontally as the page itself scrolls vertically.

By passing `scrollY` to `useTransform` and multiplying it by `-1` we get a motion value that moves in the opposite direction to the scroll.

constlines = \[\
\
{text:"Creative",reverse:false},\
\
{text:"Design",reverse:true},\
\
{text:"Motion",reverse:false},\
\
{text:"Studio",reverse:true},\
\
\]

<Ticker

key={line.text}

className={\`ticker-line ticker-${index}\`}

items={\[\
\

\

\
\]}

offset={line.reverse ? invertScroll : scrollY}

Scroll Text Lines — Motion for React Example

- Creative
- Creative
- Creative
- Creative

- Design
- Design
- Design
- Design

- Motion
- Motion
- Motion
- Motion

- Studio
- Studio
- Studio
- Studio

## Examples

#### Track element scroll offset

Element scroll-linked animation — Motion for React Example

#### Track element within viewport

#### 3D

Framer Motion 3D: useScroll - CodeSandbox

CodeSandbox

# Framer Motion 3D: useScroll

3.5M

18

1.5k

Edit Sandbox

Files

.codesandbox

public

src

template

App.tsx

index.tsx

styles.css

package.json

tsconfig.json

Dependencies

@react-three/fiber 7.0.24

@types/three 0.141.0

framer-motion 6.5.1

framer-motion-3d 6.5.1

popmotion 11.0.3

react 18.0.0

react-dom 18.0.0

react-scripts 4.0.3

three 0.133.1

Open Sandbox

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

import"./styles.css";

import { Canvas, useThree, useFrame } from"@react-three/fiber";

import { useRef, useLayoutEffect } from"react";

import { useTransform, useScroll, useTime } from"framer-motion";

import { degreesToRadians, progress, mix } from"popmotion";

constcolor="#111111";

Framer Motion example

Console

Problems

0

React DevTools

AllInfoWarningErrorDebug

#### Scroll velocity and direction

Framer Motion: Scroll velocity - CodeSandbox

# Framer Motion: Scroll velocity

3.2M

32

3.8k

framer-motion 7.5.0

import { useRef } from"react";

import {

motion,

useScroll,

useSpring,

useTransform,

useMotionValue,

useVelocity,

useAnimationFrame

} from"framer-motion";

import { wrap } from"@motionone/utils";

interfaceParallaxProps {

children:string;

baseVelocity:number;

Framer Motion Framer Motion Framer Motion Framer Motion

Scroll velocity Scroll velocity Scroll velocity Scroll velocity

Read the full`useScroll` docs to discover more about creating the above effects.

## Related topics

- **useScroll**\\
\\
Create scroll-linked animations like progress bars & parallax with the useScroll React hook.

- **useInView**\\
\\
Switch React state when an element enters/leaves the viewport.

- Motion+\\
\\
**Ticker**\\
\\
Infinitely-scrolling ticker and marquee effects, driven by time, drag or scroll.

**Scroll animation examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Parallax**\\
\\
An example of creating a parallax effect using Motion for React's useScroll hook.

Previous

Layout animation

Next

SVG animation

## Level up your animations with Motion+

Mastered the basics of scroll-linked animations? The Motion+ vault contains dozens of exclusive examples showcasing advanced effects like parallax, scroll-triggered tickers, and more.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Types of scroll animation
- Scroll-triggered animations
- Animate once on scroll
- Changing scroll container
- Setting state
- Scroll-linked animations
- Scroll progress bar
- Detect scroll direction
- Smoothing scroll values
- Transform scroll position to any value
- Track element scroll position through viewport
- Parallax scrolling
- Scroll image reveal effect
- Horizontal scroll section
- Text scroll
- Examples

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-layout-animations

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion makes it simple to **animate an element's size and position** between different layouts. With the `layout` prop, you can perform layout animations, and by using `layoutId` you can create seamless "magic motion" effects between two separate elements.

In this guide, we'll learn how to:

- **Animate layout changes** with a single prop.

- Create **shared element transitions** between components.

- Explore **advanced techniques**.

- **Troubleshoot** common layout animation issues.

- Understand the **differences** between Motion and the native View Transitions API.

## How to animate layout changes

To enable layout animations on a `motion` component, simply add the `layout` prop. Any layout change that happens as a result of a React render will now be automatically animated.

<motion.div

layout

style={{justifyContent:isOn ? "flex-start" : "flex-end"}}

Or by using the `layoutId` prop, it's possible to match two elements and animate between them for some truly advanced animations.

🍅

It can handle anything from microinteractions to full page transitions.

iOS App Store — Motion for React Example

- ![](https://examples.motion.dev/photos/app-store/a.jpg)

Travel

## 5 Inspiring Apps for Your Next Trip

- ![](https://examples.motion.dev/photos/app-store/c.jpg)

How to

## Contemplate the Meaning of Life Twice a Day

- ![](https://examples.motion.dev/photos/app-store/d.jpg)

Steps

## Urban Exploration Apps for the Vertically-Inclined

- ![](https://examples.motion.dev/photos/app-store/b.jpg)

Hats

## Take Control of Your Hat Life With This Stunning New App

When performing layout animations, changes to layout should be made via `style` or `className`, not via animation props like `animate` or `whileHover`, as `layout` will take care of the animation.

Reorder animation — Motion for React Example

Layout changes can be anything, changing `width`/`height`, number of grid columns, reordering a list, or adding/removing new items:

### Performance

Animating layout is traditionally slow, but Motion performs all layout animations using the CSS `transform` property for the highest possible performance.

### Shared layout animations

For more advanced shared layout animations, `layoutId` allows you to connect two different elements.

When a new component is added with a `layoutId` prop matching an existing component, it will automatically animate out from the old component.

If the original component is still on the page when the new one enters, they will automatically crossfade.

To animate an element

Layout animations can be customised using the`transition` prop.

animate={{opacity:0.5}}

transition={{

ease:"linear",

layout:{duration:0.3}

}}

layoutId="modal"

// This transition will be used when the modal closes

<motion.dialog

// This transition will be used when the modal opens

transition={{duration:0.3}}

### Animating within scrollable element

To correctly animate layout within a scrollable container, you must add the `layoutScroll` prop to the scrollable element. This allows Motion to account for the element's scroll offset.

To correctly animate layout within fixed elements, we need to provide them the `layoutRoot` prop.

### Group layout animations

Layout animations are triggered when a component re-renders and its layout has changed.

functionAccordion(){

const\[isOpen,setOpen\] = useState(false)

return(

style={{height:isOpen ? "100px" : "500px"}}

}

But what happens when we have two or more components that don't re-render at the same time, but **do** affect each other's layout?

functionList(){

When one re-renders, for performance reasons the other won't be able to detect changes to its layout.

We can synchronise layout changes across multiple components by wrapping them in the `LayoutGroup component`.

import{LayoutGroup}from"motion/react"

When layout changes are detected in any grouped `motion` component, layout animations will trigger across all of them.

### Scale correction

Because `layout` animations use `transform: scale()`, they can sometimes visually distort children or certain CSS properties.

- **Child elements:** To fix distortion on direct children, these can also be given the `layout` prop.

- **Border radius and box shadow:** Motion automatically corrects distortion on these properties, but they must be set via the `style`, `animate` or other animation prop.

### The component isn't animating

Ensure the component is **not** set to `display: inline`, as browsers don't apply `transform` to these elements.

Ensure the component is re-rendering when you expect the layout animation to start.

### Animations don't work during window resize

Layout animations are blocked during horizontal window resize to improve performance and to prevent unnecessary animations.

### SVG layout animations are broken

SVG components aren't currently supported with layout animations. SVGs don't have layout systems so it's recommended to directly animate their attributes like `cx` etc.

### Content is animating when the scrollbar appears

Layout changes can affect whether or not a scrollbar is visible. Scrollbars take up visible space, which means layouts are then subsequently affected by the scrollbar. Layout animations will apply to any layout change.

If you're finding that this is leading to unwanted layout animations, you can ensure the scrollbar space is reserved, even when no scrollbar is visible, with the `scrollbar-gutter` CSS rule.

body{

overflow-y:auto;

scrollbar-gutter:stable;

### The content stretches undesirably

This is a natural side-effect of animating `width` and `height` with `scale`.

Often, this can be fixed by providing these elements a `layout` animation and they'll be scale-corrected.

### Border radius or box shadows are behaving strangely

Animating `scale` is performant but can distort some styles like `border-radius` and `box-shadow`.

Motion automatically corrects for scale distortion on these properties, but they must be set on the element via `style`.

Elements with a `border` may look stretched during the animation. This is for two reasons:

1. Because changing `border` triggers layout recalculations, it defeats the performance benefits of animating via `transform`. You might as well animate `width` and `height` classically.

2. `border` can't render smaller than `1px`, which limits the degree of scale correction that Motion can perform on this style.

A work around is to replace `border` with a parent element with padding that acts as a `border`.

Interested in the technical details behind layout animations? Nanda does an incredible job of explaining the challenges of animating layout with transforms using interactive examples. Matt, creator of Motion, did a talk at Vercel conference about the implementation details that is largely up to date.

## Motion's layout animations vs the View Transitions API

More browsers are starting to support the View Transitions API, which is similar to Motion's layout animations.

### Benefits of View Transitions API

The main two benefits of View Transitions is that **it's included in browsers** and **features a unique rendering system**.

#### Filesize

Because the View Transitions API is already included in browsers, it's cheap to implement very simple crossfade animations.

However, the CSS complexity can scale quite quickly. Motion's layout animations are around 12kb but from there it's very cheap to change transitions, add springs, mark matching

#### Rendering

Whereas Motion animates the elements as they exist on the page, View Transitions API does something quite unique in that it takes an image snapshot of the previous page state, and crossfades it with a live view of the new page state.

For shared elements, it does the same thing, taking little image snapshots and then crossfading those with a live view of the element's new state.

This can be leveraged to create interesting effects like full-screen wipes that aren't really in the scope of layout animations. Framer's Page Effects were built with the View Transitions API and it also extensively uses layout animations. The right tool for the right job.

### Drawbacks to View Transitions API

There are quite a few drawbacks to the API vs layout animations:

- **Not interruptible**: Interrupting an animation mid-way will snap the animation to the end before starting the next one. This feels very janky.

- **Blocks interaction**: The animating elements overlay the "real" page underneath and block pointer events. Makes things feel quite sticky.

- **Difficult to manage IDs**: Layout animations allow more than one element with a `layoutId` whereas View Transitions will break if the previous element isn't removed.

- **Less performant:** View Transitions take an actual screenshot and animate via `width`/`height` vs layout animation's `transform`. This is measurably less performant when animating many elements.

- **Doesn't account for scroll**: If the page scroll changes during a view transition, elements will incorrectly animate this delta.

- **No relative animations:** If a nested element has a `delay` it will get "left behind" when its parent animates away, whereas Motion handles this kind of relative animation.

- **One animation at a time**: View Transitions animate the whole screen, which means combining it with other animations is difficult and other view animations impossible.

All-in-all, each system offers something different and each might be a better fit for your needs. In the future it might be that Motion also offers an API based on View Transitions API.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- Motion+\\
\\
**AnimateNumber**\\
\\
Create beautiful number ticker and countdown animations in React.

**Layout animation examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**iOS App Store**\\
\\
An example of animating cards inspired by the iOS App Store using Motion for React's layout animations.

Previous

React animation

Next

Scroll animation

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- How to animate layout changes
- Performance
- Shared layout animations
- Customise a layout animation
- Advanced use-cases
- Animating within scrollable element
- Animating within fixed containers
- Group layout animations
- Scale correction
- Troubleshooting
- The component isn't animating
- Animations don't work during window resize
- SVG layout animations are broken
- Content is animating when the scrollbar appears
- The content stretches undesirably
- Border radius or box shadows are behaving strangely
- Border looks stretched during animation
- Technical reading
- Motion's layout animations vs the View Transitions API
- Benefits of View Transitions API
- Drawbacks to View Transitions API

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-presence

Motion homepage

Docs

Examples

Tutorials

Motion+

`AnimatePresence` makes exit animations easy. By wrapping one or more `motion` components with `AnimatePresence`, we gain access to the `exit` animation prop.

Hide

## Usage

### Import

import{AnimatePresence}from"motion/react"

### Exit animations

`AnimatePresence` works by detecting when its **direct children** are removed from the React tree.

This can be due to a component mounting/remounting:

functionSlide({img,description}){

return(

}

Direct children must each have a unique `key` prop so `AnimatePresence` can track their presence in the tree.

Like `initial` and `animate`, `exit` can be defined either as an object of values, or as a variant label.

constmodalVariants = {

visible:{opacity:1,transition:{when:"beforeChildren"}},

hidden:{opacity:0,transition:{when:"afterChildren"}}

functionModal({children}){

### Changing `key`

Changing a `key` prop makes React create an entirely new component. So by changing the `key` of a single child of `AnimatePresence`, we can easily make components like slideshows.

key={image.src}

src={image.src}

initial={{x:300,opacity:0}}

animate={{x:0,opacity:1}}

exit={{x: -300,opacity:0}}

Framer Motion: Image gallery - CodeSandbox

CodeSandbox

# Framer Motion: Image gallery

## A live, editable example of the Framer Motion API

10.5M

94

8.5k

Edit Sandbox

Files

public

src

Example.tsx

image-data.ts

index.tsx

styles.css

package.json

tsconfig.json

Dependencies

framer-motion 5.0.0

react 16.8.4

react-dom 16.8.4

react-scripts 2.1.3

Open Sandbox

1

2

3

4

5

6

7

8

9

10

11

12

13

14

import\*asReactfrom"react";

import { render } from"react-dom";

import { Example } from"./Example";

import"./styles.css";

React App

‣

Console

0

Problems

React DevTools

AllInfoWarningErrorDebug

### Access presence state

Any child of `AnimatePresence` can access presence state with the `useIsPresence` hook.

import{useIsPresent}from"motion/react"

functionComponent(){

constisPresent = useIsPresent()

returnisPresent ? "Here!" : "Exiting..."

This allows you to change content or styles when a component is no longer rendered.

### Access presence data

When a component has been removed from the React tree, its props can no longer be updated. We can use `AnimatePresence`'s `custom` prop to pass new data down through the tree, even into exiting components.

import{AnimatePresence,usePresenceData}from"motion/react"

functionSlide(){

constdirection = usePresenceData()

usePresenceData — Motion for React Example

### Manual usage

It's also possible to manually tell `AnimatePresence` when a component is safe to remove with the `usePresence` hook.

This returns both `isPresent` state and a callback, `safeToRemove`, that should be called when you're ready to remove the component from the DOM (for instance after a manual animation or other timeout).

import{usePresence}from"motion/react"

const\[isPresent,safeToRemove\] = usePresence()

// Remove from DOM 1000ms after being removed from React

},\[isPresent\])

### Propagate exit animations

By default, `AnimatePresence` controls the `exit` animations on all of its children, **until** another `AnimatePresence` component is rendered.

\\* When \`show\` becomes \`false\`, exit animations

\\* on these children will not fire.

\*/}

{children}

\\* on these children \*\*will\*\* fire.

### `initial`

By passing `initial={false}`, `AnimatePresence` will disable any initial animations on children that are present when the component is first rendered.

When a component is removed, there's no longer a chance to update its props (because it's no longer in the React tree). Therefore we can't update its exit animation with the same render that removed the component.

By passing a value through `AnimatePresence`'s `custom` prop, we can use dynamic variants to change the `exit` animation.

constvariants = {

opacity:0,

x:direction === 1 ? -300 : 300

}),

visible:{opacity:1,x:0}

variants={variants}

initial="hidden"

animate="visible"

exit="hidden"

This data can be accessed by children via `usePresenceData`.

### `mode`

**Default:**`"sync"`

Decides how `AnimatePresence` handles entering and exiting children.

AnimatePresence modes — Motion for React Example

`sync`

`wait`

`popLayout`

Switch

#### `sync`

In `"sync"` mode, elements animate in and out as soon as they're added/removed.

This is the most basic (and default) mode - `AnimatePresence` takes no opinion on sequencing animations or layout. Therefore, if element layouts conflict (as in the above example), you can either implement your own solution (using `position: absolute` or similar), or try one of the other two `mode` options.

#### `wait`

In `"wait"` mode, the entering element will **wait** until the exiting child has animated out, before it animates in.

This is great for sequential animations, presenting users with one piece of information or one UI element at a time.

`wait` mode only supports one child at a time.

Try setting `ease: "easeIn"` (or similar) on the exit animation, and `ease: "easeOut"` on the enter animation for an overall `easeInOut` easing effect.

#### `popLayout`

Exiting elements will be "popped" out of the page layout, allowing surrounding elements to immediately reflow. Pairs especially well with the `layout` prop, so elements can animate to their new layout.

For a more detailed comparison, check out the full AnimatePresence modes tutorial.

### `onExitComplete`

Fires when all exiting nodes have completed animating out.

### `propagate`

**Default:**`false`

If set to `true`, exit animations on children will also trigger when this `AnimatePresence` exits from a parent `AnimatePresence`.

Root element for injecting `popLayout` styles. Defaults to `document.head` but can be set to another `ShadowRoot`, for use within shadow DOM.

## Troubleshooting

### Exit animations aren't working

Ensure all **immediate** children get a unique `key` prop that **remains the same for that component every render**.

For instance, providing `index` as a `key` is **bad** because if the items reorder then the `index` will not be matched to the `item`:

For example, this will **not work**:

isVisible && (

Instead, the conditional should be at the root of `AnimatePresence`:

When mixing exit and layout animations, it might be necessary to wrap the group in `LayoutGroup` to ensure that components outside of `AnimatePresence` know when to perform a layout animation.

When any HTML element has an active `transform` it temporarily becomes the offset parent of its children. This can cause children with `position: "absolute"` not to appear where you expect.

`mode="popLayout"` works by using `position: "absolute"`. So to ensure consistent and expected positioning during a layout animation, ensure that the animating parent has a `position` other than `"static"`.

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- Motion+\\
\\
**Cursor**\\
\\
Create custom cursor and follow-along effects in React.

- Motion+\\
\\
**AnimateActivity**\\
\\

[**AnimatePresence examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Exit animation**\\
\\
An example of animating an element when it's removed from the DOM using AnimatePresence in Motion for React.

Previous

AnimateActivity

Next

AnimateView

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Import
- Exit animations
- Changing key
- Access presence state
- Access presence data
- Manual usage
- Propagate exit animations
- Props
- initial
- custom
- mode
- onExitComplete
- propagate
- root
- Troubleshooting
- Exit animations aren't working
- Layout animations not working with mode="sync"
- Layout animations not working with mode="popLayout"

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-svg-animation

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion makes React SVG animation straightforward. In this guide, we'll learn how to make line drawing animations, path morphing animations, animate `viewBox` and more.

Path drawing — Motion for React Example

## Overview

<motion.circle

style={{fill:"#00f"}}

animate={{fill:"#f00"}}

cx={0}

animate={{cx:50}}

The `motion.svg` component can additionally animate `viewBox`. This is especially useful for easy panning animations:

<motion.svg

viewBox="0 0 200 200"

animate={{viewBox:"100 0 200 200"}}// 100px to the right

animate={{viewBox:"-100 -100 300 300"}}// Zoom out

SVG transforms work differently to CSS transforms. When we define a CSS transform, the default origin is **relative to the element itself.** So for instance, this `div` will rotate around its center point, as you'd intuitively expect:

The default behaviour can be restored by explicitly setting an element's `transformBox` style:

`motion` components provide shorthands for `x`, `y`, and `scale` transforms:

Motion values should be passed via `style`, when animating regular styles, or via the component's attribute where appropriate:

constcx = useMotionValue(100)

constopacity = useMotionValue(1)

Motion simplifies the creation of “hand-drawn” line animations using three special values. Each is set as a `0`-`1` progress value, where `1` is the total length of the line:

- `pathLength`: total drawn length

- `pathSpacing`: length between segments

- `pathOffset`: where the segment starts

These values work on `path`, `circle`, `ellipse`, `line`, `polygon`, `polyline`, `rect`.

<motion.path

d={d}

initial={{pathLength:0}}

animate={{pathLength:1}}

## Path morphing

It's possible to also animate the shape of a `path` via its `d` attribute.

d="M 0,0 l 0,10 l 10,10"

animate={{d:"M 0,0 l 10,0 l 10,10"}}

For interpolating between very different paths, you can incorporate a third-party path mixer like Flubber:

Path morphing — Motion for React Example

## Drag gesture

SVG elements can be made draggable in the same way as their HTML counterparts, using the `drag` prop.

For example, this SVG has a `viewBox` of `100px` width and height, vs a rendered size of `200px`:

import{motion,MotionConfig,transformViewBoxPoint}from"motion/react"

functionComponent(){

constref = useRef(null)

return(

}

## Related topics

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- **Motion values overview**\\
\\
Composable animatable values that can updated styles without re-renders.

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

Tutorial\\
\\
**Path morphing**\\
\\
An example of creating smooth SVG path morphing animations with Motion for React.

Previous

Scroll animation

Next

Transitions

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Overview
- Animate viewBox
- Transforms
- x/y/scale attributes
- Passing MotionValue
- Line drawing
- Path morphing
- Drag gesture

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-ai-context

Motion homepage

Docs

Examples

Tutorials

Motion+

LLMs have supercharged our development workflows, but even now they still struggle to produce great animation code.

For example, have you ever fought with your LLM about still importing Motion from `"framer-motion"`? This is because it's trained on out-of-date information.

Or has it produced an animation that's **almost** right but ends up requiring a lot of prompting to fix? This is because LLMs can't visualise timing or easing curves, so they guess at values that often feel wrong.

Motion Studio provides a number of tools to improve the output of our LLMs by giving it the right information at the right time, and giving it quality over quantity:

- An MCP providing your LLM access to:

- Latest Motion documentation

- Source code for 330+ examples

- Your saved transitions
- Spring and transition visualisation

- Rules file for best practises and performance advice

In short, it turns your AI editor into a Motion expert.

## Documentation

The Motion Studio MCP comes loaded with the full and latest Motion documentation.

Every page is available as a resource, and is queryable by the LLM via the dedicated search tool.

## Examples

Motion+ comes with a vault of 330+ examples, and they're all queryable by your LLM.

Instead of relying on outdated training data, your AI searches this curated collection of production-ready patterns and adapts them to your project. It's as easy as "build me an accordion", or "create a vertically scrolling Carousel".

- **Zero hallucinations:** The code comes from the official Motion repository, not a generic LLM training set.

- **Instant & Offline:** The server runs locally on your machine for zero latency.

- **Context aware:** The AI reads the example code and understands **why** it works, allowing it to adapt the variables to your specific project names automatically.

Use prompts like:

create a tooltip with Motion and Base UI

Or:

make a spinning 3d cube

### Browsing

All examples are browsable via the Motion Examples gallery. It's easy to ask your editor to add a specific one:

adapt the app store motion example

The AI editor will, by default, select between JS, React and Vue based on your project. You can manually prompt it for a specific platform by mentioning it directly.

adapt the app store motion vue example

## Saved transitions

When using the Motion Studio extension's visual transition editor, you can save transitions you build to your Motion+ profile.

On a user's profile, you can save their shared transitions to your own profile, too.

With the Motion Studio MCP, these shared transitions can be accessed via your LLM.

use my "bounce out" transition

## Visualise transitions

LLMs struggle to visualise animations but they can recognise images. Motion Studio lets you generate images from transitions to help your LLM understand them.

A prompt like:

visualise the ease-in-out easing curve

Will use Motion to generate an image like this for your LLM:

Or, you can highlight existing Motion spring settings or cubic bezier definition and simply prompt "visualise this".

## Rules

AI rules allow you to customise and guide AI behaviour beyond just providing documentation. The Motion Studio rules prompt your AI with best practises, like:

- When and how to add `will-change`.

- Coding styles to improve per-frame performance.

- When to use `transform` vs independent transforms.

Once you've installed Motion+ rules via the private Motion+ GitHub repo, your editor should automatically use the rules when you mention Motion or edit Motion code.

Custom rule files are available for React, vanilla JS, Vue and also Base UI.

## Get Motion Studio

Stop fighting your AI over animation code. Motion Studio is included with Motion+, along with a library of premium Motion APIs, 330+ examples, 100+ tutorials, private Discord access and early access to all new Motion APIs.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Get started with Motion Studio**

- **Generate CSS**

Previous

Install Motion Studio

Next

Animation Performance Audit

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Documentation
- Examples
- Browsing
- Saved transitions
- Visualise transitions
- Rules
- Get Motion Studio

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-visual-controls

Motion homepage

Docs

Examples

Tutorials

Motion+

Edit CSS and Motion transitions using the real-time visual controls with the Motion Studio extension, available for Cursor and VS Code.

- **Real-time updates:** Your code is instantly updated with AST-powered edits.

- **CSS & Motion:** Animate with either (or both!)

- **Cloud saves:** Like a transition? Save it to reuse later.

- **Share transitions:** Saved transitions appear on your Motion+ profile for others to download.

## Edit

Open the Motion panel and highlight any Motion or CSS animation or transition to open the edit controls.

Every change updates your code instantly via AST-powered edits, so there's no copy-pasting or manual syncing.

Currently, the edit panels supports `duration`, `delay` and easing curves, with spring support coming soon.

Edits made to your code will preserve most formatting and respect overrides like `transition-delay`.

### Named easing

Visual editing supports **some** named easing curves in both Motion and CSS, currently those that can be mapped to bezier curves:

- linear

- easeIn/Out/InOut

### Multiple transitions

By selecting multiple transitions, they can be edited simultaneously.

The values from the first transition will be visible in the UI, and changes will overwrite values in all selected transitions.

## Save

Once you've dialled in the perfect transition, it can be saved to your profile.

Once saved, you can click on the name to edit it. Or, click on the transition curve to apply a saved transition to your selected code.

Saved transitions also work with the Motion Studio MCP, so you can prompt your AI to use them directly: "apply my 'snappy' spring to this modal."

Every saved transition appears on your public Motion+ profile (if you have one). Other developers can browse your transitions, preview them, and save them to their own profiles.

It's an easy way to share your animation style with your team, or just show off.

## Get Motion Studio

Stop guessing at spring values, or copy-pasting bezier curves from the web. Motion Studio is included with Motion+, along with a library of premium Motion APIs, 330+ examples, 100+ tutorials, private Discord access and early access to all new Motion APIs.

## Related topics

- **Get started with Motion Studio**

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Studio SDK Overview**\\
\\
The complete toolkit for building animation editors and bridging design with implementation.

Previous

Animation Performance Audit

Next

Generate CSS

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Edit
- Named easing
- Multiple transitions
- Save
- Share
- Get Motion Studio

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/animation-performance-audit

Motion homepage

Docs

Examples

Tutorials

Motion+

The Animation Performance Audit is an AI skill that will audit every Motion & CSS animation in your codebase (or selected files), classify their performance, and then generate a report including scorecard and available improvements.

/motion-audit

Your LLM can then follow this report to fix slow animations in your codebase.

Without exceptionally deep knowledge about the rendering pipeline, it's difficult to know how all the various methods of animating, and the CSS values that can be animated, are going to perform.

We wrote the Web Animation Performance Tier List to teach as much about this subject as we know, but there are so many surprising gotchas, that it's difficult to know everything. And as various people work on the same codebase, performance invariably slips. This is where the Animation Performance Audit comes in.

## Install

The Animation Performance Audit skill is available to Motion+ members.

By running the following command in your terminal, the skill will be installed into all detected AI editors.

curl-sL"http://api.motion.dev/registry/skills/motion-audit?token=YOUR\_TOKEN" \| bash

Supported editors:

- Cursor

- Claude Code

- Windsurf

- Amp

- OpenCode

- Gemini CLI

## Usage

Run the audit inside a project using the `/motion-audit` command:

By default, this will run a broad search of CSS, Motion, GSAP and Anime.js APIs in your codebase.

It's possible to limit the scope by passing a directory or filename:

/motion-audit @components/Button

Additionally, you can request to scope the audit to specific types of animations, or specific APIs:

Can you perform a /motion-auditof all scroll animations

### Overall rank

The report starts with an easily-scannable letter ranking. This represents an average ranking of all discovered animations.

\## Rank

:'██████::

'██... ██:

.██:::..::

. ██████::

:..... ██:

'██::: ██:

:......:::

### Breakdown

Next, you'll receive a full breakdown describing the absolute number of animations for each tier, and the percentage of animations that this tier represents. The idea is for this graph to be top-heavy (more S, A and B tier animations than below).

\## Breakdown

S █████████████████░░░░░░░░░ 2 · 68%

A ░░░░░░░░░░░░░░░░░░░░░░░░░░ 0 · 0%

B ░░░░░░░░░░░░░░░░░░░░░░░░░░ 0 · 0%

C ████████░░░░░░░░░░░░░░░░░░ 1 · 32%

D ░░░░░░░░░░░░░░░░░░░░░░░░░░ 0 · 0%

F ░░░░░░░░░░░░░░░░░░░░░░░░░░ 0 · 0%

### Findings

In findings, there's an entry for every actionable animation that explains:

- **What:** Filename, line numbers and tier

- **Why:** The values being animated, what parts of the render pipeline they trigger

- **Impact:** Is it worth fixing/changing?

- **Improvements:** How to improve performance (where possible)

For instance, an animation like this:

<motion.div

animate={{

scale:\[1,2,2,1,1\],

rotate:\[0,0,180,180,0\],

borderRadius:\["0%","0%","50%","50%","0%"\],

}}

transition={{repeat:Infinity}}

transform:\[\
\
"scale(1) rotate(0deg)",\
\
"scale(2) rotate(0deg)",\
\
"scale(2) rotate(180deg)",\
\
"scale(2) rotate(180deg)",\
\
"scale(1) rotate(0deg)",\
\
\],

For example, the animation from before is `repeat: Infinity`, so this part of the report will suggest that performance could be improved by swapping `animate` to `whileInView`, thereby only running the animation while inside the viewport.

whileInView={keyframes}

This part of the report looks for things like support for `prefers-reduced-motion` or rapidly flashing animations and suggest ways to fix.

### Top 3 Recommendations

The report concludes with the top 3 priority fixes. This is a summary of the worst offenders, so you can ask your LLM to "fix the top 3 issues", or simply "fix" to fix everything in the report.

## Tiers

The broad tier list used for grading animations is as follows:

| Tier | Cost | Animated properties |
| --- | --- | --- |
| **S** | Compositor only | `transform`, `opacity`, `filter`, `clip-path`, `ScrollTimeline` |
| **A** | JS → Compositor | Same properties, but set from JavaScript each frame |
| **B** | One-time layout read → S/A | `layout`, `layoutId` |
| **C** | Repaint each frame | `background-color`, `color`, `border-radius`, `box-shadow`, CSS variables, SVG attributes, View Transitions |
| **D** | Layout + repaint each frame | `width`, `height`, `margin`, `padding`, `top`/`left`, `font-size`, `gap` |
| **F** | Forced sync layout per cycle | Interleaved DOM reads/writes, `:root` CSS variable animation |

The full explanation of these can be found in the Web Animation Performance Tier List.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Visual Controls**\\
\\
Edit your CSS and Motion animations with the Motion Studio Extension.

- **Generate CSS**

Previous

AI Context

Next

Visual Controls

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Install
- Usage
- Overall rank
- Breakdown
- Findings
- Anti-patterns
- Accessibility
- Top 3 Recommendations
- Tiers

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/cursor:extension/motion.motion-vscode-extension

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-install

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion Studio provides visual editing tools via the **Motion Studio extension**, and AI editing tools via the **Motion Studio MCP**. Currently, both must be installed separately.

### Install Motion Studio

One-click install for Cursor:

Add Extension

Add MCP

Motion Studio is also compatible with VS Code, Google Antigravity and more. Read on for full installation instructions.

## Visual editing

Motion Studio visual editing tools are provided via the official Extension.

Add to VS Code

It's also available on the Open VSX marketplace for other editors.

## MCP

The basic Motion Studio MCP includes AI enhancements like:

- AI context: Allow your LLM to improve its animation skills by searching the full Motion docs, source code of 330+ examples, and saved transitions.

- CSS spring generation

To install, add the following to your editor's MCP JSON settings:

{

"mcpServers":{

"motion":{

"command":"npx",

"args":\["-y","https://api.motion.dev/registry.tgz?package=motion-studio-mcp&version=latest"\]

}

The exact process differs by editor, but here are the MCP docs for popular apps:

- VS Code (search "mcp.json")

- Windsurf

- Claude Desktop

- Claude Code

## Unlock Motion+ features

To enable Motion+ features like the codex and curve visualisation, you have to install with your personal access token:

"args":\["-y","https://api.motion.dev/registry.tgz?package=motion-studio-mcp&version=latest"\],

"env":{

},

## Related topics

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Generate CSS**

- **Studio SDK Overview**\\
\\
The complete toolkit for building animation editors and bridging design with implementation.

Previous

Get started with Motion Studio

Next

AI Context

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Visual editing
- MCP
- Unlock Motion+ features

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/gsap-vs-motion)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-installation).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-transitions)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-transitions).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animation)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-gestures).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-scroll-animations):

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-layout-animations)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-presence).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-svg-animation),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-ai-context),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-visual-controls),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/animation-performance-audit),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-install).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-ai-context)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-scroll-animations)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-number

Motion homepage

Docs

Examples

Tutorials

Motion+

Checking Motion+ status…

AnimateNumber

is exclusive to Motion+

290+ examples & 40+ tutorials

Premium APIs

Motion Studio editing tools

`alpha`

Discord community

Early access

Lifetime updates

Get Motion+ for instant access

One-time payment, lifetime updates

Already joined?

Login

`AnimateNumber` is a lightweight (2.5kb) React component for creating beautiful number animations with Motion. It's perfect for counters, dynamic pricing, countdowns, and more.

`AnimateNumber` is exclusive to Motion+ members. Motion+ is a one-time payment, lifetime membership that unlocks exclusive components, premium examples and access to a private Discord community.

Number counter — Motion for React Example

​​0123456789​​

## Features

- **Built on Motion:** Leverages Motion's robust animation engine, allowing you to use familiar `transition` props like `spring`, `duration`, and `ease`.

- **Lightweight:** Adds only 2.5kb on top of Motion.

- **Advanced formatting:** Uses the built-in `Intl.NumberFormat` for powerful, locale-aware number formatting (e.g., currency, compact notation).

- **Customisable:** Provides distinct CSS classes for each part of the number (prefix, integer, fraction, suffix) for full styling control.

## Install

First, add the `motion-plus` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.10.0&token=YOUR\_AUTH\_TOKEN"

## Usage

`AnimateNumber` accepts a single child, a number.

import{AnimateNumber}from"motion-plus/react"

functionCounter(){

const\[count,setCount\] = useState(0)

return(

}

### Customise animation

The `transition` prop accepts Motion for React's transition options.

<AnimateNumbertransition={{

layout:{duration:0.3},

opacity:{ease:"linear"},

y:{type:"spring",visualDuration:0.4,bounce:0.2}

- **Layout animation**\\
\\
Smoothly animate layout changes and create shared element animations.

**AnimateNumber examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

Reorder

Next

Carousel

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Register

Upgrade

---

# https://motion.dev/docs/studio-install)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-number)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-component

Motion homepage

Docs

Examples

Tutorials

Motion+

There's a `motion` component for every HTML and SVG element, for instance `motion.div`, `motion.circle` etc. Think of it as a normal React component, supercharged for 120fps animation and gestures.

## Usage

Import `motion` from Motion:

// React

import{motion}from"motion/react"

// React Server Components (Next.js etc)

import\*asmotionfrom"motion/react-client"

You can use a `motion` component exactly as you would any normal HTML/SVG component:

<motion.div

className="box"

// Animate when this value changes:

animate={{scale:2}}

// Fade in when the element enters the viewport:

whileInView={{opacity:1}}

// Animate the component when its layout changes:

layout

// Style now supports indepedent transforms:

style={{x:100}}

`motion` components animate values without triggering React renders, for optimal performance.

Using motion values instead of React state to update `style` will also avoid re-renders.

constx = useMotionValue(0)

// Won't trigger a re-render!

},\[\])

`motion` components are fully compatible with server-side rendering, meaning the initial state of the component will be reflected in the server-generated output.

// Server will output \`translateX(100px)\`

Any React component can be turned into a `motion` component by passing it to `motion.create()`.

constMotionComponent = motion.create(Component)

Your component **must** pass a ref to the component you want to animate.

**React 18:** Use `forwardRef` to wrap the component and pass `ref` to the element you want to animate:

**React 19:** React 19 can pass `ref` via `props`:

Make sure **not** to call `motion.create()` within a React render function! This will make a new component every render, breaking your animations.

It's also possible to pass strings to `motion.create`, which will create custom DOM elements.

constMotionComponent = motion.create('custom-element')

By default, all `motion` props (like `animate` etc) are filtered out of the `props` forwarded to the provided component. By providing a `forwardMotionProps` config, the provided component will receive these props.

motion.create(Component,{forwardMotionProps:true})

## Props

`motion` components accept the following props.

### Animation

Motion provides declarative animation props like `animate` and `exit`. Learn more about React animations in Motion.

#### `initial`

The initial visual state of the `motion` component.

This can be set as an animation target:

A target to animate to on enter, and on update.

Can be set as an animation target:

initial={{boxShadow:"0px 0px #000"}}

animate={{boxShadow:"10px 10px #000"}}

A target to animate to when a component is removed from the tree. Can be set either as an animation target, or variant.

Owing to React limitations, the component being removed **must** be a **direct child** of `AnimatePresence` to enable this animation.

#### `transition`

The default transition for this component to use when an animation prop (`animate`, `whileHover` etc) has no `transition` defined.

#### `variants`

The variants for this component.

constvariants = {

active:{

backgroundColor:"#f00"

},

inactive:{

backgroundColor:"#fff",

transition:{duration:2}

}

return(

variants={variants}

animate={isActive ? "active" : "inactive"}

#### `style`

The normal React DOM `style` prop, with added support for motion values and independent transforms.

constx = useMotionValue(30)

Callback triggered every frame any value on the `motion` component updates. It's provided a single argument with the latest values.

<motion.article

animate={{opacity:1}}

Callback triggered when any animation (except layout animations, see `onLayoutAnimationStart`) starts.

It's provided a single argument, with the target or variant name of the started animation.

<motion.circle

animate={{r:10}}

Callback triggered when any animation (except layout animations, see `onLayoutAnimationComplete`) completes.

It's provided a single argument, with the target or variant name of the completed animation.

#### `whileHover`

Animation state, or variant label, to perform a hover animation to while the hover gesture is active.

// As target

Callback function that fires when a pointer starts hovering over the component. Provided the triggering `PointerEvent`.

Callback function that fires when a pointer stops hovering over the component. Provided the triggering `PointerEvent`.

#### `whileTap`

Animation state, or variant label, to perform a press animation to while the hover gesture is active.

Callback function that fires when a pointer starts pressing the component. Provided the triggering `PointerEvent`.

Callback function that fires when a pointer stops pressing the component and the pointer was released **inside** the component. Provided the triggering `PointerEvent`.

Callback function that fires when a pointer stops pressing the component and the pointer was released **outside** the component. Provided the triggering `PointerEvent`.

#### `whileFocus`

Animation state, or variant label, to animate to while the focus gesture is active.

#### `onPan`

Callback function that fires when the pan gesture is recognised on this element.

For pan gestures to work correctly with touch input, the element needs touch scrolling to be disabled on either x/y or both axis with the `touch-action` CSS rule.

functiononPan(event,info){

console.log(info.point.x,info.point.y)

- `point`: Relative to the device or page.

- `delta`: Distance since the last event.

- `offset`: Distance from the original event.

- `velocity`: Current velocity of the pointer.

#### `onPanStart`

Callback function that fires when a pan gesture starts. Provided the triggering `PointerEvent` and `info`.

Callback function that fires when a pan gesture ends. Provided the triggering `PointerEvent` and `info`.

#### `drag`

**Default:**`false`

Enable dragging for this element. Set `true` to drag in both directions. Set `"x"` or `"y"` to only drag in a specific direction.

Animation state, or variant label, to perform a drag animation to while the hover gesture is active.

Applies constraints on the draggable area.

Set as an object of optional `top`, `left`, `right`, and `bottom` values, measured in pixels:

drag="x"

dragConstraints={{left:0,right:300}}

constconstraintsRef = useRef(null)

#### `dragSnapToOrigin`

If `true`, the draggable element will animate

**Default:**`0.5`

The degree of movement allowed outside constraints. `0` = no movement, `1` = full movement.

Set to `0.5` by default. Can also be set as `false` to disable movement.

By passing an object of `top`/`right`/`bottom`/`left`, individual values can be set per constraint. Any missing values will be set to `0`.

drag

dragElastic={0.2}

**Default:**`true`

Apply momentum from the pan gesture to the component when dragging finishes. Set to `true` by default.

dragMomentum={false}

Allows you to change dragging momentum transition. When releasing a draggable element, an animation with type `"inertia"` starts. The animation is based on your dragging velocity. This property allows you to customize it.

dragTransition={{bounceStiffness:600,bounceDamping:10}}

Locks drag direction into the soonest detected direction. For example, if the component is moved more on the `x` axis than `y` axis before the drag gesture kicks in, it will **only** drag on the `x` axis for the remainder of the gesture.

Allows drag gesture propagation to child components.

Usually, dragging is initiated by pressing down on a component and moving it. For some use-cases, for instance clicking at an arbitrary point on a video scrubber, we might want to initiate dragging from a different component than the draggable one.

By creating a `dragControls` using the `useDragControls` hook, we can pass this into the draggable component's `dragControls` prop. It exposes a `start` method that can start dragging from pointer events on other components.

constdragControls = useDragControls()

functionstartDrag(event){

dragControls.start(event,{snapToCursor:true})

Given that by setting `dragControls` you are taking control of initiating the drag gesture, it is possible to disable the draggable element as the initiator by setting `dragListener={false}`.

#### `dragListener`

Determines whether to trigger the drag gesture from event listeners. If passing `dragControls`, setting this to `false` will ensure dragging can only be initiated by the controls, rather than a `pointerdown` event on the draggable element.

#### `onDrag`

Callback function that fires when the drag gesture is recognised on this element.

functiononDrag(event,info){

#### `onDragStart`

Callback function that fires when a drag gesture starts. Provided the triggering `PointerEvent` and `info`.

Callback function that fires when a drag gesture ends. Provided the triggering `PointerEvent` and `info`.

Callback function that fires a drag direction is determined.

dragDirectionLock

#### `propagate`

Prevent children gestures from propagating to their parents. Currently only supports `tap`.

<motion.button

whileTap={{opacity:0.8}}

propagate={{tap:false}}

Learn more about scroll-triggered animations in React.

#### `whileInView`

Target or variants to label to while the element is in view.

Options to define how the element is tracked within the viewport.

<motion.section

viewport={{once:true}}

- `once`: If `true`, once element enters the viewport it won't detect subsequent leave/enter events.

- `root`: The `ref` of an ancestor scrollable element to detect intersections with (instead of `window`).

- `margin`: A margin to add to the viewport to change the detection area. Defaults to `"0px"`. Use multiple values to adjust top/right/bottom/left, e.g. `"0px -20px 0px 100px"`.

- `amount`: The amount of an element that should enter the viewport to be considered "entered". Either `"some"`, `"all"` or a number between `0` and `1`. Defaults to `"some"`.

#### `onViewportEnter`

Callback function that fires when an element enters the viewport. Provided the `IntersectionObserverEntry` with details of the intersection event.

Learn more about layout animations in React.

#### `layout`

If `true`, this component will perform layout animations.

If set, this component will animate changes to its layout. Additionally, when a new element enters the DOM and an element already exists with a matching `layoutId`, it will animate out from the previous element's size/position.

If the previous component remains in the tree, the two elements will crossfade.

#### `layoutDependency`

By default, layout changes are detected every render. To reduce measurements and thus improve performance, you can pass a `layoutDependency` prop. Measurements will only occur when this value changes.

For layout animations to work correctly within scrollable elements, their scroll offset needs measuring. For performance reasons, Framer Motion doesn't measure the scroll offset of every ancestor. Add the `layoutScroll` prop to elements that should be measured.

For layout animations to work correctly within `position: fixed` elements, we need to account for page scroll. Add `layoutRoot` to mark an element as `position: fixed`.

A call

#### `inherit`

Set to `false` to prevent a component inheriting or propagating changes in a parent variant.

#### `custom`

Custom data to pass through to dynamic variants.

opacity:1,

transition:{delay:custom \\* 0.2}

})

#### `transformTemplate`

By default, transforms are applied in order of `translate`, `scale`, `rotate` and `skew`.

To change this, `transformTemplate` can be set as a function that accepts the latest transforms and the generated transform string and returns a new transform string.

// Use the latest transform values

style={{x:0,rotate:180}}

transformTemplate={

- **Layout animation**\\
\\
Smoothly animate layout changes and create shared element animations.

- **SVG animation**\\
\\
Animate SVGs in React - Line drawing and morphing effects, and more.

**Motion component examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Magnetic filings**\\
\\
An example of creating a grid of metal filings that rotate to point towards the cursor position using Motion for React.

Previous

Drag animation

Next

AnimateActivity

## Love animating with components?

Motion+ includes premium animation components like Cursor and Ticker that will save you hours of development time.

See the full feature list

One-time payment, lifetime updates.

## On this page

- Usage
- Performance
- Server-side rendering
- Custom components
- Props
- Animation
- Hover
- Focus
- Pan
- Drag
- Gestures
- Viewport
- Layout
- Advanced

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-value

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion values track the state and velocity of animated values.

They are composable, signal-like values that are performant because Motion can render them with its optimised DOM renderer.

Usually, these are created automatically by `motion` components. But for advanced use cases, it's possible to create them manually.

import{motion,useMotionValue}from"motion/react"

exportfunctionMyComponent(){

constx = useMotionValue(0)

By manually creating motion values you can:

- Set and get their state.

- Pass to multiple components to synchronise motion across them.

- Chain `MotionValue`s via the `useTransform` hook.

- Update visual properties without triggering React's render cycle.

- Subscribe to updates.

constopacity = useTransform(

x,

\[-200,0,200\],

\[0,1,0\]

)

// Will change opacity as element is dragged left/right

Motion values can be created with the `useMotionValue` hook. The string or number passed to `useMotionValue` will act as its initial state.

import{useMotionValue}from"motion/react"

Motion values can be passed to a `motion` component via `style`:

Motion values can be updated with the `set` method.

x.set(100)

Changes to the motion value will update the DOM **without triggering a React re-render**. Motion values can be updated multiple times but renders will be batched to the next animation frame.

A motion value can hold any string or number. We can read it with the `get` method.

x.get()// 100

Motion values containing a number can return a velocity via the `getVelocity` method. This returns the velocity as calculated **per second** to account for variations in frame rate across devices.

constxVelocity = x.getVelocity()

For strings and colors, `getVelocity` will always return `0`.

### Events

Listeners can be added to motion values via the`on` method or the`useMotionValueEvent` hook.

Available events are `"change"`, `"animationStart"`, `"animationComplete"``"animationCancel"`.

### Composition

Beyond `useMotionValue`, Motion provides a number of hooks for creating and composing motion values, like `useSpring` and `useTransform`.

For example, with `useTransform` we can take the latest state of one or more motion values and create a new motion value with the result.

`useSpring` can make a motion value that's attached to another via a spring.

constdragX = useMotionValue(0)

constdragY = useMotionValue(0)

constx = useSpring(dragX)

consty = useSpring(dragY)

Shared layout animation — Motion for React Example

🍅

These motion values can then go on to be passed to `motion` components, or composed with more hooks like `useVelocity`.

## API

### `get()`

Returns the latest state of the motion value.

### `getVelocity()`

Returns the latest velocity of the motion value. Returns `0` if the value is non-numerical.

### `set()`

Sets the motion value to a new state.

x.set("#f00")

### `jump()`

Jumps the motion value to a new state in a way that breaks continuity from previous values:

- Resets `velocity` to `0`.

- Ends active animations.

- Ignores attached effects (for instance `useSpring`'s spring).

constx = useSpring(0)

x.jump(10)

x.getVelocity()// 0

### `isAnimating()`

Returns `true` if the value is currently animating.

### `stop()`

Stop the active animation.

### `on()`

Subscribe to motion value events. Available events are:

- `change`

- `animationStart`

- `animationCancel`

- `animationComplete`

It returns a function that, when called, will unsubscribe the listener.

When calling `on` inside a React component, it should be wrapped with a `useEffect` hook, or instead use the`useMotionValueEvent` hook.

### `destroy()`

Destroy and clean up subscribers to this motion value.

This is normally handled automatically, so this method is only necessary if you've manually created a motion value outside the React render cycle using the vanilla `motionValue` hook.

## Related topics

- **useVelocity**\\
\\
Creates a new motion value that outputs the velocity of another motion value.

- **useTransform**\\
\\
Transform the output of one motion value into a new motion value.

- **useSpring**\\
\\
A spring-powered motion value. Standalone or attach to another motion value.

- **useScroll**\\
\\
Create scroll-linked animations like progress bars & parallax with the useScroll React hook.

**Motion values overview examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Card stack**\\
\\
An example of creating a swipeable card stack with photos in Motion for React.

Previous

Typewriter

Next

useMotionTemplate

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Events
- Composition
- API
- get()
- getVelocity()
- set()
- jump()
- isAnimating()
- stop()
- on()
- destroy()

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-config

Motion homepage

Docs

Examples

Tutorials

Motion+

The `MotionConfig` component can be used to set configuration options for all child `motion` components.

import{motion,MotionConfig}from"motion/react"

initial={{opacity:0}}

animate={{opacity:1}}

## Props

### `transition`

Define a fallback `transition` to use for all child `motion` components.

### `reducedMotion`

**Default:**`"never"`

`reducedMotion` lets you set a site-wide policy for handling reduced motion. It offers the following options:

- `"user"`: Respect the user's device setting.

- `"always"`: Enforce reduced motion (useful for debugging).

- `"never"`: Don't respect reduced motion.

When reduced motion is on, transform and layout animations will be disabled. Other animations, like `opacity` and `backgroundColor`, will persist.

### `nonce`

If using a Content Security Policy with a `nonce` attribute, passing the same attribute through `MotionConfig` will allow any `style` blocks generated by Motion to adhere the the security policy.

## Related topics

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

- **SVG animation**\\
\\
Animate SVGs in React - Line drawing and morphing effects, and more.

- **Transitions**\\
\\
Control timing with duration/easing, springs, delay and stagger.

**MotionConfig examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

LazyMotion

Next

Reorder

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Props
- transition
- reducedMotion
- nonce

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-animate

Motion homepage

Docs

Examples

Tutorials

Motion+

`useAnimate` provides a way of using the `animate` function that is scoped to the elements within your component.

This allows you to use manual animation controls, timelines, selectors scoped to your component, and automatic cleanup.

It provides a `scope` ref, and an `animate` function where every DOM selector is scoped to this ref.

functionComponent(){

const\[scope,animate\] = useAnimate()

// This "li" selector will only select children

// of the element that receives \`scope\`.

animate("li",{opacity:1})

})

Additionally, when the component calling `useAnimate` is removed, all animations started with its `animate` function will be cleaned up automatically.

## Usage

Import from Motion:

// Mini

import{useAnimate}from"motion/react-mini"

// Hybrid

import{useAnimate}from"motion/react"

`useAnimate` returns two arguments, a `scope` ref and an `animate` function.

This `scope` ref must be passed to either a regular HTML/SVG element or a `motion` component.

functionComponent({children}){

This scoped `animate` function can now be used in effects and event handlers to animate elements.

We can either use the scoped element directly:

animate(scope.current,{opacity:1},{duration:1})

Or by passing it a selector:

animate("li",{backgroundColor:"#000"},{ease:"linear"})

This selector is `"li"`, but we're not selecting all `li` elements on the page, only those that are a child of the scoped element.

### Scroll-triggered animations

Animations can be triggered when the scope scrolls into view by combining `useAnimate` with `useInView`.

import{useAnimate,useInView}from"motion/react"

constisInView = useInView(scope)

if(isInView){

animate(scope.current,{opacity:1})

}

},\[isInView\])

return(

### Exit animations

It's possible to compose your own exit animations when a component is removed using `useAnimate` in conjunction with `usePresence`.

import{useAnimate,usePresence}from"framer-motion"

const\[isPresent,safeToRemove\] = usePresence()

if(isPresent){

awaitanimate(scope.current,{opacity:1})

awaitanimate("li",{opacity:1,x:0})

enterAnimation()

}else{

awaitanimate("li",{opacity:0,x: -100})

awaitanimate(scope.current,{opacity:0})

safeToRemove()

exitAnimation()

},\[isPresent\])

This component can now be conditionally rendered as a child of `AnimatePresence`.

- **Motion values overview**\\
\\
Composable animatable values that can updated styles without re-renders.

- **Transitions**\\
\\
Control timing with duration/easing, springs, delay and stagger.

- **useInView**\\
\\
Switch React state when an element enters/leaves the viewport.

**useAnimate examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

Upgrade guide

Next

useAnimationFrame

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Scroll-triggered animations
- Exit animations

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/cursor

Motion homepage

Docs

Examples

Tutorials

Motion+

Checking Motion+ status…

Cursor

is exclusive to Motion+

290+ examples & 40+ tutorials

Premium APIs

Motion Studio editing tools

`alpha`

Discord community

Early access

Lifetime updates

Get Motion+ for instant access

One-time payment, lifetime updates

Already joined?

Login

`Cursor` is a powerful React component for building creative and interactive cursor effects. Effortlessly replace the default browser cursor, create engaging follow-cursor animations, or add magnetic snapping to UI elements.

Built on Motion's layout animations, `Cursor` is performant and full customisable with variants, CSS and custom React components.

iOS pointer animation — Motion for React Example

Appearance

## Features

- **Two modes:** Easily switch between replacing the default cursor or creating a "follow" cursor effect.

- **State-aware:** Automatically adapts its appearance when hovering over links, buttons, or selectable text, and when pressed.

- **Magnetic:** Make the cursor snap to interactive elements on hover for a tactile feel.

- **Customisable:** Use CSS, Motion variants, and custom React components to create any cursor you can imagine.

- **Accessible:** Can be disabled for users who prefer reduced motion.

## Install

First, add the `motion-plus` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=YOUR\_AUTH\_TOKEN"

## Usage

The `Cursor` component is used for both custom cursor and follow cursor effects:

import{Cursor}from"motion-plus/react"

When `Cursor` is rendered, a default custom cursor will render on the page, hiding the browser's default cursor.

Cursor: Adaptive caret size — Motion for React Example

## Motion+ Cursor

Hover over this selectable text and the cursor automatically adjusts its caret size to match.

Even if the text is really small.

### Styling

By default, the cursor is a neutral grey color. It's possible to change the cursor's styles using CSS.

- **useReducedMotion**\\
\\
Adapt or disable animations based on the device "Reduced Motion" setting.

- **Gesture animation**\\
\\
An overview of all the gestures available in Motion for React.

**Cursor examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Cursor trail**\\
\\
An example of creating a cursor trail with images in Motion for React.

Previous

Carousel

Next

ScrambleText

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Register

Upgrade

---

# https://motion.dev/docs/react)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-component).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-svg-animation).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-value)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-config):

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-presence)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-animate)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-svg-animation)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-component)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/cursor)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/quick-start)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/vue)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-activity

Motion homepage

Docs

Examples

Tutorials

Motion+

Checking Motion+ status…

Unlocks for everyone in

18 Days10 Hours52 Minutes

Or

Get Motion+ for instant access

One-time payment, lifetime updates

Already joined?

Login

`AnimateActivity` is an animated version of React's `Activity` component. It allows you to add exit animations when hiding elements.

Whereas `AnimatePresence` animates elements when they're **added** and **removed** from the tree, `AnimateActivity` uses the `Activity` component to **show** and **hide** the children with `display: none`, maintaining their internal state.

initial={{opacity:0}}

animate={{opacity:1}}

exit={{opacity:0}}

AnimateActivity: Slideshow — Motion for React Example

## Install

First, add the `motion-plus` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=YOUR\_AUTH\_TOKEN"

Once installed, `AnimateActivity` can be imported via `motion-plus/animate-activity`.

`AnimateActivity` requires `motion@12.23.24` and `react@19.2.0` or above.

Once out of alpha, `AnimateActivity` will be imported from the main `"motion"` package.

## Usage

`AnimateActivity` shares the same API as `Activity`. By switching the `mode` prop from `"visible"` to `"hidden"`, its child element will be hidden with `display: none` **after** child exit animations have completed.

return(

<motion.div

}

### Sequencing

As with `AnimatePresence`, we can use variants to sequence exit animations through a tree.

exit="hidden"

variants={{

hidden:{delayChildren:stagger(0.1)}

<motion.li

By default, exiting children will maintain their default styles in the DOM. This means that if they're `position: static` or in some way affecting the layout of the elements around them, they continue to do so until the exit animation is complete.

We can change this by setting `layoutMode` to `"pop"`. This will immediately pop the element out of its layout, allowing surrounding elements to reflow while it exits.

<AnimateActivity

mode={isVisible ? "visible" : "hidden"}

layoutMode="pop"

- **AnimatePresence**\\
\\
Add exit animations to React components when they're removed from the page.

Previous

Motion component

Next

AnimatePresence

## Get early access to AnimateActivity

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Register

Upgrade

---

# https://motion.dev/docs/react-animate-view

Motion homepage

Docs

Examples

Tutorials

Motion+

Checking Motion+ status…

Unlocks for everyone in

401 Days10 Hours52 Minutes

Or

Get Motion+ for instant access

One-time payment, lifetime updates

Already joined?

Login

`AnimateView` allows you to animate elements between different views using the browser's native View Transition API.

It's a 3kb component built on top of Motion's mini `animate()` function and React's `ViewTransition` component, providing a simple API for adding values like `clipPath` and configuring animations with Motion's transitions, including springs.

It's possible to write specific animations for when elements enter and exit the DOM, when they update, or when performing shared element animations.

{isOpen && (

`AnimateView` is currently available in Motion+ Early Access. As an Early Access API, expect changes as we receive feedback.

AnimateView: Toggle — Motion for React Example

## Install

First, add the `motion-plus` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.8.0&token=YOUR\_AUTH\_TOKEN"

Once installed, `AnimateView` can be imported via `motion-plus/animate-view`.

`AnimateView` is built on React's `ViewTransition` component and therefore requires `motion@12.34.0` and `react@canary` or above.

Once out of alpha, `AnimateView` will be imported from the main `"motion"` package.

## Usage

Import `AnimateView` from `"motion-plus/animate-view"`.

import{AnimateView}from"motion-plus/animate-view"

### Enter/exit animations

{show && (

Now, when `show` is changed within a React `startTransition`, the element will perform the browser's default fade in/out animation as it enters and leaves the DOM.

View transitions will only trigger when state changes are wrapped in `startTransition`.

The full setup looks like this:

import{startTransition,useState}from"react"

functionExample(){

const\[show,setShow\] = useState(true)

return(

}

### Configure the transition

It's possible to set a default transition for all view transitions via the `transition` prop. This accepts all Motion's transition options.

<AnimateViewenter={{

transition:{type:spring,bounce:0,duration:0.6}

### Setting values

By default, `AnimateView` will animate elements using the browser's default opacity animation. But, if you set your own values within `enter`, `exit`, `share` or `update` then this crossfade will be disabled.

Open

You can re-enable a `opacity` animation by also passing this to the prop:

opacity:1,

clipPath:\["inset(0 50% 0 100%)","inset(0 0% 0 0%)"\]

Elements wrapped in `AnimateView` will also animate whenever their content or visual styles change, crossfading between the two views. This animation can be customised with the `update` prop.

functionReorderList({items}){

<AnimateView

key={item.id}

AnimateView: Reorder items — Motion for React Example

Shuffle

animate

spring

stagger

inView

scroll

hover

press

drag

### Shared element animations

When an `AnimateView` component with a `name` prop exits the DOM, and another one with the same `name` enters it within the same transition, the two elements will perform a shared element animation.

if(selectedItem){

className="item"

functionModal({selectedItem}){

AnimateView: App Store — Motion for React Example

- ![](https://examples.motion.dev/photos/app-store/a.jpg)

Travel

## 5 Inspiring Apps for Your Next Trip

- ![](https://examples.motion.dev/photos/app-store/c.jpg)

How to

## Contemplate the Meaning of Life Twice a Day

- ![](https://examples.motion.dev/photos/app-store/d.jpg)

Steps

## Urban Exploration Apps for the Vertically-Inclined

- ![](https://examples.motion.dev/photos/app-store/b.jpg)

Hats

## Take Control of Your Hat Life With This Stunning New App

If there is more than one element with a specific `name` either before, or after the transition, the animation will fail.

The animation can be configured via the `transition` or `share` props on the entering element:

React's `addTransitionType` lets you set contextual information (like navigation direction) to the current transition.

addTransitionType("next")

setItem(2)

})

`enter`, `exit`, `share` and `update` props can all resolve dynamically, with a list of values set via `addTransitionType`. You can use this information to generate different animations.

key={index}

transform:\`translateX(${types.includes("prev") ? 100 : -100}%)\`,

})}

transform:\[\
\
\`translateX(${types.includes("next") ? 100 : -100}%)\`,\
\
"translateX(0%)",\
\
\],

1 / 6

### Suspense

`AnimateView` integrates with `Suspense`. You can crossfade between content and fallback by wrapping them both in `Suspense`:

Neither of these claims are true.

From our own stress test benchmarking, creating image bitmaps and constructing a pseudo-DOM is more memory intensive and slower than the equivalent layout measurements used by Motion's layout animations.

The claim of "a more continuous feeling" is also not right. Layout animations are \*\* **interruptible**\*\*, which means you can change direction mid-animation and they respond immediately. View transitions are \*\* **not interruptible**\*\*, meaning they must complete before a new transition can begin. This makes layout animations a far better candidate for micro-interactions where responsiveness matters.

View transitions are best suited for \*\* **page-level transitions**\\*\\* (route changes, full-view swaps) where the non-interruptible nature is acceptable and the snapshot-based approach avoids complex per-element coordination.

## Props

### `transition`

Default transition for all animation types. Accepts any Motion transition, including springs.

**Default:**`{ opacity: 1 }`

An animation to use when the wrapped element enters the DOM.

transform:\["translateX(-100%)","none"\]

transform:\[\
\
\`translateX(${types.includes("next") ? 100 : -100}%)\`,\
\
"none",\
\
\],

- **Layout animation**\\
\\
Smoothly animate layout changes and create shared element animations.

**AnimateView examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

AnimatePresence

Next

LayoutGroup

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Register

Upgrade

---

# https://motion.dev/docs/react-layout-animations),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-activity)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-animate-view)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/migrate-from-gsap-to-motion

Motion homepage

Docs

Examples

Tutorials

Motion+

Need help choosing? Check out our GSAP vs Motion comparison page.

GSAP is an incredible animation library. But, you can achieve all of the same effects using Motion, with hardware accelerated performance, often for a far smaller bundlesize.

Unlike GSAP, Motion doesn't need a costly yearly license to run on commercial websites, as its supported by corporate sponsors and optional Motion+ memberships.

By the end of this guide we'll have learned the benefits and drawbacks of migrating, and also how to migrate basic animations, timeline sequences, scroll-linked and scroll-triggered animations, and React animations.

## Benefits

Motion is built on modern browser APIs like Web Animations API (WAAPI) and Scroll Timeline, which is what enables it to offer hardware acceleration for common animations like `transform`, `filter` and `opacity`.

There are other optimisations, like using the Intersection Observer API for scroll-triggered animations rather than measuring the scroll position every frame (which can trigger style recalculations).

Likewise, when you start an animation with the `animate` function and it needs to read initial styles from the DOM, that process is batched and optimised, reducing layout thrashing and style recalculations.

Motion's APIs are generally smaller than GSAP too, with our `scroll` function is just 75% the size of its GSAP equivalent, and the mini `animate` function 90% smaller at just 2.3kb. Even the full-sized `animate` function, which offers timeline sequencing, independent transform animations, and more, is 18kb, smaller than the GSAP animation functions.

Finally, because Motion is built with ES modules, it is tree-shakable. Which means if you only import the `scroll` function, then only this code will end up being delivered to your users. This is an immediate SEO benefit of a few Lighthouse performance points.

## Drawbacks

A robust feature comparison with GSAP can be found in our feature comparison guide, but the biggest missing feature from the Motion JavaScript API is layout animations.

Motion for React's layout animations go far beyond traditional "FLIP" techniques, with every animation performed with transforms, full scale correction for children and `border-radius`, and more. So if you are a keen user of GSAP's FLIP functionality then Motion doesn't offer a comparable API yet.

GSAP is also geared squarely towards power users, with APIs that we don't believe are used by the majority of users, like the ability to get/set a `delay` after an animation has started. Motion's philosophy is to tend towards a more accessible, smaller API, and this is shown in the relative filesizes.

Finally, `animate`'s `onUpdate` callback is currently only available for animating single values, though this will change in the future.

## Migrate

For this guide, we're going to take a look at the examples given in the GSAP documentation and see how we'd rewrite them in Motion.

### Basic animations

The "Hello world' of JavaScript animations, a rotating box. In GSAP, this would be written with `gsap.to`:

gsap.to("#animate-anything-css",{

duration:10,

ease:"none",

repeat: -1,

rotation:360,

})

Motion's basic animation function is `animate`:

animate(

"#animate-anything-css",

{rotate:360},

{ease:"linear",duration:10,repeat:Infinity}

)

You can see here that it looks broadly similar, with a couple of key differences.

1. `rotate` instead of `rotation`

2. `repeat: Infinity` instead of `-1` for infinitely-repeating animations

3. `ease: "linear"` instead of `ease: "none"`

Something else to note is that in GSAP the options and animating values are all bundled in together. Whereas with Motion, these are separate objects. This isn't of huge practical importance but when animating a plain object it means that object can't have properties with the same name as GSAP options.

GSAP has two other animation methods, `fromTo` and `from`.

`fromTo` allows you to specify start and end keyframes:

gsap.fromTo(".box",{opacity:0},{opacity:0.5,duration:1})

With Motion, you just use the keyframe syntax:

animate(".box",{opacity:\[0,0.5\]},{duration:1})

This type of syntax (or equivalent also exists in GSAP, but `fromTo` is more of a legacy API.

`from` allows you to define values to animate **from**, with the target values being read from the DOM.

gsap.from(".box",{opacity:0})

Motion doesn't have a comparable API to this, but this is partly because we don't recommend it. Practically what has to happen here is GSAP reads the existing value from the DOM, set this as a target value, then animate from the given value. Unless the user writes their JavaScript to be render-blocking (discouraged), this "incorrect" style will be visible for a frame or more, which is rarely what we want.

### Animation controls

Both GSAP and Motion animations return animation controls. GSAP offers far more here. For instance, each animation option gets a method to get/set that option, whereas Motion tends towards the immutability of options.

constanimation = gsap.to()

animation.delay(0.5)// No Motion equivalent

However, there are some Motion equivalents to know about.

- `.timeScale()` is `.speed`

- `.time()` is `.time`

- `.kill()` is `.stop()`

- `.revert()` is `.cancel()`

- `.progress(1)` is `.complete()`

- `.resume()` is `.play()`

### Timeline sequencing

Both Motion and GSAP offer timeline sequencing. The fundamental difference is that GSAP has a more imperative API, with a `.timeline()` constructor and `.to`, `.add()` and `.addLabel()` methods used to compose/amend the timeline:

consttimeline = gsap.timeline(options)

timeline.to("#id",{x:100,duration:1})

timeline.addLabel("My label")

timeline.to("#id",{y:50,duration:1})

Whereas Motion uses a declarative array syntax:

consttimeline = \[\
\
\["#id",{x:100,duration:1}\],\
\
"My label",\
\
\["#id",{y:100,duration:1}\]\
\
\]

animate(timeline,options)

The benefit of the GSAP approach is it's easier to dynamically change a timeline in progress. Whereas with Motion, it's a little less boilerplate to compose long animations.

Composing multiple timelines is different in each library, much as above:

// GSAP

timeline.add(timelineA)

timeline.add(timelineB)

// Motion

consttimeline = \[...timelineA,...timelineB\]

### Scroll-triggered animations

Scroll-triggered animations are normal time-based animations that trigger when an element enters the viewport.

GSAP has the `ScrollTrigger`plugin whereas Motion uses `inView` function.

gsap.to('.box',{

scrollTrigger:'.box',

x:500

animate(target,{x:500})

There fundamental technical difference between the two is `inView` is based on the browser's Intersection Observer API, which is a super-performant way of detecting when elements enter the viewport. Whereas `ScrollTrigger` measures the element and then tracks its position relative to scroll every frame. These reads/writes cause style recalculations.

Additionally, as `inView` only triggers when the tracked element enters the viewport, it means scroll-triggered animations are lazily initialised. In combination with Motion's deferred keyframe resolution, this can result in drastically shorter startup times when using many scroll-triggered animations.

### Scroll-pinning

GSAP has an option called `pin`. If set, this will `pin` the element to the viewport during the scroll animation. For performance reasons, we recommend using CSS `position: sticky` instead.

### Scroll-linked animations

By passing `scrub: true` to `scrollTrigger`, GSAP can create scroll-linked animations. These are fundamentally different in that instead of animations being driven by time, they're being driven by scroll progress instead.

scrollTrigger:{

trigger:'.box',

scrub:true

}

});

In Motion, these kinds of animations are driven by the `scroll` function.

constanimation = animate(element,{x:500})

scroll(animation,{target:element})

`scroll` is different in that, much like `animate` can use the Web Animations API for hardware accelerated performance, `scroll` can use the Scroll Timeline API for two performance benefits:

- Enables hardware accelerated scroll animations

- Can measure scroll progress for callbacks without polling scroll position (removing style recalculations)

Instead of `start` and `end` offset options, `scroll` accepts a single `offset` array, with options much like those found in GSAP.

scroll(callback,{

target:element,

offset:\["start start","end start"\]// Exits the viewport top

You can see here that instead of using `"top"`/`"bottom"`, or `"left"`/`"right"`, Motion uses the axis-agnostic `"start"` and `"end"` keywords.

The benefit of a single `offset` option is we can map more than two offsets to more than two animation keyframes. Here's an animation where the element fades in and out of the viewport:

constanimation = animate(element,{opacity:\[0,1,1,0\]})

scroll(animation,{

offset:\[\
\
// When the target starts entering the bottom of the viewport, opacity = 0\
\
"start end",\
\
// When the target is fully in the bottom of the viewport, opacity = 1\
\
"end end",\
\
// When the target starts exiting the top of the viewport, opacity = 1\
\
"start start",\
\
// When the target is fully off the top of the viewport, opacity = 0\
\
"end start"\
\
\]

### SplitText

Motion has an equivalent for the Club GSAP API `SplitText` for Motion+ members called `splitText`.

Split Text: Scatter — Motion Example

# Move your pointer over the text to scatter.

It works in much the same way as `SplitText` without the need to register a plugin:

splitText("h1").chars,

{opacity:\[0,1\]}

Unlike GSAP's `SplitText`, Motion's `splitText` correctly applies the `aria-label` attribute to the original element with the original text, to ensure it can be read correctly by screen readers.

The main draw.chars,\
\
\]

Motion began life as a React animation library: Framer Motion. As such, its suite of React APIs goes far beyond GSAP's `useGSAP` function.

That said, you can achieve a similar pattern for a smaller bundlesize with Motion's `useAnimate` hook.

Take this rotating cube example from the GSAP docs:

constboxRef = useRef()

gsap.to(boxRef.current,{

We can rewrite this with Motion's mini `useAnimate`, which offers a React interface to the 2.3kb `animate` function.

import{useAnimate}from"motion/react-mini"

const\[scope,animate\] = useAnimate()

constanimation = animate(

scope.current,

{transform:"rotate(360deg)"},

{duration:10,repeat:Infinity}

},\[\])

Now we're running the same effect with 90% less code included in the bundlesize, plus the animation is running with hardware acceleration, which means fewer stutters (especially during React re-renders.

If you wanted to use `{ rotate: 360 }` like in the GSAP example then that's also possible by using the hybrid `animate` function:

import{useAnimate}from"motion/react"

## Conclusion

Although Motion and GSAP's feature sets don't fully overlap, thanks to modern practises and new browser APIs we think the majority of users will see better performance and lower filesizes by migrating to Motion.

Are there more GSAP features you'd like to see covered in this guide? Or a GSAP feature you'd like to see in Motion? Let me know!

Previous

Improvements to Web Animations API

Next

Animation performance

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Benefits
- Drawbacks
- Migrate
- Basic animations
- Animation controls
- Timeline sequencing
- Scroll-triggered animations
- Scroll-pinning
- Scroll-linked animations
- SplitText
- React
- Conclusion

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/scroll

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion's 5.1kb `scroll()` function creates scroll-linked animations.

A scroll-linked animation is where a value is bound directly to scroll progress. When the scroll changes, the value changes by the relative amount.

Parallax — Motion Example

## \#001

## \#002

## \#003

## \#004

## \#005

This is in contrast to a scroll-triggered animation, which is when an animation starts/stops when an element enters/leaves the viewport. In Motion, these can be built with `inView`.

As part of Motion's hybrid engine, `scroll` is able to run animations with the `ScrollTimeline` API where possible for optimal hardware-accelerated performance, removing scroll measurements, improving scroll synchronisation and ensuring animations remain smooth even under heavy CPI usage.

## Usage

Import `scroll` from Motion:

import{scroll}from"motion"

### Callbacks

`scroll()` can accept a callback function. This callback will be called when scroll changes with the latest `progress` value, between `0` and `1`.

### Animation

`scroll()` can also accept animations created with the `animate()` function.

constanimation = animate(

"div",

{transform:\["none","rotate(90deg)"\]},

{ease:"linear"}

)

scroll(animation)

Browsers that support the `ScrollTimeline` API will use this to run supported animations with hardware acceleration.

### Scroll axis

By default, vertical scroll is tracked. By providing an `axis: "x"` option, it can instead track horizontal scrolling.

scroll(callback,{axis:"x"})

### Track element scroll

`scroll()` tracks `window` scroll by default. It can also track the scroll of an `Element`, by passing it in via the `container` option.

scroll(callback,{container:document.getElementById("scroller")})

### Track element position

We can track the progress of an element as it moves within a container by passing its `ref` to the `target` option.

scroll(animation,{target:document.getElementById("item")})

### Scroll offsets

With the `offset` option we can define which parts of the `target` we want to track within the `container`, for instance track elements as they enter in from the bottom, leave at the top, or travel throughout the whole viewport.

Scroll fade in/out — Motion Example

### Pinning

To use the browser for best performance, pinning should be performed with `position: sticky`.

This works well, for instance, to create section-based full-screen effects, by using a larger container element to define the scroll distance and passing this to the `target` option:

Scroll pinning — Motion Example

- ![](https://examples.motion.dev/photos/cityscape/1.jpg)

### \#001

- ![](https://examples.motion.dev/photos/cityscape/2.jpg)

### \#002

- ![](https://examples.motion.dev/photos/cityscape/3.jpg)

### \#003

- ![](https://examples.motion.dev/photos/cityscape/4.jpg)

### \#004

- ![](https://examples.motion.dev/photos/cityscape/5.jpg)

### Scroll information

By passing a callback with a second `info` argument, it's possible to get detailed information about scrolling.

console.log(info.x.current)

})

The `info` object contains:

- `time`: The time the scroll position was recorded.

- `x`: Info on the `x` scroll axis.

- `y`: Info on the `y` scroll axis.

Each individual axis is an object containing the following data:

- `current`: The current scroll position.

- `offset`: The scroll offsets resolved as pixels.

- `progress`: A progress value, between `0`-`1` of the scroll within the resolved offsets.

- `scrollLength`: The total scrollable length on this axis. If `target` is the default scrollable area, this is the container scroll length minus the container length.

- `velocity`: The velocity of the scroll on this axis.

### Cancel animation

`scroll()` returns a cleanup function. Call this to cancel the scroll animation.

constcancel = scroll(callback)

cancel()

## Options

### `container`

**Default:**`window`

The container scroller element or window that we're tracking the scroll progress of.

scroll(

{container:document.getElementById("carousel")}

### `axis`

**Default:**`"y"`

The axis of scroll to track. Defaults to `"y"`.

{axis:"x"}

### `target`

By default, this is the **scrollable area** of the `container`. It can additionally be set as another element, to track its progress within the viewport.

animation

{ target:document.getElementById("item")}

### `offset`

**Default:**`["start start", "end end"]`

`offset` describes intersections, points where the `target` and `container` meet.

For example, the intersection `"start end"` means when the **start of the target** on the tracked axis meets the **end of the container.**

So if the target is an element, the container is the window, and we're tracking the vertical axis then `"start end"` is where the **top of the element** meets **the bottom of the viewport**.

#### Accepted intersections

Both target and container points can be defined as:

- **Number:** A value where `0` represents the start of the axis and `1` represents the end. So to define the top of the target with the middle of the container you could define `"0 0.5"`. Values outside this range are permitted.

- **Names:**`"start"`, `"center"` and `"end"` can be used as clear shortcuts for `0`, `0.5` and `1` respectively.

- **Pixels:** Pixel values like `"100px"`, `"-50px"` will be defined as that number of pixels from the start of the target/container.

- **Percent:** Same as raw numbers but expressed as `"0%"` to `"100%"`.

- **Viewport:**`"vh"` and `"vw"` units are accepted.

### `trackContentSize`

**Default:**`false`

When the size of a page or element's content changes, its scrollable area can change too. But, because browsers don't provide a callback for changes in content size, by default `scroll()` will not update until the next `"scroll"` event.

Content size tracking is disabled by default because most of the time, scrollable area remains stable, and tracking changes to it involves a small overhead.

`scroll` can automatically track changes to content size by setting `trackContentSize` to `true`.

scroll(callback,{trackContentSize:true})

Previous

animate

Next

View animations

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Callbacks
- Animation
- Scroll axis
- Track element scroll
- Track element position
- Scroll offsets
- Pinning
- Scroll information
- Cancel animation
- Options
- container
- axis
- target
- offset
- trackContentSize

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/vue

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion for Vue is a simple yet limitless animation library. It's the only animation library with a **hybrid engine**, capable of hardware accelerated animations.

In this guide, we'll learn how to install Motion Vue and take a whirlwind tour of its main features.

## Why Motion for Vue?

Vue gives you the power to build dynamic user interfaces, but orchestrating complex, performant animations can be a challenge. Motion is a production-ready library designed to solve this, making it simple to create everything from beautiful micro-interactions to complex, gesture-driven animations.

Here's when it's the right choice for your project.

- Build for Vue. While other animation libraries are messy to integrate, Motion's declarative API feels like a natural extension of Vue. Animations can be linked directly to state and props.

- **Hardware-acceleration.** Motion leverages the same high-performance browser animations as pure CSS, ensuring your UIs stay smooth and snappy. You get the power of 120fps animations with a much simpler and more expressive API.

- **Animate anything.** CSS has hard limits. There's values you can't animate, keyframes you can't interrupt, staggers that must be hardcoded. Motion provides a single, consistent API that handles everything from simple transitions to advanced scroll, layout, and gesture-driven effects.

- **App-like gestures.** Standard CSS `:hover` events are unreliable on touch devices. Motion provides robust, cross-device gesture recognisers for press, drag, and hover, making it easy to build interactions that feel native and intuitive on any device.

### When is CSS a better choice?

For simple, self-contained effects (like a color change on hover) a standard CSS transition is a lightweight solution. The strength of Motion is that it can do these simple kinds of animations but also scale to anything you can imagine. All with the same easy to write and maintain API.

## Install

Motion for Vue is available via npm:

npm install motion-v

### Nuxt modules

Motion Vue offers Nuxt modules support.

In `nuxt.config.ts`, simply add `motion-v/nuxt` into the modules, and it will auto-imports all the components for you.

exportdefaultdefineNuxtConfig({

modules:\['motion-v/nuxt'\],

})

### `unplugin-vue-components`

Motion for Vue also supports unplugin-vue-components to auto-import all components from `motion-v`:

importComponentsfrom'unplugin-vue-components/vite'

importMotionResolverfrom'motion-v/resolver'

exportdefaultdefineConfig({

plugins:\[\
\
vue(),\
\
Components({\
\
dts:true,\
\
resolvers:\[\
\
MotionResolver()\
\
\],\
\
}),\
\
\],

**Note:** Motion for Vue contains APIs specifically tailored for Vue, but every feature from vanilla Motion is also compatible and available for advanced use-cases.

## Usage

When values in `animate` change, the component will animate. Motion has great-feeling defaults, but animations can of course be configured via the`transition` prop.

<motion.div

:animate="{

scale:2,

transition:{duration:2}

}"

When a component enters the page, it will automatically animate from the rendered value, but you can provide different values via the `initial` prop.

Or disable this initial animation entirely by setting `initial` to `false`.

<motion.button

:whileHover="{scale:1.1}"

:whilePress="{scale:0.95}"

Motion's gestures are designed to feel better than using CSS alone. For instance, hover events are correctly not triggered by touch screen taps. Learn more about gestures.

### Scroll animations

Motion supports both types of scroll animations, **scroll-triggered** and **scroll-linked**.

To trigger an animation on scroll, the `whileInView` prop defines a state to animate to/from when an element enters/leaves the viewport:

:initial="{backgroundColor:'rgb(0, 255, 0)',opacity:0}"

:whileInView="{backgroundColor:'rgb(255, 0, 0)',opacity:1}"

🍅

🍊

🍋

🍐

🍏

🫐

🍆

🍇

Whereas to link a value directly to scroll position, it's possible to use `MotionValue`s via `useScroll`.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.

Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo. In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta. Mauris laoreet augue ut felis blandit, at iaculis odio ultrices. Nulla facilisi. Vestibulum cursus ipsum tellus, eu tincidunt neque tincidunt a.

## Sub-header

In eget sodales arcu, consectetur efficitur metus. Duis efficitur tincidunt odio, sit amet laoreet massa fringilla eu.

Pellentesque id lacus pulvinar elit pulvinar pretium ac non urna. Mauris id mauris vel arcu commodo venenatis. Aliquam eu risus arcu. Proin sit amet lacus mollis, semper massa ut, rutrum mi.

Sed sem nisi, luctus consequat ligula in, congue sodales nisl.

Vestibulum bibendum at erat sit amet pulvinar. Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.

Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet. Pellentesque auctor vehicula malesuada. Aliquam id feugiat sem, sit amet tempor nulla. Quisque fermentum felis faucibus, vehicula metus ac, interdum nibh. Curabitur vitae convallis ligula. Integer ac enim vel felis pharetra laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque hendrerit ac augue quis pretium.

Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique, elit metus efficitur elit, ac pretium sapien nisl nec ante. In et ex ultricies, mollis mi in, euismod dolor.

Quisque convallis ligula non magna efficitur tincidunt.

Learn more about Motion's scroll animations.

### Layout animations

Motion has an industry-leading layout animation engine that supports animating between changes in layout, using only transforms, between the same or different elements, with full scale correction.

It's as easy as applying the `layout` prop.

Or to animate between different elements, a `layoutId`:

Learn more about layout animations.

### Exit animations

Hide

Learn more about `AnimatePresence`.

## Development tools

Motion Studio provides visual editing and AI tools to enhance your animation development workflow, like inline bezier editing, CSS spring generation and more.

### Install Motion Studio

One-click install for Cursor:

Add Extension

Add MCP

Motion Studio is also compatible with VS Code, Google Antigravity and more. See full installation guide.

## Learn next

That's a very quick overview of Motion for Vue's basic features. But there's a lot more to learn!

Or, you can dive straight in to our examples, where each example comes complete with full source code that you can copy/paste into your project.

Next

Vue animation

## On this page

- Why Motion for Vue?
- Key advantages
- When is CSS a better choice?
- Install
- Nuxt modules
- unplugin-vue-components
- Usage
- Enter animation
- Gestures
- Scroll animations
- Layout animations
- Exit animations
- Learn next

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/motion-value

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion Values track the state and velocity of animated values.

They are composable, signal-like values that are performant because Motion throttles rendering with its optimised frameloop.

Motion Values are usually created automatically by the `animate` function or `motion` components. They aren't something you generally have to think about.

But, for advanced use cases, it's possible to create them manually.

constx = motionValue(0)

animate(x,100)

Spring: Follow Cursor — Motion Example

By manually creating motion values you can:

- Set and get their state.

- Subscribe to changes via the `on` method.

- Automatically end existing animations when starting new animations.

constcolor = motionValue("#f00")

animate(color,"#0f0")

animate(color,"#333")// Will automatically end the existing animation

## Usage

Motion Values can be created with the `motionValue` function. The string or number passed to `motionValue` will act as its initial state.

import{motionValue}from"motion"

Changes to a Motion Value can be subscribed to with the `.on` method.

### Set value

Motion Values can be updated with the `set` method.

x.set(100)

### Get value and velocity

The latest value of a Motion Value can be read with `.get()`:

constlatest = x.get()// 100

It's also possible to get the velocity of the value via `.getVelocity()`:

constvelocity = x.getVelocity()

Velocity is available for any number-like value, for instance `100`, or unit types like `"50vh"` etc.

Velocity is intelligently calculated by using the value rendered during the previous animation frame (rather than the last value passed via `set`).

### Render

Motion values can be passed to effects like `styleEffect`, `attrEffect` or `propEffect` to render the latest values once per animation frame.

constopacity = motionValue(1)

styleEffect("li",{x,opacity})

## API

### `get()`

Returns the latest state of the Motion Value.

### `getVelocity()`

Returns the latest velocity of the motion value. Returns `0` if the value is non-numerical.

### `set()`

Sets the Motion Value to a new state.

x.set("#f00")

### `jump()`

Jumps the Motion Value to a new state in a way that breaks continuity from previous values:

- Resets `velocity` to `0`.

- Ends active animations.

x.jump(10)

x.getVelocity()// 0

### `isAnimating()`

Returns `true` if the value is currently animating.

### `stop()`

Stop the active animation.

### `on()`

Subscribe to Motion Value events. Available events are:

- `change`

- `animationStart`

- `animationCancel`

- `animationComplete`

import{motionValue,frame}from"motion"

constcolor = motionValue("#fff")

})

It returns a function that, when called, will unsubscribe the listener.

### `destroy()`

Destroy and clean up subscribers to this Motion Value.

Previous

resize

Next

mapValue

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Set value
- Get value and velocity
- Render
- API
- get()
- getVelocity()
- set()
- jump()
- isAnimating()
- stop()
- on()
- destroy()

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/faqs

Motion homepage

Docs

Examples

Tutorials

Motion+

## Browser support?

Motion supports all modern browsers. It **doesn't support** Internet Explorer 11 or below.

## Why is my animation finishing instantly?

There are a couple reasons an animation might appear to finish instantly.

### 1\. Your browser doesn't support `CSS.registerProperty`

If you're animating CSS variables and your browser doesn't support the CSS Properties and Values API, animations will finish instantly.

2. ### `scale: 0` in Safari

There's a bug in older versions of Safari where animating to `scale(0)` completes instantly.

Previous

wrap

Next

GSAP vs Motion: Which should you use?

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Browser support?
- Why is my animation finishing instantly?
- 1\. Your browser doesn't support CSS.registerProperty
- scale: 0 in Safari

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/improvements-to-the-web-animations-api-dx

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion is the only animation library with a hybrid engine, meaning its capable of dynamically running animations either via `requestAnimationFrame` or via the Web Animations API (WAAPI).

This allows it to animate any value, for any render target (DOM, Three.js, canvas) while also retaining the ability to run animations with hardware acceleration.

Its `animate` function comes in two sizes, **mini** (2.3kb) and **hybrid** (17kb).

Both functions provide a number of improvements to the feature set and developer experience of WAAPI, in this guide we'll take a look at some.

## Springs and custom easing functions

CSS and WAAPI only support in-built easing functions like `"back-in"`, `"ease-in-out"` etc.

Motion extends that to support any custom easing function by automatically generating a `linear()` CSS easing definition in modern browsers, with a safe fallback in older browsers

animate(

"li",

{opacity:1},

{ease:mirrorEasing(Math.sin)}

)

Additionally, it supports `spring` animations in `animateStyle` by compiling the spring into a `linear()` easing and computing the appropriate `duration`. Whereas in the `animate` function it will pre-calculate the actual keyframes for real physics-based animations.

import{animate}from"motion/dom"

import{spring}from"motion"

{transform:"translateX(100px)"},

{type:spring,stiffness:400}

## Default value types

WAAPI always expects a unit type for various animatable values, which can be easy to forget.

element.animate({width:"100px"})

element.animate({width:100})// Error!

Motion knows the default value type for all popular values.

animate(element,{width:100})

## `.finished` Promise

As a newer part of the WAAPI spec, the `animation.finished``Promise` isn't supported in every browser. Motion will polyfill it in those browsers:

constanimation = animate("#box",{opacity:0})

// Async

awaitanimation

// Promise

## Durations as seconds

In WAAPI (and a subset of other JavaScript animation libraries), durations are set as milliseconds:

constanimation = element.animate({x:50},{duration:2000})

animation.currentTime = 1000

During development of Framer Motion, user testing revealed that most of our audience find seconds a more approachable unit. So in Motion, durations are defined in seconds.

constanimation = animate(element,{x:50},{duration:2})

animation.currentTime = 1

## Persisting animation state

In a typical animation library, when an animation has finished, the element (or other animated object) is left in the animation's final state.

But when you call WAAPI's `animate` function like this:

element.animate({opacity:0})

This is the result:

Play

The animation ends in its initial state!

WAAPI has an option you can set to fix this behaviour. Called `fill`, when set to `"forwards"` it will persist the animation beyond its timeline.

element.animate({opacity:0},{fill:"forwards"})

But this is discouraged even in the official spec. `fill: "forwards"` doesn't exactly change the behaviour of the animation, it's better to think of it keeping the animation active indefinitely. As WAAPI animations have a higher priority than `element.style`, the only way to change the element's styles while these animations are active is with more animations!

Keeping all these useless animations around can also lead to memory leaks.

The spec offers two solutions. One, adding a `Promise` handler that manually sets the final keyframe target to `element.style`:

awaitelement.animate({opacity:0},200).finished

element.style.opacity = 0

The second is to immediately set `element.style` to the animation target, then animate from its current value and let the browser figure out the final keyframe itself.

constopacity = element.style.opacity

element.style.opacity = 1

element.animate({opacity,offset:0},200)

Each approach has pros and cons. But a major con they both share is making the user decide. These are unintuitive fixes to an unintuitive behaviour, and whichever is chosen necessitates a wrapping library because repeating these brittle patterns is bad for readability and stability.

So instead, Motion's `animate` function will actually animate _to_ a value, leaving in its target state once the animation is complete.

animate(element,{opacity:0})

## Stop animations

WAAPI's `animate` function returns an `Animation`, which contains a `cancel` method.

constanimation = element.animate({opacity:0},{duration:1000})

When `cancel` is called, the animation is stopped **and** "removed". It's as if the animation never played at all:

Motion adds a `stop` method. This cancels the animation but also leaves the element in its current state:

constanimation = animate(element,{opacity:0},{duration:1000})

## Partial/inferred keyframes

In early versions of the WAAPI spec, two or more keyframes must be defined:

element.animate({opacity:\[0.2,1\]})

However, it was later changed to allow one keyframe. The browser will infer the initial keyframe based on the current visual state of the element.

element.animate({opacity:1})

Some legacy browsers, including the common WAAPI polyfills, only support the old syntax. Which means if you try and use WAAPI as currently documented, it will throw an error in many older browsers.

Motion's `animate` function automatically detects these browsers and will generate an initial keyframe from `window.getComputedStyle(element)` where necessary.

## Interrupting animations

WAAPI has no concept of "interrupting" existing animations. So if one animation starts while another is already playing on a specific value, the new animation simply "overrides" the existing animation.

If the old animation is still running when the new one finishes, the animating value will appear to "jump" "\]},

{duration:2000,iterations:Infinity,direction:"alternate"}

element.animate({transform:"none"},{duration:500})

},500)

Interrupt

Motion automatically interrupts the animation of any values passed to `animate` and animates on to the new target:

element,

{transform:"translateX(300px)"},

{duration:2,iterations:Infinity}

animate(element,{transform:"none"},{duration:500})

## Cubic bezier definitions

In WAAPI, cubic bezier easing is defined as a CSS string:

element.animate(

{transform:"translateX(50px)"},

{easing:"cubic-bezier(0.29, -0.13, 0.18, 1.18)"}

This kind of definition will work in Motion, but we also allow this shorthand array syntax:

{ease:\[0.29, -0.13,0.18,1.18\]}

## Independent transforms (`animate`-only)

Because CSS doesn't offer styles for `x`, `scaleX` etc, you can't animate these properties with WAAPI. Instead, you have to animate the full `transform` string:

element.animate({transform:"translateX(50px) scaleX(2)"})

This isn't just a matter of developer aesthetics. It means it's literally impossible to animate these properties with separate animations, or with different animation options.

Some modern browsers allow `translate`, `scale` and `rotate` to be defined and animated separately, but even then you can't animate the axis of each.

Motion still allows the animation of `transform`, but adds the ability to animate all transforms individually, for all axes:

animate(element,{x:50,scaleX:2})

Which means you can also animate them with different options:

{x:50,scaleX:2},

{x:{duration 2},scaleX:{repeat:1}}

Previous

GSAP vs Motion: Which should you use?

Next

Migrate from GSAP to Motion

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Springs and custom easing functions
- Default value types
- .finished Promise
- Durations as seconds
- Persisting animation state
- Stop animations
- Partial/inferred keyframes
- Interrupting animations
- Cubic bezier definitions
- Independent transforms (animate-only)

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/migrate-from-gsap-to-motion).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/scroll).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/vue).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/motion-value),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/faqs)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/improvements-to-the-web-animations-api-dx)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-in-view

Motion homepage

Docs

Examples

Tutorials

Motion+

`useInView` is a tiny (0.6kb) hook that detects when the provided element is within the viewport. It can be used with any React element.

constref = useRef(null)

constisInView = useInView(ref)

Import `useInView` from Motion:

import{useInView}from"motion/react"

`useInView` can track the visibility of any HTML element. Pass a `ref` object to both `useInView` and the HTML element.

functionComponent(){

While the element is outside the viewport, `useInView` will return `false`. When it moves inside the view, it'll re-render the component and return `true`.

### Effects

`useInView` is vanilla React state, so firing functions when `isInView` changes is a matter of passing it to a `useEffect`.

console.log("Element is in view: ",isInView)

},\[isInView\])

## Options

`useInView` can accept options to define how the element is tracked within the viewport.

constisInView = useInView(ref,{once:true})

### `root`

By default, `useInView` will track the visibility of an element as it enters/leaves the window viewport. Set `root` to be the ref of a scrollable parent, and it'll use that element to be the viewport instead.

functionCarousel(){

constcontainer = useRef(null)

constisInView = useInView(ref,{root:container})

return(

}

### `margin`

**Default:**`"0px"`

A margin to add to the viewport to change the detection area. Use multiple values to adjust top/right/bottom/left, e.g. `"0px -20px 0px 100px"`.

constisInView = useInView({

margin:"0px 100px -50px 0px"

})

For browser security reasons, `margin` won't take affect within cross-origin iframes unless `root` is explicitly defined.

### `once`

**Default:**`false`

If `true`, once an element is in view, useInView will stop observing the element and always return `true`.

### `initial`

Set an initial value to return until the element has been measured.

constisInView = useInView(ref,{initial:true})

### `amount`

**Default:**`"some"`

The amount of an element that should enter the viewport to be considered "entered". Either `"some"`, `"all"` or a number between `0` and `1`.

## Example

Scroll-triggered animations — Motion for React Example

🍅

🍊

🍋

🍐

🍏

🫐

🍆

🍇

## Related topics

- **Scroll animation**\\
\\
Create scroll-triggered and scroll-linked effects — parallax, progress and more.

- **useScroll**\\
\\
Create scroll-linked animations like progress bars & parallax with the useScroll React hook.

Previous

useDragControls

Next

usePageInView

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Effects
- Options
- root
- margin
- once
- initial
- amount
- Example

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-scroll

Motion homepage

Docs

Examples

Tutorials

Motion+

`useScroll` is used to create scroll-linked animations, like progress indicators and parallax effects.

const{scrollYProgress} = useScroll()

## Usage

Import `useScroll` from Motion:

import{useScroll}from"motion/react"

`useScroll` returns four motion values:

- `scrollX`/`Y`: The absolute scroll position, in pixels.

- `scrollXProgress`/`YProgress`: The scroll position between the defined offsets, as a value between `0` and `1`.

### Page scroll

By default, useScroll tracks the page scroll.

const{scrollY} = useScroll()

console.log("Page scroll: ",latest)

})

For example, we could show a page scroll indicator by passing `scrollYProgress` straight to the `scaleX` style of a progress bar.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.

Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo. In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta. Mauris laoreet augue ut felis blandit, at iaculis odio ultrices. Nulla facilisi. Vestibulum cursus ipsum tellus, eu tincidunt neque tincidunt a.

## Sub-header

In eget sodales arcu, consectetur efficitur metus. Duis efficitur tincidunt odio, sit amet laoreet massa fringilla eu.

Pellentesque id lacus pulvinar elit pulvinar pretium ac non urna. Mauris id mauris vel arcu commodo venenatis. Aliquam eu risus arcu. Proin sit amet lacus mollis, semper massa ut, rutrum mi.

Sed sem nisi, luctus consequat ligula in, congue sodales nisl.

Vestibulum bibendum at erat sit amet pulvinar. Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.

Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet. Pellentesque auctor vehicula malesuada. Aliquam id feugiat sem, sit amet tempor nulla. Quisque fermentum felis faucibus, vehicula metus ac, interdum nibh. Curabitur vitae convallis ligula. Integer ac enim vel felis pharetra laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque hendrerit ac augue quis pretium.

Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique, elit metus efficitur elit, ac pretium sapien nisl nec ante. In et ex ultricies, mollis mi in, euismod dolor.

Quisque convallis ligula non magna efficitur tincidunt.

As `useScroll` returns motion values, we can compose this scroll info with other motion value hooks like `useTransform` and `useSpring`:

constscaleX = useSpring(scrollYProgress)

>
> const{scrollY} = useScroll()
>
> const\[scrollDirection,setScrollDirection\] = useState("down")
>
> useMotionValueEvent(scrollY,"change",(current)=>{
>
> constdiff = current \- scrollY.getPrevious()
>
> setScrollDirection(diff \> 0 ? "down" : "up")
>
> })
>
> Perfect for triggering a sticky header animation!
>
> ~ Sam Selikoff, Motion for React Recipes

### Element scroll

To track the scroll position of a scrollable element we can pass the element's `ref` to `useScroll`'s `container` option:

constcarouselRef = useRef(null)

const{scrollX} = useScroll({

container:carouselRef

return(

Element scroll-linked animation — Motion for React Example

### Element position

We can track the progress of an element as it moves within a container by passing its `ref` to the `target` option.

constref = useRef(null)

const{scrollYProgress} = useScroll({

target:ref,

offset:\["start end","end end"\]

Track element within viewport — Motion for React Example

### Scroll offsets

With the`offset` option we can define which parts of the element we want to track with the viewport, for instance track elements as they enter in from the bottom, leave at the top, or travel throughout the whole viewport.

## Performance

Browsers are capable of animating some values, like `opacity`, `transform`, `clipPath` and `filter`, entirely on the GPU. This improves scroll synchronisation and ensures animations remain smooth even when sites are performing heavy work.

`useScroll` is also capable of running animations via the GPU. By passing `scrollXProgress` or `scrollYProgress` either directly to an `opacity` style, or via `useTransform` to one of the above styles, it will create a hardware-accelerated animation.

constfilter = useTransform(scrollYProgress,\[0,1\],\["blur(10px)","blur(0px)"\])

`useScroll` accepts the following options.

### `container`

**Default**: Viewport

The scrollable container to track the scroll position of. By default, this is the browser viewport. By passing a ref to a scrollable element, that element can be used instead.

constcontainerRef = useRef(null)

const{scrollYProgress} = useScroll({container:containerRef})

### `target`

`useScroll` tracks the progress of the `target` within the `container`. By default, the `target` is the scrollable area of the `container`. It can additionally be set as another element, to track its progress within the `container`.

consttargetRef = useRef(null)

const{scrollYProgress} = useScroll({target:targetRef})

### `axis`

**Default:**`"y"`

The tracked axis for the defined `offset`.

### `offset`

**Default:**`["start start", "end end"]`

`offset` describes intersections, points where the `target` and `container` meet.

For example, the intersection `"start end"` means when the **start of the target** on the tracked axis meets the **end of the container.**

So if the target is an element, the container is the window, and we're tracking the vertical axis then `"start end"` is where the **top of the element** meets **the bottom of the viewport**.

#### Accepted intersections

Both target and container points can be defined as:

- **Number:** A value where `0` represents the start of the axis and `1` represents the end. So to define the top of the target with the middle of the container you could define `"0 0.5"`. Values outside this range are permitted.

- **Names:**`"start"`, `"center"` and `"end"` can be used as clear shortcuts for `0`, `0.5` and `1` respectively.

- **Pixels:** Pixel values like `"100px"`, `"-50px"` will be defined as that number of pixels from the start of the target/container.

- **Percent:** Same as raw numbers but expressed as `"0%"` to `"100%"`.

- **Viewport:**`"vh"` and `"vw"` units are accepted.

// Track an element as it enters from the bottom

target:targetRef,

// Track an element as it moves out the top

offset:\["start start","end start"\]

### `trackContentSize`

**Default:**`false`

When the size of a page or element's content changes, its scrollable area can change too. But, because browsers don't provide a callback for changes in content size, by default `useScroll()` will not update until the next `"scroll"` event.

Content size tracking is disabled by default because most of the time, scrollable area remains stable, and tracking changes to it involves a small overhead.

`useScroll` can automatically track changes to content size by setting `trackContentSize` to `true`.

useScroll({trackContentSize:true})

## Related topics

- **Scroll animation**\\
\\
Create scroll-triggered and scroll-linked effects — parallax, progress and more.

- **Motion values overview**\\
\\
Composable animatable values that can updated styles without re-renders.

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

**useScroll examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

useMotionValueEvent

Next

useSpring

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Page scroll
- Element scroll
- Element position
- Scroll offsets
- Performance
- Options
- container
- target
- axis
- offset
- trackContentSize

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-ticker

Motion homepage

Docs

Examples

Tutorials

Motion+

Checking Motion+ status…

Ticker

is exclusive to Motion+

290+ examples & 40+ tutorials

Premium APIs

Motion Studio editing tools

`alpha`

Discord community

Early access

Lifetime updates

Get Motion+ for instant access

One-time payment, lifetime updates

Already joined?

Login

The `Ticker` component for React creates performant, flexible, and fully accessible ticker and marquee animations. It's perfect for showcasing logos, photos, testimonials, news headlines, and more.

`Ticker`'s simple API makes these infinitely-scrolling animations easy to build.

- !Mario Kart 64 boxart

- !GoldenEye 007 boxart

- !Super Mario 64 boxart

- !Majora's Mask boxart

- !Perfect Dark boxart

- !Mythical Ninja boxart

- !Zelda: Ocarina of Time boxart

- !Super Smash Bros boxart

- !1080 Snowboarding boxart

It intelligently clones only the minimum number of items needed to create a seamless loop, ensuring optimal performance. Because it's powered by Motion, you can take full manual control with a motion value to create scroll-driven or draggable effects.

Ticker: Scroll — Motion for React Example

- Mario Kart 64
- Mario Kart 64
- Mario Kart 64

`Ticker` is exclusive to Motion+ members. Motion+ is a one-time payment, lifetime membership that unlocks exclusive components, premium examples and access to a private Discord community.

## Features

`Ticker` is a production-ready component built with performance and accessibility at its core.

- **Lightweight:** Just `+2.1kb` on top of Motion for React.

- **Accessible:** Automatic support for "reduced motion" and intelligent keyboard focus-trapping means your site is inclusive for all users.

- **Flexible:** Animate horizontally or vertically. Control the animation with velocity, scroll position, or drag gestures.

- **Performant:** Creates the absolute minimum number of cloned elements required to fill the viewport. Read more about Motion+ Ticker's unique renderer. More efficient and maintainable than hand-rolled CSS tickers.

- **Full-width overflow:** Easily create tickers that are contained within your layout but visually extend to the edges of the viewport.

- **RTL-compatible:** Automatically adapts to RTL layouts.

## Install

First, add the `motion-plus` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-plus&version=2.0.2&token=YOUR\_AUTH\_TOKEN"

## Usage

`Ticker` accepts on mandatory prop, `items`. This is a list of valid React nodes (which can be components, strings or numbers):

constitems = \[\
\

\

\
\]

By default, tickers will scroll horizontally, but via the `axis` prop we can lay out and animate items on the `"y"` axis too.

### Adjust speed

Setting the `velocity` prop (in pixels per second) will change the speed and direction of the ticker animation.

- **React animation**\\
\\
Create React animation with Motion components. Learn variants, gestures, and keyframes.

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- **Motion values overview**\\
\\
Composable animatable values that can updated styles without re-renders.

**Ticker examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Previous

ScrambleText

Next

Typewriter

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Register

Upgrade

---

# https://motion.dev/docs/react-use-in-view).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-scroll).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-scroll)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-in-view)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-ticker)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/easing-functions

Motion homepage

Docs

Examples

Tutorials

Motion+

Easing functions are used to change the speed of an animation throughout the course of its duration. Different easing functions provide your animations with different "feelings".

Both the `animate` function and Motion for React's `motion` component have the following easing functions built-in and you can just refer to them by name.

// Named easing

ease:"easeIn"

// Bezier curve

ease:\[0.39,0.24,0.3,1\]

But you can still import them separately to use them directly, either for use with the tiny `animate` function from `"motion/dom"` or for novel use-cases.

## Usage

All of Motion's easing functions can be imported straight from `"motion"`:

import{easeIn}from"motion"

By passing a `0`-`1` progress value to these functions, you'll receive an eased progress back.

consteased = easeIn(0.75)

## Functions

Motion provides a number of built-in easing functions:

- `cubicBezier`

- `easeIn`/`easeOut`/`easeInOut`

- `backIn`/`backOut`/`backInOut`

- `circIn`/`circOut`/`circInOut`

- `anticipate`

- `linear`

### `cubicBezier`

`cubicBezier` provides very precise control over the easing curve.

import{cubicBezier}from"motion"

consteasing = cubicBezier(.35,.17,.3,.86)

consteasedProgress = easing(0.5)

New easing curve definitions can be generated with Motion Studio.

### `steps`

`steps` creates an easing with evenly-spaced, discrete steps. It is spec-compliant with CSS`steps` easing.

import{steps}from"motion"

consteasing = steps(4)

easing(0.2)// 0

easing(0.25)// 0.25

By default, the "steps" change at the end of a step, this can be changed by passing `"start"` to `steps`:

consteasing = steps(4,"start")

easing(0.2)// 0.25

The distribution of steps is linear by default but can be adjusted by passing `progress` through another easing function first.

easing(circInOut(0.2))

## Modifiers

Easing modifiers can be used to create mirrored and reversed easing functions.

### `reverseEasing`

`reverseEasing` accepts an easing function and returns a new one that reverses it. For instance, an ease in function will become an ease out function.

import{reverseEasing}from"motion"

constpowerOut = reverseEasing(powerIn)

### `mirrorEasing`

`mirrorEasing` accepts an easing function and returns a new one that mirrors it. For instance, an ease in function will become an ease in-out function.

import{mirrorEasing}from"motion"

constpowerInOut = mirrorEasing(powerInOut)

Previous

Layout animations

Next

hover

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Functions
- cubicBezier
- steps
- Modifiers
- reverseEasing
- mirrorEasing

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/easing-functions),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-motion-config)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-gestures)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-hover-animation

Motion homepage

Docs

Examples

Tutorials

Motion+

Hover animations are the most common form of gesture animation.

Motion improves on the CSS `:hover` psuedo-class, which can cause frustrating "sticky" states on touch devices, where hover styles can persist after a user lifts their finger.

Motion provides three powerful methods to tap into hover gestures to create reliable, cross-device hover interactions that filter out these unwanted emulated events:

- The `whileHover` animation prop

- `onHover` events

- `hover()` gesture recogniser

In this guide, we'll take a look at how (and when) to use each.

## The `whileHover` prop

The simplest and most common way to add a hover animation with Motion is with the `motion` component's`whileHover` prop.

It's a declarative way to define a target animation state - when a hover gesture starts, the component will animate to the values defined in it, and when the gesture ends, it'll animate

Transitions can be defined for when we enter a hover gesture state by setting `transition` within the `whileHover` definition.

<motion.button

whileHover={{

scale:1.1,

// Will be used when gesture starts

transition:{duration:0.1}

}}

// Will be used when gesture ends

transition={{duration:0.5}}

You can also listen for when a hover gesture starts and ends with the `onHoverStart` and `onHoverEnd` events.

<motion.a

## `hover()` gesture recogniser

To use `onHoverStart` and `onHoverEnd`, you need to import the full `motion` component. For lightweight hover gesture handling, you can import the tiny (<1kb) `hover()` function.

Because it returns a cleanup function, it's straightforward to integrate with `useEffect`:

import{hover}from"motion"

import{useRef,useEffect}from"react"

functionComponent(){

constref = useRef(null)

console.log("on hover start")

})

},\[\])

## Related topics

- **Gesture animation**\\
\\
An overview of all the gestures available in Motion for React.

- **hover**\\
\\
The hover() function can trigger functions as hover gestures start and end.

**Hover animation examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Hover**\\
\\
An example of using Motion's hover function to animate elements as a user hovers over them. hover() automatically filters out polyfilled hover events from touch screens, which can normally lead to broken visual states.

Previous

Gesture animation

Next

Drag animation

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- The whileHover prop
- Customise the animation
- Event handlers
- hover() gesture recogniser

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-drag

Motion homepage

Docs

Examples

Tutorials

Motion+

Drag animations allow users to move elements with their pointer.

Motion provides a suite of features to create app-quality drag animations with a simple API:

- Momentum

- Axis control

- Elastic constraints

- Direction locking

- Optional imperative start/stop controls

Although browsers provide a native Drag and Drop API, it can be challenging to create a pleasant experience, with an odd "ghost image" effect. On the other hand, it also contains native dropzone functionality - which isn't yet in Motion.

In this guide we'll take a look at all Motion's drag features and how to customise them.

Drag — Motion for React Example

## Usage

### The `drag` prop

The simplest way to make a component draggable is to add the `drag` prop to a `motion` component.

To lock dragging to a single axis, you can set the prop to `"x"` or `"y"`.

You can animate to an animation state while an element is being dragged using the `whileDrag` prop.

When the gesture starts, the component will animate to the state defined in `whileDrag`. When it ends, it will animate

By default, when a user releases a draggable element, it has **momentum**. It will perform an inertia animation based on the velocity of the pointer, creating a realistic, physical feel.

You can disable this behaviour by setting the `dragMomentum` prop to `false`.

<motion.div

drag

dragTransition={{

bounceStiffness:600,

bounceDamping:10

}}

You can constrain the movement of a draggable element using the `dragConstraints` prop.

Drag: Constraints — Motion for React Example

#### Pixel constraints

The simplest way to apply constraints is by passing an object of `top`, `left`, `right`, and `bottom` values, measured in pixels.

dragConstraints={{

top: -50,

left: -50,

right:50,

bottom:50,

For more dynamic constraints, you can pass a `ref` to another component. The draggable element will then be constrained to the bounding box of that element.

import{motion}from"motion/react"

import{useRef}from"react"

exportfunctionDragContainer(){

constconstraintsRef = useRef(null)

return(

}

#### Elastic constraints

By default, dragging an element beyond its constraints will "tug" with some elasticity. You can change this behavior with the `dragElastic` prop, which accepts a value between `0` (no movement) and `1` (full movement).

dragConstraints={{left:0,right:300}}

dragElastic={0.1}

You can lock an element to the first axis it's dragged on by setting the `dragDirectionLock` prop to `true`.

drag="x"

dragDirectionLock

### Drag events

You can listen to the lifecycle of a drag gesture with a set of event listeners. These are useful for updating other parts of your UI in response to a drag.

The main events are `onDragStart`, `onDrag`, and `onDragEnd`.

Drag with spring follow — Motion for React Example

Each callback is provided with the original `PointerEvent`, and an `info` object containing valuable data about the gesture's state:

- `point`: The `x` and `y` coordinates of the pointer.

- `delta`: The distance moved since the last event.

- `offset`: The distance from the element's origin.

- `velocity`: The current velocity of the pointer.

functiononDrag(event,info){

console.log(info.point.x,info.point.y)

In some cases, you might want to initiate a drag from a different element, like a handle or a video scrubber. You can achieve this with the `useDragControls` hook.

The hook returns a set of `dragControls` that you can pass to the draggable element. You can then call the `controls.start()` method from any event to begin the gesture.

import{motion,useDragControls}from"motion/react"

exportfunctionScrubber(){

constdragControls = useDragControls()

functionstartDrag(event){

// Start the drag gesture imperatively

dragControls.start(event,{snapToCursor:true})

dragControls={dragControls}

dragListener={false}// Disable the default drag handler

className="scrubber-handle"

## Troubleshooting

### Dragging an image shows a ghost image

These elements need `draggable` set to `false` to disable this ghost effect.

- **Gesture animation**\\
\\
An overview of all the gestures available in Motion for React.

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

**Drag animation examples**\\
\\
See all examples & tutorials, with full copy & paste source code.

Tutorial\\
\\
**Drag**\\
\\
An example of making an element draggable using Motion for React's drag prop.

Previous

Hover animation

Next

Motion component

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- The drag prop
- Axis locking
- Visual feedback with whileDrag
- Momentum
- Constraints
- Drag events
- Manual control
- Troubleshooting
- Dragging an image shows a ghost image

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-drag-controls

Motion homepage

Docs

Examples

Tutorials

Motion+

Usually, dragging is initiated by pressing down on a`motion` component with a`drag` prop and then moving the pointer.

For some use-cases, for example clicking at an arbitrary point on a video scrubber, we might want to initiate that dragging from a different element.

With `useDragControls`, we can create a set of controls to manually start dragging from any pointer event.

## Usage

Import `useDragControls` from Motion:

import{useDragControls}from"motion/react"

`useDragControls` returns drag controls that can be passed to a draggable `motion` component:

constcontrols = useDragControls()

To support touch screens, the triggering element should have the `touch-action: none` style applied.

By default, the drag gesture will only apply **changes** to the pointer position.

We can also make the `motion` component immediately snap to the cursor by passing `snapToCursor: true` to the `start` method.

controls.start(event,{snapToCursor:true})

### Disable automatic drag

With this configuration, the `motion` component will still automatically start a drag gesture when it receives a `pointerdown` event itself.

We can stop this behaviour by passing it a `dragListener={false}` prop.

<motion.div

drag

dragListener={false}

dragControls={controls}

By default, a drag gesture will take `3` pixels of cursor travel before initialising and, if using `directionLock`, determining which axis to lock on to.

This distance can be configured with the `distanceThreshold` option.

controls.start(event,{distanceThreshold:10})

### Manually stop and cancel

The drag gesture will automatically stop when the `pointerup` event is detected. It's also possible to end the gesture manually, with the `.stop()` and `.cancel()` methods.

controls.stop()

// or

controls.cancel()

Cancelling the event will skip calling the `onDragEnd` callback.

## Related topics

- **Motion component**\\
\\
Animate elements with a declarative API. Supports variants, gestures, and layout animations.

- **Gesture animation**\\
\\
An overview of all the gestures available in Motion for React.

Previous

useAnimationFrame

Next

useInView

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Touch support
- Snap to cursor
- Disable automatic drag
- Configure drag threshold
- Manually stop and cancel

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-hover-animation),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-scroll-animations).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-hover-animation)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-drag).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/react-use-drag-controls)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion Studio is a suite of AI and visual animation editing tools for your favourite code editors.

- **AI Context** **:** Upgrade your AI with the latest Motion documentation, custom ruleset, and access to over 330 examples and recommended patterns.

- **Performance Audit** **:** Identify and fix slow animations with this AI skill.

- **Transition Editor** **:** Real-time editing of Motion and CSS transitions.

- **CSS generation** **:** Generate CSS springs - no animation library needed.

Unlock the full Motion Studio feature set with Motion+. One-time payment, lifetime subscription.

### Install Motion Studio

One-click install for Cursor:

Add Extension

Add MCP

Motion Studio is also compatible with VS Code, Google Antigravity and more. See full installation guide.

## Features

### AI Context

LLMs are trained on data that is often out of data, or on low-quality Stack Overflow answers.

Motion Studio lets your LLM query the latest Motion docs, as well as the source code of 330+ premium examples for the best quality both visually and in your codebase.

Learn more about improving AI context

### Performance Audit

Use the `/motion-audit` AI skill to run a performance audit on your CSS and Motion code. The report will return a plan that you or your LLM can use to immediately improve performance.

Learn more about improving your animation performance

### Transition Editor

Motion Studio enables real-time editing and preview of transitions. Generate and edit easing curves and springs in both CSS and Motion, without having to leave your editor.

Your favourite transitions can be saved and reused anywhere.

Learn more about visual controls

### Generate CSS springs

600ms linear(0,0.0121/\\* ... \*/)

Learn more about CSS generation

## Related topics

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Studio SDK Overview**\\
\\
The complete toolkit for building animation editors and bridging design with implementation.

- **Generate CSS**

Next

Install Motion Studio

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Features
- AI Context
- Performance Audit
- Transition Editor
- Generate CSS springs

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-sdk

Motion homepage

Docs

Examples

Tutorials

Motion+

The Motion Studio SDK allows developers to build with the same functions and components as used by Motion Studio.

The SDK provides React components, state, and code generation APIs. Development is ongoing, but in this early version currently provides:

- Easing curve visualisation

- Code generation for CSS and Motion transitions

- Functions for serialising editor state into and out of the URL

## Install

Add the `motion-studio` package to your project using your private token. You need to be a Motion+ member to generate a private token.

npm install "https://api.motion.dev/registry.tgz?package=motion-studio&version=4.1.1&token=YOUR\_AUTH\_TOKEN"

## License

Motion+ allows you to build **internal animation tooling** with Motion Studio SDK. To build externally-facing tooling for your customers, contact us about the Motion+ Builder's License.

Previous

Generate CSS

Next

Codegen

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Install
- License

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-generate-css

Motion homepage

Docs

Examples

Tutorials

Motion+

Motion Studio can generate Motion springs and other easing functions as CSS `linear()` easing function \- no animation library required!

For example, you can ask your LLM to "Make a CSS spring curve, snappy but bouncy" and it will generate a `linear()` curve with the right duration and resolution to ensure your animation is smooth:

// LLM receives:

500ms linear(0,0.009,0.0352.1%,/\\* ... \*/)

`linear()` can create all kinds of easing curves that were previously impossible with CSS, like spring and bounce effects.

The downside to `linear()` is its maintainability. With Motion, it's usually easy to write and understand this kind of animation:

{ type:"spring",bounce:0.2}

However, with CSS and `linear()`, you need to visit a generation tool to output a property that looks like this:

linear(

0,0.009,0.0352.1%,0.141,0.2816.7%,0.72312.9%,0.93816.7%,1.017,

1.077,1.121,1.14924.3%,1.159,1.163,1.161,1.15429.9%,1.12932.8%,

1.05139.6%,1.01743.1%,0.991,0.97751%,0.97453.8%,0.97557.1%,

0.99769.8%,1.00376.9%,1.00483.8%,1

)

Tweaking this animation involves bouncing back and forth between your code editor and the curve generator tool. But Motion Studio allows you to do this directly in your editor.

## Usage

Once installed, you can give your LLM commands like "generate a CSS spring that is very bouncy" and it'll either reply with a `linear()` easing curve or insert it directly into your code.

### Springs

For CSS generation, Motion's springs are defined with two parameters, `visualDuration` and `bounce`.

Ask the LLM to generate a spring that "lasts 0.2 seconds and is very bouncy" will generate a CSS animation that **appears** to take 0.2 seconds to reach its target value, with oscillation taking place after this duration. This makes it easy to compose the spring animation with other time-based animations, and to tweak the bounciness without having to change the duration of the spring to compensate.

Motion+ users can also visualise the spring to iterate to their liking.

### Bounce

Not to be confused with the bounciness of a spring, a bounce easing function can make something look like it's bouncing against a hard surface.

Ask to "generate a bounce easing curve" or similar. It will default to longer durations, like 1 second, as this makes for more realistic gravity-like motion.

You can ask it to feel heavier or lighter and it will adjust the time accordingly.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Codegen**\\
\\
Utilities to generate CSS strings and Motion props from animation state.

- **AI Context**\\
\\
Turn your LLM into an animation expert with access to the latest Motion documentation & examples.

- **Get started with Motion Studio**

Previous

Visual Controls

Next

Studio SDK Overview

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Usage
- Springs
- Bounce

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-install),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-sdk)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/animation-performance-audit)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-generate-css)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-visual-controls)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/ai-llm-documentation

Motion homepage

Docs

Examples

Tutorials

Motion+

LLMs have supercharged our development workflows, but even now they still struggle to produce great animation code.

For example, have you ever fought with your LLM about still importing Motion from `"framer-motion"`? This is because it's trained on out-of-date information.

Or has it produced an animation that's **almost** right but ends up requiring a lot of prompting to fix? This is because LLMs can't visualise timing or easing curves, so they guess at values that often feel wrong.

Motion Studio provides a number of tools to improve the output of our LLMs by giving it the right information at the right time, and giving it quality over quantity:

- An MCP providing your LLM access to:

- Latest Motion documentation

- Source code for 330+ examples

- Your saved transitions
- Spring and transition visualisation

- Rules file for best practises and performance advice

In short, it turns your AI editor into a Motion expert.

## Documentation

The Motion Studio MCP comes loaded with the full and latest Motion documentation.

Every page is available as a resource, and is queryable by the LLM via the dedicated search tool.

## Examples

Motion+ comes with a vault of 330+ examples, and they're all queryable by your LLM.

Instead of relying on outdated training data, your AI searches this curated collection of production-ready patterns and adapts them to your project. It's as easy as "build me an accordion", or "create a vertically scrolling Carousel".

- **Zero hallucinations:** The code comes from the official Motion repository, not a generic LLM training set.

- **Instant & Offline:** The server runs locally on your machine for zero latency.

- **Context aware:** The AI reads the example code and understands **why** it works, allowing it to adapt the variables to your specific project names automatically.

Use prompts like:

create a tooltip with Motion and Base UI

Or:

make a spinning 3d cube

### Browsing

All examples are browsable via the Motion Examples gallery. It's easy to ask your editor to add a specific one:

adapt the app store motion example

The AI editor will, by default, select between JS, React and Vue based on your project. You can manually prompt it for a specific platform by mentioning it directly.

adapt the app store motion vue example

## Saved transitions

When using the Motion Studio extension's visual transition editor, you can save transitions you build to your Motion+ profile.

On a user's profile, you can save their shared transitions to your own profile, too.

With the Motion Studio MCP, these shared transitions can be accessed via your LLM.

use my "bounce out" transition

## Visualise transitions

LLMs struggle to visualise animations but they can recognise images. Motion Studio lets you generate images from transitions to help your LLM understand them.

A prompt like:

visualise the ease-in-out easing curve

Will use Motion to generate an image like this for your LLM:

Or, you can highlight existing Motion spring settings or cubic bezier definition and simply prompt "visualise this".

## Rules

AI rules allow you to customise and guide AI behaviour beyond just providing documentation. The Motion Studio rules prompt your AI with best practises, like:

- When and how to add `will-change`.

- Coding styles to improve per-frame performance.

- When to use `transform` vs independent transforms.

Once you've installed Motion+ rules via the private Motion+ GitHub repo, your editor should automatically use the rules when you mention Motion or edit Motion code.

Custom rule files are available for React, vanilla JS, Vue and also Base UI.

## Get Motion Studio

Stop fighting your AI over animation code. Motion Studio is included with Motion+, along with a library of premium Motion APIs, 330+ examples, 100+ tutorials, private Discord access and early access to all new Motion APIs.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Get started with Motion Studio**

- **Generate CSS**

Previous

Install Motion Studio

Next

Animation Performance Audit

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Documentation
- Examples
- Browsing
- Saved transitions
- Visualise transitions
- Rules
- Get Motion Studio

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/ai-llm-documentation).

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/vscode:extension/Motion.motion-vscode-extension

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-codex

Motion homepage

Docs

Examples

Tutorials

Motion+

LLMs have supercharged our development workflows, but even now they still struggle to produce great animation code.

For example, have you ever fought with your LLM about still importing Motion from `"framer-motion"`? This is because it's trained on out-of-date information.

Or has it produced an animation that's **almost** right but ends up requiring a lot of prompting to fix? This is because LLMs can't visualise timing or easing curves, so they guess at values that often feel wrong.

Motion Studio provides a number of tools to improve the output of our LLMs by giving it the right information at the right time, and giving it quality over quantity:

- An MCP providing your LLM access to:

- Latest Motion documentation

- Source code for 330+ examples

- Your saved transitions
- Spring and transition visualisation

- Rules file for best practises and performance advice

In short, it turns your AI editor into a Motion expert.

## Documentation

The Motion Studio MCP comes loaded with the full and latest Motion documentation.

Every page is available as a resource, and is queryable by the LLM via the dedicated search tool.

## Examples

Motion+ comes with a vault of 330+ examples, and they're all queryable by your LLM.

Instead of relying on outdated training data, your AI searches this curated collection of production-ready patterns and adapts them to your project. It's as easy as "build me an accordion", or "create a vertically scrolling Carousel".

- **Zero hallucinations:** The code comes from the official Motion repository, not a generic LLM training set.

- **Instant & Offline:** The server runs locally on your machine for zero latency.

- **Context aware:** The AI reads the example code and understands **why** it works, allowing it to adapt the variables to your specific project names automatically.

Use prompts like:

create a tooltip with Motion and Base UI

Or:

make a spinning 3d cube

### Browsing

All examples are browsable via the Motion Examples gallery. It's easy to ask your editor to add a specific one:

adapt the app store motion example

The AI editor will, by default, select between JS, React and Vue based on your project. You can manually prompt it for a specific platform by mentioning it directly.

adapt the app store motion vue example

## Saved transitions

When using the Motion Studio extension's visual transition editor, you can save transitions you build to your Motion+ profile.

On a user's profile, you can save their shared transitions to your own profile, too.

With the Motion Studio MCP, these shared transitions can be accessed via your LLM.

use my "bounce out" transition

## Visualise transitions

LLMs struggle to visualise animations but they can recognise images. Motion Studio lets you generate images from transitions to help your LLM understand them.

A prompt like:

visualise the ease-in-out easing curve

Will use Motion to generate an image like this for your LLM:

Or, you can highlight existing Motion spring settings or cubic bezier definition and simply prompt "visualise this".

## Rules

AI rules allow you to customise and guide AI behaviour beyond just providing documentation. The Motion Studio rules prompt your AI with best practises, like:

- When and how to add `will-change`.

- Coding styles to improve per-frame performance.

- When to use `transform` vs independent transforms.

Once you've installed Motion+ rules via the private Motion+ GitHub repo, your editor should automatically use the rules when you mention Motion or edit Motion code.

Custom rule files are available for React, vanilla JS, Vue and also Base UI.

## Get Motion Studio

Stop fighting your AI over animation code. Motion Studio is included with Motion+, along with a library of premium Motion APIs, 330+ examples, 100+ tutorials, private Discord access and early access to all new Motion APIs.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Get started with Motion Studio**

- **Generate CSS**

Previous

Install Motion Studio

Next

Animation Performance Audit

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Documentation
- Examples
- Browsing
- Saved transitions
- Visualise transitions
- Rules
- Get Motion Studio

![\\
\\
Unlock more APIs\\
\\
`Carousel`, `Cursor` and more: Level up with the full Motion+ library.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-visualise-curves

Motion homepage

Docs

Examples

Tutorials

Motion+

LLMs have supercharged our development workflows, but even now they still struggle to produce great animation code.

For example, have you ever fought with your LLM about still importing Motion from `"framer-motion"`? This is because it's trained on out-of-date information.

Or has it produced an animation that's **almost** right but ends up requiring a lot of prompting to fix? This is because LLMs can't visualise timing or easing curves, so they guess at values that often feel wrong.

Motion Studio provides a number of tools to improve the output of our LLMs by giving it the right information at the right time, and giving it quality over quantity:

- An MCP providing your LLM access to:

- Latest Motion documentation

- Source code for 330+ examples

- Your saved transitions
- Spring and transition visualisation

- Rules file for best practises and performance advice

In short, it turns your AI editor into a Motion expert.

## Documentation

The Motion Studio MCP comes loaded with the full and latest Motion documentation.

Every page is available as a resource, and is queryable by the LLM via the dedicated search tool.

## Examples

Motion+ comes with a vault of 330+ examples, and they're all queryable by your LLM.

Instead of relying on outdated training data, your AI searches this curated collection of production-ready patterns and adapts them to your project. It's as easy as "build me an accordion", or "create a vertically scrolling Carousel".

- **Zero hallucinations:** The code comes from the official Motion repository, not a generic LLM training set.

- **Instant & Offline:** The server runs locally on your machine for zero latency.

- **Context aware:** The AI reads the example code and understands **why** it works, allowing it to adapt the variables to your specific project names automatically.

Use prompts like:

create a tooltip with Motion and Base UI

Or:

make a spinning 3d cube

### Browsing

All examples are browsable via the Motion Examples gallery. It's easy to ask your editor to add a specific one:

adapt the app store motion example

The AI editor will, by default, select between JS, React and Vue based on your project. You can manually prompt it for a specific platform by mentioning it directly.

adapt the app store motion vue example

## Saved transitions

When using the Motion Studio extension's visual transition editor, you can save transitions you build to your Motion+ profile.

On a user's profile, you can save their shared transitions to your own profile, too.

With the Motion Studio MCP, these shared transitions can be accessed via your LLM.

use my "bounce out" transition

## Visualise transitions

LLMs struggle to visualise animations but they can recognise images. Motion Studio lets you generate images from transitions to help your LLM understand them.

A prompt like:

visualise the ease-in-out easing curve

Will use Motion to generate an image like this for your LLM:

Or, you can highlight existing Motion spring settings or cubic bezier definition and simply prompt "visualise this".

## Rules

AI rules allow you to customise and guide AI behaviour beyond just providing documentation. The Motion Studio rules prompt your AI with best practises, like:

- When and how to add `will-change`.

- Coding styles to improve per-frame performance.

- When to use `transform` vs independent transforms.

Once you've installed Motion+ rules via the private Motion+ GitHub repo, your editor should automatically use the rules when you mention Motion or edit Motion code.

Custom rule files are available for React, vanilla JS, Vue and also Base UI.

## Get Motion Studio

Stop fighting your AI over animation code. Motion Studio is included with Motion+, along with a library of premium Motion APIs, 330+ examples, 100+ tutorials, private Discord access and early access to all new Motion APIs.

## Related topics

- **Install Motion Studio**\\
\\
Enhance Copilot with Motion docs, and add visual animation editing tools for CSS and Motion.

- **Get started with Motion Studio**

- **Generate CSS**

Previous

Install Motion Studio

Next

Animation Performance Audit

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, 100+ tutorials, premium APIs, private Discord and GitHub, and powerful Motion Studio animation editing tools for your IDE.

Get Motion+

One-time payment, lifetime updates.

## On this page

- Documentation
- Examples
- Browsing
- Saved transitions
- Visualise transitions
- Rules
- Get Motion Studio

![\\
\\
AI-ready animations\\
\\
Make your LLM an animation expert with 330+ pre-built examples available via MCP.](https://motion.dev/plus)

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-ai-context):

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-codex)

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

# https://motion.dev/docs/studio-visualise-curves),

Motion homepage

Docs

Examples

Tutorials

Get Motion+

404

# Page not found

We couldn’t find the page you were looking for.

Motion+

## Level up your animations with Motion+

Unlock the full vault of 330+ Motion examples, premium APIs, private Discord and GitHub, and powerful VS Code animation editing tools.

One-time payment, lifetime updates.

Motion is supported by the best in the industry.

animations.dev

##### Stay in the loop

Subscribe for the latest news & updates.

Subscribe

Latest version:

12.34.0

Login

Register

Upgrade

---

