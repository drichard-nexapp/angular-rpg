import { Routes } from '@angular/router'
import { Characters } from './pages/characters/characters'
import { CharacterDetail } from './pages/character-detail/character-detail'
import { GUI } from './pages/gui/gui'
import { Achievements } from './pages/achievements/achievements'
import { Tasks } from './pages/tasks/tasks'
import { Items } from './pages/items/items'

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: Characters },
  { path: 'characters/:name', component: CharacterDetail },
  { path: 'map', component: GUI },
  { path: 'achievements', component: Achievements },
  { path: 'tasks', component: Tasks },
  { path: 'items', component: Items },
]
