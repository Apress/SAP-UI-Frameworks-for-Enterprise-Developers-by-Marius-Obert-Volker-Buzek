import Log from "sap/base/Log";
const _iTimeoutInSeconds = 30,
	_mLockCounters: any = {},
	_oReferenceDummy = {
		getId: function () {
			return "BusyLocker.ReferenceDummy";
		},
		setBusy: function (bBusy: any) {
			Log.info(`setBusy(${bBusy}) triggered on dummy reference`);
		}
	};
function getLockCountId(oReference: any, sPath: any) {
	return oReference.getId() + (sPath || "/busy");
}
function isLocked(oReference: any, sPath: any) {
	return getLockCountId(oReference, sPath) in _mLockCounters;
}
function getLockCountEntry(oReference: any, sPath: any) {
	if (!oReference || !oReference.getId) {
		Log.warning("No reference for BusyLocker, using dummy reference");
		oReference = _oReferenceDummy;
	}

	sPath = sPath || "/busy";
	const sId = getLockCountId(oReference, sPath);

	if (!(sId in _mLockCounters)) {
		_mLockCounters[sId] = {
			id: sId,
			path: sPath,
			reference: oReference,
			count: 0
		};
	}
	return _mLockCounters[sId];
}
/**
 * @param mLockCountEntry
 */
function deleteLockCountEntry(mLockCountEntry: any) {
	delete _mLockCounters[mLockCountEntry.id];
}

function applyLockState(mLockCountEntry: any) {
	const bIsModel = mLockCountEntry.reference.isA && mLockCountEntry.reference.isA("sap.ui.model.Model"),
		bBusy = mLockCountEntry.count !== 0;

	if (bIsModel) {
		mLockCountEntry.reference.setProperty(mLockCountEntry.path, bBusy, undefined, true);
	} else if (mLockCountEntry.reference.setBusy) {
		mLockCountEntry.reference.setBusy(bBusy);
	}

	clearTimeout(mLockCountEntry.timeout);
	if (bBusy) {
		mLockCountEntry.timeout = setTimeout(function () {
			Log.error(
				`busy lock for ${mLockCountEntry.id} with value ${mLockCountEntry.count} timed out after ${_iTimeoutInSeconds} seconds!`
			);
		}, _iTimeoutInSeconds * 1000);
	} else {
		deleteLockCountEntry(mLockCountEntry);
	}

	return bBusy;
}

function changeLockCount(mLockCountEntry: any, iDelta: any) {
	if (iDelta === 0) {
		mLockCountEntry.count = 0;
		Log.info(`busy lock count '${mLockCountEntry.id}' was reset to 0`);
	} else {
		mLockCountEntry.count += iDelta;
		Log.info(`busy lock count '${mLockCountEntry.id}' is ${mLockCountEntry.count}`);
	}
}

const BusyLocker = {
	lock: function (oModelOrControl: any, sPath?: string) {
		return this._updateLock(oModelOrControl, sPath, 1);
	},

	unlock: function (oModelOrControl: any, sPath?: string) {
		return this._updateLock(oModelOrControl, sPath, -1);
	},

	isLocked: function (oModelOrControl: any, sPath?: string) {
		return isLocked(oModelOrControl, sPath);
	},

	_updateLock: function (oReference: any, sPath: any, iDelta: any) {
		const mLockCountEntry = getLockCountEntry(oReference, sPath);
		changeLockCount(mLockCountEntry, iDelta);
		return applyLockState(mLockCountEntry);
	}
};

export default BusyLocker;
