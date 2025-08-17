export type LoginOption = {
  host: string;
  port: number;
  password: string;
  username: string;
  useSecure: boolean;
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
  imapSecure?: boolean;
};

export type Config = {
  // Add your configuration properties here
  // Example: apiKey: string;
  fontSize?: number;
  fontFamily?: string[];
  lineHeight?: number;
}
