export interface ProxyCheckRoot {
  status: string;
  query_time: number;
  [ip: string]: string | number | ProxyCheckIpResult;
}

export interface ProxyCheckIpResult {
  network: Network;
  location: Location;
  device_estimate: DeviceEstimate;
  detections: Detections;
  detection_history: unknown;
  attack_history: unknown;
  operator: unknown;
  last_updated: string;
}

export interface Network {
  asn: string;
  range: string;
  hostname: unknown;
  provider: string;
  organisation: string;
  type: string;
}

export interface Location {
  continent_name: string;
  continent_code: string;
  country_name: string;
  country_code: string;
  region_name: string;
  region_code: string;
  city_name: string;
  postal_code: unknown;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: Currency;
}

export interface Currency {
  name: string;
  code: string;
  symbol: string;
}

export interface DeviceEstimate {
  address: number;
  subnet: number;
}

export interface Detections {
  proxy: boolean;
  vpn: boolean;
  compromised: boolean;
  scraper: boolean;
  tor: boolean;
  hosting: boolean;
  anonymous: boolean;
  risk: number;
  confidence: number;
  first_seen: unknown;
  last_seen: unknown;
}
