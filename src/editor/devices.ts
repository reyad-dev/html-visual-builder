import { type EditorDevice } from './types';

export interface DeviceConfig {
  id: EditorDevice;
  name: string;
  width: string;
  widthMedia?: string | undefined;
}

export const VIEWPORT_DEVICES: DeviceConfig[] = [
  { id: 'desktop', name: 'Desktop', width: '' },
  { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '768px' },
  { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
];
