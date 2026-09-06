import type { PortalDocument } from '../types/domain';
import { api } from './api';

export const documentService = {
  list(): Promise<PortalDocument[]> {
    return api.get('/documents');
  },

  getById(id: string): Promise<PortalDocument | undefined> {
    return api.get<PortalDocument>(`/documents/${id}`).catch(() => undefined);
  },
};
