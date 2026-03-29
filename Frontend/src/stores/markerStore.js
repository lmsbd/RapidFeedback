import { makeAutoObservable } from 'mobx';

class MarkerStore {
  selectedMarkerIds = [];
  get MarkerList() {
    return this.selectedMarkerIds.slice();
  }
  constructor() {
    makeAutoObservable(this);
  }

  setSelected(ids) {
    this.selectedMarkerIds = ids;
  }

  clearSelected() {
    this.selectedMarkerIds = [];
  }
}

export default new MarkerStore();
