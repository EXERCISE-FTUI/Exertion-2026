import { Redis } from "@upstash/redis";
import { EXERMIND_CONFIG } from "@/config/exermind.config";

const url = process.env.UPSTASH_REDIS_REST_URL || EXERMIND_CONFIG.REDIS_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || EXERMIND_CONFIG.REDIS_TOKEN;

export const isRedisConfigured = Boolean(url && token);

export const redis = isRedisConfigured
  ? new Redis({
      url: url!,
      token: token!,
    })
  : null;
