import { app } from "electron";
import path from "path";
import fs from "fs";
import { type Config } from "@typings/index";

export const configJson = path.join(app.getPath("userData"), "config.json");

export function getDefaultConfig(): Config {
  return {
    fontFamily: ["宋体", "times new roman"],
    fontSize: 16,
    lineHeight: 1.1,
    countdownSeconds: 5,
  };
}

export const loadConfig = () => {
  try {
    const data = fs.readFileSync(configJson, "utf8");
    if (!data) return getDefaultConfig();
    return JSON.parse(data) as Config;
  } catch (error) {
    return getDefaultConfig();
  }
};

export const saveConfig = (config: any) => {
  fs.writeFileSync(configJson, JSON.stringify(config, null, 2));
};
