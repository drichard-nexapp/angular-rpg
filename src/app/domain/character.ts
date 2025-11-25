import { Brain } from '../services/automation.service'
import { CharacterSchema } from '../../sdk/api'

export class Character {
  constructor(
    private bain: Brain,
    private info: CharacterSchema,
  ) {}
}
