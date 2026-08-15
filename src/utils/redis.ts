import { Redis } from "@upstash/redis";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

const envUrl = process.env.UPSTASH_REDIS_REST_URL;
const envToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Use process.env if both are set; otherwise use EXERMIND_CONFIG pair atomically
const url = envUrl && envToken ? envUrl : EXERMIND_CONFIG.UPSTASH_REDIS_REST_URL;
const token = envUrl && envToken ? envToken : EXERMIND_CONFIG.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

export const redis = isRedisConfigured
  ? new Redis({
      url: url!,
      token: token!,
    })
  : null;
