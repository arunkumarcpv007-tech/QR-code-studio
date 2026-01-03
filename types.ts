
export enum QRType {
  URL = 'URL',
  WIFI = 'WIFI',
  VCARD = 'VCARD',
  TEXT = 'TEXT',
  EMAIL = 'EMAIL'
}

export type EyeStyle = 'square' | 'rounded' | 'dots';
export type DotStyle = 'solid' | 'gradient' | 'pattern';
export type DotShape = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'star' | 'triangle';

export interface QRConfig {
  type: QRType;
  value: string;
  fgColor: string;
  fgGradientColor: string;
  dotStyle: DotStyle;
  dotShape: DotShape;
  bgColor: string;
  logoUrl?: string;
  logoSize: number;
  logoOpacity: number;
  includeFrame: boolean;
  frameText: string;
  frameColor: string;
  frameTextColor: string;
  eyeStyle: EyeStyle;
  eyeColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  animate: boolean;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  fullName: string;
  phone: string;
  email: string;
  company: string;
  job: string;
  website: string;
  address: string;
}

export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

export interface SavedQR {
  id: string;
  config: QRConfig;
  timestamp: number;
}
