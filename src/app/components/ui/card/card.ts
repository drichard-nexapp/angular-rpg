import { Component, input } from '@angular/core'

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  variant = input<'default' | 'elevated' | 'outlined'>('default')
  padding = input<'none' | 'small' | 'medium' | 'large'>('medium')
}
