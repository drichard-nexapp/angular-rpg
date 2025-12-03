import { Routes } from '@angular/router'
import { Characters } from './pages/characters/characters'
import { CharacterDetail } from './pages/character-detail/character-detail'
import { GUI } from './pages/gui/gui'
import { Achievements } from './pages/achievements/achievements'
import { Tasks } from './pages/tasks/tasks'
import { Items } from './pages/items/items'
import { TestLoader } from './pages/test-loader/test-loader'
import { GrandExchange } from './pages/grand-exchange/grand-exchange'
import { Badges } from './pages/badges/badges'
import { Effects } from './pages/effects/effects'
import { Account } from './pages/account/account'

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: Characters },
  { path: 'characters/:name', component: CharacterDetail },
  { path: 'map', component: GUI },
  { path: 'achievements', component: Achievements },
  { path: 'tasks', component: Tasks },
  { path: 'items', component: Items },
  { path: 'grand-exchange', component: GrandExchange },
  { path: 'badges', component: Badges },
  { path: 'effects', component: Effects },
  { path: 'account', component: Account },
  { path: 'test-loader', component: TestLoader },
]
