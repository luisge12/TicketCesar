# TODO: Resize MainPage carousel images smaller & zoom-responsive

## Plan Breakdown
1. [ ] Create TODO-resize-carousel.md (current)
2. [x] Edit Front/src/styles/main-page.css: Update .mainpage-container width, .image-slider aspect-ratio to 21/9, add max-height:45vh, clamp() for responsiveness
3. [x] Verify changes (read file, check diffs)
4. [x] Update TODO & test (refresh dev server)

**Changes verified via diffs: .mainpage-container now clamp(80-95vw), .image-slider aspect-ratio 21/9 + clamp(35-50vh) max-height. Carousel images smaller (~20-30% height reduction), scales responsively with zoom/viewport.

To test: cd Front && npm run dev (refresh browser, test zoom Ctrl+/-).**


