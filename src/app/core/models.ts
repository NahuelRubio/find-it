export type PersonName='Nahuel'|'ML'|'lili';
export type Owner=PersonName|'Compartido';
export interface AccessProfile { id:string; display_name:PersonName; household_id:string; expires_at:string; }
export interface Location { id:string; household_id:string; parent_id:string|null; name:string; type:string; notes:string|null; deleted_at:string|null; }
export interface Box { id:string; household_id:string; parent_box_id:string|null; location_id:string|null; name:string; description:string|null; category:string|null; owner:Owner; exterior_photo_path:string|null; deleted_at:string|null; }
export interface Item { id:string; household_id:string; box_id:string|null; location_id:string|null; name:string; description:string|null; category:string|null; owner:Owner; photo_path:string|null; deleted_at:string|null; }
