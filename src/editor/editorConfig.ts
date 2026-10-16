export const DEFAULT_BLANK_HTML = `
<section class="builder-section" style="padding: 72px 28px; font-family: 'Alexandria', 'Cairo', 'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div class="builder-container" style="max-width: 960px; margin: 0 auto; text-align: center; padding: 0 16px;">
    <h1 style="font-size: 2.25rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.3;">Start Designing</h1>
    <p style="font-size: 1.125rem; color: #475569; margin-top: 0; margin-bottom: 28px; line-height: 1.7; max-width: 640px; margin-left: auto; margin-right: auto;">
      Drag blocks from the left sidebar to add new sections, headings, text, buttons, and images, or click on any element to inspect its properties.
    </p>
    <a href="#" class="builder-btn" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 1rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);">
      Explore Components
    </a>
  </div>
</section>
`.trim();

export const DEFAULT_CANVAS_CSS = `
html, body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Alexandria', 'Cairo', 'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
html[dir="rtl"], body[dir="rtl"] {
  direction: rtl;
}
* {
  box-sizing: border-box;
}
.builder-section {
  position: relative;
}
.builder-container {
  box-sizing: border-box;
}
@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`;
