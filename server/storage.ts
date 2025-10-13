// Reference: javascript_database blueprint integration
import {
  coordinates,
  activeConfig,
  type Coordinate,
  type InsertCoordinate,
  type ActiveConfig,
  type UpdateActiveConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCoordinates(): Promise<Coordinate[]>;
  getCoordinate(id: string): Promise<Coordinate | undefined>;
  createCoordinate(coordinate: InsertCoordinate): Promise<Coordinate>;
  deleteCoordinate(id: string): Promise<void>;
  
  getActiveConfig(): Promise<ActiveConfig | undefined>;
  createActiveConfig(k: number, radius: number, timeInterval: number, activeCoordinateIds: string[]): Promise<ActiveConfig>;
  updateActiveConfig(updates: UpdateActiveConfig): Promise<ActiveConfig | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCoordinates(): Promise<Coordinate[]> {
    return await db.select().from(coordinates);
  }

  async getCoordinate(id: string): Promise<Coordinate | undefined> {
    const [coordinate] = await db.select().from(coordinates).where(eq(coordinates.id, id));
    return coordinate || undefined;
  }

  async createCoordinate(insertCoordinate: InsertCoordinate): Promise<Coordinate> {
    const [coordinate] = await db
      .insert(coordinates)
      .values(insertCoordinate)
      .returning();
    return coordinate;
  }

  async deleteCoordinate(id: string): Promise<void> {
    await db.delete(coordinates).where(eq(coordinates.id, id));
  }

  async getActiveConfig(): Promise<ActiveConfig | undefined> {
    const configs = await db.select().from(activeConfig).limit(1);
    return configs[0] || undefined;
  }

  async createActiveConfig(
    k: number,
    radius: number,
    timeInterval: number,
    activeCoordinateIds: string[]
  ): Promise<ActiveConfig> {
    const [config] = await db
      .insert(activeConfig)
      .values({ k, radius, timeInterval, activeCoordinateIds })
      .returning();
    return config;
  }

  async updateActiveConfig(updates: UpdateActiveConfig): Promise<ActiveConfig | undefined> {
    const existingConfig = await this.getActiveConfig();
    
    if (!existingConfig) {
      return undefined;
    }

    const [updated] = await db
      .update(activeConfig)
      .set(updates)
      .where(eq(activeConfig.id, existingConfig.id))
      .returning();
    
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
