import { Routes } from '@angular/router'
import { Characters } from './pages/characters/characters'
import { CharacterDetail } from './pages/character-detail/character-detail'
import { Map } from './pages/map/map'
import { Achievements } from './pages/achievements/achievements'

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: Characters },
  { path: 'characters/:name', component: CharacterDetail },
  { path: 'map', component: Map },
  { path: 'achievements', component: Achievements },
]
