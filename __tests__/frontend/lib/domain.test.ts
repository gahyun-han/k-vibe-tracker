import { describe, it, expect, beforeEach } from 'vitest';
import { calculateDistance } from '@/lib/features';
import { toCrowdLevel, CROWD_DOT_CLASS } from '@/lib/domain';

describe('Lib Domain Utilities', () => {
  describe('calculateDistance (Haversine)', () => {
    it('should calculate distance between two coordinates', () => {
      // Seoul City Hall vs Gyeongbokgung Palace (approximately 1.5km apart)
      const distance = calculateDistance(
        { lat: 37.5665, lng: 126.978 }, // Seoul City Hall
        { lat: 37.5796, lng: 126.977 }, // Gyeongbokgung
      );

      // Should be approximately 1.5 km (distance in km)
      expect(distance).toBeGreaterThan(1);
      expect(distance).toBeLessThan(2);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(
        { lat: 37.5665, lng: 126.978 },
        { lat: 37.5665, lng: 126.978 },
      );

      expect(distance).toBe(0);
    });

    it('should work with different hemispheres', () => {
      // New York to London (approximately 5560 km)
      const distance = calculateDistance(
        { lat: 40.7128, lng: -74.006 }, // New York
        { lat: 51.5074, lng: -0.1278 }, // London
      );

      expect(distance).toBeGreaterThan(5000);
      expect(distance).toBeLessThan(6000);
    });
  });

  describe('toCrowdLevel', () => {
    it('should return empty for 0-10%', () => {
      const level = toCrowdLevel(5);
      expect(level).toBe('empty');
    });

    it('should return quiet for 11-30%', () => {
      const level = toCrowdLevel(20);
      expect(level).toBe('quiet');
    });

    it('should return moderate for 31-60%', () => {
      const level = toCrowdLevel(45);
      expect(level).toBe('moderate');
    });

    it('should return busy for 61-85%', () => {
      const level = toCrowdLevel(75);
      expect(level).toBe('busy');
    });

    it('should return very_busy for 86-100%', () => {
      const level = toCrowdLevel(95);
      expect(level).toBe('very_busy');
    });

    it('should handle boundary values', () => {
      expect(toCrowdLevel(0)).toBe('empty');
      expect(toCrowdLevel(100)).toBe('very_busy');
      expect(toCrowdLevel(30)).toBe('quiet');
      expect(toCrowdLevel(60)).toBe('moderate');
    });
  });

  describe('CROWD_DOT_CLASS', () => {
    it('should return correct CSS classes for each crowd level', () => {
      expect(CROWD_DOT_CLASS.empty).toContain('bg-');
      expect(CROWD_DOT_CLASS.quiet).toContain('bg-');
      expect(CROWD_DOT_CLASS.moderate).toContain('bg-');
      expect(CROWD_DOT_CLASS.busy).toContain('bg-');
      expect(CROWD_DOT_CLASS.very_busy).toContain('bg-');
    });

    it('should have unique classes for each level', () => {
      const classes = Object.values(CROWD_DOT_CLASS);
      const uniqueClasses = new Set(classes);

      expect(uniqueClasses.size).toBe(classes.length);
    });
  });
});
