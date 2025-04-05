import axios from 'axios'

export class TableService {
  fetch() {
    return axios.get('https://mbp-karol-java.letscode.it/lootlog/api/battle-records')
  }
}
