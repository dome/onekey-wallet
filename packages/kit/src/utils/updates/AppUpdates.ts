import differenceInDays from 'date-fns/differenceInDays';
import * as Linking from 'expo-linking';
import semver from 'semver';

import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import store from '@onekeyhq/kit/src/store';
import {
  available,
  checking,
  downloading,
  error,
  notAvailable,
  ready,
} from '@onekeyhq/kit/src/store/reducers/autoUpdater';
import { setUpdateSetting } from '@onekeyhq/kit/src/store/reducers/settings';
import { getTimeStamp } from '@onekeyhq/kit/src/utils/helper';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import { getDefaultLocale } from '../locale';

import { getChangeLog, getPreReleaseInfo, getReleaseInfo } from './server';
import { PackageInfo, PackagesInfo, VersionInfo } from './type.d';

class AppUpdates {
  addedListener = false;

  checkUpdate() {
    if (platformEnv.isDesktop) {
      this.checkDesktopUpdate();
      return;
    }

    return this.checkAppUpdate();
  }

  async checkAppUpdate(): Promise<VersionInfo | undefined> {
    const { enable, preReleaseUpdate } =
      store.getState().settings.devMode || {};

    const preUpdateMode = enable && preReleaseUpdate;

    let releasePackages: PackagesInfo | null;
    if (preUpdateMode) {
      releasePackages = await getPreReleaseInfo();
    } else {
      releasePackages = await getReleaseInfo();
    }

    let packageInfo: PackageInfo | undefined;

    if (platformEnv.isWeb) {
      packageInfo = releasePackages?.desktop?.find((x) => {
        if (platformEnv.isDesktopMacArm64) {
          return x.os === 'macos-arm64';
        }

        return x.os === 'macos-x64';
      });
    }

    if (platformEnv.isNativeAndroid) {
      if (platformEnv.isNativeAndroidGooglePlay) {
        packageInfo = releasePackages?.android?.find(
          (x) => x.os === 'android' && x.channel === 'GooglePlay',
        );
      } else {
        packageInfo = releasePackages?.android?.find(
          (x) => x.os === 'android' && x.channel === 'Direct',
        );
      }
    }

    if (platformEnv.isNativeIOS) {
      packageInfo = releasePackages?.ios?.find((x) => x.os === 'ios');
    }

    if (platformEnv.isDesktop) {
      if (platformEnv.isDesktopLinux) {
        packageInfo = releasePackages?.desktop?.find((x) => x.os === 'linux');
      }
    }

    if (packageInfo) {
      if (
        !packageInfo ||
        // localVersion >= releaseVersion
        semver.gte(
          store.getState().settings.version ?? '0.0.0',
          packageInfo.version,
        )
      ) {
        //  没有更新
        return undefined;
      }

      return {
        package: packageInfo,
      };
    }

    return undefined;
  }

  checkDesktopUpdate(isManual = false) {
    window.desktopApi.checkForUpdates(isManual);
  }

  openAppUpdate(versionInfo: VersionInfo): void {
    switch (versionInfo.package.channel) {
      case 'AppStore':
        Linking.canOpenURL('itms-apps://').then((supported) => {
          if (supported) {
            Linking.openURL('itms-apps://itunes.apple.com/app/id1609559473');
          } else {
            this._openUrl(versionInfo.package.download);
          }
        });
        break;
      case 'GooglePlay':
        Linking.canOpenURL('market://').then((supported) => {
          if (supported) {
            Linking.openURL('market://details?id=so.onekey.app.wallet');
          } else {
            this._openUrl(versionInfo.package.download);
          }
        });
        break;
      default:
        this._openUrl(versionInfo.package.download);
        break;
    }
  }

  async getChangeLog(
    oldVersion: string,
    newVersion: string,
  ): Promise<string | undefined> {
    const releaseInfo = await getChangeLog(oldVersion, newVersion);

    let locale = store.getState().settings.locale ?? 'en-US';
    if (locale === 'system') {
      locale = getDefaultLocale();
    }

    return releaseInfo?.[locale];
  }

  _openUrl(url: string) {
    if (platformEnv.isNative) {
      Linking.openURL(url);
    } else {
      window.open(url, '_blank');
    }
  }

  skipVersionCheck(version: string) {
    const { updateLatestVersion = null, updateLatestTimeStamp = null } =
      store.getState().settings.updateSetting ?? {};
    if (
      updateLatestVersion &&
      semver.eq(updateLatestVersion, version) &&
      updateLatestTimeStamp
    ) {
      if (differenceInDays(getTimeStamp(), updateLatestTimeStamp) > 7) {
        return true;
      }
    }
    return false;
  }

  addUpdaterListener() {
    if (this.addedListener) return;
    if (!platformEnv.isDesktop) return;
    this.addedListener = true;
    const { dispatch } = backgroundApiProxy;
    const { autoDownload = true } =
      store.getState().settings.updateSetting ?? {};
    window.desktopApi.on('update/checking', () => dispatch(checking()));
    window.desktopApi.on('update/available', ({ version }) => {
      dispatch(available({ version }));
      if (autoDownload && !this.skipVersionCheck(version)) {
        window.desktopApi.downloadUpdate();
      }
    });
    window.desktopApi.on('update/not-available', ({ version }) =>
      dispatch(notAvailable({ version })),
    );
    window.desktopApi.on('update/error', ({ version }) => {
      dispatch(error());
      dispatch(
        setUpdateSetting({
          updateLatestVersion: version,
          updateLatestTimeStamp: getTimeStamp(),
        }),
      );
    });
    window.desktopApi.on('update/downloading', (progress: number) =>
      dispatch(downloading(progress)),
    );
    window.desktopApi.on('update/downloaded', ({ version }) =>
      dispatch(ready({ version })),
    );
  }
}
const appUpdates = new AppUpdates();
export default appUpdates;
