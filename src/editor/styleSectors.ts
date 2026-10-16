/**
 * Style Manager Sectors and Property Definitions (T-0201 to T-0208)
 * Defined according to 08_UI_UX_SPEC.md and 05_EDITOR_BEHAVIOR.md.
 */

export interface SectorPropertyOption {
  value: string;
  label: string;
}

export type PropertyInputType =
  | 'text'
  | 'number'
  | 'select'
  | 'color'
  | 'slider'
  | 'composite';

export interface SectorPropertyConfig {
  id: string;
  label: string;
  type: PropertyInputType;
  cssProp: string;
  defaultUnit?: string;
  units?: string[];
  options?: SectorPropertyOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface StyleSectorConfig {
  id: string;
  name: string;
  defaultOpen: boolean;
  properties: SectorPropertyConfig[];
}

export const COMMON_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'auto'];
export const SPACING_UNITS = ['px', 'rem', 'em', '%', 'auto'];
export const SIZE_UNITS = ['px', '%', 'vw', 'vh', 'rem', 'auto'];

export const STYLE_SECTORS: StyleSectorConfig[] = [
  // 1. Layout (T-0202)
  {
    id: 'layout',
    name: 'Layout',
    defaultOpen: true,
    properties: [
      {
        id: 'display',
        label: 'Display',
        type: 'select',
        cssProp: 'display',
        options: [
          { value: 'block', label: 'Block' },
          { value: 'flex', label: 'Flex' },
          { value: 'grid', label: 'Grid' },
          { value: 'inline-block', label: 'Inline-Block' },
          { value: 'inline', label: 'Inline' },
          { value: 'none', label: 'None' },
        ],
      },
      {
        id: 'flex-direction',
        label: 'Flex Direction',
        type: 'select',
        cssProp: 'flex-direction',
        options: [
          { value: 'row', label: 'Row (Horizontal)' },
          { value: 'column', label: 'Column (Vertical)' },
          { value: 'row-reverse', label: 'Row Reverse' },
          { value: 'column-reverse', label: 'Column Reverse' },
        ],
      },
      {
        id: 'justify-content',
        label: 'Justify Content',
        type: 'select',
        cssProp: 'justify-content',
        options: [
          { value: 'flex-start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'flex-end', label: 'End' },
          { value: 'space-between', label: 'Space Between' },
          { value: 'space-around', label: 'Space Around' },
          { value: 'space-evenly', label: 'Space Evenly' },
        ],
      },
      {
        id: 'align-items',
        label: 'Align Items',
        type: 'select',
        cssProp: 'align-items',
        options: [
          { value: 'stretch', label: 'Stretch' },
          { value: 'flex-start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'flex-end', label: 'End' },
          { value: 'baseline', label: 'Baseline' },
        ],
      },
      {
        id: 'flex-wrap',
        label: 'Flex Wrap',
        type: 'select',
        cssProp: 'flex-wrap',
        options: [
          { value: 'nowrap', label: 'No Wrap' },
          { value: 'wrap', label: 'Wrap' },
          { value: 'wrap-reverse', label: 'Wrap Reverse' },
        ],
      },
      {
        id: 'gap',
        label: 'Gap',
        type: 'text',
        cssProp: 'gap',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '0px',
      },
    ],
  },

  // 2. Spacing (T-0203)
  {
    id: 'spacing',
    name: 'Spacing',
    defaultOpen: true,
    properties: [
      {
        id: 'margin-top',
        label: 'Margin Top',
        type: 'text',
        cssProp: 'margin-top',
        defaultUnit: 'px',
        units: SPACING_UNITS,
        placeholder: '0px',
      },
      {
        id: 'margin-right',
        label: 'Margin Right',
        type: 'text',
        cssProp: 'margin-right',
        defaultUnit: 'px',
        units: SPACING_UNITS,
        placeholder: '0px',
      },
      {
        id: 'margin-bottom',
        label: 'Margin Bottom',
        type: 'text',
        cssProp: 'margin-bottom',
        defaultUnit: 'px',
        units: SPACING_UNITS,
        placeholder: '0px',
      },
      {
        id: 'margin-left',
        label: 'Margin Left',
        type: 'text',
        cssProp: 'margin-left',
        defaultUnit: 'px',
        units: SPACING_UNITS,
        placeholder: '0px',
      },
      {
        id: 'padding-top',
        label: 'Padding Top',
        type: 'text',
        cssProp: 'padding-top',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '0px',
      },
      {
        id: 'padding-right',
        label: 'Padding Right',
        type: 'text',
        cssProp: 'padding-right',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '0px',
      },
      {
        id: 'padding-bottom',
        label: 'Padding Bottom',
        type: 'text',
        cssProp: 'padding-bottom',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '0px',
      },
      {
        id: 'padding-left',
        label: 'Padding Left',
        type: 'text',
        cssProp: 'padding-left',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '0px',
      },
    ],
  },

  // 3. Size (T-0204)
  {
    id: 'size',
    name: 'Size',
    defaultOpen: false,
    properties: [
      {
        id: 'width',
        label: 'Width',
        type: 'text',
        cssProp: 'width',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: 'auto',
      },
      {
        id: 'min-width',
        label: 'Min Width',
        type: 'text',
        cssProp: 'min-width',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: '0px',
      },
      {
        id: 'max-width',
        label: 'Max Width',
        type: 'text',
        cssProp: 'max-width',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: 'none',
      },
      {
        id: 'height',
        label: 'Height',
        type: 'text',
        cssProp: 'height',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: 'auto',
      },
      {
        id: 'min-height',
        label: 'Min Height',
        type: 'text',
        cssProp: 'min-height',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: '0px',
      },
      {
        id: 'max-height',
        label: 'Max Height',
        type: 'text',
        cssProp: 'max-height',
        defaultUnit: 'px',
        units: SIZE_UNITS,
        placeholder: 'none',
      },
      {
        id: 'overflow',
        label: 'Overflow',
        type: 'select',
        cssProp: 'overflow',
        options: [
          { value: 'visible', label: 'Visible' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'scroll', label: 'Scroll' },
          { value: 'auto', label: 'Auto' },
        ],
      },
    ],
  },

  // 4. Typography (T-0205)
  {
    id: 'typography',
    name: 'Typography',
    defaultOpen: false,
    properties: [
      {
        id: 'font-family',
        label: 'Font Family',
        type: 'select',
        cssProp: 'font-family',
        options: [
          { value: 'inherit', label: 'Default (Inherit)' },
          { value: "'Alexandria', sans-serif", label: 'Alexandria (عربي)' },
          { value: "'Cairo', sans-serif", label: 'Cairo (عربي)' },
          { value: "'Tajawal', sans-serif", label: 'Tajawal (عربي)' },
          { value: "'Almarai', sans-serif", label: 'Almarai (المراعي)' },
          { value: "'Amiri', serif", label: 'Amiri (أميري)' },
          { value: "'Changa', sans-serif", label: 'Changa (شانجا)' },
          { value: "'Noto Sans Arabic', sans-serif", label: 'Noto Sans Arabic (عربي)' },
          { value: "'Rubik', sans-serif", label: 'Rubik (روبيك)' },
          { value: "'El Messiri', sans-serif", label: 'El Messiri (المسيري)' },
          { value: "'Readex Pro', sans-serif", label: 'Readex Pro (عربي)' },
          { value: "'IBM Plex Sans Arabic', sans-serif", label: 'IBM Plex Arabic (عربي)' },
          { value: "'Inter', sans-serif", label: 'Inter' },
          { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
          { value: "'Roboto', sans-serif", label: 'Roboto' },
          { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
          { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
          { value: 'Georgia, serif', label: 'Georgia' },
          { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
          { value: "'Courier New', Courier, monospace", label: 'Courier New' },
        ],
      },
      {
        id: 'font-size',
        label: 'Font Size',
        type: 'text',
        cssProp: 'font-size',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em', '%'],
        placeholder: '16px',
      },
      {
        id: 'font-weight',
        label: 'Font Weight',
        type: 'select',
        cssProp: 'font-weight',
        options: [
          { value: '300', label: '300 (Light)' },
          { value: '400', label: '400 (Regular)' },
          { value: '500', label: '500 (Medium)' },
          { value: '600', label: '600 (Semi-Bold)' },
          { value: '700', label: '700 (Bold)' },
          { value: '800', label: '800 (Extra-Bold)' },
        ],
      },
      {
        id: 'color',
        label: 'Color',
        type: 'color',
        cssProp: 'color',
        placeholder: '#ffffff',
      },
      {
        id: 'text-align',
        label: 'Text Align',
        type: 'select',
        cssProp: 'text-align',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' },
        ],
      },
      {
        id: 'line-height',
        label: 'Line Height',
        type: 'text',
        cssProp: 'line-height',
        defaultUnit: '',
        units: ['', 'px', 'rem', '%'],
        placeholder: '1.5',
      },
      {
        id: 'letter-spacing',
        label: 'Letter Spacing',
        type: 'text',
        cssProp: 'letter-spacing',
        defaultUnit: 'px',
        units: ['px', 'em', 'rem'],
        placeholder: '0px',
      },
      {
        id: 'text-decoration',
        label: 'Decoration',
        type: 'select',
        cssProp: 'text-decoration',
        options: [
          { value: 'none', label: 'None' },
          { value: 'underline', label: 'Underline' },
          { value: 'line-through', label: 'Line Through' },
        ],
      },
    ],
  },

  // 5. Background (T-0206)
  {
    id: 'background',
    name: 'Background',
    defaultOpen: false,
    properties: [
      {
        id: 'background-color',
        label: 'Color',
        type: 'color',
        cssProp: 'background-color',
        placeholder: '#000000',
      },
      {
        id: 'background-image',
        label: 'Image URL',
        type: 'text',
        cssProp: 'background-image',
        placeholder: 'url(...)',
      },
      {
        id: 'background-size',
        label: 'Size',
        type: 'select',
        cssProp: 'background-size',
        options: [
          { value: 'auto', label: 'Auto' },
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
        ],
      },
      {
        id: 'background-position',
        label: 'Position',
        type: 'select',
        cssProp: 'background-position',
        options: [
          { value: 'center', label: 'Center' },
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        id: 'background-repeat',
        label: 'Repeat',
        type: 'select',
        cssProp: 'background-repeat',
        options: [
          { value: 'no-repeat', label: 'No Repeat' },
          { value: 'repeat', label: 'Repeat' },
          { value: 'repeat-x', label: 'Repeat X' },
          { value: 'repeat-y', label: 'Repeat Y' },
        ],
      },
    ],
  },

  // 6. Border (T-0207)
  {
    id: 'border',
    name: 'Border',
    defaultOpen: false,
    properties: [
      {
        id: 'border-style',
        label: 'Style',
        type: 'select',
        cssProp: 'border-style',
        options: [
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' },
        ],
      },
      {
        id: 'border-width',
        label: 'Width',
        type: 'text',
        cssProp: 'border-width',
        defaultUnit: 'px',
        units: ['px', 'rem', 'em'],
        placeholder: '1px',
      },
      {
        id: 'border-color',
        label: 'Color',
        type: 'color',
        cssProp: 'border-color',
        placeholder: '#333333',
      },
      {
        id: 'border-radius',
        label: 'Radius',
        type: 'text',
        cssProp: 'border-radius',
        defaultUnit: 'px',
        units: ['px', '%', 'rem', 'em'],
        placeholder: '4px',
      },
    ],
  },

  // 7. Effects (T-0208)
  {
    id: 'effects',
    name: 'Effects',
    defaultOpen: false,
    properties: [
      {
        id: 'opacity',
        label: 'Opacity',
        type: 'slider',
        cssProp: 'opacity',
        min: 0,
        max: 1,
        step: 0.05,
        placeholder: '1',
      },
      {
        id: 'box-shadow',
        label: 'Box Shadow',
        type: 'text',
        cssProp: 'box-shadow',
        placeholder: '0 4px 6px rgba(0,0,0,0.1)',
      },
    ],
  },
];
