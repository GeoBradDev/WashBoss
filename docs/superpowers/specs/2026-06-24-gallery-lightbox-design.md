# Gallery Lightbox Design

Date: 2026-06-24
Status: Approved

## Goal

Let a visitor click any photo in the gallery to view it large, then browse
through the full set of photos with arrows or the keyboard, and dismiss the
view to return to the page.

## Approach

Build the feature with MUI v9's built-in `Modal` and `Backdrop`. No new
dependency. This keeps the maintenance and peer-version surface small (the
project was just recovering from a dependency-induced breakage) and inherits the
existing dark theme automatically.

Rejected alternative: a dedicated lightbox library (e.g.
`yet-another-react-lightbox`). It offers swipe and pinch-zoom out of the box,
but this site does not need those, and it reintroduces the third-party
peer-dependency risk we just cleaned up.

## Components

### `src/components/Lightbox.jsx` (new)

Presentational component. Renders nothing when closed.

Props:
- `photos` — array of `{ src, alt }` (the same array Gallery already holds).
- `index` — number of the photo to show, or `null` when the lightbox is closed.
- `onClose` — called to dismiss.
- `onPrev` — called to move to the previous photo.
- `onNext` — called to move to the next photo.

Responsibilities:
- Render an MUI `Modal` open when `index !== null`.
- Show the current photo centered, capped at `maxWidth: 90vw` /
  `maxHeight: 85vh`, `objectFit: contain` so portrait and landscape both fit
  without cropping.
- Render previous/next `IconButton`s (`ChevronLeft` / `ChevronRight`) and a
  close `IconButton` (`Close`), each with an `aria-label`.
- Render a `index + 1 / photos.length` counter below the image.
- While open, attach a `keydown` listener (in a `useEffect`): `Escape` ->
  `onClose`, `ArrowLeft` -> `onPrev`, `ArrowRight` -> `onNext`. The effect
  cleans up the listener and is gated on the open state.
- Clicking the backdrop (outside the image) closes via the Modal's `onClose`.

### `src/components/Gallery.jsx` (modified)

Owns the state and navigation math.
- `const [openIndex, setOpenIndex] = useState(null)`.
- Each thumbnail gets `onClick={() => setOpenIndex(i)}` and `cursor: 'pointer'`.
- Handlers passed to `Lightbox`:
  - `onClose` -> `setOpenIndex(null)`.
  - `onPrev` -> `setOpenIndex((i) => (i + PHOTOS.length - 1) % PHOTOS.length)`.
  - `onNext` -> `setOpenIndex((i) => (i + 1) % PHOTOS.length)`.
- Navigation wraps around (last -> first, first -> last).

## Data flow

Gallery holds `openIndex`. Clicking a thumbnail sets it. Lightbox reads
`photos[index]` to render. Arrow/keyboard actions call the wrap-around handlers,
which update `openIndex`, re-rendering Lightbox with the new photo. Closing sets
`openIndex` back to `null`, unmounting the Modal content.

## Accessibility

MUI `Modal` provides focus trapping and `aria-modal`. The three control buttons
get explicit `aria-label`s ("Previous photo", "Next photo", "Close"). Keyboard
navigation (Esc / arrows) is supported.

## Error handling / edge cases

- `index === null` -> Modal closed, nothing rendered.
- Wrap-around arithmetic uses modulo so the first/last photos navigate cleanly.
- Images already exist in `public/`; a missing file would show the browser's
  broken-image glyph inside the Modal, which is acceptable and not new behavior.

## Testing

The project currently has no test runner or test script. Verification will be
manual via the Vite preview server (open a photo, arrow through, wrap around,
Esc/backdrop close, keyboard navigation). Adding a test harness for one
component is out of scope unless requested.

## Out of scope

- Swipe gestures, pinch-zoom, captions, thumbnails strip, slideshow autoplay.
- Lazy-loading / image optimization changes.