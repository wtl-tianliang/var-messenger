export type LoginOption = {
  host: string;
  port: number;
  password: string;
  username: string;
  useSecure: boolean;
};

export type Config = {
  // Add your configuration properties here
  // Example: apiKey: string;
  fontSize?: number;
  fontFamily?: string[];
  lineHeight?: number;
  countdownSeconds?: number;
}
