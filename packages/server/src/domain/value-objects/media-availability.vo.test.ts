import { describe, it, expect } from 'bun:test';
import { MediaAvailabilityVO, MediaAvailabilityValues } from './media-availability.vo';
import { JellyseerrStatusValues } from 'shared/domain/types/media.types';

describe('MediaAvailabilityVO', () => {
  describe('fromJellyseerrStatus', () => {
    it('returns TO_BE_REQUESTED for null status', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(null);
      expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
    });

    it('returns TO_BE_REQUESTED for undefined status', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(undefined);
      expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
    });

    it('returns PREVIOUSLY_REQUESTED for UNKNOWN (1)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(JellyseerrStatusValues.UNKNOWN);
      expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
    });

    it('returns PREVIOUSLY_REQUESTED for PENDING (2)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(JellyseerrStatusValues.PENDING);
      expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
    });

    it('returns PREVIOUSLY_REQUESTED for PROCESSING (3)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(JellyseerrStatusValues.PROCESSING);
      expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
    });

    it('returns AVAILABLE for PARTIALLY_AVAILABLE (4)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(
        JellyseerrStatusValues.PARTIALLY_AVAILABLE
      );
      expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
    });

    it('returns AVAILABLE for AVAILABLE (5)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(JellyseerrStatusValues.AVAILABLE);
      expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
    });

    it('returns PREVIOUSLY_REQUESTED for DELETED (6)', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(JellyseerrStatusValues.DELETED);
      expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
    });

    describe('undocumented states (>= 7)', () => {
      it('returns TO_BE_REQUESTED when hasRequests is false', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(7, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('returns PREVIOUSLY_REQUESTED when hasRequests is true', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(7, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('handles status 8 with hasRequests=false', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(8, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('handles status 8 with hasRequests=true', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(8, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('handles large status value (100) with hasRequests=false', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(100, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('handles large status value (100) with hasRequests=true', () => {
        const result = MediaAvailabilityVO.fromJellyseerrStatus(100, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });
    });

    describe('hasRequests does not affect known status codes', () => {
      it('UNKNOWN still returns PREVIOUSLY_REQUESTED regardless of hasRequests', () => {
        expect(MediaAvailabilityVO.fromJellyseerrStatus(1, false).getValue()).toBe(
          MediaAvailabilityValues.PREVIOUSLY_REQUESTED
        );
        expect(MediaAvailabilityVO.fromJellyseerrStatus(1, true).getValue()).toBe(
          MediaAvailabilityValues.PREVIOUSLY_REQUESTED
        );
      });

      it('AVAILABLE still returns AVAILABLE regardless of hasRequests', () => {
        expect(MediaAvailabilityVO.fromJellyseerrStatus(5, false).getValue()).toBe(
          MediaAvailabilityValues.AVAILABLE
        );
        expect(MediaAvailabilityVO.fromJellyseerrStatus(5, true).getValue()).toBe(
          MediaAvailabilityValues.AVAILABLE
        );
      });
    });
  });

  describe('fromCombinedJellyseerrStatus', () => {
    describe('both null/undefined', () => {
      it('returns TO_BE_REQUESTED when both are null', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(null, null);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('returns TO_BE_REQUESTED when both are null with hasRequests=true', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(null, null, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });
    });

    describe('status with null status4k', () => {
      it('returns AVAILABLE when status is AVAILABLE and status4k is null', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(5, null);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });

      it('returns PREVIOUSLY_REQUESTED when status is PENDING and status4k is null', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(2, null);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('returns PREVIOUSLY_REQUESTED when status is UNKNOWN and status4k is null', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(1, null);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });
    });

    describe('null status with status4k', () => {
      it('returns AVAILABLE when status is null and status4k is AVAILABLE', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(null, 5);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });

      it('returns PREVIOUSLY_REQUESTED when status is null and status4k is PENDING', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(null, 2);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });
    });

    describe('mixed status combinations', () => {
      it('returns AVAILABLE when status is AVAILABLE and status4k is PENDING', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(5, 2);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });

      it('returns AVAILABLE when status is PENDING and status4k is AVAILABLE', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(2, 5);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });

      it('returns PREVIOUSLY_REQUESTED when both are PENDING', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(2, 2);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('returns AVAILABLE when both are AVAILABLE', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(5, 5);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });
    });

    describe('undocumented states with combined logic', () => {
      it('returns TO_BE_REQUESTED when both are undocumented and hasRequests=false', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(7, 7, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('returns PREVIOUSLY_REQUESTED when both are undocumented and hasRequests=true', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(7, 7, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('returns TO_BE_REQUESTED when status is undocumented, status4k is null, hasRequests=false', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(7, null, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
      });

      it('returns PREVIOUSLY_REQUESTED when status is undocumented, status4k is null, hasRequests=true', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(7, null, true);
        expect(result.getValue()).toBe(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
      });

      it('returns AVAILABLE when status is undocumented and status4k is AVAILABLE', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(7, 5, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });

      it('returns AVAILABLE when status is AVAILABLE and status4k is undocumented', () => {
        const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(5, 7, false);
        expect(result.getValue()).toBe(MediaAvailabilityValues.AVAILABLE);
      });
    });
  });

  describe('query methods', () => {
    it('isToBeRequested returns true for TO_BE_REQUESTED', () => {
      const vo = MediaAvailabilityVO.toBeRequested();
      expect(vo.isToBeRequested()).toBe(true);
      expect(vo.isPreviouslyRequested()).toBe(false);
      expect(vo.isAvailable()).toBe(false);
    });

    it('isPreviouslyRequested returns true for PREVIOUSLY_REQUESTED', () => {
      const vo = MediaAvailabilityVO.previouslyRequested();
      expect(vo.isToBeRequested()).toBe(false);
      expect(vo.isPreviouslyRequested()).toBe(true);
      expect(vo.isAvailable()).toBe(false);
    });

    it('isAvailable returns true for AVAILABLE', () => {
      const vo = MediaAvailabilityVO.available();
      expect(vo.isToBeRequested()).toBe(false);
      expect(vo.isPreviouslyRequested()).toBe(false);
      expect(vo.isAvailable()).toBe(true);
    });

    it('shouldRequest returns true only for TO_BE_REQUESTED', () => {
      expect(MediaAvailabilityVO.toBeRequested().shouldRequest()).toBe(true);
      expect(MediaAvailabilityVO.previouslyRequested().shouldRequest()).toBe(false);
      expect(MediaAvailabilityVO.available().shouldRequest()).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true for equal values', () => {
      const vo1 = MediaAvailabilityVO.toBeRequested();
      const vo2 = MediaAvailabilityVO.toBeRequested();
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('returns false for different values', () => {
      const vo1 = MediaAvailabilityVO.toBeRequested();
      const vo2 = MediaAvailabilityVO.available();
      expect(vo1.equals(vo2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns TO_BE_REQUESTED for status 0', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(0);
      expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
    });

    it('returns TO_BE_REQUESTED for negative status', () => {
      const result = MediaAvailabilityVO.fromJellyseerrStatus(-1);
      expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
    });

    it('handles combined with status 0', () => {
      const result = MediaAvailabilityVO.fromCombinedJellyseerrStatus(0, null);
      expect(result.getValue()).toBe(MediaAvailabilityValues.TO_BE_REQUESTED);
    });
  });
});
