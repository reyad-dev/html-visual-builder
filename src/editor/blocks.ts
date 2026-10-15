export interface BlockDefinition {
  id: string;
  label: string;
  category: string;
  media?: string;
  content: string;
  attributes?: Record<string, unknown>;
}

export const STRUCTURE_BLOCKS: BlockDefinition[] = [
  {
    id: 'section',
    label: 'Section',
    category: 'Structure',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`,
    content: `
      <section class="builder-section" style="padding: 64px 24px; min-height: 140px;">
        <div class="builder-container" style="max-width: 1140px; margin: 0 auto; padding: 0 16px;">
          <p style="color: #64748b; text-align: center; margin: 0; font-size: 1rem;">Section block — Drag content into here</p>
        </div>
      </section>
    `.trim(),
  },
  {
    id: 'container',
    label: 'Container',
    category: 'Structure',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 4"/></svg>`,
    content: `
      <div class="builder-container" style="max-width: 1140px; margin: 0 auto; padding: 32px 24px; min-height: 90px; border: 1px dashed rgba(148, 163, 184, 0.5); border-radius: 8px;">
        <p style="color: #64748b; margin: 0; text-align: center; font-size: 0.95rem;">Container Area</p>
      </div>
    `.trim(),
  },
  {
    id: 'columns-2',
    label: '2 Columns',
    category: 'Structure',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
    content: `
      <div class="builder-row" style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 24px;">
        <div class="builder-col" style="flex: 1; min-width: 240px; padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 100px;">
          <p style="margin: 0; color: #475569;">Column 1</p>
        </div>
        <div class="builder-col" style="flex: 1; min-width: 240px; padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 100px;">
          <p style="margin: 0; color: #475569;">Column 2</p>
        </div>
      </div>
    `.trim(),
  },
];

export const CONTENT_BLOCKS: BlockDefinition[] = [
  {
    id: 'heading',
    label: 'Heading',
    category: 'Content',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M6 12h12"/></svg>`,
    content: `<h2 style="font-size: 1.875rem; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">Heading Title</h2>`,
  },
  {
    id: 'text',
    label: 'Text',
    category: 'Content',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>`,
    content: `<p style="font-size: 1rem; line-height: 1.7; color: #334155; margin-top: 0; margin-bottom: 20px;">This is editable paragraph text. Double-click to edit content directly on the canvas.</p>`,
  },
  {
    id: 'button',
    label: 'Button',
    category: 'Content',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="3"/><line x1="9" y1="12" x2="15" y2="12"/></svg>`,
    content: `<a href="#" class="builder-btn" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-family: inherit; font-size: 0.95rem; text-align: center; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);">Click Action</a>`,
  },
  {
    id: 'image',
    label: 'Image',
    category: 'Content',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
    content: `<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop" alt="Responsive visual asset" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 16px auto;" />`,
  },
];

export const BASIC_BLOCKS: BlockDefinition[] = [
  {
    id: 'spacer',
    label: 'Spacer',
    category: 'Basic',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 8 12 3 17 8"/><polyline points="7 16 12 21 17 16"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
    content: `<div class="builder-spacer" style="height: 40px; width: 100%;"></div>`,
  },
  {
    id: 'divider',
    label: 'Divider',
    category: 'Basic',
    media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
    content: `<hr class="builder-divider" style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />`,
  },
];

export const DEFAULT_BLOCKS: BlockDefinition[] = [
  ...STRUCTURE_BLOCKS,
  ...CONTENT_BLOCKS,
  ...BASIC_BLOCKS,
];
