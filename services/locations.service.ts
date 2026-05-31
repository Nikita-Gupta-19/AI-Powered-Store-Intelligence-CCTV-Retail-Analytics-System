import { api } from './http';import type { Location } from '@/types';export const locationsService={list:()=>api<Location[]>('/api/locations'),get:(id:string)=>api<any>(`/api/locations/${id}`)};
