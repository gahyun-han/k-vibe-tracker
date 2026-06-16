import { describe, expect, it } from 'vitest';
import {
  getDataSourceCopy,
  getDocentProximityCopy,
  getLocationStatusCopy,
  getNetworkStatusCopy,
  getProfileSettingsCopy,
  getPwaInstallCopy,
  getUiCopy,
  LANGUAGE_NAMES,
  SUPPORTED_LOCALES,
} from '@/lib/ui-copy';

describe('ui copy', () => {
  it('provides feature copy for every supported locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const copy = getUiCopy(locale);

      expect(LANGUAGE_NAMES[locale]).not.toMatch(/[?]/);
      expect(LANGUAGE_NAMES[locale].length).toBeGreaterThan(1);

      expect(copy.analyze.title.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingSteps).toHaveLength(3);
      expect(copy.analyze.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.analyze.buildRoute.length).toBeGreaterThan(0);

      expect(copy.radar.title.length).toBeGreaterThan(0);
      expect(copy.radar.filters.all.length).toBeGreaterThan(0);
      expect(copy.radar.facilityTypes.restroom.length).toBeGreaterThan(0);
      expect(copy.radar.viewOnMap.length).toBeGreaterThan(0);

      expect(copy.route.title.length).toBeGreaterThan(0);
      expect(copy.route.startGuidance.length).toBeGreaterThan(0);
      expect(copy.route.miniMapTitle.length).toBeGreaterThan(0);
      expect(copy.route.openDirections.length).toBeGreaterThan(0);
      expect(copy.route.openStopMap).toContain('{name}');
      expect(copy.route.extraStop.name.length).toBeGreaterThan(0);

      expect(copy.common.goBack.length).toBeGreaterThan(0);
      expect(copy.common.openProfile.length).toBeGreaterThan(0);
      expect(copy.common.unexpectedErrorTitle.length).toBeGreaterThan(0);

      expect(copy.login.title.length).toBeGreaterThan(0);
      expect(copy.login.continueGuest.length).toBeGreaterThan(0);
      expect(copy.login.guestFeatures).toHaveLength(4);

      expect(copy.map.refreshLocation.length).toBeGreaterThan(0);
      expect(copy.map.savedRouteTitle.length).toBeGreaterThan(0);
      expect(copy.map.crowd.low.length).toBeGreaterThan(0);
      expect(copy.radar.mapTitle.length).toBeGreaterThan(0);
      expect(copy.radar.openFacilityMap).toContain('{name}');

      expect(copy.placeDetail.closeDetail.length).toBeGreaterThan(0);
      expect(copy.placeDetail.crowd.high.length).toBeGreaterThan(0);

      expect(copy.persona.title.length).toBeGreaterThan(0);
      expect(copy.persona.themes.kpop.details.bts.label.length).toBeGreaterThan(0);
      expect(copy.persona.routeTitle).toContain('{detail}');

      expect(copy.tutorial.steps).toHaveLength(6);
      for (const step of copy.tutorial.steps) {
        expect(step.action.length).toBeGreaterThan(0);
      }

      const profileSettings = getProfileSettingsCopy(locale);
      expect(profileSettings.title.length).toBeGreaterThan(0);
      expect(Object.values(profileSettings.items)).toHaveLength(4);
      for (const item of Object.values(profileSettings.items)) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.value.length).toBeGreaterThan(0);
      }

      const proximity = getDocentProximityCopy(locale);
      expect(proximity.radiusLabel).toContain('100');
      expect(proximity.distanceLabel).toContain('{distance}');
      expect(proximity.checkButton.length).toBeGreaterThan(0);
      expect(proximity.ready.length).toBeGreaterThan(0);

      const locationStatus = getLocationStatusCopy(locale);
      expect(locationStatus.lastKnownLocation.length).toBeGreaterThan(0);

      const dataSource = getDataSourceCopy(locale);
      expect(dataSource.cache.length).toBeGreaterThan(0);
      expect(dataSource.mock.length).toBeGreaterThan(0);
      expect(dataSource.tourApi).toBe('TourAPI');

      const networkStatus = getNetworkStatusCopy(locale);
      expect(networkStatus.offlineTitle.length).toBeGreaterThan(0);
      expect(networkStatus.offlineBody.length).toBeGreaterThan(0);

      const pwaInstall = getPwaInstallCopy(locale);
      expect(pwaInstall.title.length).toBeGreaterThan(0);
      expect(pwaInstall.body.length).toBeGreaterThan(0);
      expect(pwaInstall.install.length).toBeGreaterThan(0);
      expect(pwaInstall.dismiss.length).toBeGreaterThan(0);
      expect(pwaInstall.close.length).toBeGreaterThan(0);
    }
  });
});
