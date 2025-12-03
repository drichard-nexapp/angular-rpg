import { Component, inject } from '@angular/core'
import { DataLoaderService } from '../../services/data-loader.service'
import { JsonPipe } from '@angular/common'

@Component({
  selector: 'app-test-loader',
  imports: [JsonPipe],
  templateUrl: './test-loader.html',
  styleUrl: './test-loader.scss',
})
export class TestLoader {
  dataLoader = inject(DataLoaderService)

  loadData() {
    this.dataLoader.loadTestData()
  }
}
