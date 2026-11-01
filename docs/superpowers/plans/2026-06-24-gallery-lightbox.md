# Gallery Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a visitor click a gallery photo to view it large and browse the full set with arrows/keyboard.

**Architecture:** A new presentational `Lightbox.jsx` renders an MUI `Modal` showing one photo with prev/next/close controls and a counter. `Gallery.jsx` owns an `openIndex` state, opens the lightbox on thumbnail click, and supplies wrap-around navigation handlers.

**Tech Stack:** React 19, MUI v9 (`Modal`, `Box`, `IconButton`, `Typography`), `@mui/icons-material` (`ChevronLeft`, `ChevronRight`, `Close`), Vite 8.

## Global Constraints

- JavaScript only, never TypeScript (`.jsx` files).
- No new npm dependencies — use MUI v9 primitives already installed.
- MUI v9 Grid uses the `size` prop, never the old `item` / `xs` / `sm` / `md` props.
- No emojis and no em dashes in code or copy.
- Do NOT run `git commit` or `git push` (user git policy). Tasks end with a verification checkpoint, not a commit.
- No test runner exists; verification is `npm run build` plus manual browser checks via `npm run dev`.

---

### Task 1: Create the Lightbox component

**Files:**
- Create: `src/components/Lightbox.jsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a default-exported `Lightbox` component with props
  `photos` (array of `{ src, alt }`), `index` (number | null), `onClose` (fn),
  `onPrev` (fn), `onNext` (fn). Renders `null` when `index === null`. Task 2
  relies on exactly these prop names.

- [ ] **Step 1: Write the component file**

Create `src/components/Lightbox.jsx` with this exact content:

```jsx
import { useEffect } from 'react'
import { Modal, Box, IconButton, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'

const controlSx = {
  position: 'absolute',
  color: 'white',
  bgcolor: 'rgba(0,0,0,0.4)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)', color: 'primary.main' },
}

export default function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const open = index !== null

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  const photo = photos[index]

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          position: 'relative',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src={photo.src}
          alt={photo.alt}
          sx={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 1,
            display: 'block',
          }}
        />

        <IconButton
          aria-label="Previous photo"
          onClick={onPrev}
          sx={{ ...controlSx, left: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeftIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <IconButton
          aria-label="Next photo"
          onClick={onNext}
          sx={{ ...controlSx, right: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRightIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ ...controlSx, top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {index + 1} / {photos.length}
        </Typography>
      </Box>
    </Modal>
  )
}
```

- [ ] **Step 2: Lint the new file**

Nothing imports `Lightbox.jsx` yet, so `npm run build` will not compile it. Lint it directly instead:

Run: `npx eslint src/components/Lightbox.jsx`
Expected: no errors (clean exit). This catches syntax errors, bad imports, and unused vars. Full runtime compilation is verified in Task 2 Step 5 once the component is imported.

- [ ] **Step 3: Checkpoint**

The component file exists with the exact prop interface `{ photos, index, onClose, onPrev, onNext }`. Full runtime verification happens in Task 2 once it is rendered. Do not commit (user git policy).

---

### Task 2: Wire the Lightbox into the Gallery

**Files:**
- Modify: `src/components/Gallery.jsx`

**Interfaces:**
- Consumes: `Lightbox` from `./Lightbox` with props
  `{ photos, index, onClose, onPrev, onNext }` (from Task 1).
- Produces: end-user click-to-enlarge behavior. Nothing downstream depends on it.

- [ ] **Step 1: Add the import and state**

In `src/components/Gallery.jsx`, change the first import line and add the Lightbox import. Replace:

```jsx
import { Box, Container, Grid, Typography } from '@mui/material'
```

with:

```jsx
import { useState } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import Lightbox from './Lightbox'
```

- [ ] **Step 2: Add state and handlers inside the component**

Change the component opening from:

```jsx
export default function Gallery() {
  return (
```

to:

```jsx
export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null)

  const handlePrev = () =>
    setOpenIndex((i) => (i + PHOTOS.length - 1) % PHOTOS.length)
  const handleNext = () =>
    setOpenIndex((i) => (i + 1) % PHOTOS.length)

  return (
```

- [ ] **Step 3: Make thumbnails clickable**

In the `PHOTOS.map` block, add an `onClick` to the image and a `cursor: 'pointer'` to its `sx`. Replace:

```jsx
              <Box
                component="img"
                src={photo.src}
                alt={photo.alt}
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  },
                }}
              />
```

with:

```jsx
              <Box
                component="img"
                src={photo.src}
                alt={photo.alt}
                onClick={() => setOpenIndex(i)}
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  },
                }}
              />
```

- [ ] **Step 4: Render the Lightbox**

Add the `Lightbox` just before the closing `</Box>` of the outer section. Replace:

```jsx
        </Grid>
      </Container>
    </Box>
  )
}
```

with:

```jsx
        </Grid>
      </Container>

      <Lightbox
        photos={PHOTOS}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </Box>
  )
}
```

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: build completes with no errors, all modules transformed.

- [ ] **Step 6: Manual browser verification**

Run: `npm run dev` and open the printed local URL (typically `http://localhost:5173/`). Scroll to the "Our Work" gallery and verify:
1. The cursor shows a pointer over each thumbnail.
2. Clicking a thumbnail opens it large, centered on a dimmed backdrop.
3. The counter reads the correct position (e.g. clicking the first photo shows `1 / 24`).
4. The right arrow advances; the left arrow goes back.
5. From the last photo, Next wraps to `1 / 24`; from the first, Previous wraps to `24 / 24`.
6. Keyboard: Left/Right arrows navigate, Esc closes.
7. Clicking the dimmed area outside the image closes it; clicking the X closes it.
8. A portrait and a landscape photo both fit fully on screen without cropping.

- [ ] **Step 7: Checkpoint**

All eight checks pass. Do not commit (user git policy); leave the changes in the working tree for the user to review.

---

## Self-Review

**Spec coverage:**
- MUI Modal/Backdrop, no new dependency -> Task 1 (uses `@mui/material` Modal). Covered.
- Lightbox.jsx props `{ photos, index, onClose, onPrev, onNext }` -> Task 1. Covered.
- Gallery owns `openIndex`, click sets it, wrap-around handlers -> Task 2 Steps 2-3. Covered.
- Image cap `90vw`/`85vh`, `objectFit: contain` -> Task 1 image `sx`. Covered.
- Prev/next/close IconButtons with aria-labels + counter -> Task 1. Covered.
- Keyboard Esc/arrows via gated useEffect -> Task 1 Step 1. Covered.
- Backdrop click closes -> Modal `onClose` in Task 1; verified Task 2 Step 6 check 7. Covered.
- Accessibility (focus trap from Modal, aria-labels) -> Task 1. Covered.
- Manual verification, no test harness -> Task 2 Step 6. Covered.

**Placeholder scan:** No TBD/TODO; all code is complete and literal.

**Type consistency:** Prop names `photos`, `index`, `onClose`, `onPrev`, `onNext` are identical in Task 1's definition and Task 2's `<Lightbox>` usage. Wrap-around math uses `PHOTOS.length` consistently. Consistent.