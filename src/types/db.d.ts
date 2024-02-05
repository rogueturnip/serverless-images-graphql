import type { ColumnType } from "kysely";

export type BuildingTypeEnum = "Commercial" | "Educational" | "Industrial" | "Recreational" | "Residential";

export type GarageType = "attached" | "detached" | "none" | "unknown";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type PoolType = "above" | "below" | "none" | "unknown";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type WaterType = "city" | "other" | "unknown" | "well";

export interface ContentCriteria {
  attic: boolean | null;
  bedrooms: Json | null;
  building_type: BuildingTypeEnum[] | null;
  description: string | null;
  garage: GarageType[] | null;
  id: Generated<number>;
  pool: PoolType[] | null;
  water: WaterType[] | null;
}

export interface SystemImageFolders {
  description: string | null;
  id: Generated<string>;
  name: string;
  parent_folder_id: string | null;
  service_provider_id: string;
}

export interface SystemImages {
  created_at: Generated<Timestamp>;
  created_by: string | null;
  folder_id: string | null;
  id: Generated<string>;
  label: string | null;
  original_key: string;
  resized_key: string | null;
  service_provider_id: string | null;
  url: string | null;
}

export interface DB {
  content_criteria: ContentCriteria;
  system_image_folders: SystemImageFolders;
  system_images: SystemImages;
}
