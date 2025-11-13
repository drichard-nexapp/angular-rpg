import { TestBed } from '@angular/core/testing'
import { SkinService } from './skin.service'

describe('SkinService', () => {
  let service: SkinService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(SkinService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return correct symbol for men1', () => {
    expect(service.getSymbol('men1')).toBe('🧙‍♂️')
  })

  it('should return correct symbol for men2', () => {
    expect(service.getSymbol('men2')).toBe('⚔️')
  })

  it('should return correct symbol for men3', () => {
    expect(service.getSymbol('men3')).toBe('🛡️')
  })

  it('should return correct symbol for women1', () => {
    expect(service.getSymbol('women1')).toBe('🧙‍♀️')
  })

  it('should return correct symbol for women2', () => {
    expect(service.getSymbol('women2')).toBe('🏹')
  })

  it('should return correct symbol for women3', () => {
    expect(service.getSymbol('women3')).toBe('🗡️')
  })

  it('should return ❓ for unknown skin', () => {
    expect(service.getSymbol('unknown' as any)).toBe('❓')
  })
})
