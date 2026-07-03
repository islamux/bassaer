# Footer Link to Who Wants to Be a Millionaire? Companion

## Goal
Add an external link in the Basaar footer pointing to the companion quiz game at https://who-wants-million.vercel.app/.

## Design
- New `Footer` component at `components/Footer.tsx`
- Shows: `اختبر معلوماتك: من سيربح المليون ↗` ("Test your knowledge: Who Wants to Be a Millionaire?")
- External link icon (Unicode `↗`) signals it leaves the site
- `target="_blank" rel="noopener noreferrer"` for security
- Styled: `text-xs text-muted-foreground`, centered, top border, `py-4`
- Imported and rendered in `ClientShell.tsx` after the children wrapper
- Appears on every page below content
