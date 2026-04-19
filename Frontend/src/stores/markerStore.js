import { makeAutoObservable } from 'mobx';

class MarkerStore {
  selectedMarkerIds = [];
  selectedMarkers = [];
  get MarkerList() {
    return this.selectedMarkerIds.slice();
  }
  constructor() {
    makeAutoObservable(this);
  }

  normalizeId(value) {
    if (value == null) return null;
    const str = String(value).trim();
    if (!str) return null;
    const num = Number(str);
    return Number.isNaN(num) ? str : num;
  }

  setSelected(ids) {
    const nextIds = Array.isArray(ids) ? ids : [];
    const normalizedIds = nextIds
      .map((id) => this.normalizeId(id))
      .filter((id) => id != null);

    this.selectedMarkerIds = normalizedIds;
    const idSet = new Set(normalizedIds);
    this.selectedMarkers = this.selectedMarkers.filter((marker) =>
      idSet.has(this.normalizeId(marker?.id ?? marker?.userId))
    );
  }

  setSelectedWithDetails(markers) {
    const list = Array.isArray(markers) ? markers : [];
    const normalized = [];
    const seen = new Set();

    list.forEach((item) => {
      const id = this.normalizeId(item?.id ?? item?.userId ?? item);
      if (id == null || seen.has(id)) return;
      seen.add(id);
      normalized.push({
        id,
        userId: id,
        userName: item?.userName ?? item?.name ?? '',
        role: item?.role,
        email: item?.email,
      });
    });

    this.selectedMarkerIds = normalized.map((item) => item.id);
    this.selectedMarkers = normalized;
  }

  clearSelected() {
    this.selectedMarkerIds = [];
    this.selectedMarkers = [];
  }
}

export default new MarkerStore();
