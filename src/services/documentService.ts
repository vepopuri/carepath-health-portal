import type { PortalDocument } from '../types/domain';
import { documents as seedDocuments } from '../data/documents';
import { withLatency } from './simulate';

export const documentService = {
  list(): Promise<PortalDocument[]> {
    return withLatency(seedDocuments.slice().sort((a, b) => (a.date < b.date ? 1 : -1)));
  },

  getById(id: string): Promise<PortalDocument | undefined> {
    return withLatency(seedDocuments.find((d) => d.id === id));
  },
};
